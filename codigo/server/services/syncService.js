const pool = require('../config/db');
const alertService = require('./alertService');

/**
 * Fetch rates from DolarApi (Argentina) and CoinGecko (Crypto)
 * and update the database.
 */
async function syncRates() {
  console.log('🔄 Iniciando sincronización de cotizaciones...');
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    
    // 1. Fetch DolarApi (ARS - Blue, Oficial)
    const dolarRes = await fetch('https://dolarapi.com/v1/dolares');
    if (dolarRes.ok) {
      const dolares = await dolarRes.json();
      
      const blue = dolares.find(d => d.casa === 'blue');
      const oficial = dolares.find(d => d.casa === 'oficial');
      
      if (blue) {
        await updateRate(client, 'USD', 'Blue', blue.compra, blue.venta);
      }
      if (oficial) {
        await updateRate(client, 'USD', 'Oficial', oficial.compra, oficial.venta);
      }
    }
    
    // 2. Fetch DolarApi (Euro)
    const euroRes = await fetch('https://dolarapi.com/v1/cotizaciones/eur');
    if (euroRes.ok) {
      const euro = await euroRes.json();
      await updateRate(client, 'EUR', 'Oficial', euro.compra, euro.venta);
    }
    
    // 3. Fetch Cripto en USD (Binance primero, CoinGecko como fallback)
    let btcPrice = null;
    let ethPrice = null;

    try {
      const [bBtc, bEth] = await Promise.all([
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT').then(r => r.json()),
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT').then(r => r.json())
      ]);
      const pBtc = parseFloat(bBtc?.price);
      const pEth = parseFloat(bEth?.price);
      if (!isNaN(pBtc) && pBtc > 0) btcPrice = pBtc;
      if (!isNaN(pEth) && pEth > 0) ethPrice = pEth;
    } catch (e) {
      console.warn('Sync Binance cripto error:', e.message);
    }

    if (!btcPrice || !ethPrice) {
      try {
        const cryptoRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
        if (cryptoRes.ok) {
          const cryptos = await cryptoRes.json();
          if (cryptos.bitcoin?.usd) btcPrice = cryptos.bitcoin.usd;
          if (cryptos.ethereum?.usd) ethPrice = cryptos.ethereum.usd;
        }
      } catch (e) {
        console.warn('Sync CoinGecko cripto error:', e.message);
      }
    }

    if (btcPrice) {
      await updateRate(client, 'BTC', 'Cripto', btcPrice * 0.999, btcPrice);
    }
    if (ethPrice) {
      await updateRate(client, 'ETH', 'Cripto', ethPrice * 0.999, ethPrice);
    }
    
    await client.query('COMMIT');
    console.log('✅ Cotizaciones sincronizadas con éxito.');
    
    // Luego de sincronizar, verificamos las alertas
    await alertService.checkAlerts();
  } catch (err) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch { /* conexión ya perdida */ }
    }
    console.error('❌ Error sincronizando cotizaciones:', err.message);
  } finally {
    if (client) client.release();
  }
}

async function updateRate(client, divisaCodigo, tipoMercado, compra, venta) {
  // 1. Get id_divisa
  const divisaRes = await client.query('SELECT id_divisa FROM divisas WHERE codigo = $1', [divisaCodigo]);
  if (divisaRes.rows.length === 0) return;
  const idDivisa = divisaRes.rows[0].id_divisa;
  
  // 2. Update existing or insert new
  const res = await client.query(`
    UPDATE tipos_de_cambio 
    SET precio_compra = $1, precio_venta = $2, fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id_divisa = $3 AND tipo_mercado = $4
    RETURNING id_tipo_cambio
  `, [compra, venta, idDivisa, tipoMercado]);
  
  if (res.rows.length === 0) {
    await client.query(`
      INSERT INTO tipos_de_cambio (id_divisa, precio_compra, precio_venta, tipo_mercado)
      VALUES ($1, $2, $3, $4)
    `, [idDivisa, compra, venta, tipoMercado]);
  }
}

module.exports = { syncRates };
