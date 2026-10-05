import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { fetchRates, getFavorites, toggleFavorite, recordHistorial } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CountUp from 'react-countup';
import { Icon } from '../../components/ui/Icon';
import CurrencyBadge from '../../components/ui/CurrencyBadge';
import { currencyName } from '../../utils';
import './Calculadora.css';

export default function Calculadora() {
  const location = useLocation();
  const { token } = useAuth();
  const [rates, setRates] = useState([]);
  const [favoritesCodes, setFavoritesCodes] = useState(new Set());
  const [toast, setToast] = useState('');
  const [favBusy, setFavBusy] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [amount, setAmount] = useState('1000');
  const [fromCurrency, setFromCurrency] = useState(location.state?.currency || 'USD');
  const [toCurrency, setToCurrency] = useState('ARS');

  // Historial visual de conversiones de la sesión (sin datos mock).
  const [history, setHistory] = useState([]);

  // ── Validación del monto ingresado ────────────────────────────────────────
  const parseAmountInput = (raw) => {
    const value = String(raw == null ? '' : raw).trim();
    if (value === '') {
      return { ok: false, error: 'Ingresá un monto para convertir.' };
    }
    if (!/^[0-9.,]+$/.test(value)) {
      return { ok: false, error: 'El monto debe ser un número válido.' };
    }

    let normalized;
    if (value.includes(',') && value.includes('.')) {
      // Formato argentino "1.000,50" → 1000.50
      if (value.lastIndexOf('.') < value.lastIndexOf(',')) {
        normalized = value.replace(/\./g, '').replace(',', '.');
      } else {
        normalized = value.replace(/,/g, '');
      }
    } else {
      normalized = value.replace(',', '.');
    }

    const num = Number(normalized);
    if (!Number.isFinite(num)) {
      return { ok: false, error: 'El monto debe ser un número válido.' };
    }
    if (num < 0) {
      return { ok: false, error: 'El monto no puede ser negativo.' };
    }
    return { ok: true, value: num };
  };

  const amountParse = parseAmountInput(amount);
  const montoError = amountParse.ok ? '' : amountParse.error;

  useEffect(() => {
    if (location.state?.currency) {
      setFromCurrency(location.state.currency);
    }
  }, [location.state]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  useEffect(() => {
    async function load() {
      try {
        const [data, favs] = await Promise.allSettled([
          fetchRates(),
          token ? getFavorites(token) : Promise.resolve([])
        ]);
        if (data.status === 'fulfilled' && Array.isArray(data.value)) setRates(data.value);
        if (favs.status === 'fulfilled' && Array.isArray(favs.value)) setFavoritesCodes(new Set(favs.value));
      } catch (err) {
        console.error("Error fetching live rates", err);
      }
    }
    load();
  }, [token]);

  const handleToggleFavorite = async () => {
    if (!token) {
      showToast('Iniciá sesión para guardar favoritos.');
      return;
    }
    if (favBusy) return;
    setFavBusy(true);
    const isFav = favoritesCodes.has(fromCurrency);
    // Optimistic update
    setFavoritesCodes(prev => {
      const next = new Set(prev);
      isFav ? next.delete(fromCurrency) : next.add(fromCurrency);
      return next;
    });
    showToast(isFav ? `${fromCurrency} quitado de favoritos` : `★ ${fromCurrency} guardado en favoritos`);
    try {
      await toggleFavorite(fromCurrency, token);
    } catch {
      setFavoritesCodes(prev => {
        const next = new Set(prev);
        isFav ? next.add(fromCurrency) : next.delete(fromCurrency);
        return next;
      });
      showToast('Error al actualizar favoritos');
    } finally {
      setFavBusy(false);
    }
  };

  const handleConvertClick = () => {
    if (montoError) {
      showToast(montoError);
      return;
    }
    if (fromRate === 0 || toRate === 0) {
      showToast(`La cotización de ${fromRate === 0 ? fromCurrency : toCurrency} no está disponible por el momento.`);
      return;
    }

    setShowResult(true);

    // Registra la conversión en el historial real (solo con sesión activa).
    if (token) {
      recordHistorial({
        par_consultado: `Conversión ${fromCurrency} → ${toCurrency}`,
        valor_momento: result || amountParse.value || 0,
      }, token).catch(() => {});
    }

    // Acumula la conversión en el panel visual "Últimas conversiones".
    setHistory(prev => [
      {
        from: fromCurrency,
        to: toCurrency,
        in: String(amountParse.value),
        out: String(result || 0),
        time: 'Ahora',
      },
      ...prev,
    ].slice(0, 5));
  };

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const getARSValue = (currencyCode) => {
    if (currencyCode === 'ARS') return 1;
    let rate = rates.find(r => r.codigo === currencyCode && r.tipo_mercado === 'Informal');
    if (!rate) rate = rates.find(r => r.codigo === currencyCode);
    if (!rate) return 0;

    // Si la divisa cotiza en USD (como BTC, ETH, USDT, BNB, DOGE), convertimos su valor base a ARS mediante Dólar Blue
    if (['BTC', 'ETH', 'USDT', 'BNB', 'DOGE'].includes(currencyCode)) {
      const usdRate = rates.find(r => r.codigo === 'USD' && r.tipo_mercado === 'Informal')?.venta
        || rates.find(r => r.codigo === 'USD')?.venta
        || 1545;
      return rate.venta * usdRate;
    }

    return rate.venta;
  };

  const fromRate = getARSValue(fromCurrency);
  const toRate = getARSValue(toCurrency);
  const rateError = fromRate === 0 || toRate === 0
    ? `La cotización de ${fromRate === 0 ? fromCurrency : toCurrency} no está disponible por el momento.`
    : '';
  const hasError = Boolean(montoError) || Boolean(rateError);

  const calculateResult = () => {
    if (!amountParse.ok) return 0;
    if (fromRate === 0 || toRate === 0) return 0;
    const inARS = amountParse.value * fromRate;
    return inARS / toRate;
  };

  const result = calculateResult();
  const conversionRate = fromRate > 0 && toRate > 0 ? fromRate / toRate : 0;

  return (
    <div className="calc-container page-enter">
      {toast && <div className="toast">{toast}</div>}

      <header className="page-header">
        <div>
          <h1 className="page-title">Calculadora</h1>
          <p className="page-sub">Convertí cualquier moneda al instante con cotizaciones en tiempo real.</p>
        </div>
      </header>

      <div className="calc-grid">
        
        {/* Left Side: Inputs */}
        <div className="calc-box">
          <div className="calc-inputs">
            
            <div className="calc-group">
              <span className="calc-label">Desde</span>
              <div className="calc-select">
                <CurrencyBadge code={fromCurrency} size={30} />
                <div className="details">
                  <span className="code">{fromCurrency}</span>
                  <span className="name">{currencyName(fromCurrency)}</span>
                </div>
                <select 
                  value={fromCurrency} 
                  onChange={e => setFromCurrency(e.target.value)}
                  style={{position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer'}}
                >
                  <option value="USD">USD</option>
                  <option value="ARS">ARS</option>
                  <option value="EUR">EUR</option>
                  <option value="BRL">BRL</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="CAD">CAD</option>
                  <option value="CHF">CHF</option>
                  <option value="AUD">AUD</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="USDT">USDT</option>
                  <option value="BNB">BNB</option>
                  <option value="DOGE">DOGE</option>
                </select>
                <span>⌄</span>
              </div>
              <span className="calc-label">Ingresá el monto</span>
              <input 
                type="text" 
                className={`calc-amount ${montoError ? 'calc-amount-error' : ''}`} 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                aria-invalid={Boolean(montoError)}
              />
              {montoError && <span className="calc-error" role="alert">{montoError}</span>}
            </div>

            <button className="calc-swap-btn" onClick={handleSwap} title="Invertir monedas">⇄</button>

            <div className="calc-group">
              <span className="calc-label">Hacia</span>
              <div className="calc-select">
                <CurrencyBadge code={toCurrency} size={30} />
                <div className="details">
                  <span className="code">{toCurrency}</span>
                  <span className="name">{currencyName(toCurrency)}</span>
                </div>
                <select 
                  value={toCurrency} 
                  onChange={e => setToCurrency(e.target.value)}
                  style={{position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer'}}
                >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="BRL">BRL</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="CAD">CAD</option>
                  <option value="CHF">CHF</option>
                  <option value="AUD">AUD</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="USDT">USDT</option>
                  <option value="BNB">BNB</option>
                  <option value="DOGE">DOGE</option>
                </select>
                <span>⌄</span>
              </div>
              <span className="calc-label">Resultado</span>
              <input 
                type="text" 
                className="calc-amount calc-result-display" 
                value={hasError ? '' : (result || 0).toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: ['BTC', 'ETH', 'USDT', 'BNB', 'DOGE'].includes(toCurrency) ? 6 : 4})} 
                disabled 
              />
              {rateError && <span className="calc-error" role="alert">{rateError}</span>}
            </div>

          </div>

          {hasError ? (
            <div className="calc-rate-info">
              <span>{montoError || rateError}</span>
              <span className="calc-rate-live">Revisá el monto ingresado</span>
            </div>
          ) : conversionRate > 0 && (
            <div className="calc-rate-info">
              <span>1 {fromCurrency} = {conversionRate.toLocaleString('es-AR', {maximumFractionDigits: 4})} {toCurrency}</span>
              <span className="calc-rate-live">Al día de hoy</span>
            </div>
          )}

          <div className="calc-actions">
            <button type="button" className="btn btn-primary btn-block" onClick={handleConvertClick}>
              Convertir <Icon name="arrowRight" size={15} />
            </button>
            <button
              type="button"
              className={`btn btn-outline btn-block ${favoritesCodes.has(fromCurrency) ? 'calc-fav-active' : ''}`}
              onClick={handleToggleFavorite}
              disabled={favBusy}
            >
              <Icon name="star" size={15} style={{ fill: favoritesCodes.has(fromCurrency) ? 'currentColor' : 'none' }} />
              {favoritesCodes.has(fromCurrency) ? `${fromCurrency} en tus favoritos` : `Agregar ${fromCurrency} a favoritos`}
            </button>
          </div>

          <div className="calc-tip">
            <div className="calc-tip-icon"><Icon name="spark" size={20} /></div>
            <div className="calc-tip-text">
              <div className="calc-tip-title">Tip Divise Pro</div>
              <div className="calc-tip-sub">Agregá monedas a favoritos para acceder más rápido.</div>
            </div>
            <Link to="/dashboard/favoritos" className="btn btn-outline btn-sm">Ir a favoritos</Link>
          </div>
        </div>

        {/* Right Side: Result */}
        <div className="calc-result-panel">
          <div className="calc-box" style={{ marginBottom: '24px' }}>
            <div className="calc-result-header">
              <span className="calc-label">Resultado de la conversión</span>
              <div className="badge">Cotización en tiempo real</div>
            </div>
            
            <div className="calc-big-result">
              {hasError ? (
                <span className="calc-error-big">{montoError || rateError}</span>
              ) : (
                <>
                  <CountUp end={result} decimals={['BTC', 'ETH', 'USDT', 'BNB', 'DOGE'].includes(toCurrency) ? 6 : 2} duration={1} separator="." decimal="," /> <span>{toCurrency}</span>
                </>
              )}
            </div>

            <div className="calc-used-rate" style={{marginTop: '32px'}}>
              <div className="title">Cotización utilizada</div>
              <div className="row">
                <span>1 {fromCurrency} = {conversionRate ? conversionRate.toLocaleString('es-AR', {maximumFractionDigits: 4}) : 0} {toCurrency}</span>
              </div>
              <div className="time">Última actualización: En vivo desde el servidor</div>
            </div>
          </div>

          <div className="calc-box calc-history">
            <div className="calc-history-header">
              <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Últimas conversiones</span>
            </div>
            
            <div className="history-list">
              {history.length === 0 && (
                <div className="calc-history-empty">Todavía no hiciste conversiones en esta sesión.</div>
              )}
              {history.map((h, i) => (
                <div className="calc-history-item" key={i}>
                  <div className="chi-left">
                    <div className="chi-flags">
                      <span style={{ marginRight: '-8px', zIndex: 1, display: 'inline-flex' }}>
                        <CurrencyBadge code={h.from} size={22} />
                      </span>
                      <span style={{ display: 'inline-flex' }}>
                        <CurrencyBadge code={h.to} size={22} />
                      </span>
                    </div>
                    <div className="chi-pair">{h.from} ➔ {h.to}</div>
                  </div>
                  <div className="chi-right">
                    <div className="chi-amounts">{h.in} {h.from} = {h.out} {h.to}</div>
                    <div className="chi-time">{h.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal de resultado de la conversión */}
        {showResult && (
          <div className="calc-modal-backdrop" onClick={() => setShowResult(false)}>
            <div className="calc-modal" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="calc-modal-close"
                onClick={() => setShowResult(false)}
                aria-label="Cerrar"
              >
                <Icon name="close" size={18} />
              </button>

              <div className="calc-modal-badge">Conversión en tiempo real</div>

              <div className="calc-modal-pair">
                <div className="calc-modal-cur">
                  <CurrencyBadge code={fromCurrency} size={34} />
                  <span className="code">{fromCurrency}</span>
                </div>
                <Icon name="arrowRight" size={20} style={{ color: 'var(--brand-gold)' }} />
                <div className="calc-modal-cur">
                  <CurrencyBadge code={toCurrency} size={34} />
                  <span className="code">{toCurrency}</span>
                </div>
              </div>

              <div className="calc-modal-amount">
                {amountParse.value} <span>{fromCurrency}</span>
              </div>

              <div className="calc-modal-equals">=</div>

              <div className="calc-modal-result">
                <CountUp
                  end={result}
                  decimals={['BTC', 'ETH', 'USDT', 'BNB', 'DOGE'].includes(toCurrency) ? 6 : 2}
                  duration={0.9}
                  separator="."
                  decimal=","
                />
                {' '}<span className="calc-modal-result-cur">{toCurrency}</span>
              </div>

              <div className="calc-modal-rate">
                <Icon name="spark" size={14} style={{ color: 'var(--brand-gold)' }} />
                1 {fromCurrency} = {conversionRate ? conversionRate.toLocaleString('es-AR', { maximumFractionDigits: 4 }) : 0} {toCurrency}
              </div>

              <button type="button" className="btn btn-primary btn-block" onClick={() => setShowResult(false)}>
                Listo
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
