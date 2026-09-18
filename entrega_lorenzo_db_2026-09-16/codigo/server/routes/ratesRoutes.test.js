const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { once } = require('node:events');
const { createRatesRouter } = require('./ratesRoutes');

test('ambas rutas devuelven las criptos de la base con el contrato del dashboard', async (t) => {
  let queries = 0;
  const database = { async query(sql) {
    queries++;
    assert.match(sql, /DISTINCT ON/);
    assert.match(sql, /fecha_actualizacion DESC, tc.id_tipo_cambio DESC/);
    return { rows: [
      { id_divisa: 11, codigo: 'USDT', nombre: 'Tether', tipo: 'crypto', coingecko_id: 'tether', precio_compra: '0.99', precio_venta: '1.00', tipo_mercado: 'Cripto', fecha_actualizacion: '2026-09-15T12:00:00Z' },
      { id_divisa: 12, codigo: 'BNB', nombre: 'BNB', tipo: 'crypto', coingecko_id: 'binancecoin', precio_compra: '700.00', precio_venta: '701.00', tipo_mercado: 'Cripto', fecha_actualizacion: '2026-09-15T12:00:00Z' },
      { id_divisa: 13, codigo: 'DOGE', nombre: 'Dogecoin', tipo: 'crypto', coingecko_id: 'dogecoin', precio_compra: '0.08', precio_venta: '0.09', tipo_mercado: 'Cripto', fecha_actualizacion: '2026-09-15T12:00:00Z' },
    ] };
  } };
  const app = express();
  app.use(['/api/rates', '/api/cotizaciones'], createRatesRouter(database));
  const server = app.listen(0, '127.0.0.1');
  t.after(() => server.close());
  await once(server, 'listening');
  for (const path of ['/api/rates', '/api/cotizaciones']) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`);
    assert.equal(response.status, 200);
    const rows = await response.json();
    assert.deepEqual(rows.map(r => r.codigo), ['USDT', 'BNB', 'DOGE']);
    assert.ok(rows.every(r => r.tipo === 'crypto' && r.tipo_mercado === 'Cripto'));
    assert.ok(rows.every(r => typeof r.venta === 'number' && r.updated_at === r.fecha));
  }
  assert.equal(queries, 2);
});

test('un error de base devuelve 500 sin precios inventados ni detalles privados', async (t) => {
  const app = express();
  app.use('/api/cotizaciones', createRatesRouter({ query: async () => { throw new Error('test database unavailable'); } }));
  const server = app.listen(0, '127.0.0.1');
  t.after(() => server.close());
  await once(server, 'listening');
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/cotizaciones`);
  assert.equal(response.status, 500);
  const body = await response.json();
  assert.equal(Array.isArray(body), false);
  assert.equal(body.error.includes('test database unavailable'), false);
});
