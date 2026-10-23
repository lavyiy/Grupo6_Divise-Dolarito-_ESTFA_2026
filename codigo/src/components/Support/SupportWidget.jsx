import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../ui/Icon';
import {
  createSupportTicket,
  getMySupportTickets,
  getAdminTickets,
  updateAdminTicket,
} from '../../services/api';
import './SupportWidget.css';

const CATEGORIES = [
  { id: 'tecnico', label: 'Problema técnico', emoji: '🛠️', hint: 'Errores o fallas de la app' },
  { id: 'cuenta', label: 'Cuenta y acceso', emoji: '🔐', hint: 'Login, contraseña o perfil' },
  { id: 'cotizaciones', label: 'Cotizaciones', emoji: '📈', hint: 'Datos de divisas o gráficos' },
  { id: 'sugerencia', label: 'Sugerencia', emoji: '💡', hint: 'Mejoras o nuevas funciones' },
  { id: 'otro', label: 'Otro tema', emoji: '💬', hint: 'Cualquier otra consulta' },
];

const PRIORITIES = [
  { id: 'baja', label: 'Baja', hint: 'Puede esperar' },
  { id: 'media', label: 'Media', hint: 'Lo necesito pronto' },
  { id: 'alta', label: 'Alta', hint: 'Me impide usar la app' },
];

const STATUS_META = {
  abierto: { label: 'Abierto', className: 'st-open' },
  en_proceso: { label: 'En proceso', className: 'st-process' },
  resuelto: { label: 'Resuelto', className: 'st-resolved' },
  cerrado: { label: 'Cerrado', className: 'st-closed' },
};

const CATEGORY_LABELS = CATEGORIES.reduce((acc, c) => ({ ...acc, [c.id]: c.label }), {});
const PRIORITY_LABELS = PRIORITIES.reduce((acc, p) => ({ ...acc, [p.id]: p.label }), {});

function buildWelcome(nombre) {
  const shortName = String(nombre || '').trim().split(/\s+/)[0];
  return [
    {
      role: 'bot',
      text: `¡Hola${shortName ? `, ${shortName}` : ''}! 👋 Soy el asistente de soporte de Divise.`,
    },
    {
      role: 'bot',
      text: 'Puedo generarte un ticket para el equipo de administración. ¿Sobre qué tema necesitás ayuda?',
    },
  ];
}

function isAdminUser(user) {
  const email = String(user?.email || '').toLowerCase();
  return Boolean(
    user?.es_admin ||
    user?.rol === 'admin' ||
    ['deviseproyect@gmail.com', 'divise.grupo6@gmail.com', 'demo.divise@example.com'].includes(email) ||
    email.includes('tacconi') ||
    email.includes('admin')
  );
}

function getFriendlyError(err, fallback) {
  if (err?.isGatewayError || [502, 503, 504].includes(err?.status)) {
    return 'El servidor de soporte está iniciando o no está disponible. Esperá unos segundos y reintentá.';
  }
  if (err?.isNetworkError) {
    return 'No se pudo conectar con el servidor. Verificá que el backend esté funcionando.';
  }
  return err?.message || fallback;
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(fn, attempts = 2) {
  let lastError;
  for (let attempt = 0; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const retriable =
        err?.isGatewayError ||
        [502, 503, 504].includes(err?.status) ||
        err?.isNetworkError;
      if (!retriable || attempt === attempts) throw err;
      await delay(1200);
    }
  }
  throw lastError;
}

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

