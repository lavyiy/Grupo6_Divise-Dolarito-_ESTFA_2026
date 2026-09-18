const db = require('../config/db');
const emailService = require('./emailService');
const whatsappService = require('./whatsappService');

// El cliente se lee dinámicamente desde db para permitir inyección en tests.
const supabase = () => db.supabase;

const CRYPTO_CODES = new Set(['BTC', 'ETH', 'USDT', 'BNB', 'DOGE', 'SOL']);

// Cada medio de mercado define su referencia por defecto (Informal = Dólar Blue).
const MARKET_RANK = { INFORMAL: 0, BLUE: 0, OFICIAL: 1, CRIPTO: 1 };

function isCripto(codigo) {
  return CRYPTO_CODES.has(String(codigo).toUpperCase());
}

/**
 * Resuelve el precio actual de una alerta dado su codigo_divisa.
 * Acepta formatos: 'BTC', 'USD', 'USD_INFORMAL', 'USD_OFICIAL', 'USD_BLUE'.
 */
function resolvePrecio(rates, code) {
  if (code == null) return undefined;
  const upper = String(code).toUpperCase();
  if (rates[upper] != null) return rates[upper];
  // Alias de mercado por si el código almacenado usa otro nombre (Blue/Informal, etc.)
  const variants = [
    `${upper}_INFORMAL`,
    `${upper}_BLUE`,
    `${upper}_OFICIAL`,
    `${upper}_CRIPTO`,
  ];
  for (const v of variants) {
    if (rates[v] != null) return rates[v];
  }
  return undefined;
}

/**
 * Verdadero si una condición textual coincide (sube/supera -> >=, baja/cae -> <=).
 */
function matchesCondition(condicion, precio, limite) {
  const c = String(condicion || '').toLowerCase();
  const sube = c.includes('sube') || c.includes('supera') || c.includes('arriba');
  if (sube) return precio >= limite;
  const baja = c.includes('baja') || c.includes('cae') || c.includes('desciende');
  if (baja) return precio <= limite;
  return false;
}

/** Nombre legible para una alerta: maneja 'GBP_OFICIAL', 'USD_INFORMAL', 'BTC'... */
function alertLabel(code) {
  const key = String(code || '').toUpperCase();
  const base = key.split('_')[0];
  const labels = {
    'USD_INFORMAL': 'Dólar Blue',
    'USD_BLUE': 'Dólar Blue',
    'USD_OFICIAL': 'Dólar Oficial',
    'EUR_OFICIAL': 'Euro',
    'BRL_OFICIAL': 'Real Brasileño',
    'UYU_OFICIAL': 'Peso Uruguayo',
    'CLP_OFICIAL': 'Peso Chileno',
    'GBP_OFICIAL': 'Libra Esterlina',
    'JPY_OFICIAL': 'Yen Japonés',
    'MXN_OFICIAL': 'Peso Mexicano',
    'CHF_OFICIAL': 'Franco Suizo',
    'CNY_OFICIAL': 'Yuan Chino',
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'USDT': 'Tether (USDT)',
    'BNB': 'BNB',
    'DOGE': 'Dogecoin',
  };
  const byBase = {
    BRL: 'Real Brasileño', UYU: 'Peso Uruguayo', CLP: 'Peso Chileno',
    GBP: 'Libra Esterlina', JPY: 'Yen Japonés', MXN: 'Peso Mexicano',
    CHF: 'Franco Suizo', CNY: 'Yuan Chino', EUR: 'Euro',
  };
  return labels[key] || byBase[base] || String(code || '');
}

/**
 * Revisa todas las alertas activas contra las cotizaciones actuales
 * y envía emails + WhatsApp si se cumplen las condiciones.
 */
