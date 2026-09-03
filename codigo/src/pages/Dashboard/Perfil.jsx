import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../../components/ui/Icon';
import {
  getMyProfile,
  updateProfile,
  changePassword,
  toggleTwoFactor
} from '../../services/api';
import './Perfil.css';

export default function Perfil() {
  const { user, token, updateUser } = useAuth();

  // ── Alerta global en página (Toast/Banner) ───────────────────────────────
  const [globalToast, setGlobalToast] = useState(null); // { type: 'ok'|'error', msg }
  const showToast = (msg, type = 'ok') => {
    setGlobalToast({ msg, type });
    setTimeout(() => setGlobalToast(null), 5000);
  };

  // ── Modal Editar Perfil ──────────────────────────────────────────────────
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const openEditModal = () => {
    setEditNombre(user?.nombre || '');
    setEditEmail(user?.email || '');
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editNombre.trim()) {
      setEditError('Ingresá tu nombre completo.');
      return;
    }
    if (!editEmail.trim()) {
      setEditError('Ingresá tu dirección de email.');
      return;
    }

    setEditLoading(true);
    setEditError('');
    try {
      await updateProfile({ nombre: editNombre.trim(), email: editEmail.trim() }, token);
      updateUser({ nombre: editNombre.trim(), email: editEmail.trim() });
      setIsEditModalOpen(false);
      showToast('¡Perfil actualizado con éxito!');
    } catch (err) {
      setEditError(err.message || 'Error al actualizar el perfil.');
    } finally {
      setEditLoading(false);
    }
  };

  // ── Modal Cambiar Contraseña ─────────────────────────────────────────────
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdShow, setPwdShow] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const openPasswordModal = () => {
    setPwdCurrent('');
    setPwdNew('');
    setPwdConfirm('');
    setPwdError('');
    setIsPasswordModalOpen(true);
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPwdError('');

    if (pwdNew.length < 8) {
      setPwdError('La nueva contraseña debe tener como mínimo 8 caracteres.');
      return;
    }
    if (pwdNew !== pwdConfirm) {
      setPwdError('Las nuevas contraseñas no coinciden.');
      return;
    }

    setPwdLoading(true);
    try {
      await changePassword({ currentPassword: pwdCurrent, newPassword: pwdNew }, token);
      setIsPasswordModalOpen(false);
      showToast('Contraseña actualizada con éxito.');
    } catch (err) {
      setPwdError(err.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setPwdLoading(false);
    }
  };

  // ── Autenticación en dos pasos (2FA) ────────────────────────────────────
  const [twoFactorActive, setTwoFactorActive] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  // ── Preferencias Visuales ────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('divise_theme') || 'dark';
  });
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('divise_base_currency') || 'USD - Dólar Blue';
  });

  const handleThemeChange = (e) => {
    const selectedTheme = e.target.value;
    setTheme(selectedTheme);
    localStorage.setItem('divise_theme', selectedTheme);
    document.documentElement.setAttribute('data-theme', selectedTheme);
    showToast(`Tema cambiado a modo ${selectedTheme === 'dark' ? 'Oscuro' : 'Claro'}.`);
  };

  const handleCurrencyChange = (e) => {
    const selectedCurrency = e.target.value;
    setCurrency(selectedCurrency);
    localStorage.setItem('divise_base_currency', selectedCurrency);
    showToast(`Divisa principal configurada: ${selectedCurrency}.`);
  };

  useEffect(() => {
    // Sincronizar tema aplicado al cargar componente
    const savedTheme = localStorage.getItem('divise_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (!token) return;
    getMyProfile(token)
      .then((profile) => {
        if (profile?.two_factor_enabled !== undefined) {
          setTwoFactorActive(Boolean(profile.two_factor_enabled));
        }
      })
      .catch(() => {});
  }, [token]);

  const handleToggle2FA = async () => {
    setTwoFactorLoading(true);
    const targetState = !twoFactorActive;
    try {
      await toggleTwoFactor(targetState, token);
      setTwoFactorActive(targetState);
      updateUser({ two_factor_enabled: targetState });
      showToast(
        targetState
          ? '2FA activado: En tu próximo inicio de sesión se enviará un código a tu correo.'
          : 'Autenticación en dos pasos (2FA) desactivada.',
        'ok'
      );
    } catch (err) {
      showToast(err.message || 'No se pudo actualizar el estado de 2FA', 'error');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  return (
    <div className="perfil-container page-enter">
      
      <header className="page-header">
        <div>
          <h1 className="page-title">Mi Perfil</h1>
          <p className="page-sub">Gestioná tu información personal, seguridad y preferencias sin salir de la pantalla.</p>
        </div>
      </header>

      {/* Toast / Notificación Superior */}
      {globalToast && (
        <div className={`toast-message ${globalToast.type}`}>
          <Icon name={globalToast.type === 'ok' ? 'check' : 'alertTriangle'} size={18} />
          <span>{globalToast.msg}</span>
        </div>
      )}

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
          <div className="pc-info-row">
            <span className="pc-label">Seguridad 2FA</span>
            <span className={`badge-2fa ${twoFactorActive ? 'active' : 'inactive'}`}>
              {twoFactorActive ? '✓ Protegida' : 'Desactivada'}
            </span>
          </div>
          
          <button
            type="button"
            className="btn btn-outline btn-block"
            style={{ marginTop: '24px' }}
            onClick={openEditModal}
          >
            <Icon name="edit" size={15} /> Editar Perfil
          </button>
        </div>

        {/* Settings */}
        <div className="perfil-settings">
          
          {/* Preferencias Visuales */}
          <div className="settings-section fade-in delay-200">
            <h3><Icon name="settings" size={16} /> Preferencias Visuales</h3>
            <div className="setting-row">
              <div>
                <h4>Tema de la Aplicación</h4>
                <p>Elegí entre el modo oscuro premium o modo claro dinámico.</p>
              </div>
              <select
                className="setting-select"
                value={theme}
                onChange={handleThemeChange}
              >
                <option value="dark">Oscuro (Divise Pro)</option>
                <option value="light">Claro (Light Gold)</option>
              </select>
            </div>
            <div className="setting-row">
              <div>
                <h4>Divisa Principal</h4>
                <p>La cotización que se prioriza por defecto en tus tableros.</p>
              </div>
              <select
                className="setting-select"
                value={currency}
                onChange={handleCurrencyChange}
              >
                <option value="USD - Dólar Blue">USD - Dólar Blue</option>
                <option value="USD - Dólar Oficial">USD - Dólar Oficial</option>
                <option value="EUR - Euro">EUR - Euro</option>
                <option value="BTC - Bitcoin">BTC - Bitcoin</option>
              </select>
            </div>
          </div>

          {/* Seguridad */}
          <div className="settings-section fade-in delay-300">
            <h3><Icon name="shield" size={16} /> Seguridad</h3>
            
            <div className="setting-row">
              <div>
                <h4>Contraseña</h4>
                <p>Cambiá tu clave de acceso de forma segura sin salir de la app.</p>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={openPasswordModal}
              >
                <Icon name="lock" size={14} /> Cambiar Contraseña
              </button>
            </div>

            <div className="setting-row">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4>Autenticación en dos pasos (2FA)</h4>
                  <span className={`badge-2fa ${twoFactorActive ? 'active' : 'inactive'}`}>
                    {twoFactorActive ? 'Activada' : 'Inactiva'}
                  </span>
                </div>
                <p>
                  {twoFactorActive
                    ? 'Activada: Se solicitará un código de 6 dígitos enviado a tu correo en cada inicio de sesión.'
                    : 'Agregá una capa extra de protección: requerí código de verificación por correo al iniciar sesión.'}
                </p>
              </div>
              <button
                type="button"
                className={`btn ${twoFactorActive ? 'btn-outline' : 'btn-primary'}`}
                onClick={handleToggle2FA}
                disabled={twoFactorLoading}
              >
                {twoFactorLoading ? (
                  <div className="spinner"></div>
                ) : twoFactorActive ? (
                  'Desactivar'
                ) : (
                  'Activar 2FA'
                )}
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ── Modal Editar Perfil (In-Place) ─────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">
                  <span className="modal-title-icon"><Icon name="edit" size={20} /></span>
                  Editar Información de Perfil
                </h3>
                <p className="modal-sub">Actualizá tu información personal al instante.</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
                aria-label="Cerrar modal"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {editError && (
              <div className="toast-message error">
                <Icon name="alertTriangle" size={16} />
                <span>{editError}</span>
              </div>
            )}

            <form className="modal-form" onSubmit={handleSaveProfile}>
              <div className="modal-field">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  className="modal-input"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div className="modal-field">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  className="modal-input"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={editLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editLoading}
                >
                  {editLoading ? <div className="spinner"></div> : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Cambiar Contraseña (In-Place) ──────────────────────────────── */}
      {isPasswordModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">
                  <span className="modal-title-icon"><Icon name="lock" size={20} /></span>
                  Cambiar Contraseña
                </h3>
                <p className="modal-sub">Elegí una contraseña segura de mínimo 8 caracteres.</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsPasswordModalOpen(false)}
                aria-label="Cerrar modal"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {pwdError && (
              <div className="toast-message error">
                <Icon name="alertTriangle" size={16} />
                <span>{pwdError}</span>
              </div>
            )}

            <form className="modal-form" onSubmit={handleSavePassword}>
              <div className="modal-field">
                <label>Contraseña Actual</label>
                <div className="modal-input-wrapper">
                  <input
                    type={pwdShow ? 'text' : 'password'}
                    className="modal-input"
                    value={pwdCurrent}
                    onChange={(e) => setPwdCurrent(e.target.value)}
                    placeholder="Tu clave actual"
                    required
                  />
                  <button
                    type="button"
                    className="modal-input-eye"
                    onClick={() => setPwdShow(!pwdShow)}
                    aria-label="Mostrar/ocultar contraseña"
                  >
                    <Icon name={pwdShow ? 'eyeOff' : 'eye'} size={16} />
                  </button>
                </div>
              </div>

              <div className="modal-field">
                <label>Nueva Contraseña (mínimo 8 caracteres)</label>
                <div className="modal-input-wrapper">
                  <input
                    type={pwdShow ? 'text' : 'password'}
                    className="modal-input"
                    value={pwdNew}
                    onChange={(e) => setPwdNew(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="modal-field">
                <label>Confirmar Nueva Contraseña</label>
                <div className="modal-input-wrapper">
                  <input
                    type={pwdShow ? 'text' : 'password'}
                    className="modal-input"
                    value={pwdConfirm}
                    onChange={(e) => setPwdConfirm(e.target.value)}
                    placeholder="Repetí la nueva clave"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsPasswordModalOpen(false)}
                  disabled={pwdLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={pwdLoading}
                >
                  {pwdLoading ? <div className="spinner"></div> : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
