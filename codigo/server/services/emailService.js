// ── server/services/emailService.js ──────────────────────────────────────────
// Soporte híbrido de envío de emails:
// 1. Gmail SMTP (vía Nodemailer) -> Recomendado para enviar a cualquier email sin comprar dominio.
//    Variables requeridas: EMAIL_USER, EMAIL_PASS (Contraseña de aplicación de Google).
// 2. Resend (https://resend.com) -> API HTTP / SDK Resend.
//    Variable requerida: RESEND_API_KEY (y opcionalmente RESEND_FROM).

let ResendClient = null;
try {
  const { Resend } = require('resend');
  ResendClient = Resend;
} catch (e) {
  // Resend SDK opcional
}

let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  // Nodemailer opcional
}

const FRONTEND_URL = process.env.FRONTEND_URL || process.env.APP_URL || 'https://dolarito.onrender.com';

/**
 * Obtiene el transportador de Nodemailer configurado con Gmail.
 */
function getGmailTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : null;

  if (nodemailer && user && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }
  return null;
}

/**
 * Envía un correo electrónico utilizando Gmail (Nodemailer) o Resend según la configuración disponible.
 */
async function sendEmail({ to, subject, html, from }) {
  const gmailTransporter = getGmailTransporter();
  const resendApiKey = process.env.RESEND_API_KEY;

  // 1. Prioridad: Gmail SMTP (permite enviar a cualquier correo sin restricciones de dominio)
  if (gmailTransporter) {
    try {
      const defaultFrom = process.env.EMAIL_FROM || `"Divise" <${process.env.EMAIL_USER}>`;
      const info = await gmailTransporter.sendMail({
        from: from || defaultFrom,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
      });

      console.log(`\n✅ [GMAIL SMTP SUCCESS] Correo enviado a ${to} (MessageId: ${info.messageId})`);
      return { success: true, provider: 'gmail', data: { id: info.messageId } };
    } catch (err) {
      console.error('\n❌ [GMAIL SMTP ERROR]:', err.message);
      // Si falla Gmail y hay Resend, intentamos Resend como respaldo
      if (!resendApiKey) {
        return { success: false, provider: 'gmail', error: err.message };
      }
      console.log('⚠️ Intentando envío de respaldo con Resend...');
    }
  }

  // 2. Resend API
  if (resendApiKey) {
    const defaultResendFrom = process.env.RESEND_FROM || 'Divise <onboarding@resend.dev>';
    try {
      if (ResendClient) {
        const resend = new ResendClient(resendApiKey);
        const { data, error } = await resend.emails.send({
          from: from || defaultResendFrom,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
        });

        if (error) {
          console.error('\n❌ [RESEND ERROR]:', error.message || error);
          return { success: false, provider: 'resend', error: error.message || error };
        }

        console.log(`\n✅ [RESEND SUCCESS] Correo enviado a ${to} (ID: ${data?.id})`);
        return { success: true, provider: 'resend', data };
      } else {
        // Fallback con fetch HTTP nativo
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: from || defaultResendFrom,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.error('\n❌ [RESEND API ERROR]:', data?.message || data?.error || res.statusText);
          return { success: false, provider: 'resend', error: data?.message || data?.error || 'Error al enviar email' };
        }

        console.log(`\n✅ [RESEND SUCCESS] Correo enviado a ${to} (ID: ${data?.id})`);
        return { success: true, provider: 'resend', data };
      }
    } catch (err) {
      console.error('\n❌ [EMAIL EXCEPTION]:', err.message);
      return { success: false, provider: 'resend', error: err.message };
    }
  }

  // 3. Ningún proveedor configurado (Modo simulación en consola para desarrollo)
  console.warn('\n⚠️ [EMAIL NO CONFIGURADO] No se definieron EMAIL_USER/EMAIL_PASS ni RESEND_API_KEY.');
  console.warn(`[SIMULACIÓN] Destino: ${to} | Asunto: ${subject}`);
  return {
    success: false,
    error: 'No se configuraron credenciales de email (EMAIL_USER/EMAIL_PASS ni RESEND_API_KEY)',
    simulated: true,
  };
}

// ── Verificación de email (código de 6 dígitos) ──────────────────────────────

async function sendVerificationEmail(toEmail, nombre, codigo) {
  console.log(`\n🔑 [CÓDIGO DE VERIFICACIÓN] Para: ${toEmail} -> Código: ${codigo}`);

  return await sendEmail({
    to: toEmail,
    subject: `Tu código de verificación Divise: ${codigo}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f0f4ff; padding: 32px 20px; border-radius: 12px; max-width: 540px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #c9a84c; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: 1px;">DIVISE</h1>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Cotizaciones & Mercado en Tiempo Real</p>
        </div>

        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 24px; text-align: center;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Activá tu cuenta</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">
            Hola <strong>${nombre || 'Usuario'}</strong>, ingresá el siguiente código en la aplicación para activar tu cuenta de Divise:
          </p>

          <div style="margin: 24px 0;">
            <span style="display: inline-block; padding: 12px 28px; background: rgba(201, 168, 76, 0.15); border: 1px solid #c9a84c; border-radius: 8px; font-size: 28px; letter-spacing: 6px; font-weight: 700; color: #f2cf66; font-family: monospace;">
              ${codigo}
            </span>
          </div>

          <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
            Este código expira en <strong>15 minutos</strong>. Si no solicitaste este registro, podés ignorar este correo de forma segura.
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
  console.log(`\n🔗 [RESET PASSWORD LINK] Para: ${toEmail} -> ${resetUrl}`);

  return await sendEmail({
    to: toEmail,
    subject: 'Restablecer tu contraseña de Divise',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f0f4ff; padding: 32px 20px; border-radius: 12px; max-width: 540px; margin: 0 auto;">
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
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f0f4ff; padding: 32px 20px; border-radius: 12px; max-width: 540px; margin: 0 auto;">
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
