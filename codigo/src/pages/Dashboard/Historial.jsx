import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { useAuth } from '../../context/AuthContext';
import { getHistorial } from '../../services/api';
import './Historial.css';

const FLAG_MAP = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  BRL: '🇧🇷',
  BTC: '₿',
  ETH: '⟠',
  USDT: '💵',
  BNB: '🔶',
  DOGE: '🐕',
  ARS: '🇦🇷',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
  CAD: '🇨🇦',
  CHF: '🇨🇭',
  AUD: '🇦🇺'
};

// Datos de demostración en caso de no haber sesión iniciada
const MOCK_HISTORY = [
  { id: 'm1', fecha: '31/07/2024', hora: '10:15', rawDate: new Date('2024-07-31T10:15:00'), codigo: 'USD', nombre: 'Dólar Estadounidense', flag: '🇺🇸', precio: 1213.50 },
  { id: 'm2', fecha: '30/07/2024', hora: '19:42', rawDate: new Date('2024-07-30T19:42:00'), codigo: 'EUR', nombre: 'Euro', flag: '🇪🇺', precio: 1423.80 },
  { id: 'm3', fecha: '30/07/2024', hora: '09:25', rawDate: new Date('2024-07-30T09:25:00'), codigo: 'BRL', nombre: 'Real Brasileño', flag: '🇧🇷', precio: 234.10 },
  { id: 'm4', fecha: '29/07/2024', hora: '19:34', rawDate: new Date('2024-07-29T19:34:00'), codigo: 'GBP', nombre: 'Libra Esterlina', flag: '🇬🇧', precio: 1677.90 },
  { id: 'm5', fecha: '28/07/2024', hora: '11:11', rawDate: new Date('2024-07-28T11:11:00'), codigo: 'JPY', nombre: 'Yen Japonés', flag: '🇯🇵', precio: 33.14 },
  { id: 'm6', fecha: '28/07/2024', hora: '21:33', rawDate: new Date('2024-07-28T21:33:00'), codigo: 'ARS', nombre: 'Peso Argentino', flag: '🇦🇷', precio: 1.00 },
  { id: 'm7', fecha: '26/07/2024', hora: '17:35', rawDate: new Date('2024-07-26T17:35:00'), codigo: 'CAD', nombre: 'Dólar Canadiense', flag: '🇨🇦', precio: 55.00 },
  { id: 'm8', fecha: '15/07/2024', hora: '16:42', rawDate: new Date('2024-07-15T16:42:00'), codigo: 'CHF', nombre: 'Franco Suizo', flag: '🇨🇭', precio: 37.10 },
  { id: 'm9', fecha: '13/07/2024', hora: '18:25', rawDate: new Date('2024-07-13T18:25:00'), codigo: 'AUD', nombre: 'Dólar Australiano', flag: '🇦🇺', precio: 1433.00 }
];

export default function Historial() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasRealData, setHasRealData] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('recientes');
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState('');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Cargar historial real desde el backend (o mock si no hay sesión)
  const fetchHistorialData = useCallback(async () => {
    if (!token) {
      setHistoryList(MOCK_HISTORY);
      setHasRealData(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getHistorial(token, 100);
      if (Array.isArray(data) && data.length > 0) {
        const parsed = data.map((item) => {
          const dateObj = new Date(item.fecha);
          const fecha = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : '';
          const hora = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
            : '';

          const rawPar = item.par_consultado || '';
          let nombre = rawPar;
          let codigo = 'USD';
          if (rawPar.includes(' - ')) {
            const parts = rawPar.split(' - ');
            nombre = parts[0].trim();
            codigo = parts[1].trim().toUpperCase();
          } else {
            codigo = rawPar.trim().toUpperCase();
          }

          const flag = FLAG_MAP[codigo] || '🌐';

          return {
            id: item.id_historial,
            fecha,
            hora,
            rawDate: dateObj,
            codigo,
            nombre,
            flag,
            precio: parseFloat(item.valor_momento) || 0
          };
        });
        setHistoryList(parsed);
        setHasRealData(true);
      } else {
        setHistoryList([]);
        setHasRealData(true);
      }
    } catch (err) {
      console.warn('[Historial] Error al cargar historial:', err.message);
      setHistoryList(MOCK_HISTORY);
      setHasRealData(false);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistorialData();
  }, [fetchHistorialData]);

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
    showToast(`Re-consultando cotización de ${item.codigo}... actual: $${item.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`);
  };

  // Filter & Sort
  const filteredHistory = historyList.filter(item => {
    const matchesSearch =
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (item.rawDate && !isNaN(item.rawDate.getTime())) {
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (item.rawDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (item.rawDate > end) return false;
      }
    }
    return true;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const timeA = a.rawDate?.getTime() || 0;
    const timeB = b.rawDate?.getTime() || 0;
    if (sortOrder === 'recientes') return timeB - timeA;
    if (sortOrder === 'antiguas') return timeA - timeB;
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

      {/* Banner si el usuario no tiene sesión iniciada */}
      {!token && (
        <div style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '10px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '13px',
          color: 'var(--text-main)'
        }}>
          <Icon name="info" size={18} style={{ color: '#38bdf8', flexShrink: 0 }} />
          <span>
            Estás visualizando datos de ejemplo. <strong>Iniciá sesión</strong> para registrar y sincronizar tu historial real al consultar divisas.
          </span>
        </div>
      )}

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
          {token && (
            <button
              className="btn btn-outline"
              onClick={() => { fetchHistorialData(); showToast('Historial actualizado'); }}
              title="Actualizar datos desde el servidor"
              disabled={loading}
            >
              <Icon name="refresh" size={14} /> Refrescar
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="historial-table-card">
        <div className="historial-card-header">
          <div className="historial-card-title">
            <span>Consultas realizadas</span>
            <span className="badge-count">{sortedHistory.length}</span>
          </div>

          <div className="historial-card-sort">
            <label>Ordenar por</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="recientes">Más recientes</option>
              <option value="antiguas">Más antiguas</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 12px auto' }}></div>
            <p>Cargando historial de consultas...</p>
          </div>
        ) : (
          <table className="hist-table">
            <thead>
              <tr>
                <th style={{ width: '220px' }}>Fecha y hora</th>
                <th>Divisa</th>
                <th>Precio consultado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
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
                    <td style={{ textAlign: 'right' }}>
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
                  <td colSpan="4" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                    {hasRealData && historyList.length === 0 ? (
                      <div>
                        <p style={{ marginBottom: '12px' }}>Aún no tenés consultas registradas en tu cuenta.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/divisas')}>
                          Explorar Divisas
                        </button>
                      </div>
                    ) : (
                      'No se encontraron consultas registradas para los filtros aplicados.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination Bar */}
        {sortedHistory.length > itemsPerPage && (
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
        )}
      </div>

    </div>
  );
}

