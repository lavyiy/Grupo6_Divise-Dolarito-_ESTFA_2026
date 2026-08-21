const db = require('../config/db');

const createUser = async (nombre, email, passwordHash) => {
  const result = await db.query(
    'INSERT INTO usuarios (nombre, email, password_hash) VALUES ($1, $2, $3) RETURNING id_usuario, nombre, email, divisa_base_id',
    [nombre, email, passwordHash]
  );
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const result = await db.query(
    'SELECT * FROM usuarios WHERE email = $1',
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
    'UPDATE usuarios SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
    [token, expires, email]
  );
};

const updatePassword = async (id_usuario, newPasswordHash) => {
  await db.query(
    'UPDATE usuarios SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id_usuario = $2',
    [newPasswordHash, id_usuario]
  );
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
            d.codigo AS divisa_base_codigo, u.created_at
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
     RETURNING id_usuario, nombre, email, divisa_base_id`,
    [nombre, email, divisa_base_id, id_usuario]
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
  getAllUsers,
  getUserById,
  updateUserProfile,
  deleteUser
};
