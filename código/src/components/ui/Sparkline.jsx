// ── src/components/ui/Sparkline.jsx ──────────────────────────────────────────
// Mini gráfico de tendencia (SVG) con línea suavizada, área degradada y
// animación de dibujado. Los valores se generan de forma determinística
// a partir de un seed para que no cambien entre renders.

import React, { useId } from 'react';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildPath(points) {
  // Suavizado por curvas de Bézier cúbicas entre puntos
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

export default function Sparkline({
  seed = 0,
  width = 84,
  height = 28,
  stroke = 'var(--success)',
  area = true,
  className = '',
}) {
  const id = useId().replace(/[:]/g, '');
  const rand = mulberry32(seed * 7919 + 13);
  const count = 11;
  const values = Array.from({ length: count }, () => rand());

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 3;

  const points = values.map((v, i) => {
    const x = (i / (count - 1)) * width;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [x, y];
  });

  const path = buildPath(points);
  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      className={`sparkline ${className}`}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {area && <path d={areaPath} fill={`url(#spark-${id})`} opacity="0.14" />}
      <path
        className="sparkline-path"
        d={path}
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
      />
    </svg>
  );
}
