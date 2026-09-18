import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeleteAccountHandler } from './handler.mjs';

function fixture(failure) {
  const calls = [];
  const admin = {
    from(table) {
      assert.equal(table, 'usuarios');
      return { select(columns) {
        assert.equal(columns, 'id_usuario');
        return { eq(column, id) {
          assert.equal(column, 'auth_user_id');
          assert.equal(id, 'verified-owner');
          return { async maybeSingle() {
            calls.push('profile');
            return { data: failure === 'missing-profile' ? null : { id_usuario: 10 },
              error: failure === 'profile' ? new Error('private detail') : null };
          } };
        } };
      } };
    },
    auth: {
      async getUser(token) {
        calls.push(['getUser', token]);
        if (failure === 'throw') throw new Error('private detail');
        return { data: { user: { id: 'verified-owner' } },
          error: failure === 'auth' ? new Error('private detail') : null };
      },
      admin: {
        async signOut(token, scope) {
          calls.push(['signOut', token, scope]);
          return { error: failure === 'signOut' ? new Error('private detail') : null };
        },
        async deleteUser(id, soft) {
          calls.push(['deleteUser', id, soft]);
          return { error: failure === 'delete' ? new Error('private detail') : null };
        },
      },
    },
  };
  return { calls, handle: createDeleteAccountHandler({ admin, allowedOrigins: ['https://dolaritosep.netlify.app'] }) };
}

function request({ body = { confirmacion: 'ELIMINAR MI CUENTA' }, method = 'POST', headers = {} } = {}) {
  return new Request('https://example.test/eliminar-mi-cuenta', {
    method,
    headers: { authorization: 'Bearer session-token', 'content-type': 'application/json', ...headers },
    ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  });
}

test('solo elimina la identidad verificada, despues de revocar sesiones', async () => {
  const { handle, calls } = fixture();
  const response = await handle(request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { eliminada: true });
  assert.deepEqual(calls, [['getUser', 'session-token'], 'profile',
    ['signOut', 'session-token', 'global'], ['deleteUser', 'verified-owner', false]]);
});

for (const [name, input, expected] of [
  ['sin token', { headers: { authorization: '' } }, 401],
  ['origen ajeno', { headers: { origin: 'https://attacker.test' } }, 403],
  ['GET', { method: 'GET' }, 405],
  ['sin confirmar', { body: {} }, 400],
  ['intento de elegir otra cuenta', { body: { confirmacion: 'ELIMINAR MI CUENTA', user_id: 'victim' } }, 400],
  ['JSON roto', { body: '{' }, 400],
  ['JSON null', { body: null }, 400],
  ['tipo incorrecto', { headers: { 'content-type': 'text/plain' } }, 415],
]) {
  test(`rechaza ${name} sin tocar Auth`, async () => {
    const { handle, calls } = fixture();
    assert.equal((await handle(request(input))).status, expected);
    assert.deepEqual(calls, []);
  });
}

for (const [failure, expected] of [
  ['auth', 401], ['profile', 503], ['missing-profile', 409], ['signOut', 503], ['throw', 503],
]) {
  test(`no borra si falla ${failure}`, async () => {
    const { handle, calls } = fixture(failure);
    const response = await handle(request());
    assert.equal(response.status, expected);
    assert.equal(calls.some((call) => call[0] === 'deleteUser'), false);
    assert.equal((await response.text()).includes('private detail'), false);
  });
}

test('no informa exito si Auth rechaza el borrado', async () => {
  const { handle } = fixture('delete');
  const response = await handle(request());
  assert.equal(response.status, 409);
  assert.equal((await response.text()).includes('private detail'), false);
});

test('preflight del sitio autorizado no modifica datos', async () => {
  const { handle, calls } = fixture();
  const response = await handle(request({ method: 'OPTIONS', headers: { origin: 'https://dolaritosep.netlify.app' } }));
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://dolaritosep.netlify.app');
  assert.deepEqual(calls, []);
});
