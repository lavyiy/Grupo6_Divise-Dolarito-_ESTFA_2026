// ── src/services/history.js ─────────────────────────────────────────────────
// Histórico real de cotizaciones desde APIs públicas gratuitas.
//  · Dólar (todas las casas) y otras divisas → ArgentinaDatos (CORS abierto)
//  · Criptomonedas                           → Binance (klines diarias, desde el inicio)

import { currencyName } from '../utils';

const CRYPTO_CODES = new Set(['BTC', 'ETH', 'USDT', 'BNB', 'DOGE']);
const BINANCE_SYMBOL = { BTC: 'BTCUSDT', ETH: 'ETHUSDT', BNB: 'BNBUSDT', DOGE: 'DOGEUSDT' };

// Monedas del mundo cuyo histórico se sirve desde el backend (evita CORS).
// USDT se cruza contra currency-api como las demás: valor en pesos argentinos.
const WORLD_EXTRA_CODES = new Set(['GBP', 'JPY', 'MXN', 'CHF', 'CNY', 'USDT']);
const API_BASE = import.meta.env.VITE_API_URL || '';

// Catálogo completo que se ofrece en el gráfico (canónico).
export const CHART_CURRENCIES = [
  { codigo: 'USD', mercado: 'Blue', nombre: 'Dólar Blue' },
  { codigo: 'USD', mercado: 'Oficial', nombre: 'Dólar Oficial' },
  { codigo: 'USD', mercado: 'Bolsa', nombre: 'Dólar MEP (Bolsa)' },
  { codigo: 'USD', mercado: 'Financiero', nombre: 'Dólar CCL (Contado con Liqui)' },
  { codigo: 'USD', mercado: 'Tarjeta', nombre: 'Dólar Tarjeta' },
  { codigo: 'USD', mercado: 'Mayorista', nombre: 'Dólar Mayorista' },
  { codigo: 'USD', mercado: 'Solidario', nombre: 'Dólar Solidario' },
  { codigo: 'EUR', mercado: 'Oficial', nombre: 'Euro' },
  { codigo: 'BRL', mercado: 'Oficial', nombre: 'Real Brasileño' },
  { codigo: 'UYU', mercado: 'Oficial', nombre: 'Peso Uruguayo' },
  { codigo: 'CLP', mercado: 'Oficial', nombre: 'Peso Chileno' },
  { codigo: 'GBP', mercado: 'Oficial', nombre: 'Libra Esterlina' },
  { codigo: 'JPY', mercado: 'Oficial', nombre: 'Yen Japonés' },
  { codigo: 'MXN', mercado: 'Oficial', nombre: 'Peso Mexicano' },
  { codigo: 'CHF', mercado: 'Oficial', nombre: 'Franco Suizo' },
  { codigo: 'CNY', mercado: 'Oficial', nombre: 'Yuan Chino' },
  { codigo: 'BTC', mercado: '', nombre: 'Bitcoin' },
  { codigo: 'ETH', mercado: '', nombre: 'Ethereum' },
  { codigo: 'USDT', mercado: '', nombre: 'Tether' },
  { codigo: 'BNB', mercado: '', nombre: 'Binance Coin' },
  { codigo: 'DOGE', mercado: '', nombre: 'Dogecoin' },
];

const MERCADO_SYNONYMS = {
  informal: 'Blue',
  blue: 'Blue',
  oficial: 'Oficial',
  bolsa: 'Bolsa',
  mep: 'Bolsa',
  financiero: 'Financiero',
  contadoconliqui: 'Financiero',
  ccl: 'Financiero',
  tarjeta: 'Tarjeta',
  mayorista: 'Mayorista',
  solidario: 'Solidario',
};

const CASA_BY_MERCADO = {
  Blue: 'blue',
  Oficial: 'oficial',
  Bolsa: 'bolsa',
  Financiero: 'contadoconliqui',
  Tarjeta: 'tarjeta',
  Mayorista: 'mayorista',
  Solidario: 'solidario',
};

export function isCryptoCode(code) {
  return CRYPTO_CODES.has(String(code || '').toUpperCase());
}

export function normalizeMercado(codigo, mercado) {
  const code = String(codigo || '').toUpperCase();
  if (CRYPTO_CODES.has(code)) return '';
  const raw = String(mercado || '').trim().toLowerCase();
  const mapped = MERCADO_SYNONYMS[raw];
  if (mapped) return mapped;
  if (code === 'USD') return 'Blue';
  return 'Oficial';
}

