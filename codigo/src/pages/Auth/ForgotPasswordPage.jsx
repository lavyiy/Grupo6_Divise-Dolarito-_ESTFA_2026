import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authForgotPassword } from '../../services/api';
import { Icon } from '../../components/ui/Icon';
import './Auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const res = await authForgotPassword({ email });
      setInfo(res?.message || 'Si la cuenta existe, te enviamos un enlace de recuperación a tu email.');
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud.');
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
            <div className="mc-title">Recuperación de Acceso</div>
            <div className="mc-price">Seguridad 24/7</div>
            <div className="mc-change"><Icon name="shield" size={14} /> Protección de cuenta</div>
            <div className="mc-chart"></div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="auth-right">
          <h2 className="auth-right-title">Recuperar contraseña</h2>
          <p className="auth-right-subtitle">
            Ingresá el email asociado a tu cuenta para recibir las instrucciones de restablecimiento.
          </p>

          {error && <div className="auth-alert error">{error}</div>}
          {info && <div className="auth-alert error" style={{ background: 'rgba(46,204,138,.12)', borderColor: 'rgba(46,204,138,.4)', color: '#2ecc8a' }}>{info}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email de tu cuenta</label>
              <div className="input-wrapper">
                <span className="input-icon"><Icon name="mail" size={16} /></span>
                <input 
                  type="email" 
                  name="email"
                  className="auth-input" 
                  placeholder="usuario@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner"></div> : <><span>Enviar enlace de recuperación</span><Icon name="arrowRight" size={16} /></>}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '24px' }}>
            ¿Recordaste tu clave? <Link to="/login" className="auth-link">Iniciar sesión</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
