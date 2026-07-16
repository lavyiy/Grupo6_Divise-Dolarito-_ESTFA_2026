const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 5000, // 5 segundos maximo para conectar
  greetingTimeout: 5000,
  socketTimeout: 5000
});

async function sendResetPasswordEmail(toEmail, token) {
  // Eliminamos la restricción temporal para que puedas probar con cualquier correo.

  const resetUrl = `https://dolarito-santi.netlify.app/reset-password?token=${token}`;
  
  // Log the URL so the user can manually click it in Render logs if SMTP is blocked
  console.log(`[ATENCION] URL de Recuperación para ${toEmail}: \n\n ${resetUrl} \n\n (Si el email falla por Render, copia y pega este link)`);
  
  const mailOptions = {
    from: `"Dolarito" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Restablecer contraseña de Dolarito',
    html: `
      <div style="font-family: Arial, sans-serif; background: #0a0f1e; color: #f0f4ff; padding: 2rem;">
        <h2 style="color: #c9a84c;">Recuperación de Contraseña</h2>
        <p>Hola,</p>
        <p>Has solicitado restablecer tu contraseña. Haz click en el siguiente botón para crear una nueva:</p>
        <a href="${resetUrl}" style="background: #c9a84c; color: #0a0f1e; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold;">Restablecer contraseña</a>
        <p>Si no fuiste vos, ignorá este mensaje.</p>
        <p style="color: #8899bb; font-size: 0.8rem; margin-top: 2rem;">El equipo de Dolarito</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL ENVIADO] Recuperación de contraseña enviada a ${toEmail}`);
  } catch (err) {
    console.error(`[ERROR EMAIL] Fallo enviando correo a ${toEmail}:`, err);
  }
}

async function sendAlertEmail(toEmail, divisa, condicion, valor, actual) {
  // Eliminamos la restricción temporal.
  
  const mailOptions = {
    from: `"Alertas Dolarito" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `🔔 Alerta: ${divisa} alcanzó tu límite`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #0a0f1e; color: #f0f4ff; padding: 2rem;">
        <h2 style="color: #2ecc8a;">¡Alerta de Mercado!</h2>
        <p>Hola,</p>
        <p>La cotización de <strong>${divisa}</strong> ha cumplido tu condición:</p>
        <p style="font-size: 1.2rem; background: rgba(201,168,76,0.1); padding: 10px; border-radius: 8px;">
          Condición: <strong>${condicion} $${valor}</strong><br>
          Precio actual: <strong>$${actual}</strong>
        </p>
        <a href="https://dolarito-santi.netlify.app" style="background: #c9a84c; color: #0a0f1e; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold;">Ver en Dolarito</a>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[ALERTA ENVIADA] Alerta enviada a ${toEmail}`);
  } catch (err) {
    console.error(`[ERROR EMAIL] Fallo enviando alerta a ${toEmail}:`, err);
  }
}

module.exports = {
  sendResetPasswordEmail,
  sendAlertEmail
};
