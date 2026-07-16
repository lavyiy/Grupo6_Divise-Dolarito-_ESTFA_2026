// ── src/App.jsx ───────────────────────────────────────────────────────────────
// Raíz de la aplicación con React Router v6.
// Rutas:
//   /          → redirige a /dashboard
//   /login     → LoginPage (pública)
//   /register  → RegisterPage (pública)
//   /dashboard → Dashboard (protegida por PrivateRoute)

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';

// ── Componentes de layout ─────────────────────────────────────────────────────
import PrivateRoute from './components/PrivateRoute/PrivateRoute';

// ── Páginas de autenticación ──────────────────────────────────────────────────
import LoginPage    from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

// ── Dashboard (Placeholder para Sprint 1) ─────────────────────────────────────
function Dashboard() {
  const { logout, user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'white', background: '#0a0f1e' }}>
      <h1>¡Bienvenido al Dashboard!</h1>
      <p style={{ marginTop: '1rem', color: '#8899bb' }}>
        Iniciaste sesión exitosamente como {user?.email || 'usuario'}.
      </p>
      <p style={{ marginTop: '0.5rem', color: '#8899bb' }}>
        El dashboard completo se construirá en el próximo sprint.
      </p>
      <button 
        onClick={logout} 
        style={{ marginTop: '2rem', background: 'rgba(201, 168, 76, 0.1)', border: '1px solid rgba(201, 168, 76, 0.2)', color: '#c9a84c', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
}

// ── App raíz con el router ────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Ruta protegida */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* Redirige la raíz al dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
