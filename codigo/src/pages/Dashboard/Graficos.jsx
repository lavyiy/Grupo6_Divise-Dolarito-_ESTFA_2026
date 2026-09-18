import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Icon } from '../../components/ui/Icon';
import CurrencyBadge from '../../components/ui/CurrencyBadge';
import { useAuth } from '../../context/AuthContext';
import { recordHistorial, getFavorites, toggleFavorite } from '../../services/api';
import {
  CHART_CURRENCIES,
  getCurrencyHistory,
  currencyKey,
  labelFor,
  describeFor,
} from '../../services/history';
import { currencyName, formatARS } from '../../utils';
import './Graficos.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const GOLD = '#F0B90B';
const TOOLTIP_BG = '#14223c';

const PERIODS = [
  { label: '7 días', days: 7 },
  { label: '30 días', days: 30 },
  { label: '90 días', days: 90 },
  { label: '1 año', days: 365 },
  { label: '5 años', days: 1825 },
  { label: 'Todo', days: Infinity },
];

function downsample(arr, max = 420) {
  if (arr.length <= max) return arr;
  const step = Math.ceil(arr.length / max);
  const out = arr.filter((_, i) => i % step === 0);
  if (out[out.length - 1] !== arr[arr.length - 1]) out.push(arr[arr.length - 1]);
  return out;
}

