import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchRates, recordHistorial } from '../../services/api';
import CountUp from 'react-countup';
import { Icon } from '../../components/ui/Icon';
import CurrencyBadge from '../../components/ui/CurrencyBadge';
import Sparkline from '../../components/ui/Sparkline';
import { useAuth } from '../../context/AuthContext';
import { stableVariation, formatARS, hashSeed } from '../../utils';
import './Inicio.css';

const KPI_CARDS = [
  {
    code: 'USD',
    market: 'Informal',
    title: 'Dólar Blue',
    icon: 'dollar',
    seed: 'blue',
  },
  {
    code: 'USD',
    market: 'Oficial',
    title: 'Dólar Oficial',
    icon: 'wallet',
    seed: 'oficial',
  },
  {
    code: 'EUR',
    market: 'Oficial',
    title: 'Euro Oficial',
    icon: 'spark',
    seed: 'euro',
  },
  {
    code: 'BTC',
    market: null,
    title: 'Bitcoin',
    icon: 'bitcoin',
    suffix: 'USD',
    seed: 'btc',
  },
];

export default function Inicio() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  const openCurrencyChart = (codigo, mercado, nombre, valor) => {
    if (token) {
      recordHistorial({ par_consultado: `${nombre} - ${codigo}`, valor_momento: valor || 0 }, token)
        .catch(() => {});
    }
    navigate('/dashboard/graficos', { state: { codigo, mercado } });
  };

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

  const getRate = (code, tipo_mercado = null) => {
    const found = rates.find(
      (r) => r.codigo === code && (!tipo_mercado || r.tipo_mercado === tipo_mercado)
    );
    return found ? found.venta : 0;
  };

  const dolarBlue = getRate('USD', 'Informal') || 1540.0;
  const dolarOficial = getRate('USD', 'Oficial') || 1515.0;
  const euroOficial = getRate('EUR', 'Oficial') || 1722.0;
  const btc = getRate('BTC') || 81200.0;

  const kpiValues = {
    blue: dolarBlue,
    oficial: dolarOficial,
    euro: euroOficial,
    btc,
  };

  return (
    <div className="inicio-container page-enter">

      {/* Encabezado del dashboard */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Resumen del mercado</h1>
          <p className="page-sub">Las cotizaciones principales en tiempo real.</p>
        </div>
        <div className="live-status">
          <span className="live-dot"></span>
          Cotizaciones en vivo
        </div>
      </header>

      {/* KPIs */}
      <div className="quick-stats">
        {KPI_CARDS.map((kpi, i) => {
          const price = kpiValues[kpi.seed];
          const variation = stableVariation(hashSeed(kpi.seed));
          const isUp = variation >= 0;
          return (
            <div
              className="stat-card stagger"
              key={kpi.seed}
              style={{ '--i': i, cursor: 'pointer' }}
              onClick={() => openCurrencyChart(kpi.code, kpi.market, kpi.title, price)}
              title={`Ver gráfico de ${kpi.title}`}
            >
              <div className="sc-header">
                <span className="sc-title">{kpi.title}</span>
                <div className="sc-icon"><Icon name={kpi.icon} size={19} /></div>
              </div>
              <div className="sc-price">
                <CountUp
                  end={price}
                  decimals={2}
                  duration={1.5}
                  separator="."
                  decimal=","
                />
                {kpi.suffix && <span> {kpi.suffix}</span>}
              </div>
              <div className="sc-bottom">
                <span className={`sc-change ${isUp ? 'up' : 'down'}`}>
                  <Icon name={isUp ? 'trendUp' : 'trendDown'} size={14} />
                  {isUp ? '+' : ''}
                  {variation.toFixed(2)}% hoy
                </span>
                <Sparkline
                  seed={hashSeed(kpi.seed)}
                  stroke={isUp ? 'var(--success)' : 'var(--danger)'}
                  width={72}
                  height={26}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Layout inferior */}
      <div className="inicio-bottom">

        <section className="ib-left stagger" style={{ '--i': 4 }}>
          <div className="panel-header">
            <h2>Cotizaciones destacadas</h2>
            <Link to="/dashboard/divisas" className="panel-link">
              Ver todas <Icon name="arrowRight" size={14} />
            </Link>
          </div>

          <div className="featured-list">
            {rates.slice(0, 4).map((item, i) => {
              const variation = stableVariation(hashSeed(item.codigo, item.tipo_mercado || item.tipo || 'x'));
              const isUp = variation >= 0;
              return (
                <div
                  className="featured-row"
                  key={`${item.codigo}-${item.tipo_mercado}-${i}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => openCurrencyChart(item.codigo, item.tipo_mercado || item.tipo, item.nombre, item.venta)}
                  title={`Ver gráfico de ${item.nombre}`}
                >
                  <div className="fr-main">
                    <CurrencyBadge code={item.codigo} size={34} title={item.codigo} />
                    <div className="fr-info">
                      <span className="fr-name">{item.nombre}</span>
                      <span className="fr-market">{item.tipo_mercado || item.tipo}</span>
                    </div>
                  </div>
                  <div className="fr-right">
                    <div className="fr-meta">
                      <span className="fr-price">{['BTC', 'ETH'].includes(item.codigo) ? 'US$ ' : '$ '}{formatARS(item.venta)}</span>
                      <span className={`fr-change ${isUp ? 'up' : 'down'}`}>
                        {isUp ? '+' : ''}
                        {variation.toFixed(2)}%
                      </span>
                    </div>
                    <Sparkline
                      seed={hashSeed(item.codigo, item.tipo_mercado || item.tipo || 'x', i)}
                      stroke={isUp ? 'var(--success)' : 'var(--danger)'}
                      width={64}
                      height={22}
                    />
                  </div>
                </div>
              );
            })}
            {rates.length === 0 && (
              <div className="featured-empty">
                {loading ? 'Cargando cotizaciones en vivo...' : 'Sin cotizaciones disponibles.'}
              </div>
            )}
          </div>
        </section>

        <aside className="ib-right stagger" style={{ '--i': 5 }}>
          <div className="panel-header">
            <h2>Accesos rápidos</h2>
          </div>

          <Link to="/dashboard/noticias" className="quick-action-card">
            <div className="qac-icon"><Icon name="newspaper" size={20} /></div>
            <div className="qac-info">
              <h4>Noticias del Mercado</h4>
              <p>Mantenete informado al instante.</p>
            </div>
            <Icon name="chevronRight" size={16} className="qac-arrow" />
          </Link>

          <Link to="/dashboard/alertas" className="quick-action-card">
            <div className="qac-icon"><Icon name="bell" size={20} /></div>
            <div className="qac-info">
              <h4>Configurar Alertas</h4>
              <p>Recibí notificaciones de precios.</p>
            </div>
            <Icon name="chevronRight" size={16} className="qac-arrow" />
          </Link>

          <Link to="/dashboard/favoritos" className="quick-action-card">
            <div className="qac-icon"><Icon name="star" size={20} /></div>
            <div className="qac-info">
              <h4>Mis Favoritos</h4>
              <p>Accedé a tus monedas preferidas.</p>
            </div>
            <Icon name="chevronRight" size={16} className="qac-arrow" />
          </Link>
        </aside>

      </div>

    </div>
  );
}
