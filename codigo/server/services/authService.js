// ── server/services/authService.js ───────────────────────────────────────────
// Lógica de negocio de autenticación.
// Los controllers llaman a este servicio; ellos solo manejan HTTP.

const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const userModel = require('../models/userModel');
const emailService = require('./emailService');

const SALT_ROUNDS = 10;
const JWT_EXPIRES = '24h';

/**
 * Registra un nuevo usuario.
 * @returns {{ user: object, token: string }}
 * @throws Error con mensaje descriptivo si falla la validación.
 */
async function registerUser(nombre, email, password) {
  if (!nombre || !email || !password) {
    throw Object.assign(new Error('Todos los campos son obligatorios'), { status: 400 });
  }

  const existing = await userModel.getUserByEmail(email);
  if (existing) {
    throw Object.assign(new Error('El email ya está registrado'), { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userModel.createUser(nombre, email, passwordHash);

  const token = signToken(user);
  return { user, token };
}

/**
 * Autentica un usuario existente.
 * @returns {{ user: object, token: string }}
 * @throws Error con mensaje descriptivo si las credenciales son inválidas.
 */
async function loginUser(email, password) {
  if (!email || !password) {
    throw Object.assign(new Error('Email y contraseña obligatorios'), { status: 400 });
  }

  const user = await userModel.getUserByEmail(email);
  if (!user) {
    throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
  }

  const { password_hash, ...safeUser } = user;
  const token = signToken(safeUser);
  return { user: safeUser, token };
}

// ── Recuperación de contraseña ────────────────────────────────────────────────
async function forgotPassword(email) {
  if (!email) throw Object.assign(new Error('Email obligatorio'), { status: 400 });

  const user = await userModel.getUserByEmail(email);
  if (!user) {
    // Para no revelar qué emails están registrados, no devolvemos error
    return { success: true, message: 'Si el correo existe, enviaremos un enlace.' };
  }

  // Generar token seguro
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min

  await userModel.updateResetToken(email, resetToken, expires.toISOString());
  
  // Enviar email sin bloquear la respuesta (fire and forget)
  emailService.sendResetPasswordEmail(email, resetToken).catch(err => {
    console.error('Error al enviar correo (posible bloqueo SMTP en Render):', err);
  });

  return { success: true, message: 'Si el correo existe, enviaremos un enlace.' };
}

async function resetPassword(token, newPassword) {
  if (!token || !newPassword) {
    throw Object.assign(new Error('Token y contraseña son obligatorios'), { status: 400 });
  }

  const user = await userModel.getUserByResetToken(token);
  if (!user) {
    throw Object.assign(new Error('Token inválido o expirado'), { status: 400 });
  }

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userModel.updatePassword(user.id_usuario, newHash);

  return { success: true, message: 'Contraseña actualizada correctamente.' };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function signToken(user) {
  return jwt.sign(
    { id_usuario: user.id_usuario, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

module.exports = { registerUser, loginUser, forgotPassword, resetPassword };
