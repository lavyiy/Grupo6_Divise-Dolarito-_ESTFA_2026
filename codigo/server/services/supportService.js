// ── server/services/supportService.js ────────────────────────────────────────
// Gestión de tickets de soporte creados desde el asistente/chatbot del dashboard.
// Persiste en PostgreSQL (tabla `soporte_tickets`, migración 013) con fallback
// a un archivo JSON para que el panel de administración siga funcionando aunque
// la base de datos no esté disponible.

const fs = require('fs');
const path = require('path');
const emailService = require('./emailService');

const DB_DIR = path.join(__dirname, '..', 'database');
const TICKETS_FILE = path.join(DB_DIR, 'soporte_tickets.json');

if (!fs.existsSync(DB_DIR)) {
  try { fs.mkdirSync(DB_DIR, { recursive: true }); } catch (e) {}
}

function loadJsonSafe(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error(`[STORAGE] Error leyendo ${filePath}:`, err.message);
  }
  return defaultValue;
}

function saveJsonSafe(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[STORAGE] Error guardando ${filePath}:`, err.message);
  }
}

const ESTADOS = ['abierto', 'en_proceso', 'resuelto', 'cerrado'];
const PRIORIDADES = ['baja', 'media', 'alta'];
const CATEGORIAS = ['tecnico', 'cuenta', 'cotizaciones', 'sugerencia', 'otro'];

const inMemoryTickets = loadJsonSafe(TICKETS_FILE, []);

function normalize(value, allowed, fallback) {
  const clean = String(value || '').trim().toLowerCase();
  return allowed.includes(clean) ? clean : fallback;
}

function nextLocalId() {
  return inMemoryTickets.length > 0
    ? Math.max(...inMemoryTickets.map(t => Number(t.id) || 0)) + 1
    : 1;
}

function buildTicketCode() {
  const year = new Date().getFullYear();
  // Código único incluso si el almacenamiento JSON se reinicia en un deploy
  // y la base de datos ya tiene tickets con códigos anteriores.
  const stamp = Date.now().toString().slice(-5);
  const random = Math.floor(Math.random() * 36).toString(36).toUpperCase();
  return `TK-${year}-${stamp}${random}`;
}

function mapDbRow(row) {
  return {
    id: row.id_ticket,
    codigo: row.codigo,
    id_usuario: row.id_usuario,
    nombre: row.nombre,
    email: row.email,
    categoria: row.categoria,
    prioridad: row.prioridad,
    asunto: row.asunto,
    mensaje: row.mensaje,
    estado: row.estado,
    respuesta_admin: row.respuesta_admin,
    leido: row.leido,
    fecha: row.fecha,
    actualizado: row.actualizado,
    resuelto_fecha: row.resuelto_fecha,
  };
}

/**
 * Crea un ticket de soporte y devuelve el registro generado.
 */
async function createTicket({ id_usuario, nombre, email, categoria, prioridad, asunto, mensaje }) {
  const localId = nextLocalId();
  const entry = {
    id: localId,
    codigo: buildTicketCode(),
    id_usuario: id_usuario ? Number(id_usuario) : null,
    nombre: nombre ? String(nombre).trim() : 'Usuario Divise',
    email: String(email).trim(),
    categoria: normalize(categoria, CATEGORIAS, 'otro'),
    prioridad: normalize(prioridad, PRIORIDADES, 'media'),
    asunto: String(asunto).trim(),
    mensaje: String(mensaje).trim(),
    estado: 'abierto',
    respuesta_admin: null,
    leido: false,
    fecha: new Date().toISOString(),
    actualizado: new Date().toISOString(),
    resuelto_fecha: null,
  };

  inMemoryTickets.unshift(entry);
  const index = 0;
  if (inMemoryTickets.length > 500) inMemoryTickets.pop();
  saveJsonSafe(TICKETS_FILE, inMemoryTickets);

  try {
    const pool = require('../config/db');
    const result = await pool.query(
      `INSERT INTO soporte_tickets
         (codigo, id_usuario, nombre, email, categoria, prioridad, asunto, mensaje, estado, leido)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'abierto', FALSE)
       RETURNING id_ticket, codigo, id_usuario, nombre, email, categoria, prioridad,
                 asunto, mensaje, estado, respuesta_admin, leido,
                 created_at AS fecha, updated_at AS actualizado, resuelto_at AS resuelto_fecha`,
      [
        entry.codigo,
        entry.id_usuario,
        entry.nombre,
        entry.email,
        entry.categoria,
        entry.prioridad,
        entry.asunto,
        entry.mensaje,
      ]
    );

    if (result.rows[0]) {
      const dbTicket = mapDbRow(result.rows[0]);
      // Mantenemos sincronizada la copia local con el id real de PostgreSQL.
      inMemoryTickets[index] = dbTicket;
      saveJsonSafe(TICKETS_FILE, inMemoryTickets);
      return dbTicket;
    }
  } catch (err) {
    // Fallback silencioso al archivo JSON (por ejemplo, si la migración no corrió).
  }

  return entry;
}

/**
 * Listado completo de tickets (uso exclusivo del panel de administración).
 */
async function getTickets() {
  try {
    const pool = require('../config/db');
    const res = await pool.query(
      `SELECT id_ticket, codigo, id_usuario, nombre, email, categoria, prioridad,
              asunto, mensaje, estado, respuesta_admin, leido,
              created_at AS fecha, updated_at AS actualizado, resuelto_at AS resuelto_fecha
       FROM soporte_tickets
       ORDER BY created_at DESC, id_ticket DESC
       LIMIT 300`
    );
    if (res && res.rows && res.rows.length > 0) {
      const dbTickets = res.rows.map(mapDbRow);
      // Si un ticket no llegó a insertarse en PostgreSQL (fallback JSON),
      // lo mostramos igualmente combinando ambas fuentes sin duplicados.
      const dbCodes = new Set(dbTickets.map(t => t.codigo));
      const localOnly = inMemoryTickets.filter(t => !dbCodes.has(t.codigo));
      if (localOnly.length === 0) return dbTickets;

      return [...dbTickets, ...localOnly].sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
    }
  } catch (err) {
    // Fallback al archivo persistente
  }
  return inMemoryTickets;
}

/**
 * Devuelve los tickets pertenecientes a un usuario (por id o por email).
 */
async function getTicketsByUser({ id_usuario, email }) {
  const all = await getTickets();
  const userId = Number(id_usuario) || null;
  const userEmail = String(email || '').trim().toLowerCase();

  return all.filter((t) => {
    const sameId = userId && Number(t.id_usuario) === userId;
    const sameEmail = userEmail && String(t.email || '').trim().toLowerCase() === userEmail;
    return sameId || sameEmail;
  });
}

/**
 * Actualiza estado, respuesta, prioridad o lectura de un ticket.
 */
async function updateTicket(id, changes = {}) {
  const targetId = Number(id);
  const allowed = ['estado', 'respuesta_admin', 'prioridad', 'leido'];
  const clean = {};

  if (changes.estado !== undefined) {
    clean.estado = normalize(changes.estado, ESTADOS, 'abierto');
  }
  if (changes.prioridad !== undefined) {
    clean.prioridad = normalize(changes.prioridad, PRIORIDADES, 'media');
  }
  if (changes.respuesta_admin !== undefined) {
    const value = changes.respuesta_admin === null ? null : String(changes.respuesta_admin).trim();
    clean.respuesta_admin = value || null;
  }
  if (changes.leido !== undefined) {
    clean.leido = Boolean(changes.leido);
  }

  if (Object.keys(clean).length === 0) {
    throw new Error('No se enviaron cambios válidos para el ticket.');
  }

  const localTicket = inMemoryTickets.find(t => Number(t.id) === targetId);
  if (localTicket) {
    Object.assign(localTicket, clean);
    localTicket.actualizado = new Date().toISOString();
    if (clean.estado === 'resuelto') localTicket.resuelto_fecha = new Date().toISOString();
    if (clean.estado && clean.estado !== 'resuelto') localTicket.resuelto_fecha = null;
    saveJsonSafe(TICKETS_FILE, inMemoryTickets);
  }

  let dbTicket = null;
  try {
    const pool = require('../config/db');
    const sets = [];
    const values = [];
    let i = 1;

    for (const field of allowed) {
      if (clean[field] !== undefined) {
        sets.push(`${field} = $${i++}`);
        values.push(clean[field]);
      }
    }
    sets.push('updated_at = NOW()');
    if (clean.estado === 'resuelto') sets.push('resuelto_at = NOW()');
    if (clean.estado && clean.estado !== 'resuelto') sets.push('resuelto_at = NULL');

    values.push(targetId);
    const result = await pool.query(
      `UPDATE soporte_tickets
       SET ${sets.join(', ')}
       WHERE id_ticket = $${i}
       RETURNING id_ticket, codigo, id_usuario, nombre, email, categoria, prioridad,
                 asunto, mensaje, estado, respuesta_admin, leido,
                 created_at AS fecha, updated_at AS actualizado, resuelto_at AS resuelto_fecha`,
      values
    );
    if (result.rows[0]) dbTicket = mapDbRow(result.rows[0]);
  } catch (err) {
    // Se conserva la actualización local
  }

  return dbTicket || localTicket || null;
}

/**
 * Elimina un ticket.
 */
async function deleteTicket(id) {
  const targetId = Number(id);
  const index = inMemoryTickets.findIndex(t => Number(t.id) === targetId);
  if (index !== -1) {
    inMemoryTickets.splice(index, 1);
    saveJsonSafe(TICKETS_FILE, inMemoryTickets);
  }

  try {
    const pool = require('../config/db');
    await pool.query('DELETE FROM soporte_tickets WHERE id_ticket = $1', [targetId]);
  } catch (err) {}

  return true;
}

/**
 * Métricas rápidas para los KPI del panel de administración.
 */
async function getTicketStats() {
  const tickets = await getTickets();
  return {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.estado === 'abierto' || t.estado === 'en_proceso').length,
    unreadTickets: tickets.filter(t => !t.leido).length,
    resolvedTickets: tickets.filter(t => t.estado === 'resuelto' || t.estado === 'cerrado').length,
  };
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const CATEGORY_LABELS = {
  tecnico: 'Problema técnico',
  cuenta: 'Cuenta y acceso',
  cotizaciones: 'Cotizaciones',
  sugerencia: 'Sugerencia',
  otro: 'Otro',
};

const PRIORITY_LABELS = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
};

/**
 * Notifica a los administradores por correo cuando ingresa un ticket nuevo.
 * No bloquea la creación del ticket si falla el envío.
 */
async function notifyNewTicket(ticket) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'deviseproyect@gmail.com';
  const categoria = CATEGORY_LABELS[ticket.categoria] || 'Otro';
  const prioridad = PRIORITY_LABELS[ticket.prioridad] || 'Media';

  const subject = `🎫 Nuevo ticket ${ticket.codigo}: ${ticket.asunto}`;
  try {
    const res = await emailService.sendEmail({
      to: adminEmail,
      subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f0f4ff; padding: 32px 20px; border-radius: 12px; max-width: 560px; margin: 0 auto; border: 1px solid rgba(255, 255, 255, 0.08);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #c9a84c; font-size: 24px; font-weight: 800; margin: 0;">DIVISE — NUEVO TICKET DE SOPORTE</h1>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 6px;">${escapeHtml(ticket.codigo)}</p>
          </div>

          <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 20px;">
            <p style="margin: 0 0 10px 0; color: #cbd5e1; font-size: 14px;">
              <strong>De:</strong> ${escapeHtml(ticket.nombre)} &lt;<a href="mailto:${escapeHtml(ticket.email)}" style="color: #f0b90b;">${escapeHtml(ticket.email)}</a>&gt;
            </p>
            <p style="margin: 0 0 6px 0; color: #cbd5e1; font-size: 14px;"><strong>Categoría:</strong> ${escapeHtml(categoria)}</p>
            <p style="margin: 0 0 6px 0; color: #cbd5e1; font-size: 14px;"><strong>Prioridad:</strong> ${escapeHtml(prioridad)}</p>
            <p style="margin: 0 0 16px 0; color: #cbd5e1; font-size: 14px;"><strong>Asunto:</strong> ${escapeHtml(ticket.asunto)}</p>
            <div style="background: rgba(0, 0, 0, 0.35); border-left: 3px solid #c9a84c; padding: 14px 16px; border-radius: 6px;">
              <p style="color: #f4f6fa; white-space: pre-wrap; font-size: 14px; line-height: 1.6; margin: 0;">${escapeHtml(ticket.mensaje)}</p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 12px;">
            <p>Ingresá al Panel de Administración de Divise para gestionar este ticket.</p>
          </div>
        </div>
      `,
    });

    await emailService.logSentEmail({
      destinatario: adminEmail,
      remitente: ticket.email,
      remitente_nombre: ticket.nombre,
      mensaje: ticket.mensaje,
      asunto: subject,
      tipo: 'Ticket de Soporte',
      codigo: ticket.codigo,
      estado: res.success ? (res.simulated ? 'Simulado (Consola)' : 'Enviado con éxito') : 'Error de envío',
      error_detalle: res.error || null,
    });

    return res;
  } catch (err) {
    console.error('[SUPPORT] No se pudo notificar el ticket por email:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  ESTADOS,
  PRIORIDADES,
  CATEGORIAS,
  createTicket,
  getTickets,
  getTicketsByUser,
  updateTicket,
  deleteTicket,
  getTicketStats,
  notifyNewTicket,
};
