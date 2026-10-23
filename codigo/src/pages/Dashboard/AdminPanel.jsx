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
  getAdminTickets,
  updateAdminTicket,
  deleteAdminTicket,
} from '../../services/api';
import { Icon } from '../../components/ui/Icon';
import './AdminPanel.css';

const TICKET_STATUS_META = {
  abierto: { label: 'Abierto', className: 'open' },
  en_proceso: { label: 'En proceso', className: 'process' },
  resuelto: { label: 'Resuelto', className: 'resolved' },
  cerrado: { label: 'Cerrado', className: 'closed' },
};

const TICKET_PRIORITY_META = {
  baja: { label: 'Baja', className: 'low' },
  media: { label: 'Media', className: 'medium' },
  alta: { label: 'Alta', className: 'high' },
};

const TICKET_CATEGORY_LABELS = {
  tecnico: 'Problema técnico',
  cuenta: 'Cuenta y acceso',
  cotizaciones: 'Cotizaciones',
  sugerencia: 'Sugerencia',
  otro: 'Otro tema',
};

export default function AdminPanel() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' | 'tickets' | 'emails' | 'users'
  
  const [messages, setMessages] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [emails, setEmails] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState('');
  const [busyUser, setBusyUser] = useState(null);
  const [busyMessageId, setBusyMessageId] = useState(null);
  const [busyTicketId, setBusyTicketId] = useState(null);
  const [filterOnlyUnread, setFilterOnlyUnread] = useState(false);
  const [ticketFilter, setTicketFilter] = useState('todos');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedModalMessage, setSelectedModalMessage] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReplyDraft, setTicketReplyDraft] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    // Cada sección se resuelve de forma independiente para que el panel no
    // quede bloqueado esperando la consulta más lenta (por ejemplo la DB).
    const tasks = [
      getAdminMessages(token)
        .then((data) => {
          if (Array.isArray(data)) setMessages(data);
        })
        .catch(() => {}),
      getAdminEmails(token)
        .then((data) => {
          if (Array.isArray(data)) setEmails(data);
        })
        .catch(() => {}),
      getAdminUsers(token)
        .then((data) => {
          if (Array.isArray(data)) setUsers(data);
        })
        .catch(() => {}),
      getAdminStats(token)
        .then((data) => {
          if (data) setStats(data);
        })
        .catch(() => {}),
      getAdminTickets(token)
        .then((data) => {
          if (Array.isArray(data)) setTickets(data);
        })
        .catch(() => {}),
    ];

    await Promise.allSettled(tasks);
    setLoading(false);
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

  // ── Gestión de Tickets de Soporte (chatbot) ────────────────────────────────

  const applyTicketUpdate = (updated) => {
    if (!updated) return;
    setTickets((prev) =>
      prev.map((t) => (Number(t.id) === Number(updated.id) ? { ...t, ...updated } : t))
    );
    setSelectedTicket((prev) =>
      prev && Number(prev.id) === Number(updated.id) ? { ...prev, ...updated } : prev
    );
  };

  const handleOpenTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setTicketReplyDraft(ticket.respuesta_admin || '');
    if (ticket.leido) return;
    try {
      const res = await updateAdminTicket(ticket.id, { leido: true }, token);
      if (res?.ticket) applyTicketUpdate(res.ticket);
      else setTickets((prev) => prev.map((t) => (t.id === ticket.id ? { ...t, leido: true } : t)));
    } catch {
      // Marcar como leído no debe bloquear la visualización del ticket
    }
  };

  const handleTicketStatus = async (ticket, estado) => {
    setBusyTicketId(ticket.id);
    try {
      const res = await updateAdminTicket(ticket.id, { estado }, token);
      if (res?.ticket) {
        applyTicketUpdate(res.ticket);
      } else {
        setTickets((prev) => prev.map((t) => (t.id === ticket.id ? { ...t, estado } : t)));
        setSelectedTicket((prev) => (prev && prev.id === ticket.id ? { ...prev, estado } : prev));
      }
      showToast(`Ticket ${ticket.codigo} actualizado a "${TICKET_STATUS_META[estado]?.label || estado}".`);
    } catch (err) {
      showToast(err.message || 'Error al actualizar el estado del ticket.');
    } finally {
      setBusyTicketId(null);
    }
  };

  const handleSaveTicketReply = async () => {
    if (!selectedTicket) return;
    const draft = ticketReplyDraft.trim();
    if (!draft) {
      showToast('Escribí una respuesta antes de guardarla.');
      return;
    }

    setBusyTicketId(selectedTicket.id);
    try {
      const res = await updateAdminTicket(
        selectedTicket.id,
        { respuesta_admin: draft, estado: 'en_proceso', leido: true },
        token
      );
      if (res?.ticket) applyTicketUpdate(res.ticket);
      else {
        setTickets((prev) =>
          prev.map((t) =>
            t.id === selectedTicket.id
              ? { ...t, respuesta_admin: draft, estado: 'en_proceso', leido: true }
              : t
          )
        );
        setSelectedTicket((prev) =>
          prev ? { ...prev, respuesta_admin: draft, estado: 'en_proceso', leido: true } : prev
        );
      }
      showToast('Respuesta guardada. Ya es visible para el usuario en "Mis tickets".');
    } catch (err) {
      showToast(err.message || 'Error al guardar la respuesta del ticket.');
    } finally {
      setBusyTicketId(null);
    }
  };

  const handleDeleteTicket = async (ticket) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar el ticket ${ticket.codigo || `#${ticket.id}`} de ${ticket.nombre || ticket.email}?`
    );
    if (!confirmDelete) return;

    setBusyTicketId(ticket.id);
    try {
      await deleteAdminTicket(ticket.id, token);
      setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
      if (selectedTicket && Number(selectedTicket.id) === Number(ticket.id)) {
        setSelectedTicket(null);
      }
      showToast('Ticket eliminado con éxito.');
    } catch (err) {
      showToast(err.message || 'Error al eliminar el ticket.');
    } finally {
      setBusyTicketId(null);
    }
  };

  const handleReplyTicket = (ticket) => {
    const cleanSubject = encodeURIComponent(`Re: [${ticket.codigo || 'Ticket'}] ${ticket.asunto || 'Soporte Divise'}`);
    const cleanBody = encodeURIComponent(
      `Hola ${ticket.nombre || 'Usuario'},\n\nEstamos trabajando en tu ticket ${ticket.codigo || ''}.\n\n${ticket.respuesta_admin ? `Respuesta del equipo:\n${ticket.respuesta_admin}\n\n` : ''}────────────────────────────────────────\nTicket original (${formatDate(ticket.fecha)}):\n"${ticket.mensaje}"\n────────────────────────────────────────\n\nSaludos cordiales,\nEquipo de Administración de Divise`
    );
    window.location.href = `mailto:${ticket.email}?subject=${cleanSubject}&body=${cleanBody}`;
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
  const unreadTicketsCount = tickets.filter((t) => !t.leido).length;
  const openTicketsCount = tickets.filter(
    (t) => t.estado === 'abierto' || t.estado === 'en_proceso'
  ).length;
  const resolvedTicketsCount = tickets.filter(
    (t) => t.estado === 'resuelto' || t.estado === 'cerrado'
  ).length;

  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter === 'abiertos' && !(t.estado === 'abierto' || t.estado === 'en_proceso')) {
      return false;
    }
    if (ticketFilter === 'resueltos' && !(t.estado === 'resuelto' || t.estado === 'cerrado')) {
      return false;
    }
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return [t.codigo, t.nombre, t.email, t.asunto, t.mensaje, t.categoria, t.respuesta_admin]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term));
  });

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
            Recepción de tickets de soporte y mensajes de usuarios, auditoría de correos (Gmail/SMTP) y gestión de roles.
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

        <div className={`admin-kpi-card ${activeTab === 'tickets' ? 'highlighted' : ''}`} onClick={() => setActiveTab('tickets')}>
          <div className="ak-icon tickets"><Icon name="ticket" size={22} /></div>
          <div className="ak-info">
            <span className="ak-label">Tickets de Soporte</span>
            <div className="ak-value-row">
              <span className="ak-value">{tickets.length}</span>
              {openTicketsCount > 0 && (
                <span className="ak-sub-badge" title="Tickets abiertos o en proceso">
                  {openTicketsCount} abiertos
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
            className={`admin-tab ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            <Icon name="ticket" size={16} />
            <span>Tickets de Soporte ({tickets.length})</span>
            {unreadTicketsCount > 0 && (
              <span className="tab-unread-pill">{unreadTicketsCount}</span>
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
                : activeTab === 'tickets'
                ? 'Buscar por código, usuario o asunto...'
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

      {/* ── TAB 2: TICKETS DE SOPORTE (CHATBOT) ───────────────────────────── */}
      {activeTab === 'tickets' && (
        <div className="admin-panel-card">
          <div className="apc-header apc-header-split">
            <div>
              <h3>Bandeja de Tickets de Soporte</h3>
              <span className="apc-sub">
                Tickets generados por los usuarios desde el asistente flotante de soporte del dashboard.
              </span>
            </div>
            <div className="apc-filters">
              <button
                type="button"
                className={`btn btn-xs ${ticketFilter === 'todos' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTicketFilter('todos')}
              >
                Todos ({tickets.length})
              </button>
              <button
                type="button"
                className={`btn btn-xs ${ticketFilter === 'abiertos' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTicketFilter('abiertos')}
              >
                Abiertos ({openTicketsCount})
              </button>
              <button
                type="button"
                className={`btn btn-xs ${ticketFilter === 'resueltos' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTicketFilter('resueltos')}
              >
                Resueltos ({resolvedTicketsCount})
              </button>
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="admin-empty-state">
              <div className="aes-icon"><Icon name="ticket" size={40} /></div>
              <h4>No hay tickets que mostrar</h4>
              <p>
                {searchTerm
                  ? `No se encontraron tickets que coincidan con "${searchTerm}".`
                  : ticketFilter === 'abiertos'
                  ? '¡Excelente! No tenés tickets pendientes en este momento.'
                  : 'Aún no se recibieron tickets desde el asistente de soporte.'}
              </p>
            </div>
          ) : (
            <div className="tickets-list">
              {filteredTickets.map((ticket) => {
                const status = TICKET_STATUS_META[ticket.estado] || TICKET_STATUS_META.abierto;
                const priority = TICKET_PRIORITY_META[ticket.prioridad] || TICKET_PRIORITY_META.media;
                const isBusy = busyTicketId === ticket.id;

                return (
                  <div
                    key={ticket.id}
                    className={`ticket-card ${status.className} ${!ticket.leido ? 'unread' : ''}`}
                  >
                    <div className="tc-top">
                      <div className="tc-badges">
                        <span className="tc-code">
                          <Icon name="ticket" size={13} /> {ticket.codigo || `#${ticket.id}`}
                        </span>
                        <span className={`tc-status ${status.className}`}>{status.label}</span>
                        <span className={`tc-priority ${priority.className}`}>
                          Prioridad {priority.label}
                        </span>
                        {!ticket.leido && <span className="tc-new">Nuevo</span>}
                      </div>
                      <span className="tc-date">{formatDate(ticket.fecha)}</span>
                    </div>

                    <div className="tc-main">
                      <div className="tc-avatar">{getInitials(ticket.nombre, ticket.email)}</div>
                      <div className="tc-info">
                        <div className="tc-name-row">
                          <strong>{ticket.nombre || 'Usuario Divise'}</strong>
                          <span className="tc-category">
                            {TICKET_CATEGORY_LABELS[ticket.categoria] || 'Otro tema'}
                          </span>
                        </div>
                        <a href={`mailto:${ticket.email}`} className="tc-email">{ticket.email}</a>
                      </div>
                    </div>

                    <div className="tc-subject">
                      <span>Asunto:</span> {ticket.asunto}
                    </div>

                    <div className="tc-body">
                      <p>{ticket.mensaje}</p>
                    </div>

                    {ticket.respuesta_admin && (
                      <div className="tc-response">
                        <span>Respuesta guardada</span>
                        <p>{ticket.respuesta_admin}</p>
                      </div>
                    )}

                    <div className="tc-actions">
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => handleOpenTicket(ticket)}
                      >
                        Ver detalle
                      </button>

                      {ticket.estado !== 'en_proceso' && ticket.estado !== 'resuelto' && (
                        <button
                          type="button"
                          className="btn btn-outline btn-xs"
                          disabled={isBusy}
                          onClick={() => handleTicketStatus(ticket, 'en_proceso')}
                        >
                          Tomar ticket
                        </button>
                      )}

                      {ticket.estado !== 'resuelto' && ticket.estado !== 'cerrado' && (
                        <button
                          type="button"
                          className="btn btn-primary btn-xs"
                          disabled={isBusy}
                          onClick={() => handleTicketStatus(ticket, 'resuelto')}
                        >
                          <Icon name="check" size={13} /> Resolver
                        </button>
                      )}

                      {ticket.estado === 'resuelto' && (
                        <button
                          type="button"
                          className="btn btn-outline btn-xs"
                          disabled={isBusy}
                          onClick={() => handleTicketStatus(ticket, 'abierto')}
                        >
                          Reabrir
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => handleReplyTicket(ticket)}
                      >
                        <Icon name="mail" size={13} /> Responder
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline btn-xs btn-delete"
                        disabled={isBusy}
                        onClick={() => handleDeleteTicket(ticket)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: AUDITORÍA DE GMAILS ENVIADOS ───────────────────────────── */}
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

      {/* ── TAB 4: GESTIÓN DE USUARIOS Y ROLES ────────────────────────────── */}
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
      {/* Modal de Detalle de Ticket de Soporte */}
      {selectedTicket && (
        <div className="admin-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div
            className="admin-modal-content admin-ticket-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>
                {selectedTicket.codigo || `Ticket #${selectedTicket.id}`} — {selectedTicket.asunto}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedTicket(null)}
              >
                ×
              </button>
            </div>

            <div className="admin-modal-meta">
              <div className="ticket-modal-badges">
                <span className={`tc-status ${(TICKET_STATUS_META[selectedTicket.estado] || TICKET_STATUS_META.abierto).className}`}>
                  {(TICKET_STATUS_META[selectedTicket.estado] || TICKET_STATUS_META.abierto).label}
                </span>
                <span className={`tc-priority ${(TICKET_PRIORITY_META[selectedTicket.prioridad] || TICKET_PRIORITY_META.media).className}`}>
                  Prioridad {(TICKET_PRIORITY_META[selectedTicket.prioridad] || TICKET_PRIORITY_META.media).label}
                </span>
                <span className="tc-category">
                  {TICKET_CATEGORY_LABELS[selectedTicket.categoria] || 'Otro tema'}
                </span>
              </div>
              <strong>De:</strong> {selectedTicket.nombre || 'Usuario Divise'} &lt;{selectedTicket.email}&gt;
              <br />
              <span className="at-date">{formatDate(selectedTicket.fecha)}</span>
            </div>

            <div className="admin-modal-body admin-ticket-body">
              <p className="ticket-modal-message">{selectedTicket.mensaje}</p>

              <label className="ticket-reply-label" htmlFor="admin-ticket-reply">
                Respuesta para el usuario
              </label>
              <textarea
                id="admin-ticket-reply"
                className="ticket-reply-input"
                rows={4}
                placeholder="Escribí la respuesta que verá el usuario en 'Mis tickets'..."
                value={ticketReplyDraft}
                onChange={(e) => setTicketReplyDraft(e.target.value)}
                disabled={busyTicketId === selectedTicket.id}
              />
              <span className="ticket-reply-hint">
                La respuesta queda guardada en el ticket y también podés enviarla por correo.
              </span>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedTicket(null)}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleReplyTicket(selectedTicket)}
              >
                <Icon name="mail" size={14} /> Enviar por correo
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveTicketReply}
                disabled={busyTicketId === selectedTicket.id}
              >
                <Icon name="check" size={14} /> Guardar respuesta
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
