// ── server/services/userService.js ───────────────────────────────────────────
// Lógica de negocio del ABM de usuarios.
// Los controllers llaman a este servicio; ellos solo manejan HTTP.

const userModel = require('../models/userModel');

async function listUsers() {
  const users = await userModel.getAllUsers();
  return users;
}

async function getUserProfile(id_usuario) {
  const user = await userModel.getUserById(id_usuario);
  if (!user) {
    throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
  }
  return user;
}

async function updateProfile(id_usuario, { nombre, email, divisa_base_id }) {
  const existing = await userModel.getUserById(id_usuario);
  if (!existing) {
    throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
  }

  if (email) {
    const withEmail = await userModel.getUserByEmail(email);
    if (withEmail && withEmail.id_usuario !== id_usuario) {
      throw Object.assign(new Error('El email ya está registrado'), { status: 400 });
    }
  }

  const updated = await userModel.updateUserProfile(id_usuario, { nombre, email, divisa_base_id });
  return updated;
}

async function removeUser(id_usuario) {
  const deleted = await userModel.deleteUser(id_usuario);
  if (!deleted) {
    throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
  }
  return deleted;
}

module.exports = { listUsers, getUserProfile, updateProfile, removeUser };
