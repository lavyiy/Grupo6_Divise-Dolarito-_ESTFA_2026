import React, { useState } from 'react';
import AlertModal from '../../components/Alerts/AlertModal';
import { Icon } from '../../components/ui/Icon';
import './Alertas.css';

export default function Alertas() {
  const [showModal, setShowModal] = useState(false);
  const [alertas, setAlertas] = useState([
    {
      id: 1,
      divisa: 'Dólar Blue',
      icon: 'dollar',
      condicion: 'Supera el valor',
      valor: '1.450',
      email: 'santi@email.com',
      activa: true
    },
    {
      id: 2,
      divisa: 'Bitcoin',
      icon: 'bitcoin',
      condicion: 'Cae por debajo de',
      valor: '60.000 USD',
      email: 'santi@email.com',
      activa: true
    }
  ]);

  const handleDelete = (id) => {
    setAlertas(alertas.filter(a => a.id !== id));
  };

  const handleSaveAlert = (newAlert) => {
    setAlertas([
      ...alertas,
      {
        id: Date.now(),
        divisa: newAlert.divisa,
        icon: newAlert.divisa === 'Bitcoin' ? 'bitcoin' : 'dollar',
        condicion: newAlert.condicion,
        valor: newAlert.valor,
        email: newAlert.email,
        activa: true
      }
    ]);
    setShowModal(false);
  };

  return (
    <div className="alertas-container page-enter">
      
      <header className="page-header">
        <div>
          <h1 className="page-title">Mis Alertas</h1>
          <p className="page-sub">Configurá notificaciones para que el mercado no te tome por sorpresa.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={16} /> Nueva Alerta
        </button>
      </header>

      {alertas.length === 0 ? (
        <div className="alertas-empty">
          <div className="ae-icon"><Icon name="bell" size={44} /></div>
          <div className="ae-title">No tenés alertas activas</div>
          <div className="ae-sub">Creá tu primera alerta para recibir un email en cuanto una cotización alcance el valor que te interesa.</div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Icon name="plus" size={16} /> Nueva Alerta
          </button>
        </div>
      ) : (
        <div className="alertas-grid">
          {alertas.map(alerta => (
            <div className="alerta-card fade-in" key={alerta.id}>
              <div className="ac-header">
                <div className="ac-title">
                  <span className="ac-icon"><Icon name={alerta.icon} size={22} /></span>
                  {alerta.divisa}
                </div>
                {alerta.activa && <div className="ac-status">Activa</div>}
              </div>
              
              <div className="ac-body">
                <div className="ac-condition">
                  <span className="ac-label">{alerta.condicion}</span>
                  <span className="ac-val"><span>$</span> {alerta.valor}</span>
                </div>
              </div>

              <div className="ac-footer">
                <div className="ac-email"><Icon name="mail" size={13} /> Enviar a: {alerta.email}</div>
                <div className="ac-actions">
                  <button onClick={() => handleDelete(alerta.id)}>Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AlertModal 
          onClose={() => setShowModal(false)} 
          onSave={handleSaveAlert}
        />
      )}

    </div>
  );
}
