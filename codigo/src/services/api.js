// ── src/services/api.js ─────────────────────────────────────────────────────
// Centraliza todas las llamadas HTTP al backend y APIs de cotización en tiempo real.

// Ruta relativa: en desarrollo Vite proxya /api al backend local (vite.config.js).
// En producción apuntar a la URL real vía VITE_API_URL.
const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Helper genérico para fetch con JSON al backend propio.
 */
async function request(path, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });

    const data = await res.json().catch(() => ({}));

    // ── Manejo de JWT expirado ────────────────────────────────────────────
    if (res.status === 401) {
      const isTokenExpired = data?.tokenExpired || data?.error?.includes('expirado') || data?.error?.includes('expired');
      if (isTokenExpired) {
        console.warn('[API] Token JWT expirado. Cerrando sesión automáticamente.');
        localStorage.removeItem('divise_token');
        localStorage.removeItem('divise_user');
        window.location.href = '/login?expired=1';
        const err = new Error('Tu sesión expiró. Iniciá sesión nuevamente.');
        err.tokenExpired = true;
        throw err;
      }
    }

    if (!res.ok) {
      const message =
        data?.message || data?.error || `Error ${res.status}: ${res.statusText}`;
      // Adjuntamos el body para que la UI pueda reaccionar (ej: needsVerification)
      const err = new Error(message);
      Object.assign(err, data || {});
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    // Si el error es por token expirado, lo re-lanzamos directamente
    if (err.tokenExpired) throw err;

    // Error de red: el servidor no está disponible
    const isNetworkError = err instanceof TypeError && err.message.includes('fetch');
    if (isNetworkError) {
      const netErr = new Error(
        'No se pudo conectar al servidor. Asegurate de que el backend esté corriendo en el puerto 5000 (npm run dev en /server).'
      );
      netErr.isNetworkError = true;
      throw netErr;
    }

    throw err;
  }
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

export function authRegister({ nombre, email, password }) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ nombre, email, password }),
  });
}

export function authLogin({ email, password }) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// ── Verificación de email con código de 6 dígitos ────────────────────────────

export function authVerifyEmail({ email, codigo }) {
  return request('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ email, codigo }),
  });
}

export function authResendCode({ email }) {
  return request('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function authVerifyEmailToken(token) {
  return request(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
    method: 'GET',
  });
}

// ── Recuperación de Contraseña ──────────────────────────────────────────────

