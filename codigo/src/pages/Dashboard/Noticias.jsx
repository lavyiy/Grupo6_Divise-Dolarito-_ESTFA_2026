import React, { useState, useEffect } from 'react';
import { Icon } from '../../components/ui/Icon';
import './Noticias.css';

const STYLE_ICONS = { economia: 'wallet', mercados: 'chart', cripto: 'spark' };

export default function Noticias() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchNews() {
      try {
        // Fetch real RSS news via public JSON proxy (Ambito Financiero - Economia)
        const rssUrl = encodeURIComponent('https://www.ambito.com/rss/economia.xml');
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}&api_key=`);
        const data = await res.json();
        
        if (data.status === 'ok') {
          // Format the feed
          const formattedNews = data.items.slice(0, 12).map((item, index) => {
            // Pick a style for variety
            const styles = ['economia', 'mercados', 'cripto'];
            const randomStyle = styles[index % styles.length];
            
            // Map styles to real Unsplash images
            let fallbackImage = '';
            if (randomStyle === 'economia') fallbackImage = 'https://images.unsplash.com/photo-1580519542036-ed47f3e42214?auto=format&fit=crop&w=600&q=80'; // Money/bills
            else if (randomStyle === 'mercados') fallbackImage = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80'; // Stock market/charts
            else if (randomStyle === 'cripto') fallbackImage = 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=600&q=80'; // Bitcoin/Crypto

            // Ensure we have a valid thumbnail, otherwise use the fallback
            const rssThumb = item.thumbnail || (item.enclosure && item.enclosure.link);
            const finalImage = (rssThumb && rssThumb.startsWith('http')) ? rssThumb : fallbackImage;

            return {
              id: item.guid || index,
              title: item.title,
              excerpt: item.description.replace(/<[^>]+>/g, '').substring(0, 120) + '...',
              link: item.link,
              source: data.feed.title || 'Ámbito Financiero',
              time: new Date(item.pubDate).toLocaleDateString('es-AR', { hour: '2-digit', minute: '2-digit' }),
              style: randomStyle,
              thumbnail: finalImage
            };
          });
          setNews(formattedNews);
        } else {
          throw new Error('No se pudo cargar las noticias');
        }
      } catch (err) {
        console.error(err);
        setError('Error al conectar con el servidor de noticias.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchNews();
  }, []);

  return (
    <div className="noticias-container page-enter">
      
      <header className="page-header">
        <div>
          <h1 className="page-title">Noticias del Mercado</h1>
          <p className="page-sub">Noticias reales en vivo obtenidas automáticamente (Vía RSS).</p>
        </div>
      </header>

      {loading && <p className="noticias-status">Conectando con el servidor de noticias...</p>}
      {error && <p className="noticias-error">{error}</p>}

      <div className="noticias-grid">
        {news.map((n, i) => (
          <a 
            href={n.link} 
            target="_blank" 
            rel="noreferrer"
            className={`noticia-card fade-in delay-${(i % 3 + 1) * 100}`} 
            key={n.id}
            style={{textDecoration: 'none'}}
          >
            {n.thumbnail ? (
              <div 
                className="nc-image" 
                style={{backgroundImage: `url(${n.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center'}}
              ></div>
            ) : (
              <div className={`nc-image nc-placeholder ${n.style}`}>
                <Icon name={STYLE_ICONS[n.style] || 'newspaper'} size={34} />
              </div>
            )}
            <div className="nc-content">
              <span className="nc-tag">{n.style.toUpperCase()}</span>
              <h3 className="nc-title">{n.title}</h3>
              <p className="nc-excerpt" dangerouslySetInnerHTML={{__html: n.excerpt}}></p>
              <div className="nc-footer">
                <span className="nc-source">{n.source}</span>
                <span className="nc-time">{n.time}</span>
              </div>
            </div>
          </a>
        ))}
      </div>

    </div>
  );
}
