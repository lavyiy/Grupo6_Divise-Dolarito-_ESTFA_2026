import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import Sparkline from '../../components/ui/Sparkline';
import { stableVariation, hashSeed } from '../../utils';
import { useAuth } from '../../context/AuthContext';
import { getFavorites, toggleFavorite, fetchRates } from '../../services/api';
import './Favoritos.css';

// Catálogo de divisas disponibles para mostrar (con flag y nombre)
const DIVISAS_CATALOG = [
  { codigo: 'USD', nombre: 'Dólar Estadounidense', flag: '🇺🇸' },
  { codigo: 'EUR', nombre: 'Euro',                 flag: '🇪🇺' },
  { codigo: 'BRL', nombre: 'Real Brasileño',       flag: '🇧🇷' },
  { codigo: 'BTC', nombre: 'Bitcoin',              flag: '₿'  },
  { codigo: 'ETH', nombre: 'Ethereum',             flag: '⟠'  },
  { codigo: 'USDT', nombre: 'Tether',              flag: '💵' },
  { codigo: 'BNB',  nombre: 'Binance Coin',        flag: '🔶' },
  { codigo: 'DOGE', nombre: 'Dogecoin',            flag: '🐕' },
];

export default function Favoritos() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [favoritesCodes, setFavoritesCodes] = useState(new Set()); // codigos en Supabase
  const [rates, setRates] = useState({});                           // precios en vivo
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('mis-favoritas');
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState('');
  const [togglingCode, setTogglingCode] = useState(null);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Carga favoritos desde Supabase y cotizaciones en vivo
  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [favData, liveRates] = await Promise.allSettled([
        getFavorites(token),
        fetchRates()
      ]);

      if (favData.status === 'fulfilled') {
        setFavoritesCodes(new Set(Array.isArray(favData.value) ? favData.value : []));
      }

      if (liveRates.status === 'fulfilled' && Array.isArray(liveRates.value)) {
        // Agrupar precio de venta por código
        const rateMap = {};
        liveRates.value.forEach(r => {
          if (!rateMap[r.codigo] || r.tipo_mercado === 'Oficial') {
            rateMap[r.codigo] = r.venta || r.compra || 0;
          }
        });
        setRates(rateMap);
      }
    } catch (err) {
      showToast('Error al cargar datos.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  // Toggle favorito → persiste en Supabase
  const handleToggleFavorite = async (codigo) => {
    if (!token || togglingCode) return;
    setTogglingCode(codigo);
    const wasFav = favoritesCodes.has(codigo);
    // Optimistic update
    setFavoritesCodes(prev => {
      const next = new Set(prev);
      wasFav ? next.delete(codigo) : next.add(codigo);
      return next;
    });
    showToast(wasFav ? `${codigo} quitado de favoritos` : `${codigo} agregado a favoritos`);
    try {
      await toggleFavorite(codigo, token);
    } catch {
      // Revertir si falla
      setFavoritesCodes(prev => {
        const next = new Set(prev);
        wasFav ? next.add(codigo) : next.delete(codigo);
        return next;
      });
      showToast('No se pudo actualizar el favorito.');
    } finally {
      setTogglingCode(null);
    }
  };

  const handleQuickConvert = (codigo) => {
    navigate('/dashboard/calculadora', { state: { currency: codigo } });
  };

  // Construir lista con precio en vivo e isFav real
  const allItems = DIVISAS_CATALOG.map((d, i) => ({
    id: i + 1,
    codigo: d.codigo,
    nombre: d.nombre,
    flag: d.flag,
    precio: rates[d.codigo] || 0,
    isFav: favoritesCodes.has(d.codigo),
  }));

  // Solo mostrar favoritos o todos según filtro
  const baseList = sortOrder === 'mis-favoritas'
    ? allItems.filter(i => i.isFav)
    : allItems;

  const filteredList = baseList.filter(item =>
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedList = [...filteredList].sort((a, b) => {
    if (sortOrder === 'codigo') return a.codigo.localeCompare(b.codigo);
    if (sortOrder === 'precio-mayor') return b.precio - a.precio;
    if (sortOrder === 'precio-menor') return a.precio - b.precio;
    return 0;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(sortedList.length / itemsPerPage) || 1;
  const currentItems = sortedList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="favoritos-container page-enter">

      {notification && <div className="toast">{notification}</div>}

      <header className="page-header">
        <div>
          <h1 className="page-title">Favoritos de Divisas</h1>
          <p className="page-sub">
            {loading ? 'Cargando...' : `${favoritesCodes.size} divisas marcadas como favoritas`}
          </p>
        </div>
      </header>

      <div className="favoritos-top-bar">
        <div className="favoritos-search-group">
          <label>Buscar divisa</label>
          <div className="favoritos-search-input">
            <Icon name="search" size={15} />
            <input
              type="text"
              placeholder="Buscar por divisa..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
        <button className="btn btn-outline" onClick={() => showToast('Filtros aplicados')}>
          <Icon name="settings" size={14} /> Aplicar filtros
        </button>
      </div>

      <div className="favoritos-table-card">
        <div className="favoritos-card-header">
          <div className="favoritos-card-title">
            <span>
              {sortOrder === 'mis-favoritas' ? 'Mis favoritas' : 'Todas las divisas'}
            </span>
            <span className="badge-count">{favoritesCodes.size}</span>
          </div>
          <div className="favoritos-card-sort">
            <label>Ordenar por</label>
            <select value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}>
              <option value="mis-favoritas">Mis favoritas primero</option>
              <option value="codigo">Código (A-Z)</option>
              <option value="precio-mayor">Precio Mayor</option>
              <option value="precio-menor">Precio Menor</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <div className="spinner-lg" /> Cargando favoritos...
          </div>
        ) : (
          <table className="fav-table">
            <thead>
              <tr>
                <th style={{ width: '180px' }}>Favorito</th>
                <th>Divisa</th>
                <th>Precio</th>
                <th>Variación</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item) => {
                  const varValue = stableVariation(hashSeed(item.codigo));
                  const isUp = varValue >= 0;
                  const isToggling = togglingCode === item.codigo;
                  return (
                    <tr key={item.codigo}>
                      <td>
                        <div className="fav-star-cell">
                          <span
                            className={`star-icon ${isToggling ? 'toggling' : ''}`}
                            onClick={() => handleToggleFavorite(item.codigo)}
                            title={item.isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                            style={{ cursor: isToggling ? 'wait' : 'pointer', opacity: isToggling ? 0.5 : 1 }}
                          >
                            <Icon name="star" size={18} style={{ fill: item.isFav ? 'var(--brand-gold)' : 'none' }} />
                          </span>
                          {item.isFav ? (
                            <div className="fav-toggle-pill">
                              <div className="fav-toggle-dot"></div>
                              <span>Favorita</span>
                            </div>
                          ) : (
                            <div className="fav-toggle-pill" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', borderColor: 'transparent' }}>
                              <span>Inactiva</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="currency-info">
                          <span className="flag-icon">{item.flag}</span>
                          <div className="currency-text">
                            <span className="currency-code">{item.codigo}</span>
                            <span className="currency-name">{item.nombre}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="currency-price">
                          {item.precio > 0
                            ? `$${item.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                            : '—'}
                        </span>
                      </td>
                      <td>
                        <div className="fav-variation">
                          <span className={`fav-var-badge ${isUp ? 'up' : 'down'}`}>
                            <Icon name={isUp ? 'trendUp' : 'trendDown'} size={12} />
                            {isUp ? '+' : ''}{varValue.toFixed(2)}%
                          </span>
                          <Sparkline seed={hashSeed(item.codigo)} width={72} height={26} stroke={isUp ? 'var(--success)' : 'var(--danger)'} />
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="fav-actions">
                          <button
                            className="btn-quick-convert"
                            onClick={() => handleQuickConvert(item.codigo)}
                          >
                            Quick Convert
                          </button>
                          <button
                            className="btn-reconsultar"
                            onClick={() => showToast(`Precio ${item.codigo}: ${item.precio > 0 ? '$' + item.precio.toLocaleString('es-AR') : 'sin datos'}`)}
                          >
                            <Icon name="refresh" size={13} /> Re-consultar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    {sortOrder === 'mis-favoritas'
                      ? 'No tenés favoritos guardados. Hacé click en ★ para agregar.'
                      : 'No se encontraron divisas.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div className="table-pagination-bar">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            &lt; Anterior
          </button>
          <span className="pagination-text">Página {currentPage} de {totalPages}</span>
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                className={`page-num ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Siguiente &gt;
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
