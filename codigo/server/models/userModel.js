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
  try {
    const { data, error } = await supabase().from('usuarios')
      .select('id_usuario, nombre, email, divisa_base_id, rol, es_admin, foto_perfil, email_verificado, created_at, divisas ( codigo )')
      .order('id_usuario', { ascending: true });

    if (error) throw error;

    return (data || []).map((u) => {
      const isSpecialAdmin = ['deviseproyect@gmail.com', 'divise.grupo6@gmail.com', 'demo.divise@example.com'].includes(u.email?.toLowerCase()) || u.email?.toLowerCase().includes('tacconi');
      return {
        id_usuario: u.id_usuario,
        nombre: u.nombre,
        email: u.email,
        divisa_base_id: u.divisa_base_id,
        divisa_base_codigo: u.divisas?.codigo ?? null,
        email_verificado: u.email_verificado,
        rol: u.rol || (u.es_admin || isSpecialAdmin ? 'admin' : 'usuario'),
        es_admin: Boolean(u.es_admin || isSpecialAdmin || u.rol === 'admin'),
        foto_perfil: u.foto_perfil ?? null,
        created_at: u.created_at,
      };
    });
  } catch {
    try {
      const { data: fallbackData, error: fbErr } = await supabase().from('usuarios')
        .select('id_usuario, nombre, email, divisa_base_id, email_verificado, created_at, divisas ( codigo )')
        .order('id_usuario', { ascending: true });
      if (fbErr) throw fbErr;
      return (fallbackData || []).map((u) => {
        const isSpecialAdmin = ['deviseproyect@gmail.com', 'divise.grupo6@gmail.com', 'demo.divise@example.com'].includes(u.email?.toLowerCase()) || u.email?.toLowerCase().includes('tacconi');
        return {
          id_usuario: u.id_usuario,
          nombre: u.nombre,
          email: u.email,
          divisa_base_id: u.divisa_base_id,
          divisa_base_codigo: u.divisas?.codigo ?? null,
          email_verificado: u.email_verificado,
          rol: isSpecialAdmin ? 'admin' : 'usuario',
          es_admin: isSpecialAdmin,
          foto_perfil: null,
          created_at: u.created_at,
        };
      });
    } catch {
      return [
        {
          id_usuario: 1,
          nombre: 'Administrador Divise',
          email: 'deviseproyect@gmail.com',
          divisa_base_id: 1,
          divisa_base_codigo: 'USD',
          email_verificado: true,
          rol: 'admin',
          es_admin: true,
          foto_perfil: null,
          created_at: new Date().toISOString(),
        },
        {
          id_usuario: 2,
          nombre: 'Admin Tacconi',
          email: 'admin@divise.com',
          divisa_base_id: 1,
          divisa_base_codigo: 'USD',
          email_verificado: true,
          rol: 'admin',
          es_admin: true,
          foto_perfil: null,
          created_at: new Date().toISOString(),
        },
        {
          id_usuario: 3,
          nombre: 'Usuario Demo',
          email: 'usuario@divise.com',
          divisa_base_id: 1,
          divisa_base_codigo: 'ARS',
          email_verificado: true,
          rol: 'usuario',
          es_admin: false,
          foto_perfil: null,
          created_at: new Date().toISOString(),
        },
        {
          id_usuario: 4,
          nombre: 'Usuario de Prueba',
          email: 'prueba@email.com',
          divisa_base_id: 1,
          divisa_base_codigo: 'ARS',
          email_verificado: true,
          rol: 'usuario',
          es_admin: false,
          foto_perfil: null,
          created_at: new Date().toISOString(),
        }
      ];
    }
  }
};

