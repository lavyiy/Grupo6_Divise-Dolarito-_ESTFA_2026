import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authLogin, authVerifyEmail, authResendCode } from '../../services/api';
import { Icon } from '../../components/ui/Icon';
import './Auth.css';

export default function LoginPage() {
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Verificación de cuenta pendiente (código de 6 dígitos)
  const [pendingEmail, setPendingEmail] = useState('');
  const [codigo, setCodigo] = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authLogin({ email: form.email, password: form.password });
      const token = data?.token ?? data?.accessToken ?? data?.jwt ?? null;
      if (!token) throw new Error('Error de autenticación.');
      login({ token, user: data?.user ?? data?.data ?? null });
    } catch (err) {
      if (err.needsVerification) {
        // Cuenta creada pero sin verificar: mostramos el ingreso de código
        setPendingEmail(err.email || form.email);
        setInfo(err.message);
      } else {
        setError(err.message || 'Credenciales incorrectas');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (codigo.length !== 6) {
      setError('Ingresá el código de 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      const data = await authVerifyEmail({ email: pendingEmail, codigo });
      const token = data?.token ?? data?.accessToken ?? null;
      if (token) {
        login({ token, user: data?.user ?? null });
      }
    } catch (err) {
      setError(err.message || 'Código incorrecto.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    try {
      const data = await authResendCode({ email: pendingEmail });
      setInfo(data?.message || 'Código reenviado. Revisá tu casilla.');
    } catch (err) {
      setError(err.message || 'No se pudo reenviar el código.');
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
            <div className="mc-title">Dólar Blue</div>
            <div className="mc-price">$ 1.423,00</div>
            <div className="mc-change"><Icon name="trendUp" size={14} /> +1,35% hoy</div>
            <div className="mc-chart"></div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="auth-right">
          <h2 className="auth-right-title">{pendingEmail ? 'Verificá tu email' : 'Bienvenido'}</h2>
          <p className="auth-right-subtitle">
            {pendingEmail
              ? <>Ingresá el código de 6 dígitos que enviamos a <strong>{pendingEmail}</strong></>
              : 'Iniciá sesión para continuar'}
          </p>

          {error && <div className="auth-alert error">{error}</div>}
          {info && !error && <div className="auth-alert error" style={{ background: 'rgba(46,204,138,.12)', borderColor: 'rgba(46,204,138,.4)', color: '#2ecc8a' }}>{info}</div>}

          {pendingEmail ? (
            <>
              <form className="auth-form" onSubmit={handleVerify}>
                <div className="form-group">
                  <label>Código de verificación</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><Icon name="shield" size={16} /></span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      className="auth-input"
                      placeholder="••••••"
                      style={{ letterSpacing: '10px', textAlign: 'center', fontSize: '1.25rem' }}
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <div className="spinner"></div> : <><span>Verificar y entrar</span><Icon name="arrowRight" size={16} /></>}
                </button>
              </form>
              <div className="auth-footer">
                ¿No te llegó?{' '}
                <span className="auth-link" style={{ cursor: 'pointer' }} onClick={handleResend}>
                  Reenviar código
                </span>
              </div>
              <div className="auth-footer">
                <span
                  className="auth-link"
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setPendingEmail(''); setCodigo(''); setError(''); setInfo(''); }}
                >
                  Volver al inicio de sesión
                </span>
              </div>
            </>
          ) : (
          <>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <span className="input-icon"><Icon name="mail" size={16} /></span>
                <input 
                  type="email" 
                  name="email"
                  className="auth-input" 
                  placeholder="usuario@email.com" 
                  value={form.email}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon"><Icon name="lock" size={16} /></span>
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="auth-input" 
                  placeholder="••••••••" 
                  value={form.password}
                  onChange={handleChange}
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

            <div className="auth-options">
              <label className="checkbox-label">
                <input type="checkbox" /> Recordarme
              </label>
              <Link to="/forgot" className="auth-link">¿Olvidaste tu contraseña?</Link>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner"></div> : <><span>Iniciar sesión</span><Icon name="arrowRight" size={16} /></>}
            </button>
          </form>

          <div className="auth-divider">o continuá con</div>

          <button type="button" className="btn btn-secondary auth-google-btn" onClick={() => alert("SSO Google Próximamente")}>
            <span className="google-g">G</span> Google
          </button>

          <div className="auth-footer">
            ¿No tenés cuenta? <Link to="/register" className="auth-link">Registrate</Link>
          </div>
          </>
          )}
        </div>

      </div>
    </div>
  );
}
