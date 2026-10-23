import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatAmount,
  formatAmountInput,
  parseArgentineNumber,
} from './numberFormat.mjs';

test('formatea miles con punto y decimales con coma', () => {
  assert.equal(formatAmount(1234.5, { decimals: 2, minDecimals: 2 }), '1.234,50');
  assert.equal(formatAmount(1500000, { decimals: 2, minDecimals: 0 }), '1.500.000');
  assert.equal(formatAmount(1234.5678, { decimals: 4, minDecimals: 2 }), '1.234,5678');
  assert.equal(formatAmount(-1234.5, { decimals: 2, minDecimals: 2 }), '-1.234,50');
  assert.equal(formatAmount(999999999.99, { decimals: 2, minDecimals: 2 }), '999.999.999,99');
  assert.equal(formatAmount('no-es-numero'), '0');
});

test('usa una única coma, solo para los decimales', () => {
  const formatted = formatAmount(1234567.89, { decimals: 2, minDecimals: 2 });
  assert.equal(formatted, '1.234.567,89');
  assert.equal((formatted.match(/,/g) || []).length, 1);
});

test('parsea la convención argentina con puntos de miles y coma decimal', () => {
  assert.equal(parseArgentineNumber('15.000.000').value, 15000000);
  assert.equal(parseArgentineNumber('15.000.000,50').value, 15000000.5);
  assert.equal(parseArgentineNumber('1.000,5').value, 1000.5);
  assert.equal(parseArgentineNumber('12980,235').value, 12980.235);
  assert.equal(parseArgentineNumber('$ 15.000').value, 15000);
  assert.equal(parseArgentineNumber('1.234').value, 1234);
});

test('la coma siempre es decimal, nunca separador de miles', () => {
  assert.equal(parseArgentineNumber('1,000').value, 1);
  assert.equal(parseArgentineNumber('0,50').value, 0.5);
  assert.equal(parseArgentineNumber(',50').value, 0.5);
  assert.equal(parseArgentineNumber('1,5').value, 1.5);
});

test('rechaza formatos ambiguos o inválidos', () => {
  assert.equal(parseArgentineNumber('12,980,235').ok, false);
  assert.equal(parseArgentineNumber('15,000.50').ok, false);
  assert.equal(parseArgentineNumber('12.5').ok, false);
  assert.equal(parseArgentineNumber('12.50').ok, false);
  assert.equal(parseArgentineNumber('1.23').ok, false);
  assert.equal(parseArgentineNumber('').ok, false);
  assert.equal(parseArgentineNumber('abc').ok, false);
  assert.equal(parseArgentineNumber('-5').ok, false);
  assert.equal(parseArgentineNumber('1,1234567').ok, false);
});

test('formatea el input agrupando miles y conservando decimales', () => {
  assert.equal(formatAmountInput('1000'), '1.000');
  assert.equal(formatAmountInput('1000,50'), '1.000,50');
  assert.equal(formatAmountInput('1.000,50'), '1.000,50');
  assert.equal(formatAmountInput('0,50'), '0,50');
  // Con más decimales de los permitidos el parser falla y se deja el texto
  // original para que la UI muestre el error correspondiente.
  assert.equal(formatAmountInput('12,3456789'), '12,3456789');
});
