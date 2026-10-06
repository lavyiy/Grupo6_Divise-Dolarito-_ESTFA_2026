import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import PasswordResetForm from '../../components/PasswordResetForm';
import './Auth.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = (searchParams.get('token') || '').replace(/\D/g, '').slice(0, 6);
  const emailFromUrl = searchParams.get('email') || '';
  const [done, setDone] = useState(false);

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
            <div className="mc-title">Nueva Credencial</div>
            <div className="mc-price">Acceso Seguro</div>
            <div className="mc-change"><Icon name="lock" size={14} /> Encriptación AES/Bcrypt</div>
            <div className="mc-chart"></div>
          </div>
        </div>

        <div className="auth-right">
          <h2 className="auth-right-title">Nueva contraseña</h2>
          <p className="auth-right-subtitle">
            Ingresá el <strong>código de 6 dígitos</strong> que te enviamos por email y tu nueva clave.
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
          ) : (
            <PasswordResetForm
              initialCode={tokenFromUrl}
              email={emailFromUrl}
              onSuccess={() => setDone(true)}
              backLabel="← Pedir un nuevo código"
              backTo="/forgot"
            />
          )}
        </div>

      </div>
    </div>
  );
}
