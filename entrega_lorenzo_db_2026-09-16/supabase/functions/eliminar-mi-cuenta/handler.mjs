export function createDeleteAccountHandler({ admin, allowedOrigins }) {
  return async function handleRequest(request) {
    const origin = request.headers.get('origin');
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Vary': 'Origin',
    };
    const respond = (status, body) => new Response(JSON.stringify(body), { status, headers });

    if (origin && !allowedOrigins.includes(origin)) {
      return respond(403, { error: 'Origen no permitido.' });
    }
    if (origin) headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Headers'] = 'authorization, apikey, content-type, x-client-info';
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') {
      headers.Allow = 'POST, OPTIONS';
      return respond(405, { error: 'Usar POST.' });
    }
    const match = /^Bearer ([^\s]+)$/i.exec(request.headers.get('authorization') ?? '');
    if (!match) return respond(401, { error: 'Inicia sesion con Supabase Auth.' });

    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
      return respond(415, { error: 'Enviar application/json.' });
    }
    let body;
    try {
      body = await request.json();
    } catch {
      return respond(400, { error: 'JSON invalido.' });
    }
    if (!body || Array.isArray(body) ||
        body.confirmacion !== 'ELIMINAR MI CUENTA' ||
        Object.keys(body).some((key) => key !== 'confirmacion')) {
      return respond(400, { error: 'Se requiere confirmacion. No enviar identificadores de usuarios.' });
    }
    if (!admin) return respond(503, { error: 'Servicio no configurado.' });

    try {
      // getUser consulta Auth; no basta con decodificar un JWT recibido.
      const { data, error: authError } = await admin.auth.getUser(match[1]);
      if (authError || !data?.user?.id) {
        return respond(401, { error: 'Sesion invalida o cuenta inexistente.' });
      }
      const userId = data.user.id;
      const { data: profile, error: profileError } = await admin
        .from('usuarios').select('id_usuario').eq('auth_user_id', userId).maybeSingle();
      if (profileError) return respond(503, { error: 'No se pudo comprobar el perfil.' });
      if (!profile) {
        return respond(409, { error: 'El perfil debe estar vinculado a Supabase Auth antes de eliminarlo.' });
      }

      const { error: signOutError } = await admin.auth.admin.signOut(match[1], 'global');
      if (signOutError) return respond(503, { error: 'No se pudieron cerrar las sesiones.' });

      // Auth elimina su cuenta y las FK eliminan sus datos en la misma transaccion.
      const { error: deleteError } = await admin.auth.admin.deleteUser(userId, false);
      if (deleteError) {
        return respond(409, {
          error: 'No se pudo completar la eliminacion. Inicia sesion de nuevo y contacta al equipo.',
        });
      }
      return respond(200, { eliminada: true });
    } catch {
      return respond(503, { error: 'No se pudo confirmar la operacion. Comprueba el estado de tu cuenta.' });
    }
  };
}
