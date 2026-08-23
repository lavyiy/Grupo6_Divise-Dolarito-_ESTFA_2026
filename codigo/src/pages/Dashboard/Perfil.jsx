import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../../components/ui/Icon';
import { getMyProfile, updateWhatsAppConfig, testWhatsAppConfig } from '../../services/api';
import './Perfil.css';

export default function Perfil() {
  const { user, token } = useAuth();

  // Configuración de WhatsApp para alertas al celular
  const [waPhone, setWaPhone] = useState('');
  const [waKey, setWaKey] = useState('');
  const [waStatus, setWaStatus] = useState(null); // { type: 'ok'|'error', msg }
  const [waLoading, setWaLoading] = useState(false);
  const [waConfigured, setWaConfigured] = useState(false);

  useEffect(() => {
    if (!token) return;
    getMyProfile(token)
      .then((profile) => {
        if (profile?.whatsapp_phone) setWaPhone(profile.whatsapp_phone);
        setWaConfigured(Boolean(profile?.whatsapp_configurado));
      })
      .catch(() => {});
  }, [token]);

  const handleSaveWhatsApp = async () => {
    setWaStatus(null);
    if (!waPhone.trim()) {
      setWaStatus({ type: 'error', msg: 'Ingresá tu número de WhatsApp con código de país.' });
      return;
    }
    setWaLoading(true);
    try {
      await updateWhatsAppConfig(
        { whatsapp_phone: waPhone.trim(), whatsapp_api_key: waKey.trim() || undefined },
        token
      );
      setWaConfigured(true);
      setWaKey('');
      setWaStatus({ type: 'ok', msg: 'Configuración guardada. Las alertas llegarán a tu WhatsApp.' });
    } catch (err) {
      setWaStatus({ type: 'error', msg: err.message });
    } finally {
      setWaLoading(false);
    }
  };

  const handleTestWhatsApp = async () => {
    setWaStatus(null);
    setWaLoading(true);
    try {
      const res = await testWhatsAppConfig(token);
      setWaStatus({ type: 'ok', msg: res.message || 'Mensaje de prueba enviado.' });
    } catch (err) {
      setWaStatus({ type: 'error', msg: err.message });
    } finally {
      setWaLoading(false);
    }
  };

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

          <div className="settings-section fade-in delay-400">
            <h3><Icon name="bell" size={16} /> Alertas por WhatsApp</h3>
            {waStatus && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '14px',
                  fontSize: '13px',
                  background: waStatus.type === 'ok' ? 'rgba(46,204,138,.12)' : 'rgba(231,76,60,.12)',
                  color: waStatus.type === 'ok' ? '#2ecc8a' : '#e74c3c',
                  border: `1px solid ${waStatus.type === 'ok' ? 'rgba(46,204,138,.4)' : 'rgba(231,76,60,.4)'}`,
                }}
              >
                {waStatus.msg}
              </div>
            )}
            <div className="setting-row">
              <div>
                <h4>Número de WhatsApp</h4>
                <p>Con código de país, sin espacios. Ej: +5491122334455</p>
              </div>
              <input
                type="tel"
                className="setting-select"
                style={{ maxWidth: '220px', color: 'inherit', fontFamily: 'inherit' }}
                placeholder="+5491122334455"
                value={waPhone}
                onChange={(e) => setWaPhone(e.target.value)}
              />
            </div>
            <div className="setting-row">
              <div>
                <h4>API Key de CallMeBot</h4>
                <p>
                  Mandá "I allow callmebot to send me messages" por WhatsApp al{' '}
                  <strong>+34 623 91 22 04</strong> y te la responde el bot.{' '}
                  {waConfigured ? '(Ya configurada ✓)' : ''}
                </p>
              </div>
              <input
                type="text"
                className="setting-select"
                style={{ maxWidth: '160px', color: 'inherit', fontFamily: 'inherit' }}
                placeholder={waConfigured ? '••••••••' : 'Ej: 123456'}
                value={waKey}
                onChange={(e) => setWaKey(e.target.value)}
              />
            </div>
            <div className="setting-row" style={{ justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-outline" onClick={handleTestWhatsApp} disabled={waLoading}>
                Probar envío
              </button>
              <button className="btn btn-primary" onClick={handleSaveWhatsApp} disabled={waLoading}>
                {waLoading ? <div className="spinner"></div> : 'Guardar'}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
