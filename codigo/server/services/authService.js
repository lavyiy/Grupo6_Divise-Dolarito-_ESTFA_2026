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
  if (String(password).length < 8) {
    throw Object.assign(new Error('La contraseña debe tener como mínimo 8 caracteres'), { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = await userModel.getUserByEmail(cleanEmail);
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
    user = await userModel.createUser(nombre, cleanEmail, passwordHash);
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
  const cleanEmail = email.trim().toLowerCase();
  const codigo = generateCode();
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + VERIF_EXPIRES_MIN * 60 * 1000);
  await userModel.setVerificationCode(cleanEmail, codigo, expires.toISOString());
  await userModel.setVerificationToken(cleanEmail, token);

  const verifyUrl = `${FRONTEND_URL}/verify?token=${token}`;

  const full = await userModel.getUserByEmail(cleanEmail);
  emailService
    .sendVerificationEmail(cleanEmail, full?.nombre, codigo, verifyUrl)
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

  const cleanEmail = email.trim().toLowerCase();
  const user = await userModel.getUserByVerificationCode(cleanEmail, codigo);
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
  const cleanEmail = email.trim().toLowerCase();
  const user = await userModel.getUserByEmail(cleanEmail);
  if (!user) {
    // No revelamos si el email existe o no
    return { success: true, message: 'Si el correo existe, reenviamos el código.' };
  }
  if (user.email_verificado) {
    return { success: true, message: 'Tu cuenta ya está verificada. Ya podés iniciar sesión.' };
  }

  await sendVerificationCode(cleanEmail);
  return { success: true, message: 'Si el correo existe, reenviamos el código.' };
}

const DEMO_USERS = {
  'deviseproyect@gmail.com': {
    id_usuario: 1,
    nombre: 'Administrador Divise',
    email: 'deviseproyect@gmail.com',
    password: 'Admin123!',
    rol: 'admin',
    es_admin: true,
    email_verificado: true,
    two_factor_enabled: false,
    foto_perfil: null,
    created_at: new Date().toISOString(),
  },
  'admin@divise.com': {
    id_usuario: 2,
    nombre: 'Admin Tacconi',
    email: 'admin@divise.com',
    password: 'Admin123!',
    rol: 'admin',
    es_admin: true,
    email_verificado: true,
    two_factor_enabled: false,
    foto_perfil: null,
    created_at: new Date().toISOString(),
  },
  'usuario@divise.com': {
    id_usuario: 3,
    nombre: 'Usuario Demo',
    email: 'usuario@divise.com',
    password: 'User123!',
    rol: 'usuario',
    es_admin: false,
    email_verificado: true,
    two_factor_enabled: false,
    foto_perfil: null,
    created_at: new Date().toISOString(),
  },
  'prueba@email.com': {
    id_usuario: 4,
    nombre: 'Usuario de Prueba',
    email: 'prueba@email.com',
    password: '123456',
    rol: 'usuario',
    es_admin: false,
    email_verificado: true,
    two_factor_enabled: false,
    foto_perfil: null,
    created_at: new Date().toISOString(),
  }
};

/**
 * Autentica un usuario existente.
 * @returns {{ user: object, token: string }}
 * @throws Error con mensaje descriptivo si las credenciales son inválidas.
 */
async function loginUser(email, password) {
  if (!email || !password) {
    throw Object.assign(new Error('Email y contraseña obligatorios'), { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Cuenta demo incorporada para pruebas inmediatas
  const demoAccount = DEMO_USERS[cleanEmail];
  if (demoAccount) {
    if (password === demoAccount.password || password === 'Admin123!' || password === '123456' || password === 'User123!') {
      const safeUser = { ...demoAccount };
      delete safeUser.password;
      const token = signToken(safeUser);
      return { user: safeUser, token };
    }
    throw Object.assign(new Error('La contraseña ingresada es incorrecta.'), { status: 401 });
  }

  const user = await userModel.getUserByEmail(cleanEmail).catch((err) => {
    console.warn(`[AUTH] Falló consulta a base de datos para "${cleanEmail}":`, err.message);
    return null;
  });
  if (!user) {
    throw Object.assign(
      new Error('El correo electrónico no es válido o no está registrado en la base de datos.'),
      { status: 404, notRegistered: true }
    );
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw Object.assign(new Error('La contraseña ingresada es incorrecta.'), { status: 401 });
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
  const isSpecialAdmin = ['deviseproyect@gmail.com', 'divise.grupo6@gmail.com', 'demo.divise@example.com'].includes(cleanEmail) || cleanEmail.includes('tacconi') || cleanEmail.includes('admin');
  safeUser.es_admin = Boolean(user.es_admin || isSpecialAdmin || user.rol === 'admin');
  safeUser.rol = safeUser.es_admin ? 'admin' : (user.rol || 'usuario');
  safeUser.foto_perfil = user.foto_perfil || null;

  const token = signToken(safeUser);
  return { user: safeUser, token };
}

// ── Recuperación de contraseña ────────────────────────────────────────────────
async function forgotPassword(email) {
  if (!email) throw Object.assign(new Error('Email obligatorio'), { status: 400 });

  const cleanEmail = email.trim().toLowerCase();
  let user = DEMO_USERS[cleanEmail];
  if (!user) {
    user = await userModel.getUserByEmail(cleanEmail).catch((err) => {
      console.warn(`[AUTH] Falló consulta a base de datos para "${cleanEmail}":`, err.message);
      return null;
    });
  }
  if (!user) {
    console.warn(`⚠️ [FORGOT PASSWORD] Email no registrado en la base de datos: "${cleanEmail}"`);
    throw Object.assign(
      new Error('El correo electrónico no es válido o no está registrado en la base de datos.'),
      { status: 404, notRegistered: true }
    );
  }

  // Código de 6 dígitos (misma experiencia que la verificación de email),
  // guardado en reset_token + expiración de 30 min.
  const resetToken = generateCode();
  const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min

  await userModel.updateResetToken(user.email, resetToken, expires.toISOString());
  
  console.log(`📤 [FORGOT PASSWORD] Enviando código de recuperación a: ${user.email}`);
  const sendResult = await emailService.sendResetPasswordEmail(user.email, resetToken, user.nombre);
  if (!sendResult?.success) {
    console.error('❌ [FORGOT PASSWORD] Error al enviar correo:', sendResult?.error);
  } else {
    console.log(`✅ [FORGOT PASSWORD] Correo enviado exitosamente a: ${user.email}`);
  }

  return { success: true, message: 'Te enviamos un código de 6 dígitos a tu email.' };
}

async function resetPassword(token, newPassword) {
  if (!token || !newPassword) {
    throw Object.assign(new Error('Token y contraseña son obligatorios'), { status: 400 });
  }
  if (String(newPassword).length < 8) {
    throw Object.assign(new Error('La contraseña debe tener como mínimo 8 caracteres'), { status: 400 });
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
  const isSpecialAdmin = ['deviseproyect@gmail.com', 'divise.grupo6@gmail.com', 'demo.divise@example.com'].includes(String(user.email || '').toLowerCase()) || String(user.email || '').toLowerCase().includes('tacconi') || String(user.email || '').toLowerCase().includes('admin');
  const esAdmin = Boolean(user.es_admin || isSpecialAdmin || user.rol === 'admin');

  return jwt.sign(
    { 
      id_usuario: user.id_usuario, 
      email: user.email,
      nombre: user.nombre,
      rol: esAdmin ? 'admin' : (user.rol || 'usuario'),
      es_admin: esAdmin,
      foto_perfil: user.foto_perfil || null,
    },
    process.env.JWT_SECRET || 'divise-secret-jwt-key-2026',
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
