// ── server/controllers/authController.js ─────────────────────────────────────
// Controller de autenticación.
// Solo maneja HTTP: extrae datos del request, llama al service, responde.

const authService = require('../services/authService');

const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const result = await authService.registerUser(nombre, email, password);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error en register:', error);
    res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(error.status || 500).json({ error: error.message || 'Error interno' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(error.status || 500).json({ error: error.message || 'Error interno' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, codigo } = req.body;
    const result = await authService.verifyEmail(email, codigo);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error en verifyEmail:', error);
    res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.resendVerificationCode(email);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error en resendVerification:', error);
    res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
  }
};

const testEmail = async (req, res) => {
  try {
    const to = req.body?.to || req.query?.to || 'deviseproyect@gmail.com';
    const emailService = require('../services/emailService');
    const result = await emailService.sendEmail({
      to,
      subject: 'Prueba de integración de Emails - Divise API',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #0b0f19; color: #f0f4ff; border-radius: 8px;">
          <h2 style="color: #c9a84c;">¡Servicio de Emails funcionando en Divise! 🚀</h2>
          <p>Este es un email de prueba enviado exitosamente hacia <strong>${to}</strong>.</p>
          <p style="color: #94a3b8; font-size: 13px;">Fecha: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo enviar el correo.',
        details: result.error,
        help: 'Verifica tus variables EMAIL_USER/EMAIL_PASS (Gmail) o RESEND_API_KEY en tu archivo .env',
      });
    }

    res.status(200).json({
      success: true,
      provider: result.provider,
      message: `Email de prueba enviado con éxito a ${to} usando ${result.provider || 'email service'}`,
      data: result.data,
    });
  } catch (error) {
    console.error('Error en testEmail:', error);
    res.status(500).json({ error: error.message || 'Error interno al probar email' });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  testEmail,
};

