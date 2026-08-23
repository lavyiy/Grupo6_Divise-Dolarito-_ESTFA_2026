import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authLogin } from '../../services/api';
import { Icon } from '../../components/ui/Icon';
import './Auth.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas');
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
            <div className="mc-title">Dólar Blue</div>
            <div className="mc-price">$ 1.423,00</div>
            <div className="mc-change"><Icon name="trendUp" size={14} /> +1,35% hoy</div>
            <div className="mc-chart"></div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="auth-right">
          <h2 className="auth-right-title">Bienvenido</h2>
          <p className="auth-right-subtitle">Iniciá sesión para continuar</p>

          {error && <div className="auth-alert error">{error}</div>}

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
        </div>

      </div>
    </div>
  );
}
