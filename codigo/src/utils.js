// ── src/utils.js ─────────────────────────────────────────────────────────────
// Utilidades compartidas: formateo y variaciones determinísticas.

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
