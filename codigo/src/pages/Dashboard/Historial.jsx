import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import './Historial.css';

export default function Historial() {
  const navigate = useNavigate();

  // Mock initial query history dataset strictly following wireframe Image 2
  const [historyList, setHistoryList] = useState([
    { id: 1, fecha: '31/07/2024', hora: '10:15', codigo: 'USD', nombre: 'Dólar Estadounidense', flag: '🇺🇸', precio: 1213.50 },
    { id: 2, fecha: '30/07/2024', hora: '19:42', codigo: 'EUR', nombre: 'Euro', flag: '🇪🇺', precio: 1423.80 },
    { id: 3, fecha: '30/07/2024', hora: '09:25', codigo: 'BRL', nombre: 'Real Brasileño', flag: '🇧🇷', precio: 234.10 },
    { id: 4, fecha: '29/07/2024', hora: '19:34', codigo: 'GBP', nombre: 'Libra Esterlina', flag: '🇬🇧', precio: 1677.90 },
    { id: 5, fecha: '28/07/2024', hora: '11:11', codigo: 'JPY', nombre: 'Yen Japonés', flag: '🇯🇵', precio: 33.14 },
    { id: 6, fecha: '28/07/2024', hora: '21:33', codigo: 'ARS', nombre: 'Peso Argentino', flag: '🇦🇷', precio: 1.00 },
    { id: 7, fecha: '26/07/2024', hora: '17:35', codigo: 'CAD', nombre: 'Dólar Canadiense', flag: '🇨🇦', precio: 55.00 },
    { id: 8, fecha: '15/07/2024', hora: '16:42', codigo: 'CHF', nombre: 'Franco Suizo', flag: '🇨🇭', precio: 37.10 },
    { id: 9, fecha: '13/07/2024', hora: '18:25', codigo: 'AUD', nombre: 'Dólar Australiano', flag: '🇦🇺', precio: 1433.00 }
  ]);

  const [startDate, setStartDate] = useState('2024-07-01');
  const [endDate, setEndDate] = useState('2024-07-31');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('recientes');
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState('');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setCurrentPage(1);
    showToast("Filtros limpiados");
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    showToast("Filtros de historial aplicados");
  };

  const handleReconsultar = (item) => {
    showToast(`Re-consultando cotización de ${item.codigo}... actual: $${item.precio.toLocaleString('es-AR', {minimumFractionDigits:2})}`);
  };

  // Filter & Sort
  const filteredHistory = historyList.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortOrder === 'recientes') return b.id - a.id;
    if (sortOrder === 'antiguas') return a.id - b.id;
    return 0;
  });

  const itemsPerPage = 6;
  const totalPages = Math.ceil(sortedHistory.length / itemsPerPage) || 1;
  const currentItems = sortedHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="historial-container page-enter">

      {/* Toast Notification */}
      {notification && (
        <div className="toast">{notification}</div>
      )}
      
      {/* Title */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Historial de Consultas</h1>
          <p className="page-sub">Registro completo de consultas de divisas y tipos de cambio guardadas.</p>
        </div>
      </header>

      {/* Top Filter Bar */}
      <div className="historial-top-bar">
        <div className="historial-filter-group">
          <label>Rango de fechas</label>
          <div className="date-range-picker">
            <div className="date-input-wrapper">
              <Icon name="clock" size={15} />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <span className="range-separator"><Icon name="arrowRight" size={14} /></span>
            <div className="date-input-wrapper">
              <Icon name="clock" size={15} />
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="historial-filter-group">
          <label>Buscar divisa</label>
          <div className="historial-search-input">
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

        <div className="historial-actions">
          <button className="btn btn-outline" onClick={handleClearFilters}>
            Limpiar filtros
          </button>
          <button className="btn btn-primary" onClick={handleApplyFilters}>
            Aplicar filtros
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="historial-table-card">
        <div className="historial-card-header">
          <div className="historial-card-title">
            <span>Consultas realizadas</span>
            <span className="badge-count">24</span>
          </div>

          <div className="historial-card-sort">
            <label>Ordenar por</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="recientes">Más recientes</option>
              <option value="antiguas">Más antiguas</option>
            </select>
          </div>
        </div>

        <table className="hist-table">
          <thead>
            <tr>
              <th style={{width: '220px'}}>Fecha y hora</th>
              <th>Divisa</th>
              <th>Precio consultado</th>
              <th style={{textAlign: 'right'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="date-time-cell">
                      <Icon name="clock" size={15} />
                      <span>{item.fecha} {item.hora}</span>
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
                  <td style={{textAlign: 'right'}}>
                    <button 
                      className="btn-reconsultar"
                      onClick={() => handleReconsultar(item)}
                    >
                      <Icon name="refresh" size={13} /> Re-consultar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{textAlign: 'center', padding: '40px', color: 'var(--text-muted)'}}>
                  No se encontraron consultas registradas en este período.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="historial-pagination-bar">
          <button 
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            &lt; Anterior
          </button>

          <span className="pagination-text">
            Página {currentPage} de {totalPages}
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
