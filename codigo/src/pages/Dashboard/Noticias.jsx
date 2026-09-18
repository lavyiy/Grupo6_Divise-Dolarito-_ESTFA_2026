import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '../../components/ui/Icon';
import { getNews } from '../../services/api';
import './Noticias.css';

const REGIONS = [
  { id: 'todas', label: 'Todas', icon: 'spark' },
  { id: 'argentina', label: 'Argentina', icon: 'dollar' },
  { id: 'mundo', label: 'Mundo', icon: 'newspaper' },
  { id: 'cripto', label: 'Cripto', icon: 'bitcoin' },
];

const PLACEHOLDER_IMAGES = {
  economia: 'https://images.unsplash.com/photo-1580519542036-ed47f3e42214?auto=format&fit=crop&w=600&q=80',
  mercados: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
  cripto: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=600&q=80',
};

function styleFor(category) {
  if (category === 'cripto') return 'cripto';
  if (category === 'mundo' || category === 'general') return 'mercados';
  return 'economia';
}

function relativeTime(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `Hace ${days} d`;
  return new Date(ts).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

export default function Noticias() {
  const [news, setNews] = useState([]);
  const [region, setRegion] = useState('todas');
  const [sort, setSort] = useState('relevancia');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getNews(region);
      setNews(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor de noticias.');
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [region]);

  useEffect(() => { loadNews(); }, [loadNews]);

  const visibleNews = sort === 'recientes'
    ? [...news].sort((a, b) => b.date - a.date)
    : news;

  return (
    <div className="noticias-container page-enter">

      <header className="page-header">
        <div>
          <h1 className="page-title">Noticias del Mercado</h1>
          <p className="page-sub">
            Solo economía, finanzas y cripto. Titulares de distintos medios, intercalados de los más populares a los menos populares.
          </p>
        </div>
      </header>

      {/* Controles: región + orden */}
      <div className="noticias-controls">
        <div className="tabs" role="tablist" aria-label="Regiones">
          {REGIONS.map((r) => (
            <button
              key={r.id}
              role="tab"
              aria-selected={region === r.id}
              className={`tab ${region === r.id ? 'active' : ''}`}
              onClick={() => setRegion(r.id)}
            >
              <Icon name={r.icon} size={14} />
              {r.label}
            </button>
          ))}
        </div>

        <div className="noticias-sort">
          <label>Ordenar por</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="relevancia">Más populares</option>
            <option value="recientes">Más recientes</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="noticias-status">
          <div className="spinner" />
          <span>Cargando noticias de varias fuentes...</span>
        </div>
      )}

      {!loading && error && (
        <div className="noticias-error">
          <Icon name="alertTriangle" size={18} />
          <span>{error}</span>
          <button className="btn btn-outline btn-sm" onClick={loadNews}>
            <Icon name="refresh" size={14} /> Reintentar
          </button>
        </div>
      )}

      {!loading && !error && visibleNews.length === 0 && (
        <p className="noticias-status">No hay noticias disponibles por el momento.</p>
      )}

      <div className="noticias-grid">
        {visibleNews.map((n, i) => {
          const style = styleFor(n.category);
          return (
            <a
              href={n.link}
              target="_blank"
              rel="noreferrer"
              className={`noticia-card fade-in delay-${(i % 3 + 1) * 100}`}
              key={n.id}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="nc-image"
                style={
                  n.image
                    ? { backgroundImage: `url(${n.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { backgroundImage: `url(${PLACEHOLDER_IMAGES[style]})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                }
                aria-hidden="true"
              />
              <div className="nc-content">
                <div className="nc-topline">
                  <span className="nc-tag">{n.source}</span>
                  <span className="nc-fame" title={`Popularidad: ${n.fame}/10`}>
                    {Array.from({ length: 5 }).map((_, d) => (
                      <span key={d} className={`nc-dot ${d < Math.round(n.fame / 2) ? 'on' : ''}`} />
                    ))}
                  </span>
                </div>
                <h3 className="nc-title">{n.title}</h3>
                <p className="nc-excerpt">{n.excerpt}</p>
                <div className="nc-footer">
                  <span className="nc-source">{n.region === 'cripto' ? 'Cripto' : n.category === 'mundo' ? 'Mundo' : 'Economía'}</span>
                  <span className="nc-time">{relativeTime(n.date)}</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

    </div>
  );
}
