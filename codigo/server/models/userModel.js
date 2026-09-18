// ── server/models/userModel.js ───────────────────────────────────────────────
// Acceso a la tabla `usuarios` (y su relación con `divisas`) mediante el
// cliente oficial de Supabase. Cada función devuelve las mismas formas de
// objeto que la versión previa basada en SQL para no romper a los llamadores.

const db = require('../config/db');

// El cliente se lee dinamicamente desde db para permitir inyeccion en tests.
const supabase = () => db.supabase;

// Las columnas de fecha son TIMESTAMP SIN zona horaria (hora local de la BD).
// Se comparan con la hora local en formato "YYYY-MM-DDTHH:mm:ss" para que el
// filtro coincida con lo que almacena PostgreSQL.
function localNow() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

// Normaliza un valor de expiración (Date o ISO) a "YYYY-MM-DDTHH:mm:ss" local,
// coherente con las columnas TIMESTAMP de la base.
function toLocalTimestamp(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return value;
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

const createUser = async (nombre, email, passwordHash) => {
  const { data, error } = await supabase().from('usuarios')
    .insert({ nombre, email, password_hash: passwordHash })
    .select('id_usuario, nombre, email, divisa_base_id')
    .single();

  if (error) throw error;
  return data;
};

const getUserByEmail = async (email) => {
  if (!email) return null;
  const { data, error } = await supabase().from('usuarios')
    .select('*')
    .ilike('email', String(email).trim())
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const getUserByResetToken = async (token) => {
  const { data, error } = await supabase().from('usuarios')
    .select('*')
    .eq('reset_token', token)
    .gt('reset_token_expires', localNow())
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const updateResetToken = async (email, token, expires) => {
  const { error } = await supabase().from('usuarios')
    .update({ reset_token: token, reset_token_expires: toLocalTimestamp(expires) })
    .ilike('email', String(email).trim());

  if (error) throw error;
};

const updatePassword = async (id_usuario, newPasswordHash) => {
  const { error } = await supabase().from('usuarios')
    .update({
      password_hash: newPasswordHash,
      reset_token: null,
      reset_token_expires: null,
    })
    .eq('id_usuario', id_usuario);

  if (error) throw error;
};

// ── Verificación de email por código ─────────────────────────────────────────

const setVerificationCode = async (email, codigo, expires) => {
  const { error } = await supabase().from('usuarios')
    .update({ verif_codigo: codigo, verif_expira: toLocalTimestamp(expires) })
    .ilike('email', String(email).trim());

  if (error) throw error;
};

// Guarda el token de verificación (para el enlace clickeable)
const setVerificationToken = async (email, token) => {
  const { error } = await supabase().from('usuarios')
    .update({ verif_token: token })
    .ilike('email', String(email).trim());

  if (error) throw error;
};

// Devuelve el usuario solo si el código coincide y no expiró
const getUserByVerificationCode = async (email, codigo) => {
  const { data, error } = await supabase().from('usuarios')
    .select('*')
    .ilike('email', String(email).trim())
    .eq('verif_codigo', codigo)
    .gt('verif_expira', localNow())
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Devuelve el usuario solo si el token coincide y no expiró
const getUserByVerificationToken = async (token) => {
  const { data, error } = await supabase().from('usuarios')
    .select('*')
    .eq('verif_token', token)
    .gt('verif_expira', localNow())
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const markEmailVerified = async (id_usuario) => {
  const { error } = await supabase().from('usuarios')
    .update({
      email_verificado: true,
      verif_codigo: null,
      verif_expira: null,
      verif_token: null,
    })
    .eq('id_usuario', id_usuario);

  if (error) throw error;
};

// ── Configuración de WhatsApp (CallMeBot) ────────────────────────────────────

const updateWhatsAppConfig = async (id_usuario, { whatsapp_phone, whatsapp_api_key }) => {
  // Se leen los valores actuales para respetar la semántica COALESCE:
  // enviar null/undefined no debe borrar lo ya configurado.
  const { data: current, error: readError } = await supabase().from('usuarios')
    .select('whatsapp_phone, whatsapp_api_key')
    .eq('id_usuario', id_usuario)
    .single();

  if (readError) throw readError;

  const next = {
    whatsapp_phone: whatsapp_phone ?? current?.whatsapp_phone ?? null,
    whatsapp_api_key: whatsapp_api_key ?? current?.whatsapp_api_key ?? null,
  };

  const { data, error } = await supabase().from('usuarios')
    .update(next)
    .eq('id_usuario', id_usuario)
    .select('id_usuario, whatsapp_phone, whatsapp_api_key')
    .single();

  if (error) throw error;

  return {
    id_usuario: data.id_usuario,
    whatsapp_phone: data.whatsapp_phone,
    tiene_api_key: data.whatsapp_api_key !== null && data.whatsapp_api_key !== undefined,
  };
};

const getWhatsAppConfig = async (id_usuario) => {
  const { data, error } = await supabase().from('usuarios')
    .select('whatsapp_phone, whatsapp_api_key')
    .eq('id_usuario', id_usuario)
    .single();

  if (error) throw error;
  return data;
};

// ── ABM de usuarios ──────────────────────────────────────────────────────────

const getAllUsers = async () => {
  const { data, error } = await supabase().from('usuarios')
    .select('id_usuario, nombre, email, divisa_base_id, created_at, divisas ( codigo )')
    .order('id_usuario', { ascending: true });

  if (error) throw error;

  return (data || []).map((u) => ({
    id_usuario: u.id_usuario,
    nombre: u.nombre,
    email: u.email,
    divisa_base_id: u.divisa_base_id,
    divisa_base_codigo: u.divisas?.codigo ?? null,
    created_at: u.created_at,
  }));
};

const getUserById = async (id_usuario) => {
  const { data, error } = await supabase().from('usuarios')
    .select(
      'id_usuario, nombre, email, divisa_base_id, email_verificado, two_factor_enabled, ' +
      'whatsapp_phone, whatsapp_api_key, created_at, divisas ( codigo )'
    )
    .eq('id_usuario', id_usuario)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id_usuario: data.id_usuario,
    nombre: data.nombre,
    email: data.email,
    divisa_base_id: data.divisa_base_id,
    divisa_base_codigo: data.divisas?.codigo ?? null,
    email_verificado: data.email_verificado,
    two_factor_enabled: data.two_factor_enabled,
    whatsapp_phone: data.whatsapp_phone,
    whatsapp_configurado: data.whatsapp_api_key !== null && data.whatsapp_api_key !== undefined,
    created_at: data.created_at,
  };
};

// Nota de diseño: con la semántica COALESCE, enviar divisa_base_id: null NO
// borra la divisa base (limitación aceptada, igual que en la versión SQL).
const updateUserProfile = async (id_usuario, { nombre, email, divisa_base_id }) => {
  const { data: current, error: readError } = await supabase().from('usuarios')
    .select('nombre, email, divisa_base_id')
    .eq('id_usuario', id_usuario)
    .single();

  if (readError) throw readError;

  const { data, error } = await supabase().from('usuarios')
    .update({
      nombre: nombre ?? current?.nombre ?? null,
      email: email ?? current?.email ?? null,
      divisa_base_id: divisa_base_id ?? current?.divisa_base_id ?? null,
    })
    .eq('id_usuario', id_usuario)
    .select('id_usuario, nombre, email, divisa_base_id, two_factor_enabled')
    .single();

  if (error) throw error;
  return data;
};

const setTwoFactorEnabled = async (id_usuario, enabled) => {
  const { data, error } = await supabase().from('usuarios')
    .update({ two_factor_enabled: enabled })
    .eq('id_usuario', id_usuario)
    .select('id_usuario, two_factor_enabled')
    .single();

  if (error) throw error;
  return data;
};

const deleteUser = async (id_usuario) => {
  const { data, error } = await supabase().from('usuarios')
    .delete()
    .eq('id_usuario', id_usuario)
    .select('id_usuario')
    .maybeSingle();

  if (error) throw error;
  return data;
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
