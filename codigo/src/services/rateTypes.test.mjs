import test from 'node:test';
import assert from 'node:assert/strict';
import { isCrypto } from './rateTypes.mjs';

test('USDT, BNB y DOGE de la base aparecen en el filtro crypto', () => {
  const rates = ['USDT', 'BNB', 'DOGE'].map(codigo => ({ codigo, tipo: 'crypto' }));
  assert.deepEqual(rates.filter(isCrypto).map(r => r.codigo), ['USDT', 'BNB', 'DOGE']);
});

test('acepta la categoria anterior y nuevas criptos del catalogo', () => {
  assert.equal(isCrypto({ codigo: 'ETH', tipo: 'Cripto' }), true);
  assert.equal(isCrypto({ codigo: 'NUEVA', tipo: 'crypto' }), true);
});

test('un dolar negociado en mercado Cripto sigue siendo una divisa fiat', () => {
  assert.equal(isCrypto({ codigo: 'USD', tipo: 'Fiat', tipo_mercado: 'Cripto' }), false);
  assert.equal(isCrypto({ codigo: 'USD', tipo: 'Oficial', tipo_mercado: 'Cripto' }), false);
});

test('mantiene compatibilidad con tickers sin tipo', () => {
  assert.equal(isCrypto({ codigo: 'DOGE' }), true);
  assert.equal(isCrypto({ codigo: 'EUR' }), false);
});
