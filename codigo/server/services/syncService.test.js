const test = require('node:test');
const assert = require('node:assert/strict');
const pool = require('../config/db');
const alertService = require('./alertService');
const { syncRates } = require('./syncService');

async function runSync(t, coingeckoAvailable) {
  const ids = { BTC: 4, ETH: 5, USDT: 11, BNB: 12, DOGE: 13 };
  const updates = [];
  const client = {
    async query(sql, values) {
      if (sql.startsWith('SELECT id_divisa')) return { rows: [{ id_divisa: ids[values[0]] }] };
      if (sql.includes('UPDATE tipos_de_cambio')) {
        updates.push(values);
        return { rows: [{ id_tipo_cambio: 1 }] };
      }
      return { rows: [] };
    },
    release() {},
  };
  t.mock.method(pool, 'connect', async () => client);
  t.mock.method(alertService, 'checkAlerts', async () => {});
  t.mock.method(global, 'fetch', async rawUrl => {
    const url = new URL(rawUrl);
    if (url.hostname === 'dolarapi.com') return { ok: false };
    if (url.hostname === 'api.binance.com') {
      assert.notEqual(url.searchParams.get('symbol'), 'null');
      return { ok: true, json: async () => ({ price: '100' }) };
    }
    assert.equal(url.hostname, 'api.coingecko.com');
    assert.equal(url.searchParams.get('ids'), 'tether');
    assert.equal(url.searchParams.get('vs_currencies'), 'usd');
    return { ok: coingeckoAvailable, json: async () => ({ tether: { usd: 0.98 } }) };
  });
  await syncRates();
  return updates;
}

test('USDT usa el precio de tether, no un valor fijo de 1 USD', async t => {
  const updates = await runSync(t, true);
  assert.equal(updates.length, 5);
  assert.equal(updates.find(values => values[2] === 11)[1], 0.98);
});

test('si CoinGecko falla no se inventa una cotizacion de USDT', async t => {
  const updates = await runSync(t, false);
  assert.equal(updates.length, 4);
  assert.equal(updates.some(values => values[2] === 11), false);
});
