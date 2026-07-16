const pool = require('../config/db');
const emailService = require('./emailService');

/**
 * Revisa todas las alertas activas contra las cotizaciones actuales
 * y envía emails si se cumplen las condiciones.
 */
async function checkAlerts() {
  console.log('🔔 Verificando alertas...');
  
  try {
    // Obtenemos alertas no notificadas con su email correspondiente
    const alertasRes = await pool.query(`
      SELECT a.id_alerta, a.codigo_divisa, a.condicion, a.valor_limite, u.email
      FROM alertas a
      JOIN usuarios u ON a.id_usuario = u.id_usuario
      WHERE a.notificada = false
    `);
    
    if (alertasRes.rows.length === 0) return;
    
    // Obtenemos precios actuales
    const ratesRes = await pool.query(`
      SELECT d.codigo, tc.tipo_mercado, tc.precio_venta 
      FROM tipos_de_cambio tc
      JOIN divisas d ON tc.id_divisa = d.id_divisa
    `);
    
    // Armamos un mapa rápido de precios (usando codigo_MERCADO o solo codigo para cripto)
    const rates = {};
    ratesRes.rows.forEach(r => {
      const isCripto = (r.codigo === 'BTC' || r.codigo === 'ETH' || r.codigo === 'USDT' || r.codigo === 'SOL');
      const key = isCripto ? r.codigo : `${r.codigo}_${r.tipo_mercado.toUpperCase()}`;
      rates[key] = parseFloat(r.precio_venta);
    });
    
    for (const alerta of alertasRes.rows) {
      const precioActual = rates[alerta.codigo_divisa];
      if (!precioActual) continue;
      
      const limite = parseFloat(alerta.valor_limite);
      let disparar = false;
      
      if (alerta.condicion === 'Sube a' && precioActual >= limite) {
        disparar = true;
      } else if (alerta.condicion === 'Baja a' && precioActual <= limite) {
        disparar = true;
      }
      
      if (disparar) {
        // Enviar correo
        await emailService.sendAlertEmail(alerta.email, alerta.codigo_divisa, alerta.condicion, limite, precioActual);
        
        // Marcar como notificada
        await pool.query('UPDATE alertas SET notificada = true WHERE id_alerta = $1', [alerta.id_alerta]);
      }
    }
  } catch (error) {
    console.error('❌ Error verificando alertas:', error.message);
  }
}

/**
 * Crea una nueva alerta en la base de datos
 */
async function createAlert(id_usuario, codigo_divisa, condicion, valor_limite) {
  const result = await pool.query(
    'INSERT INTO alertas (id_usuario, codigo_divisa, condicion, valor_limite) VALUES ($1, $2, $3, $4) RETURNING *',
    [id_usuario, codigo_divisa, condicion, valor_limite]
  );
  return result.rows[0];
}

/**
 * Obtiene las alertas de un usuario
 */
async function getUserAlerts(id_usuario) {
  const result = await pool.query(
    'SELECT * FROM alertas WHERE id_usuario = $1 ORDER BY created_at DESC',
    [id_usuario]
  );
  return result.rows;
}

/**
 * Elimina una alerta
 */
async function deleteAlert(id_alerta, id_usuario) {
  const result = await pool.query(
    'DELETE FROM alertas WHERE id_alerta = $1 AND id_usuario = $2 RETURNING id_alerta',
    [id_alerta, id_usuario]
  );
  return result.rows.length > 0;
}

module.exports = {
  checkAlerts,
  createAlert,
  getUserAlerts,
  deleteAlert
};
