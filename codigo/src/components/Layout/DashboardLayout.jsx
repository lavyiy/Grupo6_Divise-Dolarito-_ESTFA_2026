import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
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

// Ítems fijos del menú inferior (app-like). El resto entra en la hoja "Más".
const BOTTOM_MAIN = NAV_ITEMS.filter((n) =>
  ['/dashboard', '/dashboard/divisas', '/dashboard/graficos', '/dashboard/alertas'].includes(n.to)
);

const MORE_ITEMS = NAV_ITEMS.filter(
  (n) => !['/dashboard', '/dashboard/divisas', '/dashboard/graficos', '/dashboard/alertas'].includes(n.to)
);

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive =
    MORE_ITEMS.some((m) => location.pathname === m.to) || location.pathname === '/dashboard/perfil';

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
              divise
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

      {/* Navegación inferior móvil (app-like) */}
      <nav className="bottom-nav" aria-label="Menú principal">
        {BOTTOM_MAIN.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'bottom-nav-link active' : 'bottom-nav-link')}
          >
            <Icon name={item.icon} size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className={`bottom-nav-link more ${moreOpen || moreActive ? 'more-active' : ''}`}
          onClick={() => setMoreOpen(true)}
          aria-label="Más secciones"
        >
          <Icon name="menu" size={20} />
          <span>Más</span>
        </button>
      </nav>

      {/* Hoja "Más" con las secciones restantes */}
      {moreOpen && (
        <div className="bottom-sheet-backdrop" onClick={() => setMoreOpen(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bottom-sheet-handle" />
            <div className="bottom-sheet-title">Secciones</div>
            {MORE_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'bottom-sheet-link active' : 'bottom-sheet-link')}
                onClick={() => setMoreOpen(false)}
              >
                <Icon name={item.icon} size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <NavLink
              to="/dashboard/perfil"
              className={({ isActive }) => (isActive ? 'bottom-sheet-link active' : 'bottom-sheet-link')}
              onClick={() => setMoreOpen(false)}
            >
              <Icon name="user" size={20} />
              <span>Mi Perfil</span>
            </NavLink>
            <button type="button" className="bottom-sheet-close" onClick={() => setMoreOpen(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
