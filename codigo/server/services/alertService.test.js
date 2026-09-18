const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../config/db');

// Mock encadenable del query builder de Supabase.
function makeQueryMock(script) {
  const calls = [];
  const query = {};
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
  db.supabase = {
    from(table) {
      const script = scripts[table];
      if (!script) throw new Error(`Tabla no simulada: ${table}`);
      script.calls.push({ name: 'from', args: [table] });
      return script.query;
    },
  };
  return () => { db.supabase = original; };
}

test('getUserAlerts devuelve el listado del usuario', async () => {
  const alertas = makeQueryMock({
    result: { data: [{ id_alerta: 1, codigo_divisa: 'USD_Blue' }], error: null },
  });
  const restore = installDb({ alertas });
  const alertService = require('./alertService');
  try {
    const rows = await alertService.getUserAlerts(7);
    assert.deepEqual(rows, [{ id_alerta: 1, codigo_divisa: 'USD_Blue' }]);
    assert.ok(alertas.calls.some((c) => c.name === 'eq' && c.args[0] === 'id_usuario' && c.args[1] === 7));
    assert.ok(alertas.calls.some((c) => c.name === 'order' && c.args[0] === 'created_at'));
  } finally {
    restore();
  }
});

test('createAlert inserta y devuelve la alerta creada', async () => {
  const created = { id_alerta: 5, codigo_divisa: 'USD_Blue', condicion: 'Sube a', valor_limite: 2000 };
  const alertas = makeQueryMock({ result: { data: created, error: null } });
  const restore = installDb({ alertas });
  const alertService = require('./alertService');
  try {
    const row = await alertService.createAlert(7, 'USD_Blue', 'Sube a', 2000);
    assert.deepEqual(row, created);
    assert.ok(alertas.calls.some((c) => c.name === 'insert'));
    assert.ok(alertas.calls.some((c) => c.name === 'single'));
  } finally {
    restore();
  }
});

test('deleteAlert devuelve true sólo cuando borró una fila', async () => {
  const found = makeQueryMock({ result: { data: [{ id_alerta: 9 }], error: null } });
  const restore = installDb({ alertas: found });
  const alertService = require('./alertService');
  try {
    assert.equal(await alertService.deleteAlert(9, 7), true);
    assert.ok(found.calls.some((c) => c.name === 'delete'));
    assert.ok(found.calls.some((c) => c.name === 'eq' && c.args[0] === 'id_usuario'));
  } finally {
    restore();
  }

  const missing = makeQueryMock({ result: { data: [], error: null } });
  const restore2 = installDb({ alertas: missing });
  try {
    assert.equal(await alertService.deleteAlert(9, 7), false);
  } finally {
    restore2();
  }
});

test('deleteAlert propaga errores de Supabase', async () => {
  const failing = makeQueryMock({ result: { data: null, error: new Error('rls denied') } });
  const restore = installDb({ alertas: failing });
  const alertService = require('./alertService');
  try {
    await assert.rejects(() => alertService.deleteAlert(9, 7), /rls denied/);
  } finally {
    restore();
  }
});
