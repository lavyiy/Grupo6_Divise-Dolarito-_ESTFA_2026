const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { once } = require('node:events');
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');

// Reemplaza verifyToken para inyectar un usuario autenticado sin JWT real.
authMiddleware.verifyToken = (req, _res, next) => {
  req.user = { id_usuario: 7, email: 'test@divise.app' };
  next();
};

// Mock encadenable del query builder de Supabase.
function makeQueryMock(script) {
  const calls = [];
  const query = {};
  // Si la respuesta esperada es un objeto (single), no se debe tratar el
  // builder como "thenable": debe resolverse sólo al llamar a single/maybeSingle.
  const singleRow = script.result && script.result.data != null && !Array.isArray(script.result.data);
  query.then = singleRow
    ? undefined
    : (onFulfilled, onRejected) => Promise.resolve(script.result).then(onFulfilled, onRejected);
  for (const name of [
    'select', 'eq', 'ilike', 'limit', 'order', 'insert', 'update', 'delete',
    'upsert', 'in', 'single', 'maybeSingle',
  ]) {
    query[name] = (...args) => {
      calls.push({ name, args });
      if (name === 'single' || name === 'maybeSingle') return Promise.resolve(script.result);
      return query;
    };
  }
  return { query, calls };
}

function installDb(scripts) {
  const original = db.supabase;
  const client = {
    from(table) {
      const script = scripts[table];
      if (!script) throw new Error(`Tabla no simulada: ${table}`);
      script.calls.push({ name: 'from', args: [table] });
      return script.query;
    },
  };
  db.supabase = client;
  return () => { db.supabase = original; };
}

async function withServer(router, run) {
  const app = express();
  app.use(express.json());
  app.use(router);
  const server = app.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
  }
}

test('GET /api/favorites devuelve los códigos del usuario', async () => {
  const favs = makeQueryMock({
    result: {
      data: [{ id_favorito: 1, divisas: { codigo: 'USD' } }, { id_favorito: 2, divisas: { codigo: 'BTC' } }],
      error: null,
    },
  });
  const restore = installDb({ favoritos: favs });
  const router = require('./favoritesRoutes');

  try {
    await withServer(router, async (base) => {
      const res = await fetch(`${base}/`);
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), ['USD', 'BTC']);
    });
  } finally {
    restore();
  }
});

test('POST /api/favorites/toggle agrega cuando no existía', async () => {
  const divisas = makeQueryMock({ result: { data: [{ id_divisa: 4, codigo: 'BTC' }], error: null } });
  const favs = makeQueryMock({ result: { data: [], error: null } });
  const restore = installDb({ divisas, favoritos: favs });
  const router = require('./favoritesRoutes');

  try {
    await withServer(router, async (base) => {
      const res = await fetch(`${base}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo_divisa: 'btc' }),
      });
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), { success: true, isFavorite: true, codigo: 'BTC' });
      assert.ok(favs.calls.some((c) => c.name === 'upsert'));
    });
  } finally {
    restore();
  }
});

test('POST /api/favorites/toggle quita cuando ya era favorito', async () => {
  const divisas = makeQueryMock({ result: { data: [{ id_divisa: 4, codigo: 'BTC' }], error: null } });
  const favs = makeQueryMock({ result: { data: [{ id_favorito: 99 }], error: null } });
  const restore = installDb({ divisas, favoritos: favs });
  const router = require('./favoritesRoutes');

  try {
    await withServer(router, async (base) => {
      const res = await fetch(`${base}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo_divisa: 'BTC' }),
      });
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), { success: true, isFavorite: false, codigo: 'BTC' });
      assert.ok(favs.calls.some((c) => c.name === 'delete'));
    });
  } finally {
    restore();
  }
});

test('POST /api/favorites/toggle con divisa inexistente devuelve 404', async () => {
  const divisas = makeQueryMock({ result: { data: [], error: null } });
  const favs = makeQueryMock({ result: { data: [], error: null } });
  const restore = installDb({ divisas, favoritos: favs });
  const router = require('./favoritesRoutes');

  try {
    await withServer(router, async (base) => {
      const res = await fetch(`${base}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo_divisa: 'XXX' }),
      });
      assert.equal(res.status, 404);
    });
  } finally {
    restore();
  }
});
