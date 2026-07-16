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

module.exports = {
  createUser,
  getUserByEmail,
  getUserByResetToken,
  updateResetToken,
  updatePassword
};
