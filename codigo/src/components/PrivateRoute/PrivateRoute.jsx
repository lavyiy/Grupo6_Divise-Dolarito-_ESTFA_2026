// ── src/components/PrivateRoute/PrivateRoute.jsx ─────────────────────────────
// Componente de ruta protegida.
// Si el usuario no tiene token → redirige a /login.
// Si tiene token → renderiza los children normalmente.

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * @param {{ children: React.ReactNode }} props
 */
export default function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location            = useLocation();

  if (!isAuthenticated) {
    // Guardamos el destino original para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
