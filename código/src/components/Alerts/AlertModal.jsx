import React, { useState } from 'react';
import { Icon } from '../ui/Icon';
import './AlertModal.css';

export default function AlertModal({ onClose, onSave }) {
  const [divisa, setDivisa] = useState('Dólar Blue');
  const [condicion, setCondicion] = useState('Supera el valor');
  const [valor, setValor] = useState('');
  const [email, setEmail] = useState('');

  const handleSave = () => {
    if (onSave) {
      onSave({ divisa, condicion, valor, email });
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
            <div className="mlc-label">COTIZACIÓN ACTUAL</div>
            <div className="mlc-title">Dólar Blue</div>
            <div className="mlc-price">$ 1.423,00</div>
            <div className="mlc-change"><Icon name="trendUp" size={14} /> +1,35% hoy</div>
          </div>
        </div>

        <div className="modal-right">
          
          <div className="mr-group">
            <label className="mr-label">DIVISA</label>
            <div className="mr-input-wrapper">
              <span className="mr-icon"><Icon name="dollar" size={16} /></span>
              <div className="mr-select-wrapper">
                <select className="mr-select" value={divisa} onChange={e => setDivisa(e.target.value)}>
                  <option>Dólar Blue</option>
                  <option>Dólar Oficial</option>
                  <option>Euro Oficial</option>
                  <option>Bitcoin</option>
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
            <label className="mr-label">VALOR OBJETIVO (ARS)</label>
            <div className="mr-input-wrapper">
              <span className="mr-icon"><Icon name="target" size={16} /></span>
              <span style={{color: 'var(--text-main)'}}>$ </span>
              <input 
                type="text" 
                className="mr-input" 
                placeholder="1.450" 
                value={valor}
                onChange={e => setValor(e.target.value)}
              />
            </div>
          </div>

          <div className="mr-group">
            <label className="mr-label">EMAIL DE NOTIFICACIÓN</label>
            <div className="mr-input-wrapper">
              <span className="mr-icon"><Icon name="mail" size={16} /></span>
              <input 
                type="email" 
                className="mr-input" 
                placeholder="usuario@email.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
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
