// ── src/components/ui/CurrencyBadge.jsx ─────────────────────────────────────
// Badge circular elegante por moneda. Reemplaza los emojis/flags por un
// monograma con acento de color propio de cada divisa o criptomoneda.

import './CurrencyBadge.css';

const GLYPHS = {
  USD: '$', ARS: '$', CLP: '$', UYU: '$U', CAD: 'C$', AUD: 'A$', MXN: '$',
  EUR: '€', GBP: '£', JPY: '¥', CHF: 'Fr',
  BRL: 'R$',
  BTC: '₿', ETH: 'Ξ', USDT: '₮', BNB: '◆', DOGE: 'Ð',
};

const COLORS = {
  USD: '#F0B90B', ARS: '#F0B90B', CLP: '#F0B90B', UYU: '#F0B90B', CAD: '#F0B90B', AUD: '#F0B90B', MXN: '#F0B90B',
  EUR: '#8EA6FF', CHF: '#8EA6FF',
  GBP: '#C7A2FF',
  JPY: '#FF7A90',
  BRL: '#3DDC97',
  BTC: '#F7931A', ETH: '#8A92FF', USDT: '#26A17B', BNB: '#F3BA2F', DOGE: '#C2A633',
};

export default function CurrencyBadge({ code = '', size = 40, className = '', title }) {
  const normalized = String(code || '').toUpperCase();
  const glyph = GLYPHS[normalized] || normalized.slice(0, 2) || '¤';
  const color = COLORS[normalized] || '#7C8DB5';
  const glyphSize = normalized.length > 3 ? Math.round(size * 0.34) : Math.round(size * 0.46);

  return (
    <span
      className={`currency-badge ${className}`.trim()}
      style={{
        '--cb-color': color,
        width: size,
        height: size,
        fontSize: glyphSize,
        borderRadius: Math.max(9, Math.round(size * 0.3)),
      }}
      title={title || normalized}
      aria-hidden="true"
    >
      {glyph}
    </span>
  );
}
