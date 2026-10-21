// ── server/services/emailService.js ──────────────────────────────────────────
// Soporte de emails vía Gmail (Nodemailer SMTP) con fallback a Brevo y consola en desarrollo.
// Variables soportadas:
//   EMAIL_USER / GMAIL_USER       -> Tu dirección de Gmail (ej: deviseproyect@gmail.com)
//   EMAIL_PASS / GMAIL_PASS       -> Contraseña de aplicación de 16 caracteres de Google
//   FRONTEND_URL                  -> URL de la app (http://localhost:5173 o en Render)

const nodemailer = require('nodemailer');
const dns = require('dns');
const path = require('path');
const fs = require('fs');

const FRONTEND_URL = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173';

// ── Persistencia en disco (JSON) para que los mensajes y auditoría no se pierdan al reiniciar ──
const DB_DIR = path.join(__dirname, '..', 'database');
const EMAIL_LOGS_FILE = path.join(DB_DIR, 'email_logs.json');
const CONTACT_MESSAGES_FILE = path.join(DB_DIR, 'contact_messages.json');

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

// Carga inicial de auditoría de emails
const inMemoryEmailLogs = loadJsonSafe(EMAIL_LOGS_FILE, [
  {
    id_email: 1,
    destinatario: 'deviseproyect@gmail.com',
    remitente: 'agustin.rodriguez@gmail.com',
    remitente_nombre: 'Agustín Rodríguez',
    asunto: 'Contacto Soporte: Consulta sobre límites en calculadora y alertas (de agustin.rodriguez@gmail.com)',
    tipo: 'Contacto a Administradores',
    codigo: 'Hola equipo de Divise, estuve...',
    estado: 'Recibido en Soporte',
    mensaje: 'Hola equipo de Divise, estuve probando el sistema de cotizaciones y me parece genial. ¿Tienen previsto habilitar más pares de criptoactivos en las alertas personalizadas? ¡Muchas gracias!',
    error_detalle: null,
    fecha: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id_email: 2,
    destinatario: 'demo.divise@example.com',
    remitente: 'deviseproyect@gmail.com',
    remitente_nombre: 'Divise Soporte',
    asunto: 'Tu código de verificación Divise: 489210',
    tipo: 'Verificación de Cuenta',
    codigo: '489210',
    estado: 'Enviado con éxito',
    mensaje: null,
    error_detalle: null,
    fecha: new Date(Date.now() - 3600000 * 6).toISOString(),
  }
]);

// Carga inicial de mensajes de contacto de usuarios
const inMemoryContactMessages = loadJsonSafe(CONTACT_MESSAGES_FILE, [
  {
    id: 1,
    nombre: 'Agustín Rodríguez',
    email: 'agustin.rodriguez@gmail.com',
    asunto: 'Consulta sobre límites en calculadora y alertas',
    mensaje: 'Hola equipo de Divise, estuve probando el sistema de cotizaciones y me parece genial. ¿Tienen previsto habilitar más pares de criptoactivos en las alertas personalizadas? ¡Muchas gracias!',
    fecha: new Date(Date.now() - 3600000 * 3).toISOString(),
    leido: false,
    respondido: false,
  },
  {
    id: 2,
    nombre: 'Lucía Méndez',
    email: 'lucia.mendez@outlook.com',
    asunto: 'Excelente plataforma y consulta Dólar MEP',
    mensaje: 'Buenas tardes administradores, quería consultar si el tipo de cambio Dólar MEP se actualiza automáticamente cada 15 minutos o si requiere recargar la página. Saludos.',
    fecha: new Date(Date.now() - 3600000 * 24).toISOString(),
    leido: true,
    respondido: true,
  }
]);

// Guardar archivos si acaban de inicializarse por primera vez
if (!fs.existsSync(EMAIL_LOGS_FILE)) saveJsonSafe(EMAIL_LOGS_FILE, inMemoryEmailLogs);
if (!fs.existsSync(CONTACT_MESSAGES_FILE)) saveJsonSafe(CONTACT_MESSAGES_FILE, inMemoryContactMessages);

