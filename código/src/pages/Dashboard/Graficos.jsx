import React, { useState } from 'react';
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

export default function Graficos() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD/ARS');
  const [selectedPeriod, setSelectedPeriod] = useState('30 días');
  const [compareEnabled, setCompareEnabled] = useState(true);
  const [chartType, setChartType] = useState('linea');
  const [notification, setNotification] = useState('');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const chartData = {
    labels: ['21 Abr', '25 Abr', '29 Abr', '03 May', '07 May', '11 May', '15 May', '19 May'],
    datasets: [
      {
        label: 'USD/ARS',
        data: [1210, 1240, 1220, 1286.30, 1260, 1290, 1280, 1298.75],
        borderColor: 'var(--chart-gold)',
        backgroundColor: chartType === 'area' ? 'rgba(240, 185, 11, 0.18)' : 'var(--chart-gold)',
        borderWidth: 2.5,
        tension: 0.35,
        fill: chartType === 'area',
        pointRadius: 3,
        pointHoverRadius: 7,
        pointBackgroundColor: 'var(--chart-gold)',
      },
      ...(compareEnabled ? [{
        label: 'EUR/ARS',
        data: [1310, 1340, 1320, 1387.20, 1360, 1390, 1380, 1387.20],
        borderColor: 'var(--chart-steel)',
        backgroundColor: chartType === 'area' ? 'rgba(124, 141, 181, 0.16)' : 'var(--chart-steel)',
        borderWidth: 2.5,
        tension: 0.35,
        fill: chartType === 'area',
        pointRadius: 3,
        pointHoverRadius: 7,
        pointBackgroundColor: 'var(--chart-steel)',
      }] : [])
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    animation: {
      duration: 900,
      easing: 'easeOutQuart',
    },
    animations: {
      y: {
        from: (ctx) => ctx.type === 'data' && ctx.chart.scales.y ? ctx.chart.scales.y.getPixelForValue(0) : 0,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: 'var(--text-secondary)',
          font: { size: 12, weight: '600' },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'var(--bg-elevated)',
        titleColor: 'var(--text-secondary)',
        bodyColor: 'var(--text-main)',
        borderColor: 'rgba(240, 185, 11, 0.3)',
        borderWidth: 1,
        padding: 14,
        displayColors: true,
        boxPadding: 6,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.raw.toLocaleString('es-AR', {minimumFractionDigits: 2})}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
        ticks: { color: 'var(--text-muted)', font: { size: 12 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
        ticks: { color: 'var(--text-muted)', font: { size: 12 } }
      }
    }
  };

  const handleDownload = () => {
    showToast("Imagen del gráfico descargada correctamente");
  };

  const handleFullscreen = () => {
    showToast("Vista de pantalla completa activada");
  };

  return (
    <div className="graficos-container page-enter">

      {/* Toast Notification */}
      {notification && (
        <div className="toast">
          {notification}
        </div>
      )}
      
      {/* Top Header Bar */}
      <div className="graficos-top-header">
        <div className="graficos-title-box">
          <h1>Gráficos</h1>
          <p>Analizá la evolución de cualquier moneda en el tiempo.</p>
        </div>

        <div className="graficos-selectors-bar">
          <div className="selector-group">
            <label>Moneda</label>
            <div className="selector-dropdown">
              <span>🇺🇸</span>
              <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)}>
                <option value="USD/ARS">USD/ARS (Dólar Estadounidense / Peso Argentino)</option>
                <option value="EUR/ARS">EUR/ARS (Euro / Peso Argentino)</option>
                <option value="BRL/ARS">BRL/ARS (Real Brasileño / Peso Argentino)</option>
                <option value="GBP/ARS">GBP/ARS (Libra Esterlina / Peso Argentino)</option>
              </select>
            </div>
          </div>

          <div className="selector-group">
            <label>Período</label>
            <div className="selector-dropdown" style={{minWidth: '140px'}}>
              <Icon name="clock" size={15} />
              <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                <option value="7 días">7 días</option>
                <option value="30 días">30 días</option>
                <option value="90 días">90 días</option>
                <option value="1 año">1 año</option>
              </select>
            </div>
          </div>

          <div className="selector-group">
            <label>Comparar con</label>
            <div className="compare-toggle-card">
              <div className="compare-info">
                <span>🇪🇺</span>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <span style={{fontWeight: 700, fontSize: 13, color: 'var(--text-main)'}}>EUR/ARS</span>
                  <span style={{fontSize: 11, color: 'var(--text-muted)'}}>Euro / Peso Argentino</span>
                </div>
              </div>
              <div 
                className={`toggle-switch ${compareEnabled ? 'active' : ''}`}
                onClick={() => setCompareEnabled(!compareEnabled)}
                title="Activar / Desactivar comparación"
              >
                <div className="toggle-knob"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Card matched to Image 0 */}
      <div className="graficos-chart-card">
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
              className={`ct-btn ${chartType === 'velas' ? 'active' : ''}`}
              onClick={() => setChartType('velas')}
            >
              Velas
            </button>
            <button 
              className={`ct-btn ${chartType === 'barras' ? 'active' : ''}`}
              onClick={() => setChartType('barras')}
            >
              Barras
            </button>
          </div>

          <div className="chart-action-btns">
            <button className="icon-btn-square" onClick={handleDownload} title="Descargar gráfico en imagen">
              <Icon name="download" size={16} />
            </button>
            <button className="icon-btn-square" onClick={handleFullscreen} title="Pantalla completa">
              <Icon name="maximize" size={16} />
            </button>
          </div>
        </div>

        <div className="chart-canvas-wrapper">
          {chartType === 'barras' ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Info Card (1): Selected Currency & Key Period Values matched to Image 0 */}
      <div className="metrics-info-card">
        <div className="currency-badge-box">
          <div className="cbb-header">
            <span style={{fontSize: '24px'}}>🇺🇸</span>
            <div>
              <div className="cbb-title">USD/ARS</div>
              <div className="cbb-sub">Dólar Estadounidense / Peso Argentino</div>
            </div>
          </div>
          <div className="cbb-price-row">
            <span className="cbb-big-price">1.298,75 ARS</span>
            <span className="cbb-change-badge">+12,45 (0,97%) ↗</span>
          </div>
        </div>

        <div className="key-metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Apertura</span>
            <span className="metric-value">1.286,30</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Máximo</span>
            <span className="metric-value up">1.302,40</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Mínimo</span>
            <span className="metric-value down">1.284,10</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Cierre anterior</span>
            <span className="metric-value">1.286,30</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Volatilidad (30D)</span>
            <span className="metric-value">2,35%</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Rango (30D)</span>
            <span className="metric-value">1.220,50 - 1.305,80</span>
          </div>
        </div>
      </div>

      {/* Info Card (2): Summary Statistics matched to Image 0 */}
      <div className="stats-summary-card">
        <div className="ssc-item">
          <span className="ssc-label">Variación en el período (30D)</span>
          <span className="ssc-value" style={{color: 'var(--success)'}}>+78,25 ARS (6,43%)</span>
        </div>

        <div className="ssc-item">
          <span className="ssc-label">Rendimiento promedio diario</span>
          <span className="ssc-value" style={{color: 'var(--success)'}}>0,21%</span>
        </div>

        <div className="ssc-item">
          <span className="ssc-label">Días en alza</span>
          <span className="ssc-value" style={{color: 'var(--success)'}}>18 (60%)</span>
        </div>

        <div className="ssc-item">
          <span className="ssc-label">Días en baja</span>
          <span className="ssc-value" style={{color: 'var(--danger)'}}>12 (40%)</span>
        </div>

        <div className="ssc-gauge-box">
          <div className="donut-gauge">
            <div className="donut-inner">60%</div>
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
