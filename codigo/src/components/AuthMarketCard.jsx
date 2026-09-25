import React, { useEffect, useRef, useState } from 'react';
import { fetchRates } from '../services/api';
import { stableVariation, hashSeed } from '../utils';
import { Icon } from './ui/Icon';

const ROTATION = [
  { key: 'blue', codigo: 'USD', mercado: 'Informal', titulo: 'Dólar Blue' },
  { key: 'oficial', codigo: 'USD', mercado: 'Oficial', titulo: 'Dólar Oficial' },
  { key: 'btc', codigo: 'BTC', mercado: 'Cripto', titulo: 'Bitcoin' },
  { key: 'eur', codigo: 'EUR', mercado: 'Oficial', titulo: 'Euro' },
  { key: 'usdt', codigo: 'USDT', mercado: 'Cripto', titulo: 'Tether' },
  { key: 'eth', codigo: 'ETH', mercado: 'Cripto', titulo: 'Ethereum' },
  { key: 'brl', codigo: 'BRL', mercado: 'Oficial', titulo: 'Real Brasileño' },
];

const INTERVAL = 10000;

function arsValue(rate, rates) {
  if (rate.tipo_mercado !== 'Cripto') return rate.venta;
  const blue = rates.find((r) => r.codigo === 'USD' && r.tipo_mercado === 'Informal');
  return rate.venta * (blue?.venta || 1);
}

export default function AuthMarketCard() {
  const [rates, setRates] = useState([]);
  const [index, setIndex] = useState(0);
  const [change, setChange] = useState(0);
  const prevPrices = useRef({});
  const indexRef = useRef(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchRates();
        if (!active) return;
        setRates(data);
        const item = ROTATION[indexRef.current];
        const rate = data.find((r) => r.codigo === item.codigo && r.tipo_mercado === item.mercado);
        if (rate) {
          const cur = arsValue(rate, data);
          const prev = prevPrices.current[item.key];
          if (prev != null && prev > 0) {
            setChange(((cur - prev) / prev) * 100);
          } else {
            setChange(stableVariation(hashSeed(item.titulo)));
          }
          prevPrices.current[item.key] = cur;
        }
      } catch (err) {
        console.warn('[AuthMarketCard] sin cotizaciones:', err.message);
      }
    };
    load();
    const id = setInterval(() => {
      setIndex((i) => {
        indexRef.current = (i + 1) % ROTATION.length;
        return indexRef.current;
      });
      load();
    }, INTERVAL);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const item = ROTATION[index];
  const rate = rates.find((r) => r.codigo === item.codigo && r.tipo_mercado === item.mercado);
  const value = rate ? arsValue(rate, rates) : null;
  const decimals = value >= 100000 ? 0 : 2;
  const up = change >= 0;
  const fmt = (v, d) =>
    Number(v).toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });

  return (
    <div className="auth-market-card">
      <div className="mc-body mc-anim" key={`${index}-${item.key}`}>
        <div className="mc-title">{item.titulo}</div>
        <div className={`mc-price${value != null && value >= 100000 ? ' mc-price-lg' : ''}`}>
          {value != null ? `$ ${fmt(value, decimals)}` : '—'}
        </div>
        <div className="mc-change" style={{ color: up ? '#2ecc8a' : '#ff6b6b' }}>
          <Icon name={up ? 'trendUp' : 'trendDown'} size={14} />
          {change >= 0 ? '+' : ''}
          {fmt(change, 2)}%
          <span style={{ color: '#8fa1c3', fontWeight: 400, fontSize: 12 }}>
            {' '}{item.titulo === 'Dólar Blue' ? 'hoy' : '· en vivo'}
          </span>
        </div>
        <div className="mc-live">
          <span className="dot"></span>
          Actualizado en tiempo real · cada 10s
        </div>
        <div className="mc-chart"></div>
      </div>
      <div className="mc-dots">
        {ROTATION.map((r, i) => (
          <span key={r.key} className={i === index ? 'on' : ''}></span>
        ))}
      </div>
    </div>
  );
}