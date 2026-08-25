import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authResetPassword } from '../../services/api';
import { Icon } from '../../components/ui/Icon';
import './Auth.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('El token de restablecimiento es requerido.');
      return;
    }

    if (password.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await authResetPassword({ token: token.trim(), newPassword: password });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'El enlace de restablecimiento es inválido o ha expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        
        {/* Left Panel */}
        <div className="auth-left">
          <div className="auth-logo-icon">
            <img src="/logo-divise.jpeg" alt="divise logo" />
          </div>
          <h1 className="auth-brand-title">divise</h1>
          <p className="auth-brand-subtitle">Todo el valor del mercado, en tiempo real.</p>
          
          <div className="auth-market-card">
            <div className="mc-title">Nueva Credencial</div>
            <div className="mc-price">Acceso Seguro</div>
            <div className="mc-change"><Icon name="lock" size={14} /> Encriptación AES/Bcrypt</div>
            <div className="mc-chart"></div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="auth-right">
          <h2 className="auth-right-title">Nueva contraseña</h2>
          <p className="auth-right-subtitle">
            Ingresá tu nueva clave para actualizar el acceso a tu cuenta.
          </p>

          {error && <div className="auth-alert error">{error}</div>}

          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ color: '#2ecc8a', marginBottom: '8px' }}>¡Contraseña actualizada!</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
                Tu contraseña ha sido modificada con éxito. Ya podés iniciar sesión con tus nuevas credenciales.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                <span>Ir a Iniciar Sesión</span>
                <Icon name="arrowRight" size={16} />
              </Link>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              {!tokenFromUrl && (
                <div className="form-group">
                  <label>Token de recuperación</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><Icon name="shield" size={16} /></span>
                    <input 
                      type="text" 
                      className="auth-input" 
                      placeholder="Pegá aquí el token recibido" 
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required 
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Nueva Contraseña</label>
                <div className="input-wrapper">
                  <span className="input-icon"><Icon name="lock" size={16} /></span>
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="auth-input" 
                    placeholder="Mínimo 8 caracteres" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <button 
                    type="button" 
                    className="input-icon-right" 
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    <Icon name={showPassword ? "eyeOff" : "eye"} size={16} />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirmar Nueva Contraseña</label>
                <div className="input-wrapper">
                  <span className="input-icon"><Icon name="lock" size={16} /></span>
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="auth-input" 
                    placeholder="Repetí la nueva contraseña" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <div className="spinner"></div> : <><span>Restablecer contraseña</span><Icon name="arrowRight" size={16} /></>}
              </button>

              <div className="auth-footer" style={{ marginTop: '20px' }}>
                <Link to="/login" className="auth-link">Volver al inicio de sesión</Link>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
