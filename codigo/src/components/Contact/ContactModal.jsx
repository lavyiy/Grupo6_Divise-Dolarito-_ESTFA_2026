import React, { useState } from 'react';
import { Icon } from '../ui/Icon';
import { sendContactMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './ContactModal.css';

export default function ContactModal({ onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    asunto: '',
    mensaje: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  const adminEmail = 'deviseproyect@gmail.com';
  const whatsappNumber = '+54 9 11 2345-6789';
  const whatsappUrl = 'https://wa.me/5491123456789?text=Hola%20equipo%20de%20Divise,%20necesito%20ayuda%20con%20la%20plataforma.';

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(adminEmail).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.email.trim() || !form.mensaje.trim()) {
      setError('Por favor completá tu correo y el mensaje.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendContactMessage(form);
      setSuccess(res?.message || '¡Mensaje enviado con éxito a los administradores!');
      setForm({
        nombre: user?.nombre || '',
        email: user?.email || '',
        asunto: '',
        mensaje: '',
      });
    } catch (err) {
      setError(err.message || 'Error al enviar el mensaje. Podés escribirnos directamente a deviseproyect@gmail.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-modal-overlay" onClick={onClose}>
      <div className="contact-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="contact-modal-close" onClick={onClose} aria-label="Cerrar modal">
          <Icon name="close" size={20} />
        </button>

        <div className="contact-modal-header">
          <div className="cm-badge">
            <Icon name="spark" size={14} /> Soporte & Administración
          </div>
          <h2 className="cm-title">Contactar Administradores</h2>
          <p className="cm-sub">
            ¿Tenés alguna consulta, inconveniente o propuesta? El equipo de desarrollo de Divise (Grupo 6) está a tu disposición.
          </p>
        </div>

        {/* Canales directos */}
        <div className="contact-channels">
          <div className="contact-channel-card">
            <div className="ccc-icon gmail">
              <Icon name="mail" size={20} />
            </div>
            <div className="ccc-info">
              <span className="ccc-label">Correo Oficial (Gmail)</span>
              <span className="ccc-val">{adminEmail}</span>
            </div>
            <div className="ccc-actions">
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={handleCopyEmail}
                title="Copiar correo"
              >
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
              <a
                href={`mailto:${adminEmail}?subject=Consulta%20Divise`}
                className="btn btn-primary btn-xs"
                style={{ textDecoration: 'none' }}
              >
                Escribir
              </a>
            </div>
          </div>

          <div className="contact-channel-card">
            <div className="ccc-icon whatsapp">
              <Icon name="bell" size={20} />
            </div>
            <div className="ccc-info">
              <span className="ccc-label">WhatsApp Soporte</span>
              <span className="ccc-val">{whatsappNumber}</span>
            </div>
            <div className="ccc-actions">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-xs"
                style={{ textDecoration: 'none', color: '#2ecc8a', borderColor: 'rgba(46, 204, 138, 0.4)' }}
              >
                Abrir WhatsApp ↗
              </a>
            </div>
          </div>
        </div>

        {/* Formulario de Mensaje */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="cf-heading">O envianos un mensaje directo:</div>

          {error && <div className="cf-alert error">{error}</div>}
          {success && <div className="cf-alert success">{success}</div>}

          <div className="cf-row">
            <div className="cf-field">
              <label>Tu Nombre</label>
              <input
                type="text"
                placeholder="Ej: Juan Pérez"
                value={form.nombre}
                onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
              />
            </div>
            <div className="cf-field">
              <label>Tu Correo Electrónico *</label>
              <input
                type="email"
                placeholder="tu@email.com"
                required
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="cf-field">
            <label>Asunto</label>
            <input
              type="text"
              placeholder="Ej: Consulta sobre cotizaciones / cuenta"
              value={form.asunto}
              onChange={(e) => setForm((p) => ({ ...p, asunto: e.target.value }))}
            />
          </div>

          <div className="cf-field">
            <label>Mensaje *</label>
            <textarea
              rows={4}
              placeholder="Escribí acá tu mensaje detallado para los administradores..."
              required
              value={form.mensaje}
              onChange={(e) => setForm((p) => ({ ...p, mensaje: e.target.value }))}
            ></textarea>
          </div>

          <div className="contact-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar mensaje'} <Icon name="arrowRight" size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
