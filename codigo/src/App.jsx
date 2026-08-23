import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';

// ── Componentes de layout ─────────────────────────────────────────────────────
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import DashboardLayout from './components/Layout/DashboardLayout';

// ── Páginas de autenticación ──────────────────────────────────────────────────
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

// ── Páginas del Dashboard ─────────────────────────────────────────────────────
import Inicio from './pages/Dashboard/Inicio';
import Divisas from './pages/Dashboard/Divisas';
import Graficos from './pages/Dashboard/Graficos';
import Calculadora from './pages/Dashboard/Calculadora';
import Noticias from './pages/Dashboard/Noticias';
import Alertas from './pages/Dashboard/Alertas';
import Favoritos from './pages/Dashboard/Favoritos';
import Historial from './pages/Dashboard/Historial';
import Perfil from './pages/Dashboard/Perfil';

// ── App raíz con el router ────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Ruta protegida */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Inicio />} />
        <Route path="divisas" element={<Divisas />} />
        <Route path="graficos" element={<Graficos />} />
        <Route path="calculadora" element={<Calculadora />} />
        <Route path="noticias" element={<Noticias />} />
        <Route path="alertas" element={<Alertas />} />
        <Route path="favoritos" element={<Favoritos />} />
        <Route path="historial" element={<Historial />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      {/* Redirige la raíz al dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