async function checkAlerts() {
  console.log('🔔 Verificando alertas...');

  try {
    // Obtenemos alertas no notificadas
    const { data: alertas, error: alertasError } = await supabase().from('alertas')
      .select('id_alerta, id_usuario, codigo_divisa, condicion, valor_limite')
      .eq('notificada', false);

    if (alertasError) throw alertasError;
    if (!alertas || alertas.length === 0) return;

    // Obtener contacto (email / WhatsApp) de los usuarios dueños de las alertas.
    // La tabla alertas no tiene relación embebida con usuarios, así que se
    // consulta por separado y se arma el mapa en memoria.
    const userIds = [...new Set(alertas.map((a) => a.id_usuario).filter(Boolean))];
    const contacts = {};
    if (userIds.length > 0) {
      const { data: usuarios, error: usuariosError } = await supabase().from('usuarios')
        .select('id_usuario, email, whatsapp_phone, whatsapp_api_key')
        .in('id_usuario', userIds);

      if (usuariosError) throw usuariosError;
      (usuarios || []).forEach((u) => { contacts[u.id_usuario] = u; });
    }

    // Precios actuales
    const { data: cotizaciones, error: cotizacionesError } = await supabase().from('tipos_de_cambio')
      .select('tipo_mercado, precio_venta, divisas ( codigo )');

    if (cotizacionesError) throw cotizacionesError;

    // Mapa rápido de precios: codigo_MERCADO (fiat) o sólo codigo (cripto),
    // más una referencia por defecto por código para compatibilidad.
    const rates = {};
    const winner = {};
    (cotizaciones || []).forEach((row) => {
      const codigo = row.divisas?.codigo;
      if (!codigo) return;
      const venta = parseFloat(row.precio_venta);
      if (isCripto(codigo)) {
        rates[codigo] = venta;
        rates[`${codigo}_CRIPTO`] = venta;
        return;
      }
      const mercadoRaw = String(row.tipo_mercado).toUpperCase();
      const mercado = mercadoRaw === 'BLUE' ? 'INFORMAL' : mercadoRaw;
      rates[`${codigo}_${mercado}`] = venta;
      if (mercado !== mercadoRaw) rates[`${codigo}_${mercadoRaw}`] = venta;
      // Referencia por defecto por código: el mercado con menor rank (Informal/Blue gana).
      const rank = MARKET_RANK[mercado] ?? 9;
      if (winner[codigo] === undefined || rank < (MARKET_RANK[winner[codigo]] ?? 9)) {
        rates[codigo] = venta;
        winner[codigo] = mercado;
      }
    });

    for (const alerta of alertas) {
      const precioActual = resolvePrecio(rates, alerta.codigo_divisa);
      if (precioActual == null) continue;

      const limite = parseFloat(alerta.valor_limite);
      if (!matchesCondition(alerta.condicion, precioActual, limite)) continue;
        const contacto = contacts[alerta.id_usuario] || {};
        const productLabel = alertLabel(alerta.codigo_divisa);

        // Enviar correo
        if (contacto.email) {
          await emailService.sendAlertEmail(contacto.email, productLabel, alerta.condicion, limite, precioActual);
        }

        // Enviar WhatsApp si el usuario lo tiene configurado
        if (contacto.whatsapp_phone && contacto.whatsapp_api_key) {
          const msg =
            `🔔 *Alerta Divise*\n` +
            `${productLabel} ${alerta.condicion} $${limite}\n` +
            `Precio actual: *$${precioActual}*`;
          const result = await whatsappService.sendWhatsApp(contacto.whatsapp_phone, contacto.whatsapp_api_key, msg);
          if (!result.ok) {
            console.error(`[ALERTA] WhatsApp no enviado a ${contacto.whatsapp_phone}: ${result.error}`);
          }
        }

        // Marcar como notificada
        const { error: updateError } = await supabase().from('alertas')
          .update({ notificada: true })
          .eq('id_alerta', alerta.id_alerta);

        if (updateError) throw updateError;
    }
  } catch (error) {
    console.error('❌ Error verificando alertas:', error.message);
  }
}

/**
 * Crea una nueva alerta en la base de datos
 */
async function createAlert(id_usuario, codigo_divisa, condicion, valor_limite) {
  const { data, error } = await supabase().from('alertas')
    .insert({ id_usuario, codigo_divisa, condicion, valor_limite })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obtiene las alertas de un usuario
 */
async function getUserAlerts(id_usuario) {
  const { data, error } = await supabase().from('alertas')
    .select('*')
    .eq('id_usuario', id_usuario)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Elimina una alerta
 */
async function deleteAlert(id_alerta, id_usuario) {
  const { data, error } = await supabase().from('alertas')
    .delete()
    .eq('id_alerta', id_alerta)
    .eq('id_usuario', id_usuario)
    .select('id_alerta');

  if (error) throw error;
  return Array.isArray(data) && data.length > 0;
}

module.exports = {
  checkAlerts,
  createAlert,
  getUserAlerts,
  deleteAlert
};
