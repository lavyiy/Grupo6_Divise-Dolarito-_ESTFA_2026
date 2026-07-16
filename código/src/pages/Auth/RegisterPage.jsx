// ── src/pages/Auth/RegisterPage.jsx ──────────────────────────────────────────
// Página de registro de usuario.
// Conectada al endpoint POST /auth/register del backend.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authRegister } from '../../services/api';
import './Auth.css';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors,  setErrors]  = useState({});
  const [apiError, setApiError] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Limpiar error del campo al escribir
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  // ── Validación local ─────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = 'El nombre es obligatorio.';
    }
    if (!form.email.trim()) {
      errs.email = 'El email es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Ingresá un email válido.';
    }
    if (form.password.length < 6) {
      errs.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (form.confirm !== form.password) {
      errs.confirm = 'Las contraseñas no coinciden.';
    }
    return errs;
  };

  // ── Envío ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await authRegister({
        name:     form.name.trim(),
        email:    form.email.trim(),
        password: form.password,
      });

      // Redirigir a login con mensaje de éxito
      navigate('/login', { state: { registered: true }, replace: true });
    } catch (err) {
      setApiError(err.message || 'Error al registrarse. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading;

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
          <h1 className="auth-heading__title">Crear cuenta</h1>
          <p className="auth-heading__sub">Empezá a seguir el mercado cambiario</p>
        </div>

        {/* Error global de API */}
        {apiError && (
          <div className="auth-alert auth-alert--error" role="alert">
            <span>⚠</span>
            <span>{apiError}</span>
          </div>
        )}

        {/* Formulario */}
        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
          id="register-form"
        >
          {/* Nombre */}
          <div className="auth-field">
            <label htmlFor="register-name" className="auth-field__label">
              Nombre
            </label>
            <input
              id="register-name"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Tu nombre completo"
              value={form.name}
              onChange={handleChange}
              className={`auth-field__input${errors.name ? ' auth-field__input--error' : ''}`}
              disabled={loading}
            />
            {errors.name && (
              <p className="auth-field__error" role="alert">⚠ {errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="register-email" className="auth-field__label">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
              className={`auth-field__input${errors.email ? ' auth-field__input--error' : ''}`}
              disabled={loading}
            />
            {errors.email && (
              <p className="auth-field__error" role="alert">⚠ {errors.email}</p>
            )}
          </div>

          {/* Contraseña */}
          <div className="auth-field">
            <label htmlFor="register-password" className="auth-field__label">
              Contraseña
            </label>
            <input
              id="register-password"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={handleChange}
              className={`auth-field__input${errors.password ? ' auth-field__input--error' : ''}`}
              disabled={loading}
            />
            {errors.password && (
              <p className="auth-field__error" role="alert">⚠ {errors.password}</p>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="auth-field">
            <label htmlFor="register-confirm" className="auth-field__label">
              Confirmar contraseña
            </label>
            <input
              id="register-confirm"
              type="password"
              name="confirm"
              autoComplete="new-password"
              placeholder="Repetí tu contraseña"
              value={form.confirm}
              onChange={handleChange}
              className={`auth-field__input${errors.confirm ? ' auth-field__input--error' : ''}`}
              disabled={loading}
            />
            {errors.confirm && (
              <p className="auth-field__error" role="alert">⚠ {errors.confirm}</p>
            )}
          </div>

          <button
            type="submit"
            id="register-submit"
            className="auth-btn"
            disabled={isDisabled}
          >
            {loading && <span className="auth-btn__spinner" aria-hidden="true" />}
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" id="register-go-login" className="auth-footer__link">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
