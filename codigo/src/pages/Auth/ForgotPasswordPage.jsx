import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authForgotPassword } from '../../services/api';
import { Icon } from '../../components/ui/Icon';
import PasswordResetForm from '../../components/PasswordResetForm';
import './Auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const res = await authForgotPassword({ email });
      setInfo(res?.message || 'Si la cuenta existe, te enviamos un código de 6 dígitos a tu email.');
      setSentTo(email.trim().toLowerCase());
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">

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

        <div className="auth-right">
          <h2 className="auth-right-title">{sentTo ? 'Verificá tu email' : 'Recuperar contraseña'}</h2>
          <p className="auth-right-subtitle">
            {sentTo
              ? <>Ingresá el código de 6 dígitos que enviamos a <strong>{sentTo}</strong> y elegí tu nueva contraseña.</>
              : <>Ingresá el email asociado a tu cuenta y te enviamos un <strong>código de 6 dígitos</strong> para restablecer tu clave.</>}
          </p>

          {done ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ color: '#2ecc8a', marginBottom: '8px' }}>¡Contraseña actualizada!</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
                Tu contraseña fue modificada con éxito. Ya podés iniciar sesión con tus nuevas credenciales.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                <span>Ir a Iniciar Sesión</span>
                <Icon name="arrowRight" size={16} />
              </Link>
            </div>
          ) : sentTo ? (
            <PasswordResetForm
              email={sentTo}
              onSuccess={() => setDone(true)}
              onBack={() => { setSentTo(''); setInfo(''); setError(''); }}
              backLabel="← Usar otro email"
            />
          ) : (
            <div className="fade-in">
              {error && <div className="auth-alert error">{error}</div>}
              {info && !error && (
                <div
                  className="auth-alert"
                  style={{ background: 'rgba(46,204,138,.12)', borderColor: 'rgba(46,204,138,.4)', color: '#2ecc8a' }}
                >
                  {info}
                </div>
              )}

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

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                  {loading ? <div className="spinner"></div> : <><span>Enviar código de recuperación</span><Icon name="arrowRight" size={16} /></>}
                </button>
              </form>

              <div className="auth-footer" style={{ marginTop: '24px' }}>
                ¿Ya tenés el código? <Link to="/reset-password" className="auth-link">Ingresar código</Link>
              </div>
              <div className="auth-footer">
                ¿Recordaste tu clave? <Link to="/login" className="auth-link">Iniciar sesión</Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
