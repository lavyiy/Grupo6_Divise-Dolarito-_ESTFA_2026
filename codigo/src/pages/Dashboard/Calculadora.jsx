import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { fetchRates } from '../../services/api';
import CountUp from 'react-countup';
import { Icon } from '../../components/ui/Icon';
import { flagIcon, currencyName } from '../../utils';
import './Calculadora.css';

export default function Calculadora() {
  const location = useLocation();
  const [rates, setRates] = useState([]);
  const [amount, setAmount] = useState('1000');
  const [fromCurrency, setFromCurrency] = useState(location.state?.currency || 'USD');
  const [toCurrency, setToCurrency] = useState('ARS');
  
  // Fake history for demo matching mockup
  const history = [
    { from: 'USD', to: 'ARS', in: '1000', out: '1298750', time: 'Hace 1 min' },
    { from: 'EUR', to: 'USD', in: '500', out: '537.85', time: 'Hace 1 hora' },
    { from: 'ARS', to: 'BRL', in: '10000', out: '55.28', time: 'Ayer' },
    { from: 'USD', to: 'EUR', in: '100', out: '92.35', time: 'Ayer' }
  ];

  useEffect(() => {
    if (location.state?.currency) {
      setFromCurrency(location.state.currency);
    }
  }, [location.state]);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchRates();
        if (Array.isArray(data)) setRates(data);
      } catch (err) {
        console.error("Error fetching live rates", err);
      }
    }
    load();
  }, []);

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const getARSValue = (currencyCode) => {
    if (currencyCode === 'ARS') return 1;
    let rate = rates.find(r => r.codigo === currencyCode && r.tipo_mercado === 'Informal');
    if (!rate) rate = rates.find(r => r.codigo === currencyCode);
    return rate ? rate.venta : 0;
  };

  const calculateResult = () => {
    const fromVal = getARSValue(fromCurrency);
    const toVal = getARSValue(toCurrency);
    const numAmount = parseFloat(amount.replace(',', '.')) || 0;

    if (fromVal === 0 || toVal === 0) return 0;
    
    const inARS = numAmount * fromVal;
    const finalResult = inARS / toVal;
    return finalResult;
  };

  const result = calculateResult();
  const conversionRate = getARSValue(fromCurrency) / getARSValue(toCurrency);

  return (
    <div className="calc-container page-enter">
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
                <span className="flag">{flagIcon(fromCurrency)}</span>
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
                </select>
                <span>⌄</span>
              </div>
              <span className="calc-label">Ingresá el monto</span>
              <input 
                type="text" 
                className="calc-amount" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
              />
            </div>

            <button className="calc-swap-btn" onClick={handleSwap} title="Invertir monedas">⇄</button>

            <div className="calc-group">
              <span className="calc-label">Hacia</span>
              <div className="calc-select">
                <span className="flag">{flagIcon(toCurrency)}</span>
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
                </select>
                <span>⌄</span>
              </div>
              <span className="calc-label">Resultado</span>
              <input 
                type="text" 
                className="calc-amount calc-result-display" 
                value={result ? result.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 4}) : 'Cargando...'} 
                disabled 
              />
            </div>

          </div>

          {conversionRate > 0 && (
            <div className="calc-rate-info">
              <span>1 {fromCurrency} = {conversionRate.toLocaleString('es-AR', {maximumFractionDigits: 4})} {toCurrency}</span>
              <span className="calc-rate-live">Al día de hoy</span>
            </div>
          )}

          <div className="calc-actions">
            <button className="btn btn-primary btn-block">
              Convertir <Icon name="arrowRight" size={15} />
            </button>
            <button className="btn btn-outline btn-block">
              <Icon name="star" size={15} /> Agregar a favoritos
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
              <CountUp end={result} decimals={2} duration={1} separator="." decimal="," /> <span>{toCurrency}</span>
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
              {history.map((h, i) => (
                <div className="calc-history-item" key={i}>
                  <div className="chi-left">
                    <div className="chi-flags">
                      <span style={{marginRight: '-8px', zIndex: 1}}>{flagIcon(h.from)}</span>
                      <span>{flagIcon(h.to)}</span>
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

      </div>
    </div>
  );
}
