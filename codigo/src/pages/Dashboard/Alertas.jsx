import React, { useState, useEffect, useCallback } from 'react';
import AlertModal from '../../components/Alerts/AlertModal';
import { Icon } from '../../components/ui/Icon';
import { useAuth } from '../../context/AuthContext';
import { getAlerts, createAlert, deleteAlert } from '../../services/api';
import './Alertas.css';

export default function Alertas() {
  const { token } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const loadAlerts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await getAlerts(token);
      setAlertas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las alertas.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleDelete = async (id) => {
    try {
      await deleteAlert(id, token);
      setAlertas(prev => prev.filter(a => (a.id_alerta || a.id) !== id));
      showToast('Alerta eliminada.');
    } catch (err) {
      showToast('No se pudo eliminar la alerta.');
    }
  };

  const handleSaveAlert = async (newAlert) => {
    try {
      await createAlert({
        codigo_divisa: newAlert.codigo_divisa || newAlert.divisa,
        condicion: newAlert.condicion,
        valor_limite: newAlert.valor_limite || newAlert.valor
      }, token);
      setShowModal(false);
      showToast('¡Alerta creada con éxito!');
      loadAlerts();
    } catch (err) {
      showToast(err.message || 'No se pudo crear la alerta.');
    }
  };

  const getIcon = (codigo) => {
    const map = { BTC: 'bitcoin', ETH: 'ethereum', USD: 'dollar', EUR: 'dollar', BNB: 'bitcoin', DOGE: 'bitcoin', USDT: 'dollar' };
    return map[codigo] || 'dollar';
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

      {toast && (
        <div className="toast-global">
          <Icon name="check" size={15} /> {toast}
        </div>
      )}

      {error && (
        <div className="alertas-error">
          <Icon name="alertTriangle" size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="alertas-loading">
          <div className="spinner-lg" /> Cargando alertas...
        </div>
      ) : alertas.length === 0 ? (
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
          {alertas.map(alerta => {
            const id = alerta.id_alerta || alerta.id;
            const codigo = alerta.codigo_divisa || alerta.divisa;
            const condicion = alerta.condicion;
            const valor = alerta.valor_limite ?? alerta.valor;
            return (
              <div className="alerta-card fade-in" key={id}>
                <div className="ac-header">
                  <div className="ac-title">
                    <span className="ac-icon"><Icon name={getIcon(codigo)} size={22} /></span>
                    {codigo}
                  </div>
                  <div className="ac-status">Activa</div>
                </div>
                
                <div className="ac-body">
                  <div className="ac-condition">
                    <span className="ac-label">{condicion}</span>
                    <span className="ac-val"><span>$</span> {valor}</span>
                  </div>
                </div>

                <div className="ac-footer">
                  <div className="ac-actions">
                    <button
                      className="btn btn-danger-sm"
                      onClick={() => handleDelete(id)}
                    >
                      <Icon name="trash" size={13} /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