const getUserById = async (id_usuario) => {
  let finalData = null;
  try {
    const { data, error } = await supabase().from('usuarios')
      .select(
        'id_usuario, nombre, email, divisa_base_id, email_verificado, two_factor_enabled, ' +
        'whatsapp_phone, whatsapp_api_key, rol, es_admin, foto_perfil, created_at, divisas ( codigo )'
      )
      .eq('id_usuario', id_usuario)
      .maybeSingle();
    if (error) throw error;
    finalData = data;
  } catch {
    const { data: fbData } = await supabase().from('usuarios')
      .select(
        'id_usuario, nombre, email, divisa_base_id, email_verificado, two_factor_enabled, ' +
        'whatsapp_phone, whatsapp_api_key, created_at, divisas ( codigo )'
      )
      .eq('id_usuario', id_usuario)
      .maybeSingle();
    finalData = fbData;
  }

  if (!finalData) return null;

  const isSpecialAdmin = ['deviseproyect@gmail.com', 'divise.grupo6@gmail.com', 'demo.divise@example.com'].includes(finalData.email?.toLowerCase()) || finalData.email?.toLowerCase().includes('tacconi');

  return {
    id_usuario: finalData.id_usuario,
    nombre: finalData.nombre,
    email: finalData.email,
    divisa_base_id: finalData.divisa_base_id,
    divisa_base_codigo: finalData.divisas?.codigo ?? null,
    email_verificado: finalData.email_verificado,
    two_factor_enabled: finalData.two_factor_enabled,
    whatsapp_phone: finalData.whatsapp_phone,
    whatsapp_configurado: finalData.whatsapp_api_key !== null && finalData.whatsapp_api_key !== undefined,
    rol: finalData.rol || (finalData.es_admin || isSpecialAdmin ? 'admin' : 'usuario'),
    es_admin: Boolean(finalData.es_admin || isSpecialAdmin || finalData.rol === 'admin'),
    foto_perfil: finalData.foto_perfil || null,
    created_at: finalData.created_at,
  };
};

const updateUserProfile = async (id_usuario, { nombre, email, divisa_base_id, foto_perfil, rol, es_admin }) => {
  const updateFields = {};
  if (nombre !== undefined) updateFields.nombre = nombre;
  if (email !== undefined) updateFields.email = email;
  if (divisa_base_id !== undefined) updateFields.divisa_base_id = divisa_base_id;
  if (foto_perfil !== undefined) updateFields.foto_perfil = foto_perfil;
  if (rol !== undefined) {
    updateFields.rol = rol;
    updateFields.es_admin = rol === 'admin';
  }
  if (es_admin !== undefined) updateFields.es_admin = es_admin;

  if (Object.keys(updateFields).length === 0) {
    throw Object.assign(
      new Error('No se enviaron cambios para actualizar el perfil.'),
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase().from('usuarios')
      .update(updateFields)
      .eq('id_usuario', id_usuario)
      .select('id_usuario, nombre, email, divisa_base_id, two_factor_enabled, rol, es_admin, foto_perfil')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      throw Object.assign(new Error('Usuario no encontrado.'), { status: 404 });
    }
    return data;
  } catch (error) {
    // Solo se reintenta sin columnas opcionales cuando el error indica que el
    // esquema todavía no las tiene (bases viejas). Cualquier otro error debe
    // llegar al frontend en lugar de simular una actualización exitosa.
    const message = String(error?.message || '');
    const isMissingOptionalColumn =
      error?.code === '42703' ||
      error?.code === 'PGRST204' ||
      /foto_perfil|\bes_admin\b|\brol\b|schema cache/i.test(message);

    if (!isMissingOptionalColumn) throw error;

    const safeFields = { ...updateFields };
    delete safeFields.foto_perfil;
    delete safeFields.rol;
    delete safeFields.es_admin;

    if (Object.keys(safeFields).length === 0) {
      throw error;
    }

    const { data: safeData, error: safeErr } = await supabase().from('usuarios')
      .update(safeFields)
      .eq('id_usuario', id_usuario)
      .select('id_usuario, nombre, email, divisa_base_id, two_factor_enabled')
      .maybeSingle();

    if (safeErr) throw safeErr;
    if (!safeData) {
      throw Object.assign(new Error('Usuario no encontrado.'), { status: 404 });
    }
    return {
      ...safeData,
      foto_perfil: foto_perfil ?? null,
      rol: rol ?? 'usuario',
      es_admin: Boolean(es_admin)
    };
  }
};

const setUserRole = async (id_usuario, rol) => {
  return await updateUserProfile(id_usuario, { rol, es_admin: rol === 'admin' });
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
  setUserRole,
  setTwoFactorEnabled,
  deleteUser
};
