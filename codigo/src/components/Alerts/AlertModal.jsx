import React, { useState } from 'react';
import { Icon } from '../ui/Icon';
import { parseArgentineNumber } from '../../utils';
import './AlertModal.css';

// Mapeo nombre legible → código de divisa para el backend.
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
    const parsed = parseArgentineNumber(valor);
    if (!parsed.ok) {
      setError(parsed.error || 'Ingresá un valor numérico válido (ej: 1.500 o 15.000.000).');
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
        valor_limite: parsed.value,
        valor: valor
      });
    }
  };

  return (
    <div className="alert-modal-overlay" onClick={onClose}>
      <div className="alert-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="alert-modal-close" onClick={onClose} aria-label="Cerrar">
          <Icon name="close" size={20} />
        </button>

        <div className="alert-modal-left">
          <div className="alert-ml-icon"><Icon name="bell" size={32} /></div>
          <h2 className="alert-ml-title">Configurar<br/><span>alerta</span></h2>
          <p className="alert-ml-sub">
            Te avisaremos por email cuando la cotización alcance el valor que definas.
          </p>

          <div className="alert-ml-card">
            <div className="alert-mlc-label">COTIZACIÓN SELECCIONADA</div>
            <div className="alert-mlc-title">{DIVISAS[divisaIdx].label}</div>
            <div className="alert-mlc-price">Código: {DIVISAS[divisaIdx].codigo}</div>
            <div className="alert-mlc-change"><Icon name="bell" size={14} /> Notificación por email</div>
          </div>
        </div>

        <div className="alert-modal-right">
          
          <div className="alert-mr-group">
            <label className="alert-mr-label">DIVISA</label>
            <div className="alert-mr-input-wrapper">
              <span className="alert-mr-icon"><Icon name="dollar" size={16} /></span>
              <div className="alert-mr-select-wrapper">
                <select
                  className="alert-mr-select"
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

          <div className="alert-mr-group">
            <label className="alert-mr-label">CONDICIÓN</label>
            <div className="alert-mr-input-wrapper">
              <span className="alert-mr-icon"><Icon name="trendUp" size={16} /></span>
              <div className="alert-mr-select-wrapper">
                <select className="alert-mr-select" value={condicion} onChange={e => setCondicion(e.target.value)}>
                  <option>Supera el valor</option>
                  <option>Cae por debajo de</option>
                </select>
              </div>
            </div>
          </div>

          <div className="alert-mr-group">
            <label className="alert-mr-label">VALOR OBJETIVO (ARS)</label>
            <div className="alert-mr-input-wrapper">
              <span className="alert-mr-icon"><Icon name="target" size={16} /></span>
              <span style={{color: 'var(--text-main)', fontWeight: '600'}}>$ </span>
              <input 
                type="text" 
                className="alert-mr-input" 
                placeholder="Ej: 1.500 o 15.000.000" 
                value={valor}
                onChange={e => setValor(e.target.value)}
              />
            </div>
            {error && <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>{error}</span>}
          </div>

          <div className="alert-mr-info">
            <span className="alert-mr-info-icon"><Icon name="info" size={16} /></span>
            <span>Te enviaremos un email en cuanto el mercado alcance la condición especificada.</span>
          </div>

          <div className="alert-mr-actions">
            <button className="btn btn-primary" onClick={handleSave}>Guardar alerta <Icon name="arrowRight" size={16} /></button>
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          </div>

        </div>

      </div>
    </div>
  );
}
