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
const VERIF_EXPIRES_MIN = 15;

const FRONTEND_URL = process.env.FRONTEND_URL || process.env.APP_URL || 'https://dolarito.onrender.com';

/**
 * Genera un código numérico de 6 dígitos ("012345" incluido).
 */
function generateCode() {
  return crypto.randomInt(0, 1000000).toString().padStart(6, '0');
}

/**
 * Registra un nuevo usuario y envía código de verificación al email.
 * La cuenta queda inactiva hasta verificar.
 * @returns {{ message: string, email: string }}
 */
async function registerUser(nombre, email, password) {
  if (!nombre || !email || !password) {
    throw Object.assign(new Error('Todos los campos son obligatorios'), { status: 400 });
  }

  const existing = await userModel.getUserByEmail(email);
  if (existing && existing.email_verificado) {
    throw Object.assign(new Error('El email ya está registrado'), { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  let user;
  if (existing) {
    // Re-registro de una cuenta nunca verificada: actualizamos datos y reenviamos código
    const newHash = await bcrypt.hash(password, SALT_ROUNDS);
    await userModel.updatePassword(existing.id_usuario, newHash);
    await userModel.updateUserProfile(existing.id_usuario, { nombre });
    user = existing;
  } else {
    user = await userModel.createUser(nombre, email, passwordHash);
  }

  await sendVerificationCode(user.email);

  return {
    message: 'Cuenta creada. Te enviamos un código de 6 dígitos a tu email para activarla.',
    email: user.email,
    needsVerification: true,
  };
}

/**
 * Genera y guarda código + token de verificación, y los manda por email.
 */
async function sendVerificationCode(email) {
  const codigo = generateCode();
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + VERIF_EXPIRES_MIN * 60 * 1000);
  await userModel.setVerificationCode(email, codigo, expires.toISOString());
  await userModel.setVerificationToken(email, token);

  const verifyUrl = `${FRONTEND_URL}/verify?token=${token}`;

  const full = await userModel.getUserByEmail(email);
  emailService
    .sendVerificationEmail(email, full?.nombre, codigo, verifyUrl)
    .catch(err => console.error('Error enviando código de verificación:', err.message));
}

/**
 * Verifica el código de 6 dígitos. Si es correcto, activa la cuenta
 * y devuelve sesión iniciada.
 * @returns {{ user: object, token: string }}
 */
async function verifyEmail(email, codigo) {
  if (!email || !codigo) {
    throw Object.assign(new Error('Email y código son obligatorios'), { status: 400 });
  }

  const user = await userModel.getUserByVerificationCode(email, codigo);
  if (!user) {
    throw Object.assign(new Error('Código inválido o expirado'), { status: 400 });
  }

  await userModel.markEmailVerified(user.id_usuario);

  const { password_hash, ...safeUser } = user;
  safeUser.email_verificado = true;
  const token = signToken(safeUser);
  return { user: safeUser, token };
}

/**
 * Verifica la cuenta mediante el enlace clickeable (token).
 */
async function verifyEmailByToken(token) {
  if (!token) {
    throw Object.assign(new Error('Token de verificación inválido'), { status: 400 });
  }

  const user = await userModel.getUserByVerificationToken(token);
  if (!user) {
    throw Object.assign(new Error('Enlace de verificación inválido o expirado'), { status: 400 });
  }

  await userModel.markEmailVerified(user.id_usuario);
  return { success: true, message: 'Cuenta verificada correctamente.' };
}

/**
 * Reenvía un código de verificación.
 */
async function resendVerificationCode(email) {
  if (!email) {
    throw Object.assign(new Error('Email obligatorio'), { status: 400 });
  }
  const user = await userModel.getUserByEmail(email);
  if (!user) {
    // No revelamos si el email existe o no
    return { success: true, message: 'Si el correo existe, reenviamos el código.' };
  }
  if (user.email_verificado) {
    throw Object.assign(new Error('Esta cuenta ya está verificada'), { status: 400 });
  }

  await sendVerificationCode(email);
  return { success: true, message: 'Si el correo existe, reenviamos el código.' };
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

  // Cuenta sin verificar o con 2FA activado: enviamos código de 6 dígitos y solicitamos paso 2
  if (!user.email_verificado || user.two_factor_enabled) {
    await sendVerificationCode(user.email);
    const msg = user.two_factor_enabled
      ? 'Verificación en dos pasos (2FA): Enviamos un código de 6 dígitos a tu correo.'
      : 'Tu email aún no está verificado. Enviamos un código de 6 dígitos a tu casilla para activarla.';
    throw Object.assign(
      new Error(msg),
      { status: 403, needsVerification: true, email: user.email, twoFactor: Boolean(user.two_factor_enabled) }
    );
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

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  verifyEmailByToken,
  resendVerificationCode,
  forgotPassword,
  resetPassword
};