export function authForgotPassword({ email }) {
  return request('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function authResetPassword({ token, newPassword }) {
  return request('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

export function authTestEmail({ to }) {
  return request('/api/auth/test-email', {
    method: 'POST',
    body: JSON.stringify({ to }),
  });
}

// ── Configuración de WhatsApp (alertas al celular) ───────────────────────────

export function getMyProfile(token) {
  return request('/api/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateProfile(profileData, token) {
  return request('/api/users/me', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(profileData),
  });
}

export function changePassword({ currentPassword, newPassword }, token) {
  return request('/api/users/me/password', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function toggleTwoFactor(enabled, token) {
  return request('/api/users/me/2fa', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ enabled }),
  });
}

// ── Eliminar cuenta ──────────────────────────────────────────────────────────

export function deleteMyAccount(token) {
  return request('/api/users/me', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Alertas ───────────────────────────────────────────────────────────────────

export function getAlerts(token) {
  return request('/api/alerts', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createAlert({ codigo_divisa, condicion, valor_limite }, token) {
  return request('/api/alerts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ codigo_divisa, condicion, valor_limite }),
  });
}

export function deleteAlert(id, token) {
  return request(`/api/alerts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Favoritos ─────────────────────────────────────────────────────────────────

export function getFavorites(token) {
  return request('/api/favorites', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function toggleFavorite(codigo_divisa, token) {
  return request('/api/favorites/toggle', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ codigo_divisa }),
  });
}

// ── Cotizaciones en Tiempo Real (DolarApi & Cripto en vivo) ────────────────

/**
 * Consulta precios en tiempo real de BTC, ETH, USDT, BNB y DOGE en USD.
 * Intenta primero Binance (rápido y sin rate-limits agresivos), luego CoinGecko y Coinbase como fallback.
 */
async function fetchCryptoPrices() {
  const symbols = [
    { key: 'btc', binance: 'BTCUSDT', coingecko: 'bitcoin', coinbase: 'BTC-USD', fallback: 81200.00 },
    { key: 'eth', binance: 'ETHUSDT', coingecko: 'ethereum', coinbase: 'ETH-USD', fallback: 2500.00 },
    { key: 'usdt', binance: null, coingecko: 'tether', coinbase: 'USDT-USD', fallback: 1.00 },
    { key: 'bnb', binance: 'BNBUSDT', coingecko: 'binancecoin', coinbase: 'BNB-USD', fallback: 600.00 },
    { key: 'doge', binance: 'DOGEUSDT', coingecko: 'dogecoin', coinbase: 'DOGE-USD', fallback: 0.32 },
  ];

  const prices = {};

  // 1. Binance
  try {
    const binanceSymbols = symbols.filter(s => s.binance);
    const binanceResults = await Promise.all(
      binanceSymbols.map(s =>
        fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${s.binance}`)
          .then(r => r.json())
          .then(data => ({ key: s.key, price: parseFloat(data?.price) }))
          .catch(() => ({ key: s.key, price: NaN }))
      )
    );
    binanceResults.forEach(r => {
      if (!isNaN(r.price) && r.price > 0) prices[r.key] = r.price;
    });
    // USDT siempre ~1 USD
    if (!prices.usdt) prices.usdt = 1.00;
  } catch (err) {
    console.warn('[Cripto API] Binance falló, intentando CoinGecko...', err.message);
  }

  // 2. CoinGecko (para los que faltan)
  const missing = symbols.filter(s => !prices[s.key]);
  if (missing.length > 0) {
    try {
      const ids = missing.map(s => s.coingecko).join(',');
      const cgRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`).then(r => r.json());
      missing.forEach(s => {
        const val = parseFloat(cgRes?.[s.coingecko]?.usd);
        if (!isNaN(val) && val > 0) prices[s.key] = val;
      });
    } catch (err) {
      console.warn('[Cripto API] CoinGecko falló, intentando Coinbase...', err.message);
    }
  }

  // 3. Coinbase (para los que aún faltan)
  const stillMissing = symbols.filter(s => !prices[s.key]);
  if (stillMissing.length > 0) {
    try {
      const coinbaseResults = await Promise.all(
        stillMissing.map(s =>
          fetch(`https://api.coinbase.com/v2/prices/${s.coinbase}/spot`)
            .then(r => r.json())
            .then(data => ({ key: s.key, price: parseFloat(data?.data?.amount) }))
            .catch(() => ({ key: s.key, price: NaN }))
        )
      );
      coinbaseResults.forEach(r => {
        if (!isNaN(r.price) && r.price > 0) prices[r.key] = r.price;
      });
    } catch (err) {
      console.warn('[Cripto API] Coinbase falló...', err.message);
    }
  }

  // Respaldo de emergencia para los que sigan sin precio
  symbols.forEach(s => {
    if (!prices[s.key]) prices[s.key] = s.fallback;
  });

  return prices;
}

/**
 * Obtiene las cotizaciones actuales en tiempo real desde DolarApi y APIs de Criptomonedas en vivo.
 */