/**
 * Registra un correo enviado en la base de datos y en el buffer persistente.
 */
async function logSentEmail({
  destinatario,
  asunto,
  tipo,
  codigo = null,
  estado = 'enviado',
  error_detalle = null,
  remitente = null,
  remitente_nombre = null,
  mensaje = null
}) {
  const newId = inMemoryEmailLogs.length > 0
    ? Math.max(...inMemoryEmailLogs.map(e => Number(e.id_email) || 0)) + 1
    : 1;

  const entry = {
    id_email: newId,
    destinatario,
    remitente,
    remitente_nombre,
    mensaje,
    asunto,
    tipo,
    codigo,
    estado,
    error_detalle,
    fecha: new Date().toISOString(),
  };

  inMemoryEmailLogs.unshift(entry);
  if (inMemoryEmailLogs.length > 300) inMemoryEmailLogs.pop();
  saveJsonSafe(EMAIL_LOGS_FILE, inMemoryEmailLogs);

  try {
    const pool = require('../config/db');
    await pool.query(
      `INSERT INTO emails_enviados (destinatario, asunto, tipo, codigo, estado, error_detalle, fecha)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [destinatario, asunto, tipo, codigo, estado, error_detalle]
    );
  } catch (err) {
    // Si la tabla no está creada aún o falla la conexión, la copia persistente en JSON ya está guardada
  }
  return entry;
}

/**
 * Devuelve el listado de correos enviados para la vista de administrador.
 */
async function getEmailLogs() {
  try {
    const pool = require('../config/db');
    const res = await pool.query(
      `SELECT id_email, destinatario, asunto, tipo, codigo, estado, error_detalle, fecha
       FROM emails_enviados
       ORDER BY fecha DESC, id_email DESC
       LIMIT 100`
    );
    if (res && res.rows && res.rows.length > 0) {
      return res.rows;
    }
  } catch (err) {
    // Fallback a logs persistentes en memoria/JSON
  }
  return inMemoryEmailLogs;
}

/**
 * Construye transportadores SMTP de Gmail con reintentos.
 * Render free no tiene salida IPv6 (y smtp.gmail.com resuelve IPv6 primero),
 * así que forzamos IPv4 y probamos 465 (TLS implícito) y 587 (STARTTLS).
 */
async function buildGmailTransporters() {
  const user = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const rawPass = process.env.EMAIL_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
  const pass = rawPass ? rawPass.replace(/\s+/g, '') : null;

  if (!user || !pass) return [];

  const host4 = await dns.promises
    .lookup('smtp.gmail.com', { family: 4 })
    .then(r => r.address)
    .catch(() => 'smtp.gmail.com');

  const common = {
    auth: { user, pass },
    tls: { servername: 'smtp.gmail.com' },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  };

  return [
    nodemailer.createTransport({ ...common, host: host4, port: 465, secure: true }),
    nodemailer.createTransport({ ...common, host: host4, port: 587, secure: false, requireTLS: true }),
  ];
}

/**
 * Envía un correo electrónico utilizando Gmail SMTP (Nodemailer), Resend, Brevo o simulación en consola.
 */
async function sendEmail({ to, subject, html, from }) {
  // 1. Gmail SMTP (Nodemailer) con reintentos (IPv4 465 / 587 STARTTLS)
  const gmailTransporters = await buildGmailTransporters();
  if (gmailTransporters.length > 0) {
    const user = process.env.EMAIL_USER || process.env.GMAIL_USER;
    const defaultFrom = process.env.EMAIL_FROM || `"Divise" <${user}>`;
    const errors = [];
    for (const transporter of gmailTransporters) {
      try {
        const info = await transporter.sendMail({
          from: from || defaultFrom,
          to: Array.isArray(to) ? to.join(', ') : to,
          subject,
          html,
        });
        console.log(`\n📧 [GMAIL SMTP SUCCESS] Correo enviado a ${to} (MessageId: ${info.messageId})`);
        return { success: true, provider: 'gmail', data: { id: info.messageId } };
      } catch (err) {
        errors.push(err.message);
        console.error(`\n❌ [GMAIL SMTP ERROR]: ${err.message}`);
      }
    }
    console.error(`[GMAIL] Todos los intentos fallaron: ${errors.join(' | ')} → probando proveedores de respaldo.`);
  }

  // 2. Resend API (si está configurada RESEND_API_KEY)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: from || process.env.RESEND_FROM || 'Divise <onboarding@resend.dev>',
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        console.log(`\n📧 [RESEND SUCCESS] Correo enviado a ${to} (ID: ${data?.id})`);
        return { success: true, provider: 'resend', data };
      }
      console.error('\n❌ [RESEND ERROR]:', data?.message || data?.error || res.statusText);
    } catch (err) {
      console.error('\n❌ [RESEND EXCEPTION]:', err.message);
    }
  }

  // 3. Brevo API (opcional)
  const brevoKey = process.env.BREVO_API_KEY;
  const brevoSender = process.env.BREVO_SENDER;
  if (brevoKey && brevoSender) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { email: brevoSender, name: 'Divise' },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        console.log(`\n📧 [BREVO SUCCESS] Correo enviado a ${to}`);
        return { success: true, provider: 'brevo', data };
      }
      console.error('\n❌ [BREVO ERROR]:', data?.message || res.statusText);
    } catch (err) {
      console.error('\n❌ [BREVO EXCEPTION]:', err.message);
    }
  }

  // 4. Modo desarrollo / consola
  const hadProviders = gmailTransporters.length > 0 || resendApiKey || (brevoKey && brevoSender);
  if (hadProviders) {
    console.error('❌ [EMAIL] Ningún proveedor pudo enviar el correo.');
    return { success: false, provider: 'none', error: 'Ningún proveedor de email pudo enviar el correo.' };
  }
  console.warn(`\n⚠️ [EMAIL NO CONFIGURADO] Para enviar correos reales, definí EMAIL_USER y EMAIL_PASS en server/.env`);
  console.warn(`📩 [SIMULACIÓN CONSOLA] Destino: ${to} | Asunto: ${subject}`);
  return {
    success: true,
    provider: 'simulated',
    simulated: true,
    message: 'Email simulado en consola (configura EMAIL_USER y EMAIL_PASS para Gmail)',
  };
}

// ── Verificación de email (código de 6 dígitos + enlace) ─────────────────────

async function sendVerificationEmail(toEmail, nombre, codigo, verifyUrl) {
  const url = verifyUrl || `${FRONTEND_URL}/verify?token=${codigo}`;
  console.log(`\n======================================================`);
  console.log(`🔑 [CÓDIGO DE VERIFICACIÓN GMAIL]`);
  console.log(`👤 Para: ${toEmail} (${nombre || 'Usuario'})`);
  console.log(`🔢 Código de 6 dígitos: ${codigo}`);
  console.log(`🔗 Enlace directo: ${url}`);
  console.log(`======================================================\n`);

  const res = await sendEmail({
    to: toEmail,
    subject: `Tu código de verificación Divise: ${codigo}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f0f4ff; padding: 32px 20px; border-radius: 12px; max-width: 540px; margin: 0 auto; border: 1px solid rgba(255, 255, 255, 0.08);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #c9a84c; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: 1px;">DIVISE</h1>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Cotizaciones & Mercado en Tiempo Real</p>
        </div>

        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 24px; text-align: center;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Activá tu cuenta</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">
            Hola <strong>${nombre || 'Usuario'}</strong>, ingresá este código en Divise para activar tu cuenta o completar tu inicio de sesión:
          </p>

          <div style="margin: 24px 0;">
            <span style="display: inline-block; padding: 14px 32px; background: rgba(201, 168, 76, 0.15); border: 2px solid #c9a84c; border-radius: 10px; font-size: 32px; letter-spacing: 8px; font-weight: 800; color: #f2cf66; font-family: monospace;">
              ${codigo}
            </span>
          </div>

          <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; margin-top: 20px;">
            <p style="color: #94a3b8; font-size: 13px; margin-top: 0;">O activá directamente haciendo clic aquí:</p>
            <a href="${url}" target="_blank" style="display: inline-block; padding: 12px 28px; background: #c9a84c; color: #0b0f19; font-weight: 700; text-decoration: none; border-radius: 8px; font-size: 14px;">
              ✔ Activar mi cuenta
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 12px; margin-top: 20px; margin-bottom: 0;">
            Este enlace y código expiran en <strong>15 minutos</strong>. Si no solicitaste este acceso, podés ignorar este correo de forma segura.
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 11px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Divise. Todos los derechos reservados.</p>
        </div>
      </div>
    `,
  });

  await logSentEmail({
    destinatario: toEmail,
    asunto: `Tu código de verificación Divise: ${codigo}`,
    tipo: 'Verificación de Cuenta',
    codigo,
    estado: res.success ? (res.simulated ? 'Simulado (Consola)' : 'Enviado con éxito') : 'Error de envío',
    error_detalle: res.error || null,
  });

  return res;
}

// ── Recuperación de contraseña ────────────────────────────────────────────────

async function sendResetPasswordEmail(toEmail, codigo, nombre) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${codigo}&email=${encodeURIComponent(toEmail)}`;
  console.log(`\n======================================================`);
  console.log(`🔑 [CÓDIGO DE RECUPERACIÓN GMAIL]`);
  console.log(`👤 Para: ${toEmail} (${nombre || 'Usuario'})`);
  console.log(`🔢 Código de 6 dígitos: ${codigo}`);
  console.log(`🔗 Enlace directo: ${resetUrl}`);
  console.log(`======================================================\n`);

  const res = await sendEmail({
    to: toEmail,
    subject: `Tu código de recuperación Divise: ${codigo}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f0f4ff; padding: 32px 20px; border-radius: 12px; max-width: 540px; margin: 0 auto; border: 1px solid rgba(255, 255, 255, 0.08);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #c9a84c; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: 1px;">DIVISE</h1>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Cotizaciones & Mercado en Tiempo Real</p>
        </div>

        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 24px; text-align: center;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Recuperación de Contraseña</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">
            Hola <strong>${nombre || 'Usuario'}</strong>, ingresá este código en Divise para restablecer tu contraseña:
          </p>

          <div style="margin: 24px 0;">
            <span style="display: inline-block; padding: 14px 32px; background: rgba(201, 168, 76, 0.15); border: 2px solid #c9a84c; border-radius: 10px; font-size: 32px; letter-spacing: 8px; font-weight: 800; color: #f2cf66; font-family: monospace;">
              ${codigo}
            </span>
          </div>

          <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; margin-top: 20px;">
            <p style="color: #94a3b8; font-size: 13px; margin-top: 0;">O restablecé directamente haciendo clic aquí:</p>
            <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; background: #c9a84c; color: #0b0f19; font-weight: 700; text-decoration: none; border-radius: 8px; font-size: 14px;">
              ✔ Restablecer contraseña
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 12px; margin-top: 20px; margin-bottom: 0;">
            Este código y enlace expiran en <strong>30 minutos</strong>. Si no solicitaste este cambio, podés ignorar este correo de forma segura.
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 11px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Divise. Todos los derechos reservados.</p>
        </div>
      </div>
    `,
  });

  await logSentEmail({
    destinatario: toEmail,
    asunto: `Tu código de recuperación Divise: ${codigo}`,
    tipo: 'Recuperación de Clave',
    codigo,
    estado: res.success ? (res.simulated ? 'Simulado (Consola)' : 'Enviado con éxito') : 'Error de envío',
    error_detalle: res.error || null,
  });

  return res;
}

// ── Alerta de cotización ──────────────────────────────────────────────────────

async function sendAlertEmail(toEmail, divisa, condicion, valor, actual) {
  const res = await sendEmail({
    to: toEmail,
    subject: `🔔 Alerta Divise: ${divisa} alcanzó tu límite`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f0f4ff; padding: 32px 20px; border-radius: 12px; max-width: 540px; margin: 0 auto; border: 1px solid rgba(255, 255, 255, 0.08);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #c9a84c; font-size: 26px; font-weight: 800; margin: 0;">DIVISE</h1>
        </div>

        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 24px; text-align: center;">
          <h2 style="color: #2ecc8a; font-size: 18px; margin-top: 0;">¡Alerta de Cotización Activada! 🔔</h2>
          <p style="color: #cbd5e1; font-size: 14px;">La cotización de <strong>${divisa}</strong> alcanzó el objetivo configurado:</p>

          <div style="background: rgba(201, 168, 76, 0.08); border: 1px solid rgba(201, 168, 76, 0.25); border-radius: 8px; padding: 16px; margin: 20px 0; text-align: left;">
            <p style="margin: 0 0 6px 0; color: #cbd5e1; font-size: 13px;">Condición configurada: <strong style="color: #ffffff;">${condicion} $${valor}</strong></p>
            <p style="margin: 0; color: #cbd5e1; font-size: 13px;">Precio detectado: <strong style="color: #2ecc8a; font-size: 15px;">$${actual}</strong></p>
          </div>

          <a href="${FRONTEND_URL}" target="_blank" style="display: inline-block; padding: 10px 24px; background: #c9a84c; color: #0b0f19; font-weight: 700; text-decoration: none; border-radius: 8px; font-size: 14px;">
            Ver en Divise
          </a>
        </div>
      </div>
    `,
  });

  await logSentEmail({
    destinatario: toEmail,
    asunto: `🔔 Alerta Divise: ${divisa} alcanzó tu límite`,
    tipo: 'Alerta de Cotización',
    codigo: `${condicion} $${valor}`,
    estado: res.success ? (res.simulated ? 'Simulado (Consola)' : 'Enviado con éxito') : 'Error de envío',
    error_detalle: res.error || null,
  });

  return res;
}

// ── Contacto con administradores y gestión de mensajes de usuarios ───────────

/**
 * Guarda un mensaje enviado por un usuario en el registro de administración.
 */
async function saveContactMessage({ nombre, email, asunto, mensaje }) {
  const newId = inMemoryContactMessages.length > 0
    ? Math.max(...inMemoryContactMessages.map(m => Number(m.id) || 0)) + 1
    : 1;

  const msgEntry = {
    id: newId,
    nombre: nombre ? String(nombre).trim() : 'Usuario Divise',
    email: String(email).trim(),
    asunto: asunto ? String(asunto).trim() : 'Consulta de soporte',
    mensaje: String(mensaje).trim(),
    fecha: new Date().toISOString(),
    leido: false,
    respondido: false,
  };

  inMemoryContactMessages.unshift(msgEntry);
  if (inMemoryContactMessages.length > 500) inMemoryContactMessages.pop();
  saveJsonSafe(CONTACT_MESSAGES_FILE, inMemoryContactMessages);

  try {
    const pool = require('../config/db');
    await pool.query(
      `INSERT INTO mensajes_contacto (nombre, email, asunto, mensaje, leido, fecha)
       VALUES ($1, $2, $3, $4, FALSE, NOW())`,
      [msgEntry.nombre, msgEntry.email, msgEntry.asunto, msgEntry.mensaje]
    );
  } catch (err) {
    // Fallback a almacenamiento persistente en JSON
  }

  return msgEntry;
}

/**
 * Devuelve la lista de mensajes de contacto recibidos de los usuarios.
 */
async function getContactMessages() {
  try {
    const pool = require('../config/db');
    const res = await pool.query(
      `SELECT id_mensaje as id, nombre, email, asunto, mensaje, leido, respondido, fecha
       FROM mensajes_contacto
       ORDER BY fecha DESC, id_mensaje DESC
       LIMIT 200`
    );
    if (res && res.rows && res.rows.length > 0) {
      return res.rows;
    }
  } catch (err) {}
  return inMemoryContactMessages;
}

/**
 * Marca un mensaje como leído o no leído.
 */
async function markContactMessageRead(id, leido = true) {
  const targetId = Number(id);
  const msg = inMemoryContactMessages.find(m => Number(m.id) === targetId);
  if (msg) {
    msg.leido = Boolean(leido);
    saveJsonSafe(CONTACT_MESSAGES_FILE, inMemoryContactMessages);
  }
  try {
    const pool = require('../config/db');
    await pool.query('UPDATE mensajes_contacto SET leido = $1 WHERE id_mensaje = $2', [Boolean(leido), targetId]);
  } catch (err) {}
  return msg || { id: targetId, leido };
}

/**
 * Elimina un mensaje de contacto.
 */
async function deleteContactMessage(id) {
  const targetId = Number(id);
  const index = inMemoryContactMessages.findIndex(m => Number(m.id) === targetId);
  if (index !== -1) {
    inMemoryContactMessages.splice(index, 1);
    saveJsonSafe(CONTACT_MESSAGES_FILE, inMemoryContactMessages);
  }
  try {
    const pool = require('../config/db');
    await pool.query('DELETE FROM mensajes_contacto WHERE id_mensaje = $1', [targetId]);
  } catch (err) {}
  return true;
}

async function sendContactEmail({ nombre, email, asunto, mensaje }) {
  const adminEmail = process.env.EMAIL_USER || process.env.ADMIN_EMAIL || 'deviseproyect@gmail.com';
  const cleanAsunto = asunto ? String(asunto).trim() : 'Consulta de usuario desde la plataforma';
  const cleanNombre = nombre ? String(nombre).trim() : 'Usuario Divise';
  const cleanEmail = String(email).trim();
  const cleanMensaje = String(mensaje).trim();

  // 1. Guardar de forma garantizada el mensaje para visualización en el Panel de Admin
  const savedMessage = await saveContactMessage({
    nombre: cleanNombre,
    email: cleanEmail,
    asunto: cleanAsunto,
    mensaje: cleanMensaje,
  });

  // 2. Despachar correo electrónico a la casilla oficial de soporte (deviseproyect@gmail.com)
  const res = await sendEmail({
    to: adminEmail,
    subject: `📩 Contacto Soporte Divise: ${cleanAsunto}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f0f4ff; padding: 32px 20px; border-radius: 12px; max-width: 560px; margin: 0 auto; border: 1px solid rgba(255, 255, 255, 0.08);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #c9a84c; font-size: 24px; font-weight: 800; margin: 0;">DIVISE — MENSAJE DE SOPORTE</h1>
        </div>

        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 20px;">
          <p style="margin: 0 0 10px 0; color: #cbd5e1; font-size: 14px;">
            <strong>De:</strong> ${cleanNombre} &lt;<a href="mailto:${cleanEmail}" style="color: #f0b90b;">${cleanEmail}</a>&gt;
          </p>
          <p style="margin: 0 0 16px 0; color: #cbd5e1; font-size: 14px;">
            <strong>Asunto:</strong> ${cleanAsunto}
          </p>
          <div style="background: rgba(0, 0, 0, 0.35); border-left: 3px solid #c9a84c; padding: 14px 16px; border-radius: 6px;">
            <p style="color: #f4f6fa; white-space: pre-wrap; font-size: 14px; line-height: 1.6; margin: 0;">${cleanMensaje}</p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 12px;">
          <p>Podés responderle directamente haciendo clic en Responder en tu cliente de correo.</p>
        </div>
      </div>
    `,
  });

  // 3. Registrar en la tabla de auditoría de correos enviados con todos los detalles
  const snippet = cleanMensaje.length > 40 ? cleanMensaje.slice(0, 40) + '…' : cleanMensaje;
  await logSentEmail({
    destinatario: adminEmail,
    remitente: cleanEmail,
    remitente_nombre: cleanNombre,
    mensaje: cleanMensaje,
    asunto: `Contacto Soporte: ${cleanAsunto} (de ${cleanEmail})`,
    tipo: 'Contacto a Administradores',
    codigo: snippet,
    estado: res.success ? (res.simulated ? 'Recibido en Panel (Simulado)' : 'Enviado con éxito') : 'Error de envío',
    error_detalle: res.error || null,
  });

  return { ...res, savedMessage };
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendAlertEmail,
  sendContactEmail,
  logSentEmail,
  getEmailLogs,
  saveContactMessage,
  getContactMessages,
  markContactMessageRead,
  deleteContactMessage,
};
