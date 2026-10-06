import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authResetPassword, authForgotPassword } from '../services/api';
import { Icon } from './ui/Icon';

export default function PasswordResetForm({
  initialCode = '',
  email = '',
  onSuccess,
  onBack,
  backTo = '/forgot',
  backLabel = '← Volver a solicitar el código',
}) {
  const [codigo, setCodigo] = useState(initialCode);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const mapError = (msg) => {
    const m = msg || '';
    const lower = m.toLowerCase();
    if (lower.includes('expir')) {
      return 'El código expiró (es válido por 30 minutos). Pedí uno nuevo.';
    }
    if (lower.includes('inválid') || lower.includes('invalid') || lower.includes('no encontrado')) {
      return 'El código es inválido o ya fue utilizado. Pedí uno nuevo.';
    }
    if (lower.includes('mínimo') || lower.includes('minimo') || lower.includes('8 caracteres')) {
      return m;
    }
    return m || 'Ocurrió un error al restablecer la contraseña. Intentá de nuevo.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    const code = codigo.trim().replace(/\D/g, '');
    if (!/^\d{6}$/.test(code)) {
      setError('Ingresá el código de 6 dígitos que te enviamos por email.');
      return;
    }
    if (password.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Verificá que las dos sean iguales.');
      return;
    }

    setLoading(true);
    try {
      await authResetPassword({ token: code, newPassword: password });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(mapError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setError('');
    setInfo('');
    setResending(true);
    try {
      const res = await authForgotPassword({ email });
      setInfo(res?.message || 'Código reenviado. Revisá tu casilla de email.');
    } catch (err) {
      setError(err.message || 'No se pudo reenviar el código.');
    } finally {
      setResending(false);
    }
  };

  const codeInputStyle = {
    letterSpacing: '12px',
    textAlign: 'center',
    fontSize: '1.35rem',
    fontWeight: '700',
    color: '#f0b90b',
  };

  return (
    <div className="fade-in">
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          background: 'rgba(240, 185, 11, 0.12)',
          border: '1px solid rgba(240, 185, 11, 0.3)',
          borderRadius: '20px',
          color: '#f0b90b',
          fontSize: '12px',
          fontWeight: 600,
          marginBottom: '16px',
        }}
      >
        <Icon name="shield" size={14} /> Paso 2 de 2: Verificación de Seguridad
      </div>

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
          <label>Código de verificación (6 dígitos)</label>
          <div className="input-wrapper">
            <span className="input-icon"><Icon name="shield" size={16} /></span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoFocus
              autoComplete="one-time-code"
              className="auth-input"
              placeholder="••••••"
              style={codeInputStyle}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
          </div>
          {email && (
            <small style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Enviado a <strong style={{ color: '#cbd5e1' }}>{email}</strong>. Válido por 30 minutos.
            </small>
          )}
        </div>

        <div className="form-group">
          <label>Nueva contraseña</label>
          <div className="input-wrapper">
            <span className="input-icon"><Icon name="lock" size={16} /></span>
            <input
              type={showPassword ? 'text' : 'password'}
              className="auth-input"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="input-icon-right"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              <Icon name={showPassword ? 'eyeOff' : 'eye'} size={16} />
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Confirmar nueva contraseña</label>
          <div className="input-wrapper">
            <span className="input-icon"><Icon name="lock" size={16} /></span>
            <input
              type={showPassword ? 'text' : 'password'}
              className="auth-input"
              placeholder="Repetí la nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <><span>Restablecer contraseña</span><Icon name="arrowRight" size={16} /></>
          )}
        </button>
      </form>

      <div className="auth-footer" style={{ marginTop: '16px' }}>
        ¿No te llegó el código?{' '}
        {email ? (
          <span className="auth-link" style={{ cursor: resending ? 'default' : 'pointer', fontWeight: 600 }} onClick={handleResend}>
            {resending ? 'Reenviando...' : 'Reenviar código'}
          </span>
        ) : (
          <Link to="/forgot" className="auth-link">Solicitar un código</Link>
        )}
      </div>

      <div className="auth-footer" style={{ marginTop: '12px' }}>
        {onBack ? (
          <span className="auth-link" style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={onBack}>
            {backLabel}
          </span>
        ) : (
          <Link to={backTo} className="auth-link" style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
            {backLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