export function currencyKey(currency) {
  const codigo = String(currency.codigo || '').toUpperCase();
  return `${codigo}|${normalizeMercado(codigo, currency.mercado)}`;
}

export function labelFor(currency) {
  const codigo = String(currency.codigo || '').toUpperCase();
  return currency.mercado ? `${codigo} · ${currency.mercado}` : codigo;
}

export function describeFor(currency) {
  const codigo = String(currency.codigo || '').toUpperCase();
  return currency.nombre || currencyName(codigo);
}

function cleanPoints(rows) {
  const map = new Map();
  rows.forEach(({ t, v }) => {
    if (Number.isFinite(t) && Number.isFinite(v) && v > 0) map.set(t, v);
  });
  return Array.from(map, ([t, v]) => ({ t, v })).sort((a, b) => a.t - b.t);
}

function parseDate(fecha) {
  const time = new Date(`${fecha}T12:00:00`).getTime();
  return Number.isFinite(time) ? time : NaN;
}

async function fetchDolarCasa(casa) {
  const res = await fetch(`https://api.argentinadatos.com/v1/cotizaciones/dolares/${casa}`);
  if (!res.ok) throw new Error('No se pudo obtener el histórico del dólar.');
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('Respuesta inválida de ArgentinaDatos.');
  return cleanPoints(data.map(d => ({ t: parseDate(d.fecha), v: Number(d.venta ?? d.compra) })));
}

async function fetchMonedaArgentina(codigo) {
  const res = await fetch('https://api.argentinadatos.com/v1/cotizaciones/');
  if (!res.ok) throw new Error('No se pudo obtener el histórico de la divisa.');
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('Respuesta inválida de ArgentinaDatos.');
  return cleanPoints(
    data
      .filter(d => d.moneda === codigo)
      .map(d => ({ t: parseDate(d.fecha), v: Number(d.venta ?? d.compra) }))
  );
}

// Monedas del mundo vía el backend propio (calcula el cruce USD→ARS contra
// currency-api en CDN), para mantener los precios en pesos argentinos y evitar CORS.
async function fetchMonedaMundial(codigo) {
  const res = await fetch(`${API_BASE}/api/fx-history/${codigo}`);
  if (!res.ok) throw new Error(`No se pudo obtener el histórico de ${codigo}.`);
  const data = await res.json();
  if (!Array.isArray(data.points) || data.points.length === 0) {
    throw new Error(`Sin histórico disponible para ${codigo}.`);
  }
  return cleanPoints(data.points);
}

async function fetchBinance(symbol) {
  const collected = [];
  let endTime = Date.now();
  // Binance limita a 1000 velas por request: paginamos hacia atrás para
  // traer la mayor cantidad de historia posible (BTC arranca en 2017).
  for (let i = 0; i < 8; i += 1) {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=1000&endTime=${endTime}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('No se pudo obtener el histórico de la criptomoneda.');
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) break;
    rows.forEach(r => collected.push({ t: r[0], v: Number(r[4]) })); // precio de cierre
    endTime = rows[0][0] - 1;
    if (rows.length < 1000) break;
  }
  if (collected.length === 0) throw new Error('La criptomoneda no tiene histórico disponible.');
  return cleanPoints(collected);
}

/**
 * Devuelve el histórico diario de una moneda/mercado.
 * @param {{codigo:string, mercado?:string}} currency
 * @returns {Promise<{points:{t:number,v:number}[], source:string}>}
 */
export async function getCurrencyHistory(currency) {
  const codigo = String(currency.codigo || '').toUpperCase();
  const mercado = normalizeMercado(codigo, currency.mercado);

  if (codigo === 'ARS') {
    const now = Date.now();
    return { points: [{ t: now - 30 * 864e5, v: 1 }, { t: now, v: 1 }], source: 'Base' };
  }

  if (WORLD_EXTRA_CODES.has(codigo)) {
    return { points: await fetchMonedaMundial(codigo), source: 'currency-api' };
  }

  if (CRYPTO_CODES.has(codigo)) {
    return { points: await fetchBinance(BINANCE_SYMBOL[codigo]), source: 'Binance' };
  }

  if (codigo === 'USD') {
    const casa = CASA_BY_MERCADO[mercado] || 'blue';
    return { points: await fetchDolarCasa(casa), source: `ArgentinaDatos · ${casa}` };
  }

  return { points: await fetchMonedaArgentina(codigo), source: 'ArgentinaDatos' };
}
