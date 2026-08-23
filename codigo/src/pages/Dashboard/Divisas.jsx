import React, { useState, useEffect } from 'react';
import { fetchRates } from '../../services/api';
import { Icon } from '../../components/ui/Icon';
import Sparkline from '../../components/ui/Sparkline';
import { stableVariation, formatARS, currencyIcon, hashSeed } from '../../utils';
import './Divisas.css';

const CATEGORIES = [
  { id: 'todos', label: 'Todos', icon: 'wallet' },
  { id: 'divisas', label: 'Divisas', icon: 'dollar' },
  { id: 'cripto', label: 'Cripto', icon: 'spark' },
];

const isCrypto = (r) =>
  r.tipo_mercado === 'Cripto' ||
  r.tipo === 'Cripto' ||
  ['BTC', 'ETH', 'USDT', 'USDC'].includes(r.codigo);

export default function Divisas() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('todos');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchRates();
        if (Array.isArray(data)) setRates(data);
      } catch (err) {
        console.error("Error fetching live rates", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Reloj de "última actualización" en vivo
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

      {/* Encabezado */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Cotizaciones</h1>
          <p className="page-sub">
            Precios de compra y venta actualizados al día.
          </p>
        </div>
        <div className="divisas-updated" title="Última actualización">
          <span className="live-dot"></span>
          Actualizado {now.toLocaleTimeString('es-AR')}
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
      ) : filteredRates.length === 0 ? (
        <div className="divisas-empty">
          <Icon name="search" size={28} />
          <p>No se encontraron cotizaciones con esos filtros.</p>
        </div>
      ) : (
        <div className="divisas-grid">
          {filteredRates.map((d, i) => {
            const variation = stableVariation(
              hashSeed(d.codigo, d.tipo_mercado || d.tipo || 'x')
            );
            const isUp = variation >= 0;
            const seed = hashSeed(d.codigo, d.tipo_mercado || d.tipo || 'x');

            return (
              <div className="divisa-card stagger" key={`${d.codigo}-${d.tipo_mercado}-${i}`} style={{ '--i': i }}>
                <div className="dc-header">
                  <div className="dc-identity">
                    <div className="dc-icon">{currencyIcon(d.codigo)}</div>
                    <div className="dc-names">
                      <span className="dc-code">{d.codigo}</span>
                      <span className="dc-name">{d.nombre}</span>
                    </div>
                  </div>
                  <button className="dc-fav-btn" title="Agregar a favoritos">
                    <Icon name="star" size={17} />
                  </button>
                </div>

                <div className="dc-meta">
                  {(d.tipo_mercado || d.tipo) && (
                    <span className="dc-tag">{d.tipo_mercado || d.tipo}</span>
                  )}
                </div>

                <div className="dc-price">$ {formatARS(d.venta)}</div>

                <div className="dc-bottom">
                  <span className={`dc-change ${isUp ? 'up' : 'down'}`}>
                    <Icon name={isUp ? 'trendUp' : 'trendDown'} size={13} />
                    {isUp ? '+' : ''}
                    {variation.toFixed(2)}% hoy
                  </span>
                  <Sparkline
                    seed={seed}
                    stroke={isUp ? 'var(--success)' : 'var(--danger)'}
                    width={76}
                    height={26}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
