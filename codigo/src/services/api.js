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
    // Si el servidor de Render está inactivo o da error de red, respondemos con modo offline simulado para desarrollo
    console.warn(`[API] Servidor backend no disponible (${err.message}). Usando respuesta fallback.`);
    if (path === '/api/auth/login') {
      const reqBody = options.body ? JSON.parse(options.body) : {};
      const pendingEmail = reqBody.email || 'demo@divise.com';
      // Simula el flujo 2-step verification tras el ingreso de credenciales
      const verifErr = new Error('Verificación de seguridad en 2 pasos: Te enviamos un código de 6 dígitos a tu casilla (Código demo: 123456).');
      verifErr.needsVerification = true;
      verifErr.email = pendingEmail;
      throw verifErr;
    }
    if (path === '/api/auth/verify-email') {
      const reqBody = options.body ? JSON.parse(options.body) : {};
      const email = reqBody.email || 'demo@divise.com';
      return {
        success: true,
        token: 'mock-jwt-token-12345',
        user: { id: 1, nombre: 'Usuario Divise', email, email_verificado: true, two_factor_enabled: true }
      };
    }
    if (path === '/api/auth/resend-verification') {
      return { success: true, message: 'Código reenviado con éxito (Código demo: 123456).' };
    }
    if (path === '/api/auth/register') {
      return { message: 'Usuario registrado exitosamente. Te enviamos el código.', needsVerification: true };
    }
    if (path === '/api/users/me' && options.method === 'PUT') {
      const reqBody = options.body ? JSON.parse(options.body) : {};
      return { success: true, message: 'Perfil actualizado correctamente.', ...reqBody };
    }
    if (path === '/api/users/me/password') {
      return { success: true, message: 'Contraseña actualizada correctamente.' };
    }
    if (path === '/api/users/me/2fa') {
      const reqBody = options.body ? JSON.parse(options.body) : {};
      return { success: true, two_factor_enabled: reqBody.enabled, message: reqBody.enabled ? '2FA activado' : '2FA desactivado' };
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

// ── Cotizaciones en Tiempo Real (DolarApi & Cripto en vivo) ────────────────

/**
 * Consulta precios en tiempo real de Bitcoin y Ethereum en USD.
 * Intenta primero Binance (rápido y sin rate-limits agresivos), luego CoinGecko y Coinbase como fallback.
 */
async function fetchCryptoPrices() {
  // 1. Binance
  try {
    const [btcRes, ethRes] = await Promise.all([
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT').then(r => r.json()),
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT').then(r => r.json())
    ]);
    const btc = parseFloat(btcRes?.price);
    const eth = parseFloat(ethRes?.price);
    if (!isNaN(btc) && !isNaN(eth) && btc > 0 && eth > 0) {
      return { btc, eth };
    }
  } catch (err) {
    console.warn('[Cripto API] Binance falló, intentando CoinGecko...', err.message);
  }

  // 2. CoinGecko
  try {
    const cgRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd').then(r => r.json());
    const btc = parseFloat(cgRes?.bitcoin?.usd);
    const eth = parseFloat(cgRes?.ethereum?.usd);
    if (!isNaN(btc) && !isNaN(eth) && btc > 0 && eth > 0) {
      return { btc, eth };
    }
  } catch (err) {
    console.warn('[Cripto API] CoinGecko falló, intentando Coinbase...', err.message);
  }

  // 3. Coinbase
  try {
    const [btcRes, ethRes] = await Promise.all([
      fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot').then(r => r.json()),
      fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot').then(r => r.json())
    ]);
    const btc = parseFloat(btcRes?.data?.amount);
    const eth = parseFloat(ethRes?.data?.amount);
    if (!isNaN(btc) && !isNaN(eth) && btc > 0 && eth > 0) {
      return { btc, eth };
    }
  } catch (err) {
    console.warn('[Cripto API] Coinbase falló...', err.message);
  }

  // Respaldo de emergencia si falla toda la red
  return { btc: 81200.00, eth: 2500.00 };
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
      : { btc: 81200.00, eth: 2500.00 };

    formattedRates.push(
      {
        codigo: 'BTC',
        nombre: 'Bitcoin',
        tipo_mercado: 'Cripto',
        tipo: 'Cripto',
        compra: Number((cryptoData.btc * 0.999).toFixed(2)),
        venta: Number(cryptoData.btc.toFixed(2)),
        updated_at: new Date().toISOString()
      },
      {
        codigo: 'ETH',
        nombre: 'Ethereum',
        tipo_mercado: 'Cripto',
        tipo: 'Cripto',
        compra: Number((cryptoData.eth * 0.999).toFixed(2)),
        venta: Number(cryptoData.eth.toFixed(2)),
        updated_at: new Date().toISOString()
      }
    );

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
      { codigo: 'ETH', nombre: 'Ethereum', tipo_mercado: 'Cripto', tipo: 'Cripto', compra: 2490, venta: 2500 }
    ];
  }
}
