// ── server/services/emailService.js ──────────────────────────────────────────
// Soporte de emails vía Gmail (Nodemailer SMTP) con fallback a Brevo y consola en desarrollo.
// Variables soportadas:
//   EMAIL_USER / GMAIL_USER       -> Tu dirección de Gmail (ej: deviseproyect@gmail.com)
//   EMAIL_PASS / GMAIL_PASS       -> Contraseña de aplicación de 16 caracteres de Google
//   FRONTEND_URL                  -> URL de la app (http://localhost:5173 o en Render)

const nodemailer = require('nodemailer');

const FRONTEND_URL = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173';

/**
 * Obtiene el transportador de Nodemailer configurado con Gmail.
 */
function getGmailTransporter() {
  const user = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const rawPass = process.env.EMAIL_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
  const pass = rawPass ? rawPass.replace(/\s+/g, '') : null;

  if (user && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }
  return null;
}

/**
 * Envía un correo electrónico utilizando Gmail SMTP (Nodemailer), Brevo o simulación en consola.
 */
async function sendEmail({ to, subject, html, from }) {
  const gmail = getGmailTransporter();

  // 1. Gmail SMTP (Nodemailer)
  if (gmail) {
    const user = process.env.EMAIL_USER || process.env.GMAIL_USER;
    const defaultFrom = process.env.EMAIL_FROM || `"Divise" <${user}>`;
    try {
      const info = await gmail.sendMail({
        from: from || defaultFrom,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
      });
      console.log(`\n📧 [GMAIL SMTP SUCCESS] Correo enviado a ${to} (MessageId: ${info.messageId})`);
      return { success: true, provider: 'gmail', data: { id: info.messageId } };
    } catch (err) {
      console.error('\n❌ [GMAIL SMTP ERROR]:', err.message);
      return { success: false, provider: 'gmail', error: err.message };
    }
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

  // 3. Modo desarrollo / consola
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

  return await sendEmail({
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
}

// ── Recuperación de contraseña ────────────────────────────────────────────────

async function sendResetPasswordEmail(toEmail, token) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  console.log(`\n======================================================`);
  console.log(`🔗 [ENLACE DE RECUPERACIÓN GMAIL]`);
  console.log(`👤 Para: ${toEmail}`);
  console.log(`🔗 Link: ${resetUrl}`);
  console.log(`======================================================\n`);

  return await sendEmail({
    to: toEmail,
    subject: 'Restablecer tu contraseña de Divise',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f0f4ff; padding: 32px 20px; border-radius: 12px; max-width: 540px; margin: 0 auto; border: 1px solid rgba(255, 255, 255, 0.08);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #c9a84c; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: 1px;">DIVISE</h1>
        </div>

        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 24px; text-align: center;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Recuperación de Contraseña</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta. Hacé clic en el siguiente botón para continuar:
          </p>

          <div style="margin: 24px 0;">
            <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; background: #c9a84c; color: #0b0f19; font-weight: 700; text-decoration: none; border-radius: 8px; font-size: 15px;">
              Restablecer Contraseña
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 12px;">
            O copiá este enlace en tu navegador:<br/>
            <span style="color: #c9a84c; word-break: break-all;">${resetUrl}</span>
          </p>

          <p style="color: #94a3b8; font-size: 12px; margin-top: 16px; margin-bottom: 0;">
            El enlace es válido por <strong>30 minutos</strong>. Si no solicitaste este cambio, ignorá este mensaje.
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 11px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Divise.</p>
        </div>
      </div>
    `,
  });
}

// ── Alerta de cotización ──────────────────────────────────────────────────────

async function sendAlertEmail(toEmail, divisa, condicion, valor, actual) {
  return await sendEmail({
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
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendAlertEmail,
};
