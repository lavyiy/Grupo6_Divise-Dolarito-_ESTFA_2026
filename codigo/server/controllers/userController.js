// ── server/controllers/userController.js ─────────────────────────────────────
// Controller del ABM de usuarios.
// Solo maneja HTTP: extrae datos del request, llama al service, responde.

const userService = require('../services/userService');

const listUsers = async (req, res) => {
  try {
    const users = await userService.listUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error en listUsers:', error);
    res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
  }
};

const getProfile = async (req, res) => {
  try {
    const id_usuario = req.params.id || req.user.id_usuario;
    const user = await userService.getUserProfile(id_usuario);
    res.status(200).json(user);
  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const id_usuario = req.params.id || req.user.id_usuario;
    const { nombre, email, divisa_base_id } = req.body;
    const updated = await userService.updateProfile(id_usuario, { nombre, email, divisa_base_id });
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error en updateProfile:', error);
    res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    // El ID siempre sale del token, nunca del body.
    const id_usuario = req.user.id_usuario;
    const deleted = await userService.removeUser(id_usuario);
    res.status(200).json({ message: 'Cuenta eliminada correctamente', deleted });
  } catch (error) {
    console.error('Error en deleteAccount:', error);
    res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
  }
};

const updateWhatsApp = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const { whatsapp_phone, whatsapp_api_key } = req.body;
    const updated = await userService.updateWhatsAppConfig(id_usuario, { whatsapp_phone, whatsapp_api_key });
    res.status(200).json({ message: 'Configuración de WhatsApp guardada', ...updated });
  } catch (error) {
    console.error('Error en updateWhatsApp:', error);
    res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
  }
};

const testWhatsApp = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const result = await userService.testWhatsApp(id_usuario);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error en testWhatsApp:', error);
    res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
  }
};

const changePassword = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const { currentPassword, newPassword } = req.body;
    const result = await userService.changePassword(id_usuario, currentPassword, newPassword);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error en changePassword:', error);
    res.status(error.status || 500).json({ error: error.message || 'Error al cambiar contraseña' });
  }
};

const toggleTwoFactor = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const { enabled } = req.body;
    const result = await userService.toggleTwoFactor(id_usuario, enabled);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error en toggleTwoFactor:', error);
    res.status(error.status || 500).json({ error: error.message || 'Error al actualizar 2FA' });
  }
};

module.exports = {
  listUsers,
  getProfile,
  updateProfile,
  deleteAccount,
  updateWhatsApp,
  testWhatsApp,
  changePassword,
  toggleTwoFactor
};
