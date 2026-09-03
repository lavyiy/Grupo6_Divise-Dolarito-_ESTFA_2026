// ── server/services/userService.js ───────────────────────────────────────────
// Lógica de negocio del ABM de usuarios.
// Los controllers llaman a este servicio; ellos solo manejan HTTP.

const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const whatsappService = require('./whatsappService');

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

// ── WhatsApp (CallMeBot) ─────────────────────────────────────────────────────

function normalizePhone(phone) {
  const digits = String(phone).replace(/[^\d]/g, '');
  if (digits.length < 10 || digits.length > 15) {
    throw Object.assign(
      new Error('Número inválido. Incluí el código de país, ej: +5491122334455'),
      { status: 400 }
    );
  }
  return '+' + digits;
}

async function updateWhatsAppConfig(id_usuario, { whatsapp_phone, whatsapp_api_key }) {
  const existing = await userModel.getUserById(id_usuario);
  if (!existing) {
    throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
  }

  const config = {};
  if (whatsapp_phone !== undefined && whatsapp_phone !== null && whatsapp_phone !== '') {
    config.whatsapp_phone = normalizePhone(whatsapp_phone);
  }
  if (whatsapp_api_key !== undefined && whatsapp_api_key !== null && whatsapp_api_key !== '') {
    config.whatsapp_api_key = String(whatsapp_api_key).trim();
  }

  return userModel.updateWhatsAppConfig(id_usuario, config);
}

async function testWhatsApp(id_usuario) {
  const cfg = await userModel.getWhatsAppConfig(id_usuario);
  if (!cfg?.whatsapp_phone || !cfg?.whatsapp_api_key) {
    throw Object.assign(
      new Error('Primero guardá tu número de WhatsApp y la API key de CallMeBot.'),
      { status: 400 }
    );
  }

  const result = await whatsappService.sendWhatsApp(
    cfg.whatsapp_phone,
    cfg.whatsapp_api_key,
    '✅ Hola! Esta es una prueba de notificaciones de Divise.'
  );

  if (!result.ok) {
    throw Object.assign(new Error(`No se pudo enviar el mensaje: ${result.error}`), { status: 502 });
  }
  return { success: true, message: 'Mensaje de prueba enviado a tu WhatsApp.' };
}

// ── Seguridad de cuenta ──────────────────────────────────────────────────────

async function changePassword(id_usuario, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    throw Object.assign(new Error('Debes ingresar la contraseña actual y la nueva contraseña.'), { status: 400 });
  }
  if (newPassword.length < 8) {
    throw Object.assign(new Error('La nueva contraseña debe tener mínimo 8 caracteres.'), { status: 400 });
  }

  const user = await userModel.getUserById(id_usuario);
  if (!user) {
    throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
  }

  const fullUser = await userModel.getUserByEmail(user.email);
  if (!fullUser) {
    throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
  }

  const match = await bcrypt.compare(currentPassword, fullUser.password_hash);
  if (!match) {
    throw Object.assign(new Error('La contraseña actual es incorrecta.'), { status: 400 });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await userModel.updatePassword(id_usuario, newHash);
  return { success: true, message: 'Contraseña actualizada con éxito.' };
}

async function toggleTwoFactor(id_usuario, enabled) {
  const existing = await userModel.getUserById(id_usuario);
  if (!existing) {
    throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
  }

  const result = await userModel.setTwoFactorEnabled(id_usuario, Boolean(enabled));
  return {
    success: true,
    two_factor_enabled: result.two_factor_enabled,
    message: result.two_factor_enabled ? 'Autenticación en dos pasos activada' : 'Autenticación en dos pasos desactivada'
  };
}

module.exports = {
  listUsers,
  getUserProfile,
  updateProfile,
  removeUser,
  updateWhatsAppConfig,
  testWhatsApp,
  changePassword,
  toggleTwoFactor
};
