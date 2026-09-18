import React, { useState } from 'react';
import { Icon } from '../ui/Icon';
import './AlertModal.css';

// Mapeo nombre legible → código de divisa para el backend.
// Las divisas fiat llevan el mercado en el código (ej: USD_INFORMAL) para
// que la alerta se compare contra la cotización correcta.
const DIVISAS = [
  { label: 'Dólar Blue',    codigo: 'USD', mercado: 'Informal' },
  { label: 'Dólar Oficial', codigo: 'USD', mercado: 'Oficial' },
  { label: 'Euro',          codigo: 'EUR', mercado: 'Oficial' },
  { label: 'Real Brasileño', codigo: 'BRL', mercado: 'Oficial' },
  { label: 'Peso Uruguayo', codigo: 'UYU', mercado: 'Oficial' },
  { label: 'Peso Chileno',  codigo: 'CLP', mercado: 'Oficial' },
  { label: 'Libra Esterlina', codigo: 'GBP', mercado: 'Oficial' },
  { label: 'Yen Japonés',   codigo: 'JPY', mercado: 'Oficial' },
  { label: 'Peso Mexicano', codigo: 'MXN', mercado: 'Oficial' },
  { label: 'Franco Suizo',  codigo: 'CHF', mercado: 'Oficial' },
  { label: 'Yuan Chino',    codigo: 'CNY', mercado: 'Oficial' },
  { label: 'Bitcoin',       codigo: 'BTC' },
  { label: 'Ethereum',      codigo: 'ETH' },
  { label: 'Tether (USDT)', codigo: 'USDT' },
  { label: 'BNB',           codigo: 'BNB' },
  { label: 'Dogecoin',      codigo: 'DOGE' },
];

export default function AlertModal({ onClose, onSave }) {
  const [divisaIdx, setDivisaIdx] = useState(0);
  const [condicion, setCondicion] = useState('Supera el valor');
  const [valor, setValor] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!valor || isNaN(parseFloat(valor.replace(',', '.')))) {
      setError('Ingresá un valor numérico válido.');
      return;
    }
    setError('');
    if (onSave) {
      const divisa = DIVISAS[divisaIdx];
      const codigoKey = divisa.mercado
        ? `${divisa.codigo}_${divisa.mercado.toUpperCase()}`
        : divisa.codigo;
      onSave({
        codigo_divisa: codigoKey,
        divisa: divisa.label,
        mercado: divisa.mercado || 'Cripto',
        condicion,
        valor_limite: parseFloat(valor.replace(',', '.')),
        valor: valor
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar"><Icon name="close" size={20} /></button>

        <div className="modal-left">
          <div className="ml-icon"><Icon name="bell" size={36} /></div>
          <h2 className="ml-title">Configurar<br/><span>alerta</span></h2>
          <p className="ml-sub">
            Te avisaremos por email cuando la cotización alcance el valor que definas.
          </p>

          <div className="ml-card">
            <div className="mlc-label">COTIZACIÓN SELECCIONADA</div>
            <div className="mlc-title">{DIVISAS[divisaIdx].label}</div>
            <div className="mlc-price">Código: {DIVISAS[divisaIdx].codigo}</div>
            <div className="mlc-change"><Icon name="bell" size={14} /> Notificación por email</div>
          </div>
        </div>

        <div className="modal-right">
          
          <div className="mr-group">
            <label className="mr-label">DIVISA</label>
            <div className="mr-input-wrapper">
              <span className="mr-icon"><Icon name="dollar" size={16} /></span>
              <div className="mr-select-wrapper">
                <select
                  className="mr-select"
                  value={divisaIdx}
                  onChange={e => setDivisaIdx(Number(e.target.value))}
                >
                  {DIVISAS.map((d, i) => (
                    <option key={i} value={i}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mr-group">
            <label className="mr-label">CONDICIÓN</label>
            <div className="mr-input-wrapper">
              <span className="mr-icon"><Icon name="trendUp" size={16} /></span>
              <div className="mr-select-wrapper">
                <select className="mr-select" value={condicion} onChange={e => setCondicion(e.target.value)}>
                  <option>Supera el valor</option>
                  <option>Cae por debajo de</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mr-group">
            <label className="mr-label">VALOR OBJETIVO</label>
            <div className="mr-input-wrapper">
              <span className="mr-icon"><Icon name="target" size={16} /></span>
              <span style={{color: 'var(--text-main)'}}>$ </span>
              <input 
                type="text" 
                className="mr-input" 
                placeholder="1450" 
                value={valor}
                onChange={e => setValor(e.target.value)}
              />
            </div>
            {error && <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>{error}</span>}
          </div>

          <div className="mr-info">
            <span className="mr-info-icon"><Icon name="info" size={16} /></span>
            <span>Te enviaremos un email cuando la cotización supere el valor objetivo que definiste.</span>
          </div>

          <div className="mr-actions">
            <button className="btn btn-primary" onClick={handleSave}>Guardar alerta <Icon name="arrowRight" size={16} /></button>
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          </div>

        </div>

      </div>
    </div>
  );
}
