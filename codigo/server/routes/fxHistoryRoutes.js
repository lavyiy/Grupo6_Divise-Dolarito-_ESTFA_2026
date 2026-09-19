const express = require('express');

const router = express.Router();

// Monedas del mundo soportadas para histórico (cruce USD→ARS contra currency-api).
// Incluye USDT (tether), cotizado en su paridad USD → valor en pesos argentinos.
const WORLD_CODES = new Set(['GBP', 'JPY', 'MXN', 'CHF', 'CNY', 'USDT']);

// Caché en memoria: code -> { expira, points }
const cache = new Map();
const CACHE_TTL = 6 * 60 * 60 * 1000;

const CDN = (dateStr) =>
  `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${dateStr}/v1/currencies/usd.min.json`;

function businessDays(count) {
  const days = [];
  const d = new Date();
  while (days.length < count) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      days.push(d.toISOString().slice(0, 10));
    }
    d.setDate(d.getDate() - 1);
  }
  return days.reverse();
}

async function fetchRatesFor(dateStr) {
  try {
    const res = await fetch(CDN(dateStr));
    if (!res.ok) return null;
    const data = await res.json();
    return data?.usd || null;
  } catch {
    return null;
  }
}

/**
 * GET /api/fx-history/:code?days=90
 * Histórico diario (días hábiles) en ARS de una moneda del mundo, cruzando
 * contra el dólar con la fuente currency-api (jsDelivr, CORS abierto).
 * Se sirve desde el backend para centralizar la lógica y cachear.
 */
router.get('/:code', async (req, res) => {
  const code = String(req.params.code || '').toUpperCase();
  if (!WORLD_CODES.has(code)) {
    return res.status(400).json({ error: 'Código no soportado para histórico' });
  }

  const requested = parseInt(req.query.days, 10);
  const days = Number.isFinite(requested)
    ? Math.min(Math.max(requested, 30), 180)
    : 90;

  const cached = cache.get(code);
  if (cached && cached.expira > Date.now()) {
    return res.json({ points: cached.points, source: cached.source, cached: true });
  }

  try {
    const dates = businessDays(days);
    const series = [];
    const BATCH = 8;
    for (let i = 0; i < dates.length; i += BATCH) {
      const chunk = dates.slice(i, i + BATCH);
      const results = await Promise.all(chunk.map(fetchRatesFor));
      results.forEach((usd, k) => {
        const ars = Number(usd?.ars);
        const cur = Number(usd?.[code.toLowerCase()]);
        if (Number.isFinite(ars) && Number.isFinite(cur) && cur > 0) {
          series.push({ t: new Date(`${dates[i + k]}T12:00:00`).getTime(), v: Number((ars / cur).toFixed(4)) });
        }
      });
    }

    series.sort((a, b) => a.t - b.t);
    if (series.length === 0) {
      return res.status(502).json({ error: 'No hay datos históricos para este código' });
    }

    const source = `currency-api · últimos ${series.length} días hábiles`;
    cache.set(code, { expira: Date.now() + CACHE_TTL, points: series, source });
    res.json({ points: series, source });
  } catch (error) {
    res.status(502).json({ error: 'Histórico no disponible en este momento' });
  }
});

module.exports = router;