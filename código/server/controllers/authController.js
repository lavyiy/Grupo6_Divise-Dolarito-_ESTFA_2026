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

module.exports = { register, login, forgotPassword, resetPassword };
