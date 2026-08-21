import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import Sparkline from '../../components/ui/Sparkline';
import { stableVariation, hashSeed } from '../../utils';
import './Favoritos.css';

export default function Favoritos() {
  const navigate = useNavigate();

  // Mock list of initial favorites according to wireframe prototype
  const [favoritesList, setFavoritesList] = useState([
    { id: 1, codigo: 'USD', nombre: 'Dólar Estadounidense', flag: '🇺🇸', precio: 1315.50, isFav: true },
    { id: 2, codigo: 'EUR', nombre: 'Euro', flag: '🇪🇺', precio: 1423.80, isFav: true },
    { id: 3, codigo: 'BRL', nombre: 'Real Brasileño', flag: '🇧🇷', precio: 234.10, isFav: true },
    { id: 4, codigo: 'GBP', nombre: 'Libra Esterlina', flag: '🇬🇧', precio: 1677.00, isFav: true },
    { id: 5, codigo: 'JPY', nombre: 'Yen Japonés', flag: '🇯🇵', precio: 33.14, isFav: true },
    { id: 6, codigo: 'ARS', nombre: 'Peso Argentino', flag: '🇦🇷', precio: 1.00, isFav: true },
    { id: 7, codigo: 'CAD', nombre: 'Dólar Canadiense', flag: '🇨🇦', precio: 55.00, isFav: true },
    { id: 8, codigo: 'CHF', nombre: 'Franco Suizo', flag: '🇨🇭', precio: 37.10, isFav: true },
    { id: 9, codigo: 'AUD', nombre: 'Dólar Australiano', flag: '🇦🇺', precio: 1433.00, isFav: true }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('mis-favoritas');
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState('');

  const toggleFavorite = (id) => {
    setFavoritesList(prev => prev.map(item => {
      if (item.id === id) {
        const updated = !item.isFav;
        showToast(updated ? `Agregado a favoritas` : `Quitado de favoritas`);
        return { ...item, isFav: updated };
      }
      return item;
    }));
  };

  const handleQuickConvert = (codigo) => {
    navigate('/dashboard/calculadora', { state: { currency: codigo } });
  };

  const handleReconsultar = (item) => {
    showToast(`Cotización de ${item.codigo} actualizada: $${item.precio.toLocaleString('es-AR', {minimumFractionDigits:2})}`);
  };

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Filtering & Sorting
  const filteredList = favoritesList.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedList = [...filteredList].sort((a, b) => {
    if (sortOrder === 'mis-favoritas') return (b.isFav === a.isFav) ? 0 : b.isFav ? 1 : -1;
    if (sortOrder === 'codigo') return a.codigo.localeCompare(b.codigo);
    if (sortOrder === 'precio-mayor') return b.precio - a.precio;
    if (sortOrder === 'precio-menor') return a.precio - b.precio;
    return 0;
  });

  // Pagination logic (5 per page to showcase pagination)
  const itemsPerPage = 5;
  const totalPages = Math.ceil(sortedList.length / itemsPerPage) || 1;
  const currentItems = sortedList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="favoritos-container page-enter">
      
      {/* Toast Notification */}
      {notification && (
        <div className="toast">{notification}</div>
      )}

      {/* Screen Title */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Favoritos de Divisas</h1>
          <p className="page-sub">{favoritesList.filter(f => f.isFav).length} divisas marcadas como favoritas</p>
        </div>
      </header>

      {/* Top Controls Filter Bar */}
      <div className="favoritos-top-bar">
        <div className="favoritos-search-group">
          <label>Buscar divisa</label>
          <div className="favoritos-search-input">
            <Icon name="search" size={15} />
            <input 
              type="text" 
              placeholder="Buscar por divisa..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <button className="btn btn-outline" onClick={() => showToast("Filtros aplicados")}>
          <Icon name="settings" size={14} /> Aplicar filtros
        </button>
      </div>

      {/* Main Table Container */}
      <div className="favoritos-table-card">
        <div className="favoritos-card-header">
          <div className="favoritos-card-title">
            <span>Favoritas seleccionadas</span>
            <span className="badge-count">{favoritesList.filter(f => f.isFav).length}</span>
          </div>

          <div className="favoritos-card-sort">
            <label>Ordenar por</label>
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="mis-favoritas">Mis favoritas primero</option>
              <option value="codigo">Código (A-Z)</option>
              <option value="precio-mayor">Precio Mayor</option>
              <option value="precio-menor">Precio Menor</option>
            </select>
          </div>
        </div>

        <table className="fav-table">
          <thead>
            <tr>
              <th style={{width: '180px'}}>Star</th>
              <th>Divisa</th>
              <th>Precio</th>
              <th>Variación</th>
              <th style={{textAlign: 'right'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item) => {
                const varValue = stableVariation(hashSeed(item.codigo));
                const isUp = varValue >= 0;
                return (
                <tr key={item.id}>
                  <td>
                    <div className="fav-star-cell">
                      <span 
                        className="star-icon" 
                        onClick={() => toggleFavorite(item.id)}
                        title={item.isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                      >
                        <Icon name="star" size={18} style={{ fill: item.isFav ? 'var(--brand-gold)' : 'none' }} />
                      </span>
                      {item.isFav ? (
                        <div className="fav-toggle-pill">
                          <div className="fav-toggle-dot"></div>
                          <span>Favorita</span>
                        </div>
                      ) : (
                        <div className="fav-toggle-pill" style={{background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', borderColor: 'transparent'}}>
                          <span>Inactiva</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="currency-info">
                      <span className="flag-icon">{item.flag}</span>
                      <div className="currency-text">
                        <span className="currency-code">{item.codigo}</span>
                        <span className="currency-name">{item.nombre}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="currency-price">
                      ${item.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td>
                    <div className="fav-variation">
                      <span className={`fav-var-badge ${isUp ? 'up' : 'down'}`}>
                        <Icon name={isUp ? 'trendUp' : 'trendDown'} size={12} />
                        {isUp ? '+' : ''}{varValue.toFixed(2)}%
                      </span>
                      <Sparkline seed={hashSeed(item.codigo)} width={72} height={26} stroke={isUp ? 'var(--success)' : 'var(--danger)'} />
                    </div>
                  </td>
                  <td style={{textAlign: 'right'}}>
                    <div className="fav-actions">
                      <button 
                        className="btn-quick-convert"
                        onClick={() => handleQuickConvert(item.codigo)}
                      >
                        Quick Convert
                      </button>
                      <button 
                        className="btn-reconsultar"
                        onClick={() => handleReconsultar(item)}
                      >
                        <Icon name="refresh" size={13} /> Re-consultar
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: '40px', color: 'var(--text-muted)'}}>
                  No se encontraron divisas coincidentes.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="table-pagination-bar">
          <button 
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            &lt; Anterior
          </button>

          <span className="pagination-text">
            Navegación de Páginas del Favoritos (Página {currentPage} de {totalPages})
          </span>

          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                className={`page-num ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            <button 
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Siguiente &gt;
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
