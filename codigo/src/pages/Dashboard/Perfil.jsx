import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../../components/ui/Icon';
import AvatarModal from '../../components/Profile/AvatarModal';
import ContactModal from '../../components/Contact/ContactModal';
import {
  getMyProfile,
  updateProfile,
  changePassword,
  toggleTwoFactor,
  deleteMyAccount
} from '../../services/api';
import './Perfil.css';

export default function Perfil() {
  const { user, token, updateUser, logout } = useAuth();

  // ── Alerta global en página (Toast/Banner) ───────────────────────────────
  const [globalToast, setGlobalToast] = useState(null); // { type: 'ok'|'error', msg }
  const showToast = (msg, type = 'ok') => {
    setGlobalToast({ msg, type });
    setTimeout(() => setGlobalToast(null), 5000);
  };

  // ── Modales de Foto y Contacto ──────────────────────────────────────────
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

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

  // ── Guardar Foto de Perfil ───────────────────────────────────────────────
  const handleSaveAvatar = async (photoUrl) => {
    try {
      await updateProfile({ foto_perfil: photoUrl }, token);
      updateUser({ foto_perfil: photoUrl });
      setIsAvatarModalOpen(false);
      showToast(photoUrl ? '¡Foto de perfil actualizada con éxito!' : 'Foto de perfil restablecida a la inicial.');
    } catch (err) {
      showToast(err.message || 'Error al actualizar la foto de perfil.', 'error');
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

  // ── Eliminar Cuenta ──────────────────────────────────────────────────
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'ELIMINAR') {
      setDeleteError('Escribí ELIMINAR para confirmar.');
      return;
    }
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteMyAccount(token);
      logout();
    } catch (err) {
      setDeleteError(err.message || 'No se pudo eliminar la cuenta.');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="perfil-container page-enter">
      
      <header className="page-header">
        <div>
          <h1 className="page-title">Mi Perfil</h1>
          <p className="page-sub">Gestioná tu información personal, foto de perfil, seguridad y preferencias.</p>
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
          <div
            className="pc-avatar"
            onClick={() => setIsAvatarModalOpen(true)}
            title="Hacé clic para cambiar tu foto de perfil"
          >
            {user?.foto_perfil ? (
              <img src={user.foto_perfil} alt={user?.nombre || 'Foto'} className="pc-avatar-img" />
            ) : (
              user?.nombre?.charAt(0)?.toUpperCase() || 'U'
            )}
            <div className="pc-avatar-overlay">
              <Icon name="camera" size={20} />
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-xs"
            onClick={() => setIsAvatarModalOpen(true)}
            style={{ marginBottom: '16px' }}
          >
            <Icon name="camera" size={13} /> Cambiar Foto
          </button>

          <h2 className="pc-name">{user?.nombre || 'Usuario Registrado'}</h2>
          <p className="pc-email">{user?.email || 'usuario@email.com'}</p>
          
          <div className="pc-divider"></div>
          
          <div className="pc-info-row">
            <span className="pc-label">Rol en la plataforma</span>
            <span className={`badge ${user?.es_admin || user?.rol === 'admin' ? 'badge-primary' : 'badge-success'}`}>
              {user?.es_admin || user?.rol === 'admin' ? '🛡️ Administrador' : 'Usuario'}
            </span>
          </div>

          <div className="pc-info-row">
            <span className="pc-label">Estado de la cuenta</span>
            <span className="badge badge-success">Activa</span>
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
            style={{ marginTop: '20px' }}
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
                <option value="dark">🌙 Modo Oscuro (Predeterminado)</option>
                <option value="light">☀️ Modo Claro</option>
              </select>
            </div>

            <div className="setting-row">
              <div>
                <h4>Divisa Principal / Favorita</h4>
                <p>Moneda de referencia para las conversiones y KPIs.</p>
              </div>
              <select
                className="setting-select"
                value={currency}
                onChange={handleCurrencyChange}
              >
                <option value="USD - Dólar Blue">USD - Dólar Blue</option>
                <option value="USD - Dólar Oficial">USD - Dólar Oficial</option>
                <option value="EUR - Euro">EUR - Euro</option>
                <option value="BRL - Real">BRL - Real Brasileño</option>
                <option value="BTC - Bitcoin">BTC - Bitcoin</option>
              </select>
            </div>
          </div>

          {/* Seguridad */}
          <div className="settings-section fade-in delay-300">
            <h3><Icon name="shield" size={16} /> Seguridad</h3>
            
            <div className="setting-row">
              <div>
                <h4>Contraseña de Acceso</h4>
                <p>Se recomienda cambiarla periódicamente para proteger tu cuenta.</p>
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
                <h4>Verificación en dos pasos (2FA)</h4>
                <p>Se enviará un código numérico a tu correo cada vez que inicies sesión.</p>
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
                  'Desactivar 2FA'
                ) : (
                  'Activar 2FA'
                )}
              </button>
            </div>
          </div>

          {/* Contacto y Soporte */}
          <div className="settings-section fade-in delay-350">
            <h3><Icon name="mail" size={16} /> Soporte y Contacto con Administradores</h3>
            <div className="setting-row">
              <div>
                <h4>¿Necesitás comunicarte con nosotros?</h4>
                <p>Escribinos por Gmail (deviseproyect@gmail.com), WhatsApp o envianos un mensaje directo.</p>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsContactModalOpen(true)}
              >
                <Icon name="mail" size={14} /> Contactar
              </button>
            </div>
          </div>

          {/* Zona de Peligro */}
          <div className="settings-section danger-zone fade-in delay-400">
            <h3><Icon name="alertTriangle" size={16} /> Zona de Peligro</h3>
            <div className="setting-row">
              <div>
                <h4>Eliminar mi cuenta</h4>
                <p>Esta acción es permanente. Se eliminarán tu perfil, favoritos, alertas e historial de consultas. No se puede deshacer.</p>
              </div>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => { setIsDeleteModalOpen(true); setDeleteConfirmText(''); setDeleteError(''); }}
              >
                <Icon name="alertTriangle" size={14} /> Eliminar cuenta
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ── Modal Foto de Perfil ───────────────────────────────────────────── */}
      {isAvatarModalOpen && (
        <AvatarModal
          currentPhoto={user?.foto_perfil}
          userName={user?.nombre}
          onClose={() => setIsAvatarModalOpen(false)}
          onSave={handleSaveAvatar}
        />
      )}

      {/* ── Modal Contactar Administradores ─────────────────────────────────── */}
      {isContactModalOpen && (
        <ContactModal onClose={() => setIsContactModalOpen(false)} />
      )}

      {/* ── Modal Editar Perfil (In-Place Scoped) ────────────────────────────── */}
      {isEditModalOpen && (
        <div className="perfil-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="perfil-modal-content" onClick={(e) => e.stopPropagation()}>
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

      {/* ── Modal Cambiar Contraseña (In-Place Scoped) ───────────────────────── */}
      {isPasswordModalOpen && (
        <div className="perfil-modal-overlay" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="perfil-modal-content" onClick={(e) => e.stopPropagation()}>
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

      {/* ── Modal Eliminar Cuenta (Confirmación Scoped) ────────────────────── */}
      {isDeleteModalOpen && (
        <div className="perfil-modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="perfil-modal-content modal-danger" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title" style={{ color: 'var(--danger)' }}>
                  <span className="modal-title-icon" style={{ color: 'var(--danger)' }}><Icon name="alertTriangle" size={20} /></span>
                  Eliminar mi cuenta
                </h3>
                <p className="modal-sub">Esta acción es irreversible. Tu perfil, favoritos, alertas e historial se borrarán permanentemente.</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsDeleteModalOpen(false)}
                aria-label="Cerrar modal"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {deleteError && (
              <div className="toast-message error">
                <Icon name="alertTriangle" size={16} />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="modal-form">
              <div className="modal-field">
                <label>Escribí <strong>ELIMINAR</strong> para confirmar</label>
                <input
                  type="text"
                  className="modal-input"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                  placeholder="ELIMINAR"
                  autoFocus
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deleteLoading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteConfirmText !== 'ELIMINAR'}
                >
                  {deleteLoading ? <div className="spinner"></div> : 'Eliminar definitivamente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
