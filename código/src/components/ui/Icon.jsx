// ── src/components/ui/Icon.jsx ──────────────────────────────────────────────
// Set de iconos SVG coherentes (trazo, estilo lucide) para toda la aplicación.

const ICON_PATHS = {
  home: <>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 10v11h14V10" />
    <path d="M9 21v-6h6v6" />
  </>,
  dollar: <>
    <path d="M12 2v20" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </>,
  bitcoin: <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 5.26m5.908 1.042.347-1.97M7.48 20.408l.833-4.716M8.587 3.594l.833 4.716M4.198 18.51l4.71-.831M4.703 5.39l4.71.831" />,
  chart: <>
    <path d="M3 3v18h18" />
    <path d="m7 15 4-5 4 3 6-8" />
  </>,
  calculator: <>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M8 7h8" />
    <path d="M8 11h.01M12 11h.01M16 11h.01" />
    <path d="M8 15h.01M12 15h.01M16 15h.01" />
    <path d="M8 19h.01M12 19h.01M16 19h.01" />
  </>,
  newspaper: <>
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8" />
    <path d="M15 18h-5" />
    <path d="M10 6h8v4h-8V6Z" />
  </>,
  bell: <>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </>,
  star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  clock: <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>,
  user: <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
  </>,
  logout: <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </>,
  search: <>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.35-4.35" />
  </>,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  arrowRight: <>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </>,
  plus: <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>,
  close: <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>,
  menu: <>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </>,
  trendUp: <>
    <path d="m3 17 6-6 4 4 8-8" />
    <path d="M14 7h7v7" />
  </>,
  trendDown: <>
    <path d="m3 7 6 6 4-4 8 8" />
    <path d="M21 10v7h-7" />
  </>,
  refresh: <>
    <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" />
    <path d="M21 3v5h-5" />
  </>,
  download: <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 10 5 5 5-5" />
    <path d="M12 15V3" />
  </>,
  maximize: <>
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </>,
  eye: <>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </>,
  eyeOff: <>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 8 10 8a9.74 9.74 0 0 0 5.39-1.61" />
    <path d="m2 2 20 20" />
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
  </>,
  mail: <>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </>,
  lock: <>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </>,
  shield: <path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10z" />,
  settings: <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </>,
  spark: <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />,
  info: <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6" />
    <path d="M12 7.5h.01" />
  </>,
  target: <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 1v4M12 19v4M1 12h4M19 12h4" />
  </>,
  wallet: <>
    <path d="M3 7V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    <path d="M16 12h.01" />
    <path d="M3 9h18" />
  </>,
};

export function Icon({ name, size = 18, className = '', style }) {
  const paths = ICON_PATHS[name];
  if (!paths) return null;
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
}

export default Icon;
