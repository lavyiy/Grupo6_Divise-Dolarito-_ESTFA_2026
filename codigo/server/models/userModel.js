const db = require('../config/db');

const createUser = async (nombre, email, passwordHash) => {
  const result = await db.query(
    'INSERT INTO usuarios (nombre, email, password_hash) VALUES ($1, $2, $3) RETURNING id_usuario, nombre, email, divisa_base_id',
    [nombre, email, passwordHash]
  );
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  if (!email) return null;
  const result = await db.query(
    'SELECT * FROM usuarios WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))',
    [email]
  );
  return result.rows[0];
};

const getUserByResetToken = async (token) => {
  const result = await db.query(
    'SELECT * FROM usuarios WHERE reset_token = $1 AND reset_token_expires > CURRENT_TIMESTAMP',
    [token]
  );
  return result.rows[0];
};

const updateResetToken = async (email, token, expires) => {
  await db.query(
    'UPDATE usuarios SET reset_token = $1, reset_token_expires = $2 WHERE LOWER(TRIM(email)) = LOWER(TRIM($3))',
    [token, expires, email]
  );
};

const updatePassword = async (id_usuario, newPasswordHash) => {
  await db.query(
    'UPDATE usuarios SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id_usuario = $2',
    [newPasswordHash, id_usuario]
  );
};

// ── Verificación de email por código ─────────────────────────────────────────

const setVerificationCode = async (email, codigo, expires) => {
  await db.query(
    'UPDATE usuarios SET verif_codigo = $1, verif_expira = $2 WHERE LOWER(TRIM(email)) = LOWER(TRIM($3))',
    [codigo, expires, email]
  );
};

// Guarda el token de verificación (para el enlace clickeable)
const setVerificationToken = async (email, token) => {
  await db.query(
    'UPDATE usuarios SET verif_token = $1 WHERE LOWER(TRIM(email)) = LOWER(TRIM($2))',
    [token, email]
  );
};

// Devuelve el usuario solo si el código coincide y no expiró
const getUserByVerificationCode = async (email, codigo) => {
  const result = await db.query(
    `SELECT * FROM usuarios
     WHERE LOWER(TRIM(email)) = LOWER(TRIM($1)) AND verif_codigo = $2 AND verif_expira > CURRENT_TIMESTAMP`,
    [email, codigo]
  );
  return result.rows[0];
};

// Devuelve el usuario solo si el token coincide y no expiró
const getUserByVerificationToken = async (token) => {
  const result = await db.query(
    `SELECT * FROM usuarios
     WHERE verif_token = $1 AND verif_expira > CURRENT_TIMESTAMP`,
    [token]
  );
  return result.rows[0];
};

const markEmailVerified = async (id_usuario) => {
  await db.query(
    'UPDATE usuarios SET email_verificado = TRUE, verif_codigo = NULL, verif_expira = NULL, verif_token = NULL WHERE id_usuario = $1',
    [id_usuario]
  );
};

// ── Configuración de WhatsApp (CallMeBot) ────────────────────────────────────

const updateWhatsAppConfig = async (id_usuario, { whatsapp_phone, whatsapp_api_key }) => {
  const result = await db.query(
    `UPDATE usuarios
     SET whatsapp_phone = COALESCE($1, whatsapp_phone),
         whatsapp_api_key = COALESCE($2, whatsapp_api_key)
     WHERE id_usuario = $3
     RETURNING id_usuario, whatsapp_phone, whatsapp_api_key IS NOT NULL AS tiene_api_key`,
    [whatsapp_phone, whatsapp_api_key, id_usuario]
  );
  return result.rows[0];
};

const getWhatsAppConfig = async (id_usuario) => {
  const result = await db.query(
    'SELECT whatsapp_phone, whatsapp_api_key FROM usuarios WHERE id_usuario = $1',
    [id_usuario]
  );
  return result.rows[0];
};

// ── ABM de usuarios ──────────────────────────────────────────────────────────

const getAllUsers = async () => {
  const result = await db.query(
    `SELECT u.id_usuario, u.nombre, u.email, u.divisa_base_id,
            d.codigo AS divisa_base_codigo, u.created_at
     FROM usuarios u
     LEFT JOIN divisas d ON d.id_divisa = u.divisa_base_id
     ORDER BY u.id_usuario ASC`
  );
  return result.rows;
};

const getUserById = async (id_usuario) => {
  const result = await db.query(
    `SELECT u.id_usuario, u.nombre, u.email, u.divisa_base_id,
            d.codigo AS divisa_base_codigo,
            u.email_verificado, u.two_factor_enabled, u.whatsapp_phone,
            (u.whatsapp_api_key IS NOT NULL) AS whatsapp_configurado,
            u.created_at
     FROM usuarios u
     LEFT JOIN divisas d ON d.id_divisa = u.divisa_base_id
     WHERE u.id_usuario = $1`,
    [id_usuario]
  );
  return result.rows[0];
};

// Nota de diseño: con COALESCE, enviar divisa_base_id: null NO borra la divisa
// base (limitación aceptada).
const updateUserProfile = async (id_usuario, { nombre, email, divisa_base_id }) => {
  const result = await db.query(
    `UPDATE usuarios
     SET nombre = COALESCE($1, nombre),
         email = COALESCE($2, email),
         divisa_base_id = COALESCE($3, divisa_base_id)
     WHERE id_usuario = $4
     RETURNING id_usuario, nombre, email, divisa_base_id, two_factor_enabled`,
    [nombre, email, divisa_base_id, id_usuario]
  );
  return result.rows[0];
};

const setTwoFactorEnabled = async (id_usuario, enabled) => {
  const result = await db.query(
    'UPDATE usuarios SET two_factor_enabled = $1 WHERE id_usuario = $2 RETURNING id_usuario, two_factor_enabled',
    [enabled, id_usuario]
  );
  return result.rows[0];
};

const deleteUser = async (id_usuario) => {
  const result = await db.query(
    'DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario',
    [id_usuario]
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserByResetToken,
  updateResetToken,
  updatePassword,
  setVerificationCode,
  setVerificationToken,
  getUserByVerificationCode,
  getUserByVerificationToken,
  markEmailVerified,
  updateWhatsAppConfig,
  getWhatsAppConfig,
  getAllUsers,
  getUserById,
  updateUserProfile,
  setTwoFactorEnabled,
  deleteUser
};
