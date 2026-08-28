import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authVerifyEmailToken } from '../../services/api';
import { Icon } from '../../components/ui/Icon';
import './Auth.css';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Falta el token de verificación en el enlace.');
      return;
    }

    authVerifyEmailToken(token)
      .then((res) => {
        setStatus('success');
        setMessage(res?.message || 'Cuenta verificada correctamente.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err?.message || 'El enlace de verificación es inválido o ha expirado.');
      });
  }, [token]);

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
            <div className="mc-title">Verificación</div>
            <div className="mc-price">Cuenta segura</div>
            <div className="mc-change"><Icon name="shield" size={14} /> Autenticación confirmada</div>
            <div className="mc-chart"></div>
          </div>
        </div>

        <div className="auth-right">
          {status === 'loading' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="spinner"></div>
              <p style={{ color: '#94a3b8', marginTop: '16px' }}>Verificando tu cuenta...</p>
            </div>
          )}

          {status === 'success' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ color: '#2ecc8a', marginBottom: '8px' }}>¡Cuenta verificada!</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>{message}</p>
              <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                <span>Ir a Iniciar Sesión</span>
                <Icon name="arrowRight" size={16} />
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h3 style={{ color: '#e74c3c', marginBottom: '8px' }}>No se pudo verificar</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>{message}</p>
              <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                <span>Ir a Iniciar Sesión</span>
                <Icon name="arrowRight" size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
