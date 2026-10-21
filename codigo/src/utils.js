// ── src/utils.js ─────────────────────────────────────────────────────────────
// Utilidades compartidas: formateo y variaciones determinísticas.

import { isCrypto } from './services/rateTypes.mjs';

// Divisas fiat que pueden llegar almacenadas en paridad USD (~1.00) en vez de
// en pesos argentinos (el sync las cargó contra la moneda base del dólar).
const USD_PRICE_CODES = new Set(['CAD', 'AUD']);

/**
 * Indica si el precio de una cotización está expresado en USD y debe
 * convertirse a ARS para mostrarlo en la card. Las cripto siempre vienen en
 * USD; CAD, AUD y el dólar cripto solo se convierten si el valor es
 * sospechosamente bajo (paridad ~1.00), porque ya pueden llegar en ARS.
 */
export function esPrecioEnUSD(rate) {
  const codigo = String(rate?.codigo || '').toUpperCase();
  const valor = Number(rate?.venta ?? rate?.compra ?? 0);
  if (isCrypto(rate)) return true;
  const esParidad = Number.isFinite(valor) && valor <= 20;
  if (USD_PRICE_CODES.has(codigo)) return esParidad;
  if (codigo === 'USD' && String(rate?.tipo_mercado || rate?.tipo || '').toLowerCase() === 'cripto') return esParidad;
  return false;
}

/**
 * Devuelve el precio de una cotización expresado en ARS, convirtiendo desde
 * USD con la referencia del dólar (Blue preferido, si no Oficial). Si no hay
 * referencia o la cotización ya viene en ARS, devuelve el valor tal cual.
 */
export function precioEnARS(rate, usdRef = 0) {
  const valor = Number(rate?.venta ?? rate?.compra ?? 0);
  if (!Number.isFinite(valor)) return 0;
  if (!esPrecioEnUSD(rate) || !usdRef) return valor;
  return Number((valor * usdRef).toFixed(4));
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Variación porcentual estable (entre -2 y +2) para una seed dada. */
export function stableVariation(seed) {
  const rand = mulberry32(seed);
  return rand() * 4 - 2;
}

/** Formatea un número como moneda argentina ($ 1.234,56). */
export function formatARS(value, decimals = 2) {
  return Number(value || 0).toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: Math.max(decimals, 4),
  });
}

/** Nombre legible por código de moneda. */
export function currencyName(code) {
  switch (code) {
    case 'USD': return 'Dólar Estadounidense';
    case 'ARS': return 'Peso Argentino';
    case 'EUR': return 'Euro';
    case 'BRL': return 'Real Brasileño';
    case 'GBP': return 'Libra Esterlina';
    case 'JPY': return 'Yen Japonés';
    case 'CAD': return 'Dólar Canadiense';
    case 'CHF': return 'Franco Suizo';
    case 'AUD': return 'Dólar Australiano';
    case 'UYU': return 'Peso Uruguayo';
    case 'CLP': return 'Peso Chileno';
    case 'MXN': return 'Peso Mexicano';
    case 'CNY': return 'Yuan Chino';
    case 'BTC': return 'Bitcoin';
    case 'ETH': return 'Ethereum';
    case 'USDT': return 'Tether (USDT)';
    case 'BNB': return 'Binance Coin';
    case 'DOGE': return 'Dogecoin';
    default: return code;
  }
}

/** Seed estable a partir de un texto (código + mercado). */
export function hashSeed(...parts) {
  return parts.join('-').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

/**
 * Parsea montos ingresados por el usuario soportando formato argentino (puntos para miles,
 * comas para decimales, ej: 15.000, 15.000.000, 15.000.000,50) y números grandes sin fallar.
 * @param {string|number} raw
 * @returns {{ ok: boolean, value?: number, error?: string, normalized?: string }}
 */
export function parseArgentineNumber(raw) {
  const value = String(raw == null ? '' : raw).trim();
  if (!value) return { ok: false, error: 'Ingresá un monto para convertir.' };

  // Elimina prefijo de moneda y espacios superfluos: ej "$ 15.000.000"
  const cleaned = value.replace(/^[$\s]+/, '').trim();
  if (!/^[0-9.,]+$/.test(cleaned)) {
    return { ok: false, error: 'El monto debe contener solo números, puntos o comas.' };
  }

  let normalized;
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  if (hasComma && hasDot) {
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    if (lastComma > lastDot) {
      // Formato argentino: ej 15.000.000,50 o 15.000,75 -> miles '.', decimal ','
      const beforeComma = cleaned.slice(0, lastComma).replace(/[.,]/g, '');
      const afterComma = cleaned.slice(lastComma + 1).replace(/[.,]/g, '');
      normalized = `${beforeComma}.${afterComma}`;
    } else {
      // Formato internacional: ej 15,000,000.50 -> miles ',', decimal '.'
      const beforeDot = cleaned.slice(0, lastDot).replace(/[.,]/g, '');
      const afterDot = cleaned.slice(lastDot + 1).replace(/[.,]/g, '');
      normalized = `${beforeDot}.${afterDot}`;
    }
  } else if (hasComma) {
    const parts = cleaned.split(',');
    if (parts.length > 2) {
      // Múltiples comas: ej 15,000,000 o 15,000,000,50
      const lastPart = parts[parts.length - 1];
      if (lastPart.length !== 3 && parts.slice(1, -1).every(p => p.length === 3)) {
        const intPart = parts.slice(0, -1).join('');
        normalized = `${intPart}.${lastPart}`;
      } else {
        normalized = cleaned.replace(/,/g, '');
      }
    } else {
      // Una sola coma: 15,50 o 1500,75 -> decimal argentino
      normalized = cleaned.replace(',', '.');
    }
  } else if (hasDot) {
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      // Múltiples puntos: ej 15.000.000 o 15.000.000.50
      const lastPart = parts[parts.length - 1];
      if (lastPart.length !== 3 && parts.slice(1, -1).every(p => p.length === 3)) {
        const intPart = parts.slice(0, -1).join('');
        normalized = `${intPart}.${lastPart}`;
      } else {
        // Todos son separadores de miles argentinos (ej: 15.000.000, 1.000.000)
        normalized = cleaned.replace(/\./g, '');
      }
    } else {
      // Un solo punto: ej 15.000 vs 15.5 o 15.50
      const [intPart, decPart] = parts;
      // Si tiene exactamente 3 dígitos luego del punto (ej. 15.000, 1.000, 500.000)
      // y la parte entera no es 0, en Argentina es separador de miles.
      if (decPart && decPart.length === 3 && intPart !== '0') {
        normalized = cleaned.replace(/\./g, '');
      } else {
        // Decimal estándar (0.50, 15.5)
        normalized = cleaned;
      }
    }
  } else {
    normalized = cleaned;
  }

  const num = Number(normalized);
  if (!Number.isFinite(num) || isNaN(num)) {
    return { ok: false, error: 'El monto ingresado no es un número válido.' };
  }
  if (num < 0) {
    return { ok: false, error: 'El monto no puede ser negativo.' };
  }
  return { ok: true, value: num, normalized };
}