export async function fetchRates() {
  try {
    const [dolaresRes, cotizRes, cryptoRes] = await Promise.allSettled([
      fetch('https://dolarapi.com/v1/dolares').then(res => res.json()),
      fetch('https://dolarapi.com/v1/cotizaciones').then(res => res.json()),
      fetchCryptoPrices()
    ]);

    let formattedRates = [];

    // Cotizaciones del Dólar (Oficial, Blue, MEP, CCL, Tarjeta, Mayorista, Cripto)
    if (dolaresRes.status === 'fulfilled' && Array.isArray(dolaresRes.value)) {
      const mappedDolares = dolaresRes.value.map(d => ({
        codigo: 'USD',
        nombre: `Dólar ${d.nombre}`,
        tipo_mercado: d.casa === 'blue' ? 'Informal' : d.casa === 'oficial' ? 'Oficial' : d.casa === 'bolsa' ? 'Bolsa' : d.casa === 'contadoconliqui' ? 'Financiero' : d.casa === 'tarjeta' ? 'Tarjeta' : d.casa === 'cripto' ? 'Cripto' : d.nombre,
        tipo: d.casa === 'blue' ? 'Informal' : 'Oficial',
        compra: d.compra || d.venta,
        venta: d.venta,
        updated_at: d.fechaActualizacion
      }));
      formattedRates.push(...mappedDolares);
    }

    // Cotizaciones de otras divisas (Euro, Real, Peso Uruguayo, Peso Chileno)
    if (cotizRes.status === 'fulfilled' && Array.isArray(cotizRes.value)) {
      const mappedCotiz = cotizRes.value
        .filter(c => c.moneda !== 'USD')
        .map(c => ({
          codigo: c.moneda,
          nombre: c.nombre,
          tipo_mercado: 'Oficial',
          tipo: 'Oficial',
          compra: c.compra || c.venta,
          venta: c.venta,
          updated_at: c.fechaActualizacion
        }));
      formattedRates.push(...mappedCotiz);
    }

    // Monedas Cripto en tiempo real (en USD)
    const cryptoData = cryptoRes.status === 'fulfilled' && cryptoRes.value
      ? cryptoRes.value
      : { btc: 81200.00, eth: 2500.00, usdt: 1.00, bnb: 600.00, doge: 0.32 };

    const cryptoList = [
      { codigo: 'BTC', nombre: 'Bitcoin', key: 'btc' },
      { codigo: 'ETH', nombre: 'Ethereum', key: 'eth' },
      { codigo: 'USDT', nombre: 'Tether', key: 'usdt' },
      { codigo: 'BNB', nombre: 'Binance Coin', key: 'bnb' },
      { codigo: 'DOGE', nombre: 'Dogecoin', key: 'doge' },
    ];

    cryptoList.forEach(c => {
      const price = cryptoData[c.key] || 0;
      if (price > 0) {
        formattedRates.push({
          codigo: c.codigo,
          nombre: c.nombre,
          tipo_mercado: 'Cripto',
          tipo: 'Cripto',
          compra: Number((price * 0.999).toFixed(c.codigo === 'DOGE' ? 4 : 2)),
          venta: Number(price.toFixed(c.codigo === 'DOGE' ? 4 : 2)),
          updated_at: new Date().toISOString()
        });
      }
    });

    if (formattedRates.length > 0) {
      return formattedRates;
    }
    throw new Error("No rates returned");
  } catch (err) {
    console.error("Error fetching live rates from DolarApi / Crypto", err);
    // Backup seguro con precios actualizados si no hay conectividad
    return [
      { codigo: 'USD', nombre: 'Dólar Blue', tipo_mercado: 'Informal', tipo: 'Informal', compra: 1520, venta: 1540 },
      { codigo: 'USD', nombre: 'Dólar Oficial', tipo_mercado: 'Oficial', tipo: 'Oficial', compra: 1465, venta: 1515 },
      { codigo: 'USD', nombre: 'Dólar Bolsa (MEP)', tipo_mercado: 'Bolsa', tipo: 'Financiero', compra: 1520, venta: 1526 },
      { codigo: 'USD', nombre: 'Dólar Contado con Liqui', tipo_mercado: 'Financiero', tipo: 'Financiero', compra: 1579, venta: 1581 },
      { codigo: 'USD', nombre: 'Dólar Tarjeta', tipo_mercado: 'Tarjeta', tipo: 'Oficial', compra: 1904, venta: 1969 },
      { codigo: 'EUR', nombre: 'Euro', tipo_mercado: 'Oficial', tipo: 'Oficial', compra: 1707, venta: 1722 },
      { codigo: 'BRL', nombre: 'Real Brasileño', tipo_mercado: 'Oficial', tipo: 'Oficial', compra: 286, venta: 287 },
      { codigo: 'BTC', nombre: 'Bitcoin', tipo_mercado: 'Cripto', tipo: 'Cripto', compra: 81100, venta: 81200 },
      { codigo: 'ETH', nombre: 'Ethereum', tipo_mercado: 'Cripto', tipo: 'Cripto', compra: 2490, venta: 2500 },
      { codigo: 'USDT', nombre: 'Tether', tipo_mercado: 'Cripto', tipo: 'Cripto', compra: 1.00, venta: 1.00 },
      { codigo: 'BNB', nombre: 'Binance Coin', tipo_mercado: 'Cripto', tipo: 'Cripto', compra: 598, venta: 600 },
      { codigo: 'DOGE', nombre: 'Dogecoin', tipo_mercado: 'Cripto', tipo: 'Cripto', compra: 0.319, venta: 0.32 }
    ];
  }
}
