import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authRegister } from '../../services/api';
import { Icon } from '../../components/ui/Icon';
import './Auth.css';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    
    if (form.password.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }

    if (!form.terms) {
      setError('Debes aceptar los términos y condiciones.');
      return;
    }

    setLoading(true);
    try {
      const data = await authRegister({ 
        nombre: form.nombre, 
        email: form.email, 
        password: form.password 
      });
      const token = data?.token ?? data?.accessToken ?? data?.jwt ?? null;
      if (token) {
        login({ token, user: data?.user ?? data?.data ?? null });
        navigate('/dashboard');
      } else {
        // Fallback si no devuelve token pero se registró bien
        navigate('/login', { state: { registered: true } });
      }
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta.');
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
          <h2 className="auth-right-title">Crear cuenta</h2>
          <p className="auth-right-subtitle">Completá tus datos para comenzar</p>

          {error && <div className="auth-alert error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre Completo</label>
              <div className="input-wrapper">
                <span className="input-icon"><Icon name="user" size={16} /></span>
                <input 
                  type="text" 
                  name="nombre"
                  className="auth-input" 
                  placeholder="Ej: Juan Pérez" 
                  value={form.nombre}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

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
                  placeholder="Mínimo 8 caracteres" 
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

            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon"><Icon name="lock" size={16} /></span>
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="auth-input" 
                  placeholder="Repetí tu contraseña" 
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required 
                />
                <button 
                  type="button" 
                  className="input-icon-right" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <Icon name={showConfirmPassword ? "eyeOff" : "eye"} size={16} />
                </button>
              </div>
            </div>

            <div className="auth-options">
              <label className="checkbox-label" style={{fontSize: '12px'}}>
                <input 
                  type="checkbox" 
                  name="terms"
                  checked={form.terms}
                  onChange={handleChange}
                /> 
                Acepto los <span className="auth-link" style={{margin: '0 4px'}}>Términos y Condiciones</span> y la <span className="auth-link" style={{margin: '0 4px'}}>Política de Privacidad</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner"></div> : <><span>Crear cuenta</span><Icon name="arrowRight" size={16} /></>}
            </button>
          </form>

          <div className="auth-divider">o continuá con</div>

          <button type="button" className="btn btn-secondary auth-google-btn" onClick={() => alert("SSO Google Próximamente")}>
            <span className="google-g">G</span> Google
          </button>

          <div className="auth-footer">
            ¿Ya tenés cuenta? <Link to="/login" className="auth-link">Iniciar sesión</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
