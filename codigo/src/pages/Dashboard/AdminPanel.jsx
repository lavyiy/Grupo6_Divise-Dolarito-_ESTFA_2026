import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminEmails,
  getAdminUsers,
  updateUserRole,
  getAdminStats,
  getAdminMessages,
  markAdminMessageRead,
  deleteAdminMessage,
} from '../../services/api';
import { Icon } from '../../components/ui/Icon';
import './AdminPanel.css';

export default function AdminPanel() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' | 'emails' | 'users'
  
  const [messages, setMessages] = useState([]);
  const [emails, setEmails] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState('');
  const [busyUser, setBusyUser] = useState(null);
  const [busyMessageId, setBusyMessageId] = useState(null);
  const [filterOnlyUnread, setFilterOnlyUnread] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedModalMessage, setSelectedModalMessage] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [messagesRes, emailsRes, usersRes, statsRes] = await Promise.allSettled([
        getAdminMessages(token),
        getAdminEmails(token),
        getAdminUsers(token),
        getAdminStats(token),
      ]);

      if (messagesRes.status === 'fulfilled' && Array.isArray(messagesRes.value)) {
        setMessages(messagesRes.value);
      }
      if (emailsRes.status === 'fulfilled' && Array.isArray(emailsRes.value)) {
        setEmails(emailsRes.value);
      }
      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) {
        setUsers(usersRes.value);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los datos del panel de administración.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Acciones sobre Mensajes de Contacto ─────────────────────────────────────

  const handleToggleRead = async (msg) => {
    const nextState = !msg.leido;
    setBusyMessageId(msg.id);
    // Actualización optimista
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, leido: nextState } : m))
    );
    try {
      await markAdminMessageRead(msg.id, nextState, token);
      showToast(nextState ? 'Mensaje marcado como leído.' : 'Mensaje marcado como no leído.');
    } catch (err) {
      // Revertir en caso de error
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, leido: !nextState } : m))
      );
      showToast(err.message || 'Error al actualizar estado del mensaje.');
    } finally {
      setBusyMessageId(null);
    }
  };

  const handleDeleteMessage = async (msg) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar el mensaje de ${msg.nombre || msg.email}?`
    );
    if (!confirmDelete) return;

    setBusyMessageId(msg.id);
    try {
      await deleteAdminMessage(msg.id, token);
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      showToast('Mensaje eliminado con éxito.');
    } catch (err) {
      showToast(err.message || 'Error al eliminar el mensaje.');
    } finally {
      setBusyMessageId(null);
    }
  };

  const handleCopyEmail = (email, id) => {
    if (!email) return;
    navigator.clipboard?.writeText(email).then(() => {
      setCopiedId(id);
      showToast(`Correo copiado: ${email}`);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const handleReplyMail = (msg) => {
    const cleanSubject = encodeURIComponent(`Re: ${msg.asunto || 'Consulta Soporte Divise'}`);
    const cleanBody = encodeURIComponent(
      `Hola ${msg.nombre || 'Usuario'},\n\nGracias por comunicarte con el equipo de soporte de Divise...\n\n────────────────────────────────────────\nMensaje recibido (${formatDate(msg.fecha)}):\n"${msg.mensaje}"\n────────────────────────────────────────\n\nSaludos cordiales,\nEquipo de Administración de Divise`
    );
    window.location.href = `mailto:${msg.email}?subject=${cleanSubject}&body=${cleanBody}`;
  };

  // ── Gestión de Roles de Usuarios ──────────────────────────────────────────

  const handleToggleRole = async (targetUser) => {
    const newRole = (targetUser.rol === 'admin' || targetUser.es_admin) ? 'usuario' : 'admin';
    const confirmChange = window.confirm(
      `¿Estás seguro de cambiar el rol de ${targetUser.nombre || targetUser.email} a "${newRole}"?`
    );
    if (!confirmChange) return;

    setBusyUser(targetUser.id_usuario);
    try {
      await updateUserRole(targetUser.id_usuario, newRole, token);
      showToast(`Rol de ${targetUser.email} actualizado a ${newRole}.`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id_usuario === targetUser.id_usuario
            ? { ...u, rol: newRole, es_admin: newRole === 'admin' }
            : u
        )
      );
    } catch (err) {
      showToast(err.message || 'Error al cambiar rol del usuario.');
    } finally {
      setBusyUser(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // ── Filtros ────────────────────────────────────────────────────────────────

  const unreadMessagesCount = messages.filter((m) => !m.leido).length;

  const filteredMessages = messages.filter((m) => {
    if (filterOnlyUnread && m.leido) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.nombre?.toLowerCase().includes(term) ||
      m.email?.toLowerCase().includes(term) ||
      m.asunto?.toLowerCase().includes(term) ||
      m.mensaje?.toLowerCase().includes(term)
    );
  });

  const filteredEmails = emails.filter((e) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      e.destinatario?.toLowerCase().includes(term) ||
      e.remitente?.toLowerCase().includes(term) ||
      e.asunto?.toLowerCase().includes(term) ||
      e.tipo?.toLowerCase().includes(term) ||
      e.codigo?.toLowerCase().includes(term) ||
      e.mensaje?.toLowerCase().includes(term)
    );
  });

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.nombre?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.rol?.toLowerCase().includes(term)
    );
  });

  const getInitials = (nombre, email) => {
    if (nombre && nombre.trim()) {
      const parts = nombre.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (email || 'US').slice(0, 2).toUpperCase();
  };

  return (
    <div className="admin-container page-enter">
      {toast && <div className="admin-toast">{toast}</div>}

      <header className="page-header admin-header">
        <div>
          <div className="admin-badge">
            <Icon name="shield" size={15} /> Panel de Control de Administradores
          </div>
          <h1 className="page-title">Gestión y Mensajes del Sistema</h1>
          <p className="page-sub">
            Recepción de mensajes de soporte de usuarios, auditoría de correos (Gmail/SMTP) y gestión de roles.
          </p>
        </div>
        <div className="admin-header-actions">
          <button className="btn btn-outline" onClick={loadData} disabled={loading} title="Actualizar datos">
            <Icon name="spark" size={16} /> Refrescar
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="admin-stats-grid">
        <div className={`admin-kpi-card ${activeTab === 'messages' ? 'highlighted' : ''}`} onClick={() => setActiveTab('messages')}>
          <div className="ak-icon messages"><Icon name="mail" size={22} /></div>
          <div className="ak-info">
            <span className="ak-label">Mensajes Recibidos</span>
            <div className="ak-value-row">
              <span className="ak-value">{messages.length}</span>
              {unreadMessagesCount > 0 && (
                <span className="ak-sub-badge" title="Mensajes sin leer">
                  {unreadMessagesCount} nuevos
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={`admin-kpi-card ${activeTab === 'emails' ? 'highlighted' : ''}`} onClick={() => setActiveTab('emails')}>
          <div className="ak-icon emails"><Icon name="spark" size={22} /></div>
          <div className="ak-info">
            <span className="ak-label">Gmails Despachados</span>
            <span className="ak-value">{emails.length || stats?.totalEmailsSent || 0}</span>
          </div>
        </div>

        <div className={`admin-kpi-card ${activeTab === 'users' ? 'highlighted' : ''}`} onClick={() => setActiveTab('users')}>
          <div className="ak-icon users"><Icon name="user" size={22} /></div>
          <div className="ak-info">
            <span className="ak-label">Usuarios Registrados</span>
            <span className="ak-value">{users.length || stats?.totalUsers || 0}</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="ak-icon verified"><Icon name="check" size={22} /></div>
          <div className="ak-info">
            <span className="ak-label">Cuentas Verificadas</span>
            <span className="ak-value">
              {users.filter((u) => u.email_verificado).length || stats?.verifiedUsers || 0}
            </span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="ak-icon admins"><Icon name="shield" size={22} /></div>
          <div className="ak-info">
            <span className="ak-label">Administradores</span>
            <span className="ak-value">
              {users.filter((u) => u.es_admin || u.rol === 'admin').length || 1}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="admin-tabs-bar">
        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <Icon name="mail" size={16} />
            <span>Mensajes de Usuarios ({messages.length})</span>
            {unreadMessagesCount > 0 && (
              <span className="tab-unread-pill">{unreadMessagesCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`admin-tab ${activeTab === 'emails' ? 'active' : ''}`}
            onClick={() => setActiveTab('emails')}
          >
            <Icon name="spark" size={16} />
            <span>Gmails Enviados ({emails.length})</span>
          </button>

          <button
            type="button"
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Icon name="user" size={16} />
            <span>Usuarios y Roles ({users.length})</span>
          </button>
        </div>

        <div className="admin-search-wrapper">
          <Icon name="search" size={16} className="as-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder={
              activeTab === 'messages'
                ? 'Buscar por remitente, asunto o texto...'
                : activeTab === 'emails'
                ? 'Buscar por correo, asunto o código...'
                : 'Buscar por nombre o email...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="as-clear" onClick={() => setSearchTerm('')}>×</button>
          )}
        </div>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      {/* ── TAB 1: MENSAJES DE USUARIOS ───────────────────────────────────── */}
      {activeTab === 'messages' && (
        <div className="admin-panel-card">
          <div className="apc-header apc-header-split">
            <div>
              <h3>Bandeja de Mensajes de Soporte y Consultas</h3>
              <span className="apc-sub">
                Mensajes enviados por usuarios desde el formulario oficial de Contacto hacia los administradores.
              </span>
            </div>
            <div className="apc-filters">
              <button
                type="button"
                className={`btn btn-xs ${!filterOnlyUnread ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterOnlyUnread(false)}
              >
                Todos ({messages.length})
              </button>
              <button
                type="button"
                className={`btn btn-xs ${filterOnlyUnread ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterOnlyUnread(true)}
              >
                Sólo no leídos ({unreadMessagesCount})
              </button>
            </div>
          </div>

          {filteredMessages.length === 0 ? (
            <div className="admin-empty-state">
              <div className="aes-icon"><Icon name="mail" size={40} /></div>
              <h4>No hay mensajes que mostrar</h4>
              <p>
                {filterOnlyUnread
                  ? '¡Excelente! No tenés mensajes pendientes de lectura en este momento.'
                  : searchTerm
                  ? `No se encontraron mensajes que coincidan con "${searchTerm}".`
                  : 'Aún no se han recibido consultas desde el formulario de contacto.'}
              </p>
            </div>
          ) : (
            <div className="messages-list">
              {filteredMessages.map((msg) => {
                const isUnread = !msg.leido;
                const isBusy = busyMessageId === msg.id;
                return (
                  <div key={msg.id} className={`message-card ${isUnread ? 'unread' : 'read'}`}>
                    <div className="mc-header">
                      <div className="mc-sender-info">
                        <div className="mc-avatar">
                          {getInitials(msg.nombre, msg.email)}
                        </div>
                        <div>
                          <div className="mc-name-row">
                            <strong className="mc-name">{msg.nombre || 'Usuario Divise'}</strong>
                            <span className={`mc-badge ${isUnread ? 'unread' : 'read'}`}>
                              {isUnread ? '● No leído' : '✓ Leído'}
                            </span>
                          </div>
                          <div className="mc-meta-row">
                            <a
                              href={`mailto:${msg.email}`}
                              className="mc-email"
                              title="Escribir a este correo"
                            >
                              {msg.email}
                            </a>
                            <button
                              type="button"
                              className="mc-copy-btn"
                              onClick={() => handleCopyEmail(msg.email, msg.id)}
                              title="Copiar dirección de email"
                            >
                              {copiedId === msg.id ? '✓ Copiado' : 'Copiar'}
                            </button>
                            <span className="mc-dot">•</span>
                            <span className="mc-date">{formatDate(msg.fecha)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mc-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-xs"
                          onClick={() => handleReplyMail(msg)}
                          title="Abrir tu cliente de correo para responderle directamente"
                        >
                          <Icon name="mail" size={14} /> Responder por Correo
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-xs"
                          onClick={() => handleToggleRead(msg)}
                          disabled={isBusy}
                          title={isUnread ? 'Marcar como leído' : 'Marcar como no leído'}
                        >
                          {isUnread ? '✓ Marcar Leído' : 'Marcar No Leído'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-xs btn-delete"
                          onClick={() => handleDeleteMessage(msg)}
                          disabled={isBusy}
                          title="Eliminar este mensaje"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div className="mc-subject">
                      <span className="mc-subject-label">Asunto:</span>
                      <span className="mc-subject-text">{msg.asunto || 'Consulta general'}</span>
                    </div>

                    <div className="mc-body">
                      <p>{msg.mensaje}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: AUDITORÍA DE GMAILS ENVIADOS ───────────────────────────── */}
      {activeTab === 'emails' && (
        <div className="admin-panel-card">
          <div className="apc-header">
            <h3>Registro de Correos Despachados (Auditoría Gmail / SMTP)</h3>
            <span className="apc-sub">
              Visualizá códigos de verificación, 2FA, restablecimientos, alertas y despachos de soporte.
            </span>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fecha & Hora</th>
                  <th>Destinatario / De</th>
                  <th>Tipo de Mensaje</th>
                  <th>Asunto</th>
                  <th>Código / Detalle</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="at-empty">
                      {loading ? 'Cargando registros...' : 'No se encontraron correos en el historial.'}
                    </td>
                  </tr>
                ) : (
                  filteredEmails.map((item, idx) => {
                    const isOk =
                      item.estado?.toLowerCase().includes('enviado') ||
                      item.estado?.toLowerCase().includes('éxito') ||
                      item.estado?.toLowerCase().includes('recibido');
                    const isSimulated = item.estado?.toLowerCase().includes('simulado');
                    const isContact = item.tipo?.toLowerCase().includes('contacto');

                    return (
                      <tr key={item.id_email || idx}>
                        <td className="at-date">{formatDate(item.fecha)}</td>
                        <td className="at-recipient">
                          <strong>{item.destinatario}</strong>
                          {item.remitente && (
                            <div className="at-sender-sub">
                              De: {item.remitente_nombre ? `${item.remitente_nombre} <${item.remitente}>` : item.remitente}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`at-type-badge ${isContact ? 'contact' : ''}`}>
                            {item.tipo || 'Notificación'}
                          </span>
                        </td>
                        <td className="at-subject" title={item.asunto}>
                          {item.asunto}
                        </td>
                        <td className="at-code">
                          {item.codigo ? (
                            <span
                              className={`at-code-box ${isContact ? 'clickable' : ''}`}
                              onClick={() => {
                                if (item.mensaje) {
                                  setSelectedModalMessage({
                                    asunto: item.asunto,
                                    remitente: item.remitente || 'Usuario',
                                    remitente_nombre: item.remitente_nombre || 'Remitente',
                                    mensaje: item.mensaje,
                                    fecha: item.fecha,
                                  });
                                }
                              }}
                              title={item.mensaje ? 'Hacé clic para ver el mensaje completo' : ''}
                            >
                              {item.codigo}
                            </span>
                          ) : (
                            <span className="at-muted">—</span>
                          )}
                        </td>
                        <td>
                          <span className={`at-status ${isOk ? 'ok' : isSimulated ? 'sim' : 'err'}`}>
                            {item.estado || 'Enviado'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: GESTIÓN DE USUARIOS Y ROLES ────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="admin-panel-card">
          <div className="apc-header">
            <h3>Gestión de Usuarios y Roles</h3>
            <span className="apc-sub">Asigná o remové permisos de Administrador a las cuentas registradas.</span>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo Electrónico</th>
                  <th>Email Verificado</th>
                  <th>Fecha de Registro</th>
                  <th>Rol Actual</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="at-empty">
                      {loading ? 'Cargando usuarios...' : 'No se encontraron usuarios.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isAdminUser = u.es_admin || u.rol === 'admin';
                    const isSelf = u.id_usuario === user?.id_usuario;
                    return (
                      <tr key={u.id_usuario}>
                        <td className="at-id">#{u.id_usuario}</td>
                        <td className="at-name">
                          <strong>{u.nombre || '—'}</strong>
                        </td>
                        <td className="at-email">{u.email}</td>
                        <td>
                          <span className={`badge ${u.email_verificado ? 'badge-success' : 'badge-warning'}`}>
                            {u.email_verificado ? '✓ Verificado' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="at-date">{formatDate(u.created_at)}</td>
                        <td>
                          <span className={`at-role-badge ${isAdminUser ? 'admin' : 'user'}`}>
                            <Icon name={isAdminUser ? 'shield' : 'user'} size={13} />
                            {isAdminUser ? 'Administrador' : 'Usuario'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`btn btn-xs ${isAdminUser ? 'btn-outline' : 'btn-primary'}`}
                            onClick={() => handleToggleRole(u)}
                            disabled={busyUser === u.id_usuario || isSelf}
                            title={isSelf ? 'No podés cambiar tu propio rol' : ''}
                          >
                            {isAdminUser ? 'Quitar Admin' : 'Hacer Admin'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Mensaje (para visualización rápida) */}
      {selectedModalMessage && (
        <div className="admin-modal-overlay" onClick={() => setSelectedModalMessage(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{selectedModalMessage.asunto}</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedModalMessage(null)}
              >
                ×
              </button>
            </div>
            <div className="admin-modal-meta">
              <strong>De:</strong> {selectedModalMessage.remitente_nombre} &lt;{selectedModalMessage.remitente}&gt;
              <br />
              <span className="at-date">{formatDate(selectedModalMessage.fecha)}</span>
            </div>
            <div className="admin-modal-body">
              {selectedModalMessage.mensaje}
            </div>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedModalMessage(null)}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  handleReplyMail({
                    email: selectedModalMessage.remitente,
                    nombre: selectedModalMessage.remitente_nombre,
                    asunto: selectedModalMessage.asunto,
                    mensaje: selectedModalMessage.mensaje,
                    fecha: selectedModalMessage.fecha,
                  });
                }}
              >
                <Icon name="mail" size={14} /> Responder por Correo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
