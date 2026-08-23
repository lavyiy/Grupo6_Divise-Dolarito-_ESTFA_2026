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

module.exports = { listUsers, getProfile, updateProfile, deleteAccount };
