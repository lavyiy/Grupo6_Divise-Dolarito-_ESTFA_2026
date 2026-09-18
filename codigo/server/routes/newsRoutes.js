// ── server/routes/newsRoutes.js ─────────────────────────────────────────────
// Agrega noticias reales de varias fuentes (RSS) por región y las ordena
// desde las fuentes más populares hacia las menos populares.
// Cachea el resultado para no golpear los feeds en cada request.

const express = require('express');
const { XMLParser } = require('fast-xml-parser');

const router = express.Router();

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  cdataPropName: '__cdata',
  trimValues: true,
});

// fame: ranking de popularidad (más alto = más famoso)
// Solo economía/finanzas/cripto. Las fuentes "general"/"mundo" se filtran por
// palabras clave financieras (ver isFinance) para no mezclar otra temática.
const SOURCES = [
  // Argentina
  { name: 'Ámbito Financiero', url: 'https://www.ambito.com/rss/economia.xml', region: 'argentina', fame: 10, category: 'economia' },
  { name: 'Ámbito Financiero', url: 'https://www.ambito.com/rss/finanzas.xml', region: 'argentina', fame: 10, category: 'finanzas' },
  { name: 'La Nación', url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/category/economia/?outputType=xml', region: 'argentina', fame: 9, category: 'economia' },
  { name: 'La Nación', url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/?outputType=xml', region: 'argentina', fame: 9, category: 'general' },
  { name: 'Infobae', url: 'https://www.infobae.com/arc/outboundfeeds/rss/category/economia/', region: 'argentina', fame: 9, category: 'economia' },
  { name: 'Infobae', url: 'https://www.infobae.com/arc/outboundfeeds/rss/', region: 'argentina', fame: 9, category: 'general' },
  { name: 'Clarín', url: 'https://www.clarin.com/rss/economia/', region: 'argentina', fame: 8, category: 'economia' },
  { name: 'Clarín', url: 'https://www.clarin.com/rss/lo-ultimo/', region: 'argentina', fame: 8, category: 'general' },
  { name: 'Perfil', url: 'https://www.perfil.com/feed', region: 'argentina', fame: 7, category: 'general' },
  { name: 'Perfil', url: 'https://www.perfil.com/feed/economia', region: 'argentina', fame: 7, category: 'economia' },
  // Mundo
  { name: 'Ámbito Mundo', url: 'https://www.ambito.com/rss/mundo.xml', region: 'mundo', fame: 10, category: 'mundo' },
  { name: 'BBC Mundo', url: 'https://feeds.bbci.co.uk/mundo/rss.xml', region: 'mundo', fame: 10, category: 'mundo' },
  { name: 'El País', url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia/portada', region: 'mundo', fame: 9, category: 'economia' },
  { name: 'El País', url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada', region: 'mundo', fame: 9, category: 'general' },
  // Cripto
  { name: 'Cointelegraph', url: 'https://cointelegraph.com/rss', region: 'cripto', fame: 7, category: 'cripto' },
  { name: 'CriptoNoticias', url: 'https://www.criptonoticias.com/feed/', region: 'cripto', fame: 6, category: 'cripto' },
  { name: 'CriptoTendencia', url: 'https://www.criptotendencia.com/feed', region: 'cripto', fame: 6, category: 'cripto' },
  { name: 'BeInCrypto', url: 'https://es.beincrypto.com/feed', region: 'cripto', fame: 6, category: 'cripto' },
];

// Categorías que ya son financieras por definición (no se filtran).
const TRUSTED_CATEGORIES = new Set(['economia', 'finanzas', 'cripto']);

// Palabras clave para detectar notas financieras en fuentes generales/mundo.
const FINANCE_KEYWORDS = [
  'dólar', 'dolar', 'divisa', 'cotización', 'cotizacion', 'tipo de cambio',
  'blue', 'mep', 'ccl', 'contado con liqui', 'riesgo país', 'riesgo pais',
  'inflación', 'inflacion', 'economía', 'economia', 'económico', 'economico',
  'económica', 'economica', 'finanzas', 'financiero', 'financiera', 'fmi',
  'banco central', 'bcra', 'bancos', 'reservas', 'tasas', 'tasa de interés',
  'tasa de interes', 'deuda', 'bonos', 'acciones', 'bolsa', 'mercados',
  'merval', 'wall street', 'nasdaq', 'fiscal', 'impuestos', 'presupuesto',
  'salarios', 'paritarias', 'jubilaciones', 'pymes', 'inversión', 'inversion',
  'inversores', 'ahorristas', 'aranceles', 'exportaciones', 'importaciones',
  'petróleo', 'petroleo', 'criptomonedas', 'cripto', 'bitcoin', 'ethereum',
  'blockchain', 'etf', 'stablecoin', 'pib',
];

const FINANCE_RE = new RegExp(FINANCE_KEYWORDS.join('|'), 'i');

function isFinance(item) {
  if (TRUSTED_CATEGORIES.has(item.category)) return true;
  // Para fuentes generales/mundo exigimos una palabra clave en el TÍTULO,
  // así evitamos colar notas que solo la mencionan de pasada en el resumen.
  return FINANCE_RE.test(item.title || '');
}

const REGIONS = ['argentina', 'mundo', 'cripto'];
const CACHE_TTL = 20 * 60 * 1000; // 20 minutos
const cache = new Map();

function asArray(value) {
  if (Array.isArray(value)) return value;
  return value === undefined || value === null ? [] : [value];
}

function textOf(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    for (const v of value) {
      const t = textOf(v);
      if (t) return t;
    }
    return '';
  }
  if (typeof value === 'object') {
    return textOf(value['#text'] ?? value.__cdata ?? '');
  }
  return '';
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveLink(link) {
  if (!link) return '';
  if (typeof link === 'string') return link.trim();
  if (Array.isArray(link)) {
    for (const l of link) {
      const r = resolveLink(l);
      if (r) return r;
    }
    return '';
  }
  if (typeof link === 'object') {
    return resolveLink(link['@_href']) || resolveLink(link['#text']) || '';
  }
  return '';
}

function findImage(node, depth = 0) {
  if (!node || depth > 4) return '';
  if (typeof node === 'string') {
    const m = node.match(/https?:\/\/[^"'\s>]+\.(?:jpg|jpeg|png|webp|gif)/i);
    return m ? m[0] : '';
  }
  if (Array.isArray(node)) {
    for (const n of node) {
      const u = findImage(n, depth + 1);
      if (u) return u;
    }
    return '';
  }
  if (typeof node === 'object') {
    for (const key of ['@_url', '@_href']) {
      const v = node[key];
      if (typeof v === 'string' && /^https?:\/\//i.test(v)) return v;
    }
    for (const key of ['media:content', 'media:thumbnail', 'enclosure', 'content', 'content:encoded', 'description', 'summary']) {
      const u = findImage(node[key], depth + 1);
      if (u) return u;
    }
  }
  return '';
}

function parseDate(value) {
  const raw = textOf(value);
  const time = raw ? new Date(raw).getTime() : NaN;
  return Number.isFinite(time) ? time : Date.now();
}

function normalizeItem(item, source) {
  const title = stripHtml(textOf(item.title));
  const link = resolveLink(item.link || item.guid);
  if (!title || !link) return null;
  const description = textOf(item.description)
    || textOf(item.summary)
    || textOf(item['content:encoded'])
    || textOf(item.content);
  const excerpt = stripHtml(description).slice(0, 180);
  const image = findImage(item) || (description.match(/<img[^>]+src=["']([^"']+)/i) || [])[1] || '';
  const date = parseDate(item.pubDate || item.published || item.updated || item['dc:date']);
  return {
    id: `${source.name}-${link}`,
    title,
    link,
    excerpt: excerpt ? `${excerpt}${excerpt.length >= 180 ? '…' : ''}` : '',
    image: /^https?:\/\//i.test(image) ? image : '',
    source: source.name,
    region: source.region,
    category: source.category,
    fame: source.fame,
    date,
  };
}

async function fetchSource(source) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const parsed = parser.parse(xml);
    const rssItems = parsed?.rss?.channel?.item;
    const atomItems = parsed?.feed?.entry;
    const rdfItems = parsed?.['rdf:RDF']?.item;
    const items = asArray(rssItems).length
      ? asArray(rssItems)
      : asArray(atomItems).length
        ? asArray(atomItems)
        : asArray(rdfItems);
    return items.map((item) => normalizeItem(item, source)).filter(Boolean);
  } finally {
    clearTimeout(timeout);
  }
}

function dayNumber() {
  return Math.floor(Date.now() / 864e5);
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

async function buildFeed(region) {
  const sources = region === 'todas' ? SOURCES : SOURCES.filter(s => s.region === region);
  const results = await Promise.allSettled(sources.map(fetchSource));
  const items = results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));

  // Deduplicar por título
  const seen = new Set();
  const unique = items.filter(item => {
    const key = item.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Solo noticias de economía/finanzas/cripto
  const financeItems = unique.filter(isFinance);

  const day = dayNumber();

  // Agrupar por medio y ordenar dentro de cada medio por fecha (más recientes primero)
  const bySource = new Map();
  for (const item of financeItems) {
    if (!bySource.has(item.source)) bySource.set(item.source, []);
    bySource.get(item.source).push(item);
  }
  for (const group of bySource.values()) {
    group.sort((a, b) => {
      if (b.date !== a.date) return b.date - a.date;
      return (hashString(a.id) + day) % 100 - (hashString(b.id) + day) % 100;
    });
  }

  // Medios ordenados por popularidad (fame desc)
  const groups = [...bySource.values()].sort((a, b) => b[0].fame - a[0].fame);

  // Intercalar medios (round-robin) para que no domine uno solo,
  // con un tope de notas por medio.
  const MAX_PER_SOURCE = 8;
  const counters = new Map();
  const queues = groups.map((g) => g.slice());
  const mixed = [];
  let progress = true;
  while (mixed.length < 36 && progress) {
    progress = false;
    for (const queue of queues) {
      if (mixed.length >= 36) break;
      if (!queue.length) continue;
      const src = queue[0].source;
      if ((counters.get(src) || 0) >= MAX_PER_SOURCE) continue;
      mixed.push(queue.shift());
      counters.set(src, (counters.get(src) || 0) + 1);
      progress = true;
    }
  }

  return mixed;
}

router.get('/', async (req, res) => {
  const requested = String(req.query.region || 'todas').toLowerCase();
  const region = requested === 'todas' || REGIONS.includes(requested) ? requested : 'todas';

  const cached = cache.get(region);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return res.json({ region, count: cached.items.length, items: cached.items });
  }

  try {
    const items = await buildFeed(region);
    cache.set(region, { time: Date.now(), items });
    return res.json({ region, count: items.length, items });
  } catch (err) {
    console.error('[Noticias] Error al construir el feed:', err.message);
    if (cached) return res.json({ region, count: cached.items.length, items: cached.items, stale: true });
    return res.status(502).json({ error: 'No se pudieron cargar las noticias.' });
  }
});

module.exports = router;