export default function SupportWidget() {
  const { token, user } = useAuth();
  const isAdmin = isAdminUser(user);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState(isAdmin ? 'bandeja' : 'nuevo'); // 'nuevo' | 'mis' | 'bandeja'
  const [step, setStep] = useState('categoria');
  const [form, setForm] = useState({
    categoria: '',
    prioridad: 'media',
    asunto: '',
    mensaje: '',
  });
  const [chat, setChat] = useState(() => buildWelcome(user?.nombre));
  const [input, setInput] = useState('');
  const [createdTicket, setCreatedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState('');

  const [adminTickets, setAdminTickets] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [busyTicketId, setBusyTicketId] = useState(null);
  const [replyTicketId, setReplyTicketId] = useState(null);
  const [replyDraft, setReplyDraft] = useState('');

  const chatBodyRef = useRef(null);
  const inputRef = useRef(null);

  const loadTickets = useCallback(async () => {
    if (!token) return;
    setTicketsLoading(true);
    setTicketsError('');
    try {
      const data = await fetchWithRetry(() => getMySupportTickets(token));
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setTicketsError(getFriendlyError(err, 'No se pudieron cargar tus tickets.'));
    } finally {
      setTicketsLoading(false);
    }
  }, [token]);

  const loadAdminTickets = useCallback(async () => {
    if (!token) return;
    setAdminLoading(true);
    setAdminError('');
    try {
      const data = await fetchWithRetry(() => getAdminTickets(token));
      setAdminTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setAdminError(getFriendlyError(err, 'No se pudo cargar la bandeja de tickets.'));
    } finally {
      setAdminLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!open) return;
    if (view === 'mis' && !isAdmin) loadTickets();
    if (view === 'bandeja' && isAdmin) loadAdminTickets();
  }, [open, view, isAdmin, loadTickets, loadAdminTickets]);

  useEffect(() => {
    if (isAdmin && view === 'mis') setView('bandeja');
    if (!isAdmin && view === 'bandeja') setView('nuevo');
  }, [isAdmin, view]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chat, step]);

  useEffect(() => {
    if ((step === 'asunto' || step === 'mensaje') && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  const resetFlow = () => {
    setView('nuevo');
    setStep('categoria');
    setForm({ categoria: '', prioridad: 'media', asunto: '', mensaje: '' });
    setChat(buildWelcome(user?.nombre));
    setInput('');
    setCreatedTicket(null);
    setError('');
  };

  const pushChat = (entry) => setChat((prev) => [...prev, entry]);

  const handleCategory = (category) => {
    setForm((prev) => ({ ...prev, categoria: category.id }));
    pushChat({ role: 'user', text: `${category.emoji} ${category.label}` });
    pushChat({ role: 'bot', text: 'Perfecto. ¿Qué prioridad le asignamos a este ticket?' });
    setStep('prioridad');
  };

  const handlePriority = (priority) => {
    setForm((prev) => ({ ...prev, prioridad: priority.id }));
    pushChat({ role: 'user', text: priority.label });
    pushChat({ role: 'bot', text: 'Escribí un asunto breve que resuma el problema.' });
    setStep('asunto');
    setInput('');
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const value = input.trim();
    setError('');

    if (step === 'asunto') {
      if (!value) {
        setError('Escribí un asunto para continuar.');
        return;
      }
      setForm((prev) => ({ ...prev, asunto: value }));
      pushChat({ role: 'user', text: value });
      pushChat({
        role: 'bot',
        text: 'Ahora contame con detalle qué pasó, qué esperabas que ocurriera y desde qué pantalla lo viste.',
      });
      setInput('');
      setStep('mensaje');
      return;
    }

    if (step === 'mensaje') {
      if (value.length < 10) {
        setError('Contame un poco más (mínimo 10 caracteres) para que el equipo pueda ayudarte.');
        return;
      }
      if (!token) {
        setError('Necesitás iniciar sesión para generar un ticket.');
        return;
      }

      setForm((prev) => ({ ...prev, mensaje: value }));
      pushChat({ role: 'user', text: value });
      setLoading(true);

      try {
        const res = await fetchWithRetry(() =>
          createSupportTicket(
            {
              categoria: form.categoria,
              prioridad: form.prioridad,
              asunto: form.asunto,
              mensaje: value,
            },
            token
          )
        );

        const ticket = res?.ticket || null;
        setCreatedTicket(ticket);
        pushChat({
          role: 'bot',
          text: `Listo ✅ Generé el ticket ${ticket?.codigo || ''} y ya quedó en la bandeja del equipo de administración.`,
        });
        setInput('');
        setStep('listo');
      } catch (err) {
        const message = getFriendlyError(err, 'No se pudo generar el ticket. Intentá nuevamente.');
        setError(message);
        pushChat({
          role: 'bot',
          text: `No pude crear el ticket: ${message} Podés reintentar enviando la descripción otra vez.`,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNewTab = () => {
    if (createdTicket) resetFlow();
    else setView('nuevo');
  };

  const renderStatus = (estado) => {
    const meta = STATUS_META[estado] || STATUS_META.abierto;
    return <span className={`sp-status ${meta.className}`}>{meta.label}</span>;
  };

  // ── Acciones del administrador ─────────────────────────────────────────────

  const applyAdminTicket = (updated) => {
    if (!updated) return;
    setAdminTickets((prev) =>
      prev.map((t) => (Number(t.id) === Number(updated.id) ? { ...t, ...updated } : t))
    );
  };

  const handleAdminStatus = async (ticket, estado) => {
    setBusyTicketId(ticket.id);
    setAdminError('');
    try {
      const res = await fetchWithRetry(() =>
        updateAdminTicket(ticket.id, { estado }, token)
      );
      if (res?.ticket) applyAdminTicket(res.ticket);
      else {
        setAdminTickets((prev) =>
          prev.map((t) => (Number(t.id) === Number(ticket.id) ? { ...t, estado } : t))
        );
      }
    } catch (err) {
      setAdminError(getFriendlyError(err, 'No se pudo actualizar el ticket.'));
    } finally {
      setBusyTicketId(null);
    }
  };

  const handleToggleReply = (ticket) => {
    if (Number(replyTicketId) === Number(ticket.id)) {
      setReplyTicketId(null);
      setReplyDraft('');
      return;
    }
    setReplyTicketId(ticket.id);
    setReplyDraft(ticket.respuesta_admin || '');
    if (!ticket.leido) {
      updateAdminTicket(ticket.id, { leido: true }, token)
        .then((res) => {
          if (res?.ticket) applyAdminTicket(res.ticket);
          else {
            setAdminTickets((prev) =>
              prev.map((t) => (Number(t.id) === Number(ticket.id) ? { ...t, leido: true } : t))
            );
          }
        })
        .catch(() => {});
    }
  };

  const handleAdminReply = async (ticket) => {
    const draft = replyDraft.trim();
    if (!draft) {
      setAdminError('Escribí una respuesta antes de guardarla.');
      return;
    }

    setBusyTicketId(ticket.id);
    setAdminError('');
    try {
      const res = await fetchWithRetry(() =>
        updateAdminTicket(
          ticket.id,
          { respuesta_admin: draft, estado: 'en_proceso', leido: true },
          token
        )
      );
      if (res?.ticket) applyAdminTicket(res.ticket);
      else {
        setAdminTickets((prev) =>
          prev.map((t) =>
            Number(t.id) === Number(ticket.id)
              ? { ...t, respuesta_admin: draft, estado: 'en_proceso', leido: true }
              : t
          )
        );
      }
      setReplyTicketId(null);
      setReplyDraft('');
    } catch (err) {
      setAdminError(getFriendlyError(err, 'No se pudo guardar la respuesta.'));
    } finally {
      setBusyTicketId(null);
    }
  };

  const adminOpenCount = adminTickets.filter(
    (t) => t.estado === 'abierto' || t.estado === 'en_proceso'
  ).length;

  return (
    <div className="support-root">
      {open && (
        <div className="support-panel" role="dialog" aria-label="Soporte Divise">
          <div className="sp-header">
            <div className="sp-avatar">
              <Icon name={isAdmin ? 'shield' : 'lifebuoy'} size={20} />
            </div>
            <div className="sp-title">
              <strong>Soporte Divise</strong>
              <span>{isAdmin ? 'Bandeja de administración' : 'Asistente de tickets'}</span>
            </div>
            <button
              type="button"
              className="sp-close"
              onClick={() => setOpen(false)}
              aria-label="Cerrar soporte"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          <div className="sp-tabs">
            <button
              type="button"
              className={`sp-tab ${view === 'nuevo' ? 'active' : ''}`}
              onClick={handleNewTab}
            >
              <Icon name="chat" size={14} /> Nuevo ticket
            </button>

            {isAdmin ? (
              <button
                type="button"
                className={`sp-tab ${view === 'bandeja' ? 'active' : ''}`}
                onClick={() => setView('bandeja')}
              >
                <Icon name="shield" size={14} /> Bandeja
                {adminOpenCount > 0 && <span className="sp-tab-pill">{adminOpenCount}</span>}
              </button>
            ) : (
              <button
                type="button"
                className={`sp-tab ${view === 'mis' ? 'active' : ''}`}
                onClick={() => setView('mis')}
              >
                <Icon name="ticket" size={14} /> Mis tickets
                {tickets.length > 0 && <span className="sp-tab-pill">{tickets.length}</span>}
              </button>
            )}
          </div>

          {view === 'nuevo' && step === 'listo' && createdTicket && (
            <div className="sp-success">
              <div className="sp-success-icon">
                <Icon name="check" size={26} />
              </div>
              <h3>¡Ticket generado!</h3>
              <p>
                Tu ticket <strong>{createdTicket.codigo}</strong> fue enviado al equipo de
                administración. Te responderemos al correo <strong>{createdTicket.email || user?.email}</strong>.
              </p>

              <div className="sp-success-ticket">
                <div className="sp-st-row">
                  <span className="sp-st-label">Código</span>
                  <span className="sp-st-value">{createdTicket.codigo}</span>
                </div>
                <div className="sp-st-row">
                  <span className="sp-st-label">Tema</span>
                  <span className="sp-st-value">
                    {CATEGORY_LABELS[createdTicket.categoria] || 'Otro tema'}
                  </span>
                </div>
                <div className="sp-st-row">
                  <span className="sp-st-label">Prioridad</span>
                  <span className="sp-st-value">
                    {PRIORITY_LABELS[createdTicket.prioridad] || 'Media'}
                  </span>
                </div>
                <div className="sp-st-row">
                  <span className="sp-st-label">Asunto</span>
                  <span className="sp-st-value">{createdTicket.asunto}</span>
                </div>
                <div className="sp-st-row">
                  <span className="sp-st-label">Estado</span>
                  {renderStatus(createdTicket.estado)}
                </div>
              </div>

              <div className="sp-success-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setView(isAdmin ? 'bandeja' : 'mis')}
                >
                  {isAdmin ? 'Ir a la bandeja' : 'Ver mis tickets'}
                </button>
                <button type="button" className="btn btn-primary" onClick={resetFlow}>
                  Nuevo ticket
                </button>
              </div>
            </div>
          )}

          {view === 'nuevo' && step !== 'listo' && (
            <>
              <div className="sp-chat" ref={chatBodyRef} aria-live="polite">
                {chat.map((msg, index) => (
                  <div key={`${msg.role}-${index}`} className={`sp-msg ${msg.role}`}>
                    {msg.role === 'bot' && (
                      <div className="sp-msg-avatar">
                        <Icon name="chat" size={13} />
                      </div>
                    )}
                    <div className="sp-bubble">{msg.text}</div>
                  </div>
                ))}

                {step === 'categoria' && (
                  <div className="sp-chips">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        className="sp-chip"
                        onClick={() => handleCategory(category)}
                      >
                        <span className="sp-chip-emoji">{category.emoji}</span>
                        <span className="sp-chip-text">
                          <strong>{category.label}</strong>
                          <small>{category.hint}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {step === 'prioridad' && (
                  <div className="sp-chips sp-chips-row">
                    {PRIORITIES.map((priority) => (
                      <button
                        key={priority.id}
                        type="button"
                        className={`sp-chip sp-chip-priority ${priority.id}`}
                        onClick={() => handlePriority(priority)}
                      >
                        <strong>{priority.label}</strong>
                        <small>{priority.hint}</small>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {error && <div className="sp-error">{error}</div>}

              {(step === 'asunto' || step === 'mensaje') ? (
                <form className="sp-input-bar" onSubmit={handleSend}>
                  {step === 'mensaje' ? (
                    <textarea
                      ref={inputRef}
                      rows={2}
                      placeholder="Detallá el problema..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={loading}
                    />
                  ) : (
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Asunto del ticket..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={loading}
                    />
                  )}
                  <button
                    type="submit"
                    className="sp-send-btn"
                    disabled={loading}
                    aria-label="Enviar"
                  >
                    {loading ? <span className="sp-spinner" /> : <Icon name="send" size={17} />}
                  </button>
                </form>
              ) : (
                <div className="sp-hint-bar">
                  <Icon name="info" size={14} /> Elegí una opción para continuar
                </div>
              )}
            </>
          )}

          {view === 'mis' && !isAdmin && (
            <div className="sp-tickets">
              <div className="sp-tickets-head">
                <span>Tus tickets de soporte</span>
                <button
                  type="button"
                  className="sp-refresh"
                  onClick={loadTickets}
                  disabled={ticketsLoading}
                  title="Actualizar"
                >
                  <Icon name="refresh" size={14} /> Actualizar
                </button>
              </div>

              {ticketsError && (
                <div className="sp-error sp-error-action">
                  <span>{ticketsError}</span>
                  <button type="button" className="sp-retry" onClick={loadTickets}>
                    Reintentar
                  </button>
                </div>
              )}

              {ticketsLoading ? (
                <div className="sp-tickets-empty">Cargando tus tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="sp-tickets-empty">
                  <Icon name="ticket" size={28} />
                  <strong>Todavía no tenés tickets</strong>
                  <span>Cuando generes uno desde el asistente, va a aparecer acá.</span>
                  <button type="button" className="btn btn-primary btn-sm" onClick={resetFlow}>
                    Crear mi primer ticket
                  </button>
                </div>
              ) : (
                <div className="sp-ticket-list">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="sp-ticket-card">
                      <div className="sp-ticket-top">
                        <span className="sp-ticket-code">{ticket.codigo}</span>
                        {renderStatus(ticket.estado)}
                      </div>
                      <strong className="sp-ticket-subject">{ticket.asunto}</strong>
                      <p className="sp-ticket-msg">{ticket.mensaje}</p>
                      {ticket.respuesta_admin && (
                        <div className="sp-ticket-response">
                          <span>Respuesta del equipo:</span>
                          <p>{ticket.respuesta_admin}</p>
                        </div>
                      )}
                      <div className="sp-ticket-meta">
                        <span>{CATEGORY_LABELS[ticket.categoria] || 'Otro tema'}</span>
                        <span>Prioridad {PRIORITY_LABELS[ticket.prioridad] || 'Media'}</span>
                        <span>{formatDate(ticket.fecha)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === 'bandeja' && isAdmin && (
            <div className="sp-tickets">
              <div className="sp-tickets-head">
                <span>Bandeja de tickets ({adminTickets.length})</span>
                <button
                  type="button"
                  className="sp-refresh"
                  onClick={loadAdminTickets}
                  disabled={adminLoading}
                  title="Actualizar"
                >
                  <Icon name="refresh" size={14} /> Actualizar
                </button>
              </div>

              {adminError && (
                <div className="sp-error sp-error-action">
                  <span>{adminError}</span>
                  <button type="button" className="sp-retry" onClick={loadAdminTickets}>
                    Reintentar
                  </button>
                </div>
              )}

              {adminLoading ? (
                <div className="sp-tickets-empty">Cargando bandeja...</div>
              ) : adminTickets.length === 0 ? (
                <div className="sp-tickets-empty">
                  <Icon name="ticket" size={28} />
                  <strong>No hay tickets pendientes</strong>
                  <span>Los tickets que generen los usuarios van a aparecer acá.</span>
                </div>
              ) : (
                <div className="sp-ticket-list">
                  {adminTickets.map((ticket) => {
                    const isBusy = Number(busyTicketId) === Number(ticket.id);
                    const isReplying = Number(replyTicketId) === Number(ticket.id);

                    return (
                      <div
                        key={ticket.id}
                        className={`sp-ticket-card sp-admin-card ${!ticket.leido ? 'unread' : ''}`}
                      >
                        <div className="sp-ticket-top">
                          <span className="sp-ticket-code">{ticket.codigo}</span>
                          {renderStatus(ticket.estado)}
                        </div>

                        <div className="sp-admin-user">
                          <strong>{ticket.nombre || 'Usuario Divise'}</strong>
                          <a href={`mailto:${ticket.email}`}>{ticket.email}</a>
                        </div>

                        <strong className="sp-ticket-subject">{ticket.asunto}</strong>
                        <p className="sp-ticket-msg">{ticket.mensaje}</p>

                        {ticket.respuesta_admin && (
                          <div className="sp-ticket-response">
                            <span>Respuesta guardada:</span>
                            <p>{ticket.respuesta_admin}</p>
                          </div>
                        )}

                        <div className="sp-ticket-meta">
                          <span>{CATEGORY_LABELS[ticket.categoria] || 'Otro tema'}</span>
                          <span>Prioridad {PRIORITY_LABELS[ticket.prioridad] || 'Media'}</span>
                          <span>{formatDate(ticket.fecha)}</span>
                        </div>

                        <div className="sp-admin-actions">
                          {ticket.estado !== 'en_proceso' && ticket.estado !== 'resuelto' && (
                            <button
                              type="button"
                              className="btn btn-outline btn-xs"
                              disabled={isBusy}
                              onClick={() => handleAdminStatus(ticket, 'en_proceso')}
                            >
                              Tomar
                            </button>
                          )}

                          {ticket.estado !== 'resuelto' && ticket.estado !== 'cerrado' && (
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              disabled={isBusy}
                              onClick={() => handleAdminStatus(ticket, 'resuelto')}
                            >
                              <Icon name="check" size={12} /> Resolver
                            </button>
                          )}

                          {ticket.estado === 'resuelto' && (
                            <button
                              type="button"
                              className="btn btn-outline btn-xs"
                              disabled={isBusy}
                              onClick={() => handleAdminStatus(ticket, 'abierto')}
                            >
                              Reabrir
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            disabled={isBusy}
                            onClick={() => handleToggleReply(ticket)}
                          >
                            <Icon name="mail" size={12} /> {isReplying ? 'Cancelar' : 'Responder'}
                          </button>
                        </div>

                        {isReplying && (
                          <div className="sp-admin-reply">
                            <textarea
                              rows={3}
                              placeholder="Escribí la respuesta que verá el usuario..."
                              value={replyDraft}
                              onChange={(e) => setReplyDraft(e.target.value)}
                              disabled={isBusy}
                            />
                            <div className="sp-admin-reply-actions">
                              <button
                                type="button"
                                className="btn btn-outline btn-xs"
                                onClick={() => handleToggleReply(ticket)}
                                disabled={isBusy}
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary btn-xs"
                                onClick={() => handleAdminReply(ticket)}
                                disabled={isBusy}
                              >
                                {isBusy ? 'Guardando...' : 'Guardar respuesta'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        className={`support-launcher ${open ? 'open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Cerrar soporte' : 'Abrir soporte'}
        aria-expanded={open}
      >
        <Icon name={open ? 'close' : 'chat'} size={22} />
        <span className="sl-label">{open ? 'Cerrar' : 'Soporte'}</span>
        {!open && <span className="sl-dot" />}
      </button>
    </div>
  );
}
