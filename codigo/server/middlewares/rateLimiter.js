// ── server/middlewares/rateLimiter.js ─────────────────────────────────────────
// Limitador de peticiones en memoria (ventana deslizante) para proteger
// los endpoints de autenticación contra fuerza bruta y spam (CP-082).
// Sin dependencias externas: adecuado para un despliegue de un solo nodo.

const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_REQUESTS = 10;

const buckets = new Map();

function clientKey(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function rateLimit({ windowMs = WINDOW_MS, max = MAX_REQUESTS } = {}) {
  return (req, res, next) => {
    const key = clientKey(req);
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: 'Demasiados intentos. Esperá unos minutos y volvé a intentar.',
      });
    }

    return next();
  };
}

// Limpieza periódica del mapa para no acumular memoria.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, WINDOW_MS).unref();

module.exports = { rateLimit };