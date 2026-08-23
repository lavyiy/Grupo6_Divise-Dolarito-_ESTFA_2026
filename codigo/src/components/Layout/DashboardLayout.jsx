import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../ui/Icon';
import './DashboardLayout.css';

const NAV_ITEMS = [
  { to: '/dashboard', end: true, label: 'Inicio', icon: 'home' },
  { to: '/dashboard/divisas', label: 'Cotizaciones', icon: 'dollar' },
  { to: '/dashboard/graficos', label: 'Gráficos', icon: 'chart' },
  { to: '/dashboard/calculadora', label: 'Calculadora', icon: 'calculator' },
  { to: '/dashboard/noticias', label: 'Noticias', icon: 'newspaper' },
  { to: '/dashboard/alertas', label: 'Alertas', icon: 'bell' },
  { to: '/dashboard/favoritos', label: 'Favoritos', icon: 'star' },
  { to: '/dashboard/historial', label: 'Historial', icon: 'clock' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Navbar */}
      <nav className="dashboard-nav">
        <div className="nav-left">
          <Link to="/dashboard" className="nav-logo" aria-label="Ir al inicio">
            <span className="nav-logo-icon">
              <Icon name="spark" size={17} />
            </span>
            <span className="nav-logo-text">
              divise<span className="nav-logo-dot">.</span>
            </span>
          </Link>
          <button
            className="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={20} />
          </button>
        </div>

        <div className={`nav-center ${mobileMenuOpen ? 'open' : ''}`}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="nav-right">
          <button className="nav-icon-btn" title="Notificaciones">
            <Icon name="bell" size={17} />
          </button>
          <Link to="/dashboard/perfil" className="profile-link" title="Ver perfil">
            <div className="avatar">
              {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </Link>
          <button className="nav-icon-btn logout-btn" onClick={handleLogout} title="Cerrar sesión">
            <Icon name="logout" size={17} />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}
