// ── src/pages/Auth/LoginPage.jsx ─────────────────────────────────────────────
// Página de inicio de sesión.
// Conectada al endpoint POST /auth/login del backend.

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authLogin } from '../../services/api';
import './Auth.css';

export default function LoginPage() {
  const { login }   = useAuth();
  const location    = useLocation();

  // Mensaje de éxito si viene desde el registro
  const registerMsg = location.state?.registered
    ? '¡Cuenta creada! Ya podés iniciar sesión.'
    : null;

  const [form, setForm] = useState({ email: '', password: '' });
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authLogin({ email: form.email, password: form.password });

      // El backend puede responder con { token } o { accessToken } o { jwt }
      const token =
        data?.token       ??
        data?.accessToken ??
        data?.jwt         ??
        null;

      if (!token) {
        throw new Error('El servidor no devolvió un token válido.');
      }

      login({ token, user: data?.user ?? data?.data ?? null });
      // login() navega automáticamente a /dashboard
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !form.email || !form.password;

  return (
    <div className="auth-page">
      {/* Fondo animado */}
      <div className="auth-page__bg" />
      <div className="auth-page__orb auth-page__orb--1" />
      <div className="auth-page__orb auth-page__orb--2" />

      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand__logo" aria-hidden="true">💱</div>
          <span className="auth-brand__name">Dolarito</span>
        </div>

        {/* Encabezado */}
        <div className="auth-heading">
          <h1 className="auth-heading__title">Bienvenido</h1>
          <p className="auth-heading__sub">Ingresá a tu cuenta para continuar</p>
        </div>

        {/* Alerta de registro exitoso */}
        {registerMsg && (
          <div className="auth-alert auth-alert--success" role="status">
            <span>✓</span>
            <span>{registerMsg}</span>
          </div>
        )}

        {/* Alerta de error */}
        {error && (
          <div className="auth-alert auth-alert--error" role="alert">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
          id="login-form"
        >
          <div className="auth-field">
            <label htmlFor="login-email" className="auth-field__label">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
              className="auth-field__input"
              required
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password" className="auth-field__label">
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="auth-field__input"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            id="login-submit"
            className="auth-btn"
            disabled={isDisabled}
          >
            {loading && <span className="auth-btn__spinner" aria-hidden="true" />}
            {loading ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          ¿No tenés cuenta?{' '}
          <Link to="/register" id="login-go-register" className="auth-footer__link">
            Registrate gratis (v2)
          </Link>
        </p>
      </div>
    </div>
  );
}
