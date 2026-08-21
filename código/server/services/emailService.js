// ── server/services/emailService.js ──────────────────────────────────────────
// Envío de emails via Resend (https://resend.com) — API HTTP, funciona en Render free.
// Variable de entorno requerida: RESEND_API_KEY
//
// Por qué Resend y no nodemailer/Gmail:
//   - Render bloquea los puertos SMTP (25, 465, 587) en el plan gratuito.
//   - Resend usa HTTPS (puerto 443) → nunca bloqueado.
//   - Plan gratis: 3.000 emails/mes, 100/día.

const FROM_ADDRESS = 'Divise <onboarding@resend.dev>';
// ↑ Este "from" funciona en el plan gratuito de Resend sin verificar dominio.
//   Cuando tengas un dominio propio, cambiarlo por: noreply@tudominio.com

/**
 * Helper genérico: hace POST a la API de Resend.
 */
async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('[EMAIL] RESEND_API_KEY no configurada. Email no enviado.');
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error('[EMAIL] Error de Resend:', error);
  } else {
    console.log(`[EMAIL] Enviado correctamente a ${to}`);
  }
}

// ── Recuperación de contraseña ────────────────────────────────────────────────

async function sendResetPasswordEmail(toEmail, token) {
  const resetUrl = `https://divise-santi.netlify.app/reset-password?token=${token}`;

  // Backup: si el email falla, el link sigue visible en los logs de Render
  console.log(`[RESET URL] ${toEmail} → ${resetUrl}`);

  await sendEmail({
    to: toEmail,
    subject: 'Restablecer contraseña de Divise',
    html: `
      <div style="font-family: Arial, sans-serif; background: #0a0f1e; color: #f0f4ff; padding: 2rem; border-radius: 12px;">
        <h2 style="color: #c9a84c;">Recuperación de Contraseña 💱</h2>
        <p>Hola,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Hacé click en el botón para crear una nueva:</p>
        <a href="${resetUrl}"
           style="display: inline-block; margin: 20px 0; padding: 12px 24px;
                  background: #c9a84c; color: #0a0f1e; text-decoration: none;
                  border-radius: 8px; font-weight: bold; font-size: 1rem;">
          Restablecer contraseña
        </a>
        <p style="color: #8899bb; font-size: 0.85rem;">
          Este link expira en <strong>30 minutos</strong>. Si no fuiste vos, ignorá este mensaje.
        </p>
        <hr style="border-color: rgba(255,255,255,0.1); margin: 1.5rem 0;">
        <p style="color: #8899bb; font-size: 0.75rem;">El equipo de Divise</p>
      </div>
    `,
  });
}

// ── Alerta de precio ──────────────────────────────────────────────────────────

async function sendAlertEmail(toEmail, divisa, condicion, valor, actual) {
  await sendEmail({
    to: toEmail,
    subject: `🔔 Alerta Divise: ${divisa} alcanzó tu límite`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #0a0f1e; color: #f0f4ff; padding: 2rem; border-radius: 12px;">
        <h2 style="color: #2ecc8a;">¡Alerta de Mercado! 🔔</h2>
        <p>Hola,</p>
        <p>La cotización de <strong>${divisa}</strong> cumplió tu condición:</p>
        <div style="background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3);
                    padding: 1rem; border-radius: 8px; margin: 1rem 0;">
          <p style="margin: 0;">Condición: <strong>${condicion} $${valor}</strong></p>
          <p style="margin: 0.5rem 0 0;">Precio actual: <strong style="color: #2ecc8a;">$${actual}</strong></p>
        </div>
        <a href="https://divise-santi.netlify.app"
           style="display: inline-block; margin: 20px 0; padding: 12px 24px;
                  background: #c9a84c; color: #0a0f1e; text-decoration: none;
                  border-radius: 8px; font-weight: bold;">
          Ver en Divise
        </a>
        <p style="color: #8899bb; font-size: 0.75rem;">El equipo de Divise</p>
      </div>
    `,
  });
}

module.exports = {
  sendResetPasswordEmail,
  sendAlertEmail,
};
