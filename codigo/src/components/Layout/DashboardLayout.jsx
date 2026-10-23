import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../ui/Icon';
import ContactModal from '../Contact/ContactModal';
import SupportWidget from '../Support/SupportWidget';
import './DashboardLayout.css';

const BASE_NAV_ITEMS = [
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
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const isAdmin = Boolean(
    user?.es_admin ||
    user?.rol === 'admin' ||
    ['deviseproyect@gmail.com', 'divise.grupo6@gmail.com', 'demo.divise@example.com'].includes(String(user?.email || '').toLowerCase()) ||
    String(user?.email || '').toLowerCase().includes('tacconi') ||
    String(user?.email || '').toLowerCase().includes('admin')
  );

  const navItems = isAdmin
    ? [...BASE_NAV_ITEMS, { to: '/dashboard/admin', label: 'Admin', icon: 'shield', admin: true }]
    : BASE_NAV_ITEMS;

  const bottomMain = navItems.filter((n) =>
    ['/dashboard', '/dashboard/divisas', '/dashboard/graficos', '/dashboard/alertas'].includes(n.to)
  );

  const moreItems = navItems.filter(
    (n) => !['/dashboard', '/dashboard/divisas', '/dashboard/graficos', '/dashboard/alertas'].includes(n.to)
  );

  const moreActive =
    moreItems.some((m) => location.pathname === m.to) ||
    location.pathname === '/dashboard/perfil' ||
    location.pathname === '/dashboard/admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Navbar Superior */}
      <nav className="dashboard-nav">
        <div className="nav-left">
          <Link to="/dashboard" className="nav-logo" aria-label="Ir al inicio">
            <span className="nav-logo-icon">
              <Icon name="spark" size={17} />
            </span>
            <span className="nav-logo-text">divise</span>
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
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''} ${item.admin ? 'admin-nav-link' : ''}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="nav-right">
          <button
            type="button"
            className="nav-contact-btn"
            onClick={() => setContactOpen(true)}
            title="Contactar Administradores y Soporte"
          >
            <Icon name="mail" size={15} />
            <span className="contact-btn-text">Contacto</span>
          </button>

          <Link to="/dashboard/perfil" className="profile-link" title="Ver perfil">
            <div className="avatar">
              {user?.foto_perfil ? (
                <img
                  src={user.foto_perfil}
                  alt={user.nombre || 'Perfil'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                user?.nombre?.charAt(0)?.toUpperCase() || 'U'
              )}
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

      {/* Modal de Contactar Administradores */}
      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}

      {/* Asistente flotante de soporte (tickets para usuarios y bandeja para admin) */}
      <SupportWidget />

      {/* Navegación inferior móvil (app-like) */}
      <nav className="bottom-nav" aria-label="Menú principal">
        {bottomMain.map((item) => (
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
            {moreItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `bottom-sheet-link ${isActive ? 'active' : ''} ${item.admin ? 'admin-sheet-link' : ''}`
                }
                onClick={() => setMoreOpen(false)}
              >
                <Icon name={item.icon} size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <button
              type="button"
              className="bottom-sheet-link"
              onClick={() => {
                setMoreOpen(false);
                setContactOpen(true);
              }}
            >
              <Icon name="mail" size={20} />
              <span>Contactar Soporte</span>
            </button>
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