export default function Graficos() {
  const location = useLocation();
  const { token } = useAuth();
  const chartRef = useRef(null);
  const cardRef = useRef(null);
  const pendingRecord = useRef(false);

  const incoming = location.state || {};
  const [selectedKey, setSelectedKey] = useState(() => {
    const fallback = currencyKey(CHART_CURRENCIES[0]);
    if (!incoming.codigo) return fallback;
    const candidate = currencyKey({ codigo: incoming.codigo, mercado: incoming.mercado });
    return CHART_CURRENCIES.some(c => currencyKey(c) === candidate) ? candidate : fallback;
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30 días');
  const [chartType, setChartType] = useState('linea');
  const [rawPoints, setRawPoints] = useState([]);
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [favBusy, setFavBusy] = useState(false);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Cargar favoritos del usuario
  useEffect(() => {
    if (!token) return;
    getFavorites(token)
      .then((list) => { if (Array.isArray(list)) setFavorites(new Set(list)); })
      .catch(() => {});
  }, [token]);

  const selected = useMemo(
    () => CHART_CURRENCIES.find(c => currencyKey(c) === selectedKey) || CHART_CURRENCIES[0],
    [selectedKey]
  );

  const isFavorite = favorites.has(selected.codigo);

  const handleToggleFav = async () => {
    if (!token || favBusy) return;
    setFavBusy(true);
    const wasFav = favorites.has(selected.codigo);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (wasFav) next.delete(selected.codigo); else next.add(selected.codigo);
      return next;
    });
    try {
      await toggleFavorite(selected.codigo, token);
      showToast(wasFav ? `${selected.codigo} quitado de favoritos` : `★ ${selected.codigo} guardado en favoritos`);
    } catch {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (wasFav) next.add(selected.codigo); else next.delete(selected.codigo);
        return next;
      });
      showToast('No se pudo actualizar el favorito.');
    } finally {
      setFavBusy(false);
    }
  };

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { points, source: src } = await getCurrencyHistory(selected);
      setRawPoints(points);
      setSource(src);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el histórico.');
      setRawPoints([]);
      setSource('');
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const points = useMemo(() => {
    if (!rawPoints.length) return [];
    const days = PERIODS.find(p => p.label === selectedPeriod)?.days ?? 30;
    if (days === Infinity) return rawPoints;
    const cutoff = Date.now() - days * 864e5;
    const filtered = rawPoints.filter(p => p.t >= cutoff);
    return filtered.length >= 2 ? filtered : rawPoints.slice(-2);
  }, [rawPoints, selectedPeriod]);

  const metrics = useMemo(() => {
    if (points.length < 1) return null;
    const vals = points.map(p => p.v);
    const first = vals[0];
    const last = vals[vals.length - 1];
    const prev = vals.length > 1 ? vals[vals.length - 2] : first;
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const change = last - first;
    const pct = first ? (change / first) * 100 : 0;
    let ups = 0;
    let downs = 0;
    const returns = [];
    for (let i = 1; i < vals.length; i += 1) {
      const r = vals[i - 1] ? (vals[i] - vals[i - 1]) / vals[i - 1] : 0;
      if (r >= 0) ups += 1; else downs += 1;
      returns.push(r);
    }
    const mean = returns.length ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const variance = returns.length
      ? returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length
      : 0;
    return {
      first,
      last,
      prev,
      max,
      min,
      change,
      pct,
      ups,
      downs,
      avgDaily: mean * 100,
      volatility: Math.sqrt(variance) * 100,
      count: vals.length,
    };
  }, [points]);

  // Registra en el historial cuando el usuario cambia de moneda (no al entrar).
  useEffect(() => {
    if (loading || error || !pendingRecord.current) return;
    pendingRecord.current = false;
    if (!token) return;
    const lastVal = points.length ? points[points.length - 1].v : 0;
    recordHistorial({
      par_consultado: `${currencyName(selected.codigo)} - ${selected.codigo}`,
      valor_momento: lastVal,
    }, token).catch(() => {});
  }, [loading, error, points, selected, token]);

  const handleCurrencyChange = (key) => {
    pendingRecord.current = true;
    setSelectedKey(key);
  };

  const displayPoints = useMemo(() => downsample(points), [points]);

  const spanDays = points.length
    ? (points[points.length - 1].t - points[0].t) / 864e5
    : 0;
  const showYear = spanDays > 300;

  const chartData = useMemo(() => ({
    labels: displayPoints.map(p => {
      const opts = { day: '2-digit', month: 'short' };
      if (showYear) opts.year = '2-digit';
      return new Date(p.t).toLocaleDateString('es-AR', opts);
    }),
    datasets: [{
      label: labelFor(selected),
      data: displayPoints.map(p => p.v),
      borderColor: GOLD,
      backgroundColor: chartType === 'area' ? 'rgba(240, 185, 11, 0.16)' : GOLD,
      borderWidth: 2.4,
      tension: 0.3,
      fill: chartType === 'area',
      pointRadius: displayPoints.length > 120 ? 0 : 2.5,
      pointHoverRadius: 6,
      pointBackgroundColor: GOLD,
      pointBorderColor: GOLD,
    }],
  }), [displayPoints, chartType, selected, showYear]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    animation: { duration: 700, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#aeb9cd',
          font: { size: 12, weight: '600' },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: TOOLTIP_BG,
        titleColor: '#aeb9cd',
        bodyColor: '#f4f6fa',
        borderColor: 'rgba(240, 185, 11, 0.35)',
        borderWidth: 1,
        padding: 14,
        displayColors: true,
        boxPadding: 6,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${formatARS(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
        ticks: { color: '#5f6d88', maxTicksLimit: 8, font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
        ticks: { color: '#5f6d88', font: { size: 11 } },
      },
    },
  }), []);

  const handleDownload = () => {
    try {
      const url = chartRef.current?.toBase64Image?.();
      if (!url) throw new Error('sin gráfico');
      const link = document.createElement('a');
      link.href = url;
      link.download = `divise-${selected.codigo}.png`;
      link.click();
      showToast('Imagen del gráfico descargada');
    } catch {
      showToast('No se pudo descargar el gráfico');
    }
  };

  const handleFullscreen = () => {
    const el = cardRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.();
  };

  const changeUp = metrics ? metrics.pct >= 0 : true;
  const rangeCaption = rawPoints.length
    ? `${rawPoints.length.toLocaleString('es-AR')} registros · ${new Date(rawPoints[0].t).toLocaleDateString('es-AR')} → ${new Date(rawPoints[rawPoints.length - 1].t).toLocaleDateString('es-AR')}`
    : '';
  const upRatio = metrics && (metrics.ups + metrics.downs)
    ? Math.round((metrics.ups / (metrics.ups + metrics.downs)) * 100)
    : 0;

  return (
    <div className="graficos-container page-enter">

      {notification && <div className="toast">{notification}</div>}

      {/* Top Header Bar */}
      <div className="graficos-top-header">
        <div className="graficos-title-box">
          <h1>Gráficos</h1>
          <p>Evolución histórica real de {CHART_CURRENCIES.length} monedas y mercados.</p>
        </div>

        <div className="graficos-selectors-bar">
          <div className="selector-group">
            <label>Moneda</label>
            <div className="selector-dropdown" style={{ minWidth: '270px' }}>
              <CurrencyBadge code={selected.codigo} size={24} />
              <select value={selectedKey} onChange={(e) => handleCurrencyChange(e.target.value)}>
                {CHART_CURRENCIES.map((c) => (
                  <option key={currencyKey(c)} value={currencyKey(c)}>
                    {labelFor(c)} — {describeFor(c)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="selector-group">
            <label>Período</label>
            <div className="selector-dropdown" style={{ minWidth: '140px' }}>
              <Icon name="clock" size={15} />
              <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                {PERIODS.map(p => (
                  <option key={p.label} value={p.label}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="graficos-chart-card" ref={cardRef}>
        <div className="chart-toolbar">
          <div className="chart-type-selector">
            <button
              className={`ct-btn ${chartType === 'linea' ? 'active' : ''}`}
              onClick={() => setChartType('linea')}
            >
              Línea
            </button>
            <button
              className={`ct-btn ${chartType === 'area' ? 'active' : ''}`}
              onClick={() => setChartType('area')}
            >
              Área
            </button>
            <button
              className={`ct-btn ${chartType === 'barras' ? 'active' : ''}`}
              onClick={() => setChartType('barras')}
            >
              Barras
            </button>
          </div>

          <div className="chart-action-btns">
            <button
              type="button"
              className={`btn-fav-chart ${isFavorite ? 'is-fav' : ''}`}
              onClick={handleToggleFav}
              disabled={favBusy}
              title={isFavorite ? `Quitar ${selected.codigo} de favoritos` : `Agregar ${selected.codigo} a favoritos`}
            >
              <Icon name="star" size={15} style={{ fill: isFavorite ? 'currentColor' : 'none' }} />
              {isFavorite ? 'En favoritos' : 'Agregar a favoritos'}
            </button>
            <button className="icon-btn-square" onClick={handleDownload} title="Descargar gráfico en imagen">
              <Icon name="download" size={16} />
            </button>
            <button className="icon-btn-square" onClick={handleFullscreen} title="Pantalla completa">
              <Icon name="maximize" size={16} />
            </button>
          </div>
        </div>

        <div className="chart-canvas-wrapper">
          {loading ? (
            <div className="chart-state">
              <div className="spinner" />
              <p>Cargando histórico de {labelFor(selected)}...</p>
            </div>
          ) : error ? (
            <div className="chart-state chart-state-error">
              <Icon name="alertTriangle" size={26} />
              <p>{error}</p>
              <button className="btn btn-outline btn-sm" onClick={loadHistory}>
                <Icon name="refresh" size={14} /> Reintentar
              </button>
            </div>
          ) : chartType === 'barras' ? (
            <Bar ref={chartRef} data={chartData} options={chartOptions} />
          ) : (
            <Line ref={chartRef} data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      {source && (
        <p className="chart-source-caption">
          <Icon name="info" size={13} /> Fuente: {source}{rangeCaption ? ` · ${rangeCaption}` : ''}
        </p>
      )}

      {/* Info Card: Selected Currency & Key Period Values */}
      <div className="metrics-info-card">
        <div className="currency-badge-box">
          <div className="cbb-header">
            <CurrencyBadge code={selected.codigo} size={46} />
            <div>
              <div className="cbb-title">{labelFor(selected)}</div>
              <div className="cbb-sub">{describeFor(selected)}</div>
            </div>
          </div>
          <div className="cbb-price-row">
            <span className="cbb-big-price">
              {metrics ? `$${formatARS(metrics.last)}` : '—'}
            </span>
            {metrics && (
              <span
                className="cbb-change-badge"
                style={{
                  color: changeUp ? 'var(--success)' : 'var(--danger)',
                  background: changeUp ? 'rgba(0,192,135,0.15)' : 'rgba(246,70,93,0.15)',
                  borderColor: changeUp ? 'rgba(0,192,135,0.3)' : 'rgba(246,70,93,0.3)',
                }}
              >
                {changeUp ? '+' : ''}{formatARS(metrics.change)} ({changeUp ? '+' : ''}{metrics.pct.toFixed(2)}%) {changeUp ? '↗' : '↘'}
              </span>
            )}
          </div>
        </div>

        <div className="key-metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Apertura</span>
            <span className="metric-value">{metrics ? formatARS(metrics.first) : '—'}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Máximo</span>
            <span className="metric-value up">{metrics ? formatARS(metrics.max) : '—'}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Mínimo</span>
            <span className="metric-value down">{metrics ? formatARS(metrics.min) : '—'}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Cierre anterior</span>
            <span className="metric-value">{metrics ? formatARS(metrics.prev) : '—'}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Volatilidad</span>
            <span className="metric-value">{metrics ? `${metrics.volatility.toFixed(2)}%` : '—'}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Rango ({selectedPeriod})</span>
            <span className="metric-value">
              {metrics ? `${formatARS(metrics.min)} - ${formatARS(metrics.max)}` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Statistics Card */}
      <div className="stats-summary-card">
        <div className="ssc-item">
          <span className="ssc-label">Variación en el período ({selectedPeriod})</span>
          <span className="ssc-value" style={{ color: changeUp ? 'var(--success)' : 'var(--danger)' }}>
            {metrics ? `${changeUp ? '+' : ''}${formatARS(metrics.change)} (${metrics.pct.toFixed(2)}%)` : '—'}
          </span>
        </div>

        <div className="ssc-item">
          <span className="ssc-label">Rendimiento promedio diario</span>
          <span className="ssc-value" style={{ color: (metrics?.avgDaily ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {metrics ? `${metrics.avgDaily.toFixed(2)}%` : '—'}
          </span>
        </div>

        <div className="ssc-item">
          <span className="ssc-label">Días en alza</span>
          <span className="ssc-value" style={{ color: 'var(--success)' }}>
            {metrics ? `${metrics.ups} (${upRatio}%)` : '—'}
          </span>
        </div>

        <div className="ssc-item">
          <span className="ssc-label">Días en baja</span>
          <span className="ssc-value" style={{ color: 'var(--danger)' }}>
            {metrics ? `${metrics.downs} (${100 - upRatio}%)` : '—'}
          </span>
        </div>

        <div className="ssc-gauge-box">
          <div
            className="donut-gauge"
            style={{ background: `conic-gradient(var(--success) ${upRatio}%, var(--danger) ${upRatio}% 100%)` }}
          >
            <div className="donut-inner">{upRatio}%</div>
          </div>
          <div className="gauge-legend-list">
            <span className="gll-up">● Al alza</span>
            <span className="gll-down">● A la baja</span>
          </div>
        </div>
      </div>

    </div>
  );
}
