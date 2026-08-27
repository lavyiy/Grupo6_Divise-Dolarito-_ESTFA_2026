// ── server/services/emailService.js ──────────────────────────────────────────
// Envío de emails via Brevo (https://www.brevo.com) — API HTTP, funciona en Render free.
// Variable de entorno requerida: BREVO_API_KEY
//
// Brevo gratis: 300 emails/día, 9,000/mes, sin verificar dominio propio.
// Render free bloquea SMTP (25, 465, 587) → Brevo usa HTTPS (443), siempre funciona.
//
// Antes se usaba nodemailer (Gmail SMTP) y Resend; ambos fallan o tienen
// restricciones en Render free. Brevo es la solución elegida.

const FRONTEND_URL = process.env.FRONTEND_URL || process.env.APP_URL || 'https://dolarito.onrender.com';

/**
 * Helper: POST a la API de Brevo (SMTP API v3).
 */
async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn('[EMAIL] BREVO_API_KEY no configurada. Email no enviado.');
    console.warn(`[EMAIL SIMULADO] Para: ${to} | Asunto: ${subject}`);
    return { success: false, error: 'BREVO_API_KEY no configurada', simulated: true };
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender:  { email: 'no-reply@brevo.com', name: 'Divise' },
      to:      [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error('[EMAIL] Error de Brevo:', res.status, data);
    return { success: false, error: data?.message || `Error ${res.status}` };
  }

  console.log(`[EMAIL] Enviado correctamente a ${to}`);
  return { success: true, provider: 'brevo', data };
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
