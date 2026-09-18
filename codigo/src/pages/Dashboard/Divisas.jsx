import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDatabaseRates, getFavorites, toggleFavorite, recordHistorial } from '../../services/api';
import { isCrypto } from '../../services/rateTypes.mjs';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../../components/ui/Icon';
import CurrencyBadge from '../../components/ui/CurrencyBadge';
import { formatARS } from '../../utils';
import './Divisas.css';

const CATEGORIES = [
  { id: 'todos', label: 'Todos', icon: 'wallet' },
  { id: 'divisas', label: 'Divisas', icon: 'dollar' },
  { id: 'cripto', label: 'Cripto', icon: 'spark' },
];

export default function Divisas() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [rates, setRates] = useState([]);
  const [favoritesCodes, setFavoritesCodes] = useState(new Set());
  const [togglingCode, setTogglingCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('todos');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const [data, favs] = await Promise.allSettled([
          fetchDatabaseRates(),
          token ? getFavorites(token) : Promise.resolve([])
        ]);
        if (cancelled) return;
        if (data.status === 'fulfilled' && Array.isArray(data.value)) {
          setRates(data.value);
        } else {
          setRates([]);
          setLoadError('No se pudieron cargar las cotizaciones. Volvé a intentar.');
        }
        if (favs.status === 'fulfilled' && Array.isArray(favs.value)) {
          setFavoritesCodes(new Set(favs.value));
        }
      } catch (err) {
        console.error("Error fetching database rates or favorites", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token, retryCount]);

  const lastUpdated = rates.reduce((latest, rate) => {
    const timestamp = Date.parse(rate.updated_at || rate.fecha);
    return Number.isFinite(timestamp) ? Math.max(latest, timestamp) : latest;
  }, 0);

  const handleToggleFavorite = async (codigo) => {
    if (!token) {
      showToast('Iniciá sesión para gestionar tus favoritos.');
      return;
    }
    if (togglingCode) return;
    setTogglingCode(codigo);

    const isFav = favoritesCodes.has(codigo);
    // Optimistic update
    setFavoritesCodes(prev => {
      const next = new Set(prev);
      isFav ? next.delete(codigo) : next.add(codigo);
      return next;
    });
    showToast(isFav ? `${codigo} quitado de favoritos` : `★ ${codigo} agregado a favoritos`);

    try {
      await toggleFavorite(codigo, token);
    } catch (err) {
      // Revertir ante error
      setFavoritesCodes(prev => {
        const next = new Set(prev);
        isFav ? next.add(codigo) : next.delete(codigo);
        return next;
      });
      showToast('Error al actualizar favorito.');
    } finally {
      setTogglingCode(null);
    }
  };

  /**
   * Tarea 14: Registra en historial cuando el usuario hace clic en una card de divisa.
   * Solo actúa si hay sesión activa. Falla silenciosamente para no interrumpir la UX.
   */
  const handleCardClick = (divisa) => {
    const mercado = divisa.tipo_mercado || divisa.tipo || '';
    // Registra la consulta en el historial (solo con sesión activa)
    if (token) {
      const par = `${divisa.nombre} - ${divisa.codigo}`;
      const valor = divisa.venta ?? divisa.compra ?? 0;
      recordHistorial({ par_consultado: par, valor_momento: valor }, token)
        .catch(err => console.warn('[Historial] No se pudo registrar la consulta:', err.message));
    }
    // Navega al gráfico de esa moneda
    navigate('/dashboard/graficos', { state: { codigo: divisa.codigo, mercado } });
  };

  const filteredRates = rates.filter((r) => {
    const matchesSearch =
      r.nombre.toLowerCase().includes(search.toLowerCase()) ||
      r.codigo.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === 'todos' ||
      (category === 'cripto' ? isCrypto(r) : !isCrypto(r));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="divisas-container page-enter">

      {toast && <div className="toast" style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999 }}>{toast}</div>}

      {/* Encabezado */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Cotizaciones</h1>
          <p className="page-sub">
            Cotizaciones de divisas y criptomonedas.
          </p>
        </div>
        <div className="divisas-updated" title="Última actualización">
          <span className="live-dot"></span>
          {lastUpdated ? `Último dato: ${new Date(lastUpdated).toLocaleString('es-AR')}` : 'Sin actualización'}
        </div>
      </header>

      {/* Controles: categorías + búsqueda */}
      <div className="divisas-controls">
        <div className="tabs" role="tablist" aria-label="Categorías">
          {CATEGORIES.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={category === tab.id}
              className={`tab ${category === tab.id ? 'active' : ''}`}
              onClick={() => setCategory(tab.id)}
            >
              <Icon name={tab.icon} size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="divisas-search">
          <Icon name="search" size={16} />
          <input
            type="text"
            placeholder="Buscar divisa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de cards */}
      {loading ? (
        <div className="divisas-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="divisa-card skeleton" key={`s-${i}`} style={{ minHeight: '172px' }} />
          ))}
        </div>
      ) : loadError ? (
        <div className="divisas-empty" role="alert">
          <p>{loadError}</p>
          <button className="btn btn-outline" onClick={() => setRetryCount(value => value + 1)}>
            Reintentar
          </button>
        </div>
      ) : filteredRates.length === 0 ? (
        <div className="divisas-empty">
          <Icon name="search" size={28} />
          <p>No se encontraron cotizaciones con esos filtros.</p>
        </div>
      ) : (
        <div className="divisas-grid">
          {filteredRates.map((d, i) => {
            const isFav = favoritesCodes.has(d.codigo);
            const isToggling = togglingCode === d.codigo;

            return (
              <div
                className="divisa-card stagger"
                key={`${d.codigo}-${d.tipo_mercado || d.tipo}-${i}`}
                style={{ '--i': i, cursor: 'pointer' }}
                onClick={() => handleCardClick(d)}
              >
                <div className="dc-header">
                  <div className="dc-identity">
                    <CurrencyBadge code={d.codigo} size={42} title={`${d.codigo} · ${d.nombre}`} />
                    <div className="dc-names">
                      <span className="dc-code">{d.codigo}</span>
                      <span className="dc-name">{d.nombre}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`dc-fav-btn ${isFav ? 'active' : ''}`}
                    title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    disabled={isToggling}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(d.codigo);
                    }}
                  >
                    <Icon
                      name="star"
                      size={17}
                      style={{
                        fill: isFav ? 'var(--brand-gold)' : 'none',
                        color: isFav ? 'var(--brand-gold)' : 'inherit'
                      }}
                    />
                  </button>
                </div>

                <div className="dc-meta">
                  {(d.tipo_mercado || d.tipo) && (
                    <span className="dc-tag">{d.tipo_mercado || d.tipo}</span>
                  )}
                </div>

                <div className="dc-price">
                  {isCrypto(d) ? `US$ ${formatARS(d.venta)}` : `$ ${formatARS(d.venta)}`}
                </div>

                <div className="dc-bottom">
                  <span className="dc-change">
                    {d.fecha ? `Fecha: ${new Date(d.fecha).toLocaleDateString('es-AR')}` : 'Variación no disponible'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
