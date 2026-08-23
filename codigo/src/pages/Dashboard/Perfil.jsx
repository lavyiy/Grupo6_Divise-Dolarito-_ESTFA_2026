import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../../components/ui/Icon';
import './Perfil.css';

export default function Perfil() {
  const { user } = useAuth();

  return (
    <div className="perfil-container page-enter">
      
      <header className="page-header">
        <div>
          <h1 className="page-title">Mi Perfil</h1>
          <p className="page-sub">Gestioná tu información personal y preferencias de la aplicación.</p>
        </div>
      </header>

      <div className="perfil-grid">
        
        {/* Info Card */}
        <div className="perfil-card fade-in delay-100">
          <div className="pc-avatar">
            {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <h2 className="pc-name">{user?.nombre || 'Usuario Registrado'}</h2>
          <p className="pc-email">{user?.email || 'usuario@email.com'}</p>
          
          <div className="pc-divider"></div>
          
          <div className="pc-info-row">
            <span className="pc-label">Estado de la cuenta</span>
            <span className="badge badge-success">Activa</span>
          </div>
          <div className="pc-info-row">
            <span className="pc-label">Plan actual</span>
            <span className="badge badge-gold">Divise Pro</span>
          </div>
          
          <button className="btn btn-outline btn-block" style={{marginTop: '24px'}}>Editar Perfil</button>
        </div>

        {/* Settings */}
        <div className="perfil-settings">
          
          <div className="settings-section fade-in delay-200">
            <h3><Icon name="settings" size={16} /> Preferencias Visuales</h3>
            <div className="setting-row">
              <div>
                <h4>Tema de la Aplicación</h4>
                <p>Elegí entre el modo oscuro premium o claro.</p>
              </div>
              <select className="setting-select">
                <option>Oscuro (Divise Pro)</option>
                <option disabled>Claro (Próximamente)</option>
              </select>
            </div>
            <div className="setting-row">
              <div>
                <h4>Divisa Principal</h4>
                <p>La divisa que se mostrará por defecto en los gráficos.</p>
              </div>
              <select className="setting-select">
                <option>USD - Dólar Blue</option>
                <option>USD - Dólar Oficial</option>
                <option>EUR - Euro</option>
                <option>BTC - Bitcoin</option>
              </select>
            </div>
          </div>

          <div className="settings-section fade-in delay-300">
            <h3><Icon name="shield" size={16} /> Seguridad</h3>
            <div className="setting-row">
              <div>
                <h4>Contraseña</h4>
                <p>Cambiá tu contraseña regularmente por seguridad.</p>
              </div>
              <button className="btn btn-outline">Cambiar</button>
            </div>
            <div className="setting-row">
              <div>
                <h4>Autenticación en dos pasos (2FA)</h4>
                <p>Agregá una capa extra de seguridad a tu cuenta.</p>
              </div>
              <button className="btn btn-primary">Activar</button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
