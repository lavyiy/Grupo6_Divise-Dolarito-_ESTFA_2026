import React, { useState, useRef } from 'react';
import { Icon } from '../ui/Icon';
import './AvatarModal.css';

// Avatares predeterminados estilizados con temática financiera y cripto
const PRESET_AVATARS = [
  { id: 'bull', label: 'Toro / Inversor', icon: '📈', bg: '#0f2942', border: '#38bdf8' },
  { id: 'btc', label: 'Cripto Trader', icon: '₿', bg: '#2b2108', border: '#f0b90b' },
  { id: 'bank', label: 'Financiero', icon: '🏦', bg: '#172554', border: '#60a5fa' },
  { id: 'gem', label: 'Diamante', icon: '💎', bg: '#1e1b4b', border: '#a855f7' },
  { id: 'shield', label: 'Seguridad', icon: '🛡️', bg: '#064e3b', border: '#34d399' },
  { id: 'spark', label: 'Divise Pro', icon: '✨', bg: '#31102e', border: '#f472b6' },
  { id: 'lion', label: 'Líder', icon: '🦁', bg: '#2c1404', border: '#fb923c' },
  { id: 'rocket', label: 'Crecimiento', icon: '🚀', bg: '#1c1917', border: '#eab308' },
];

/**
 * Genera un SVG Data URI para los avatares predeterminados
 */
function createPresetSvgUri(preset) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <rect width="128" height="128" rx="64" fill="${preset.bg}"/>
    <circle cx="64" cy="64" r="60" fill="none" stroke="${preset.border}" stroke-width="4"/>
    <text x="64" y="76" font-size="52" text-anchor="middle" dominant-baseline="middle">${preset.icon}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Debe coincidir con el límite del backend (1.000.000 caracteres).
const MAX_DATA_URL_LENGTH = 900_000;

function renderCompressedImage(img, maxSize, quality) {
  let width = img.width;
  let height = img.height;

  if (width > height) {
    if (width > maxSize) {
      height = Math.round((height * maxSize) / width);
      width = maxSize;
    }
  } else if (height > maxSize) {
    width = Math.round((width * maxSize) / height);
    height = maxSize;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}

export default function AvatarModal({ currentPhoto, userName, onClose, onSave }) {
  const [selectedPhoto, setSelectedPhoto] = useState(currentPhoto || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Procesa y comprime la foto subida desde la computadora usando Canvas
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor seleccioná un archivo de imagen (JPEG, PNG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('La imagen es demasiado grande. El límite máximo es 8MB.');
      return;
    }

    setError('');
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Redimensionar y bajar la calidad hasta que la imagen entre en el
          // límite del backend (siempre como JPEG para que pese poco).
          let maxSize = 256;
          let quality = 0.85;
          let dataUrl = renderCompressedImage(img, maxSize, quality);

          while (dataUrl.length > MAX_DATA_URL_LENGTH && quality > 0.5) {
            quality -= 0.1;
            dataUrl = renderCompressedImage(img, maxSize, quality);
          }

          if (dataUrl.length > MAX_DATA_URL_LENGTH) {
            maxSize = 160;
            quality = 0.7;
            dataUrl = renderCompressedImage(img, maxSize, quality);
          }

          if (dataUrl.length > MAX_DATA_URL_LENGTH) {
            setError('No pudimos comprimir la imagen lo suficiente. Probá con otra foto más liviana.');
            setLoading(false);
            return;
          }

          setSelectedPhoto(dataUrl);
          setLoading(false);
        } catch {
          setError('Error al procesar la imagen seleccionada.');
          setLoading(false);
        }
      };
      img.onerror = () => {
        setError('Error al procesar la imagen seleccionada.');
        setLoading(false);
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setError('Error al leer el archivo.');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset) => {
    setError('');
    setSelectedPhoto(createPresetSvgUri(preset));
  };

  const handleRemovePhoto = () => {
    setError('');
    setSelectedPhoto('');
  };

  const handleConfirm = async () => {
    if (loading || saving) return;
    setError('');
    setSaving(true);
    try {
      await onSave(selectedPhoto);
    } catch (err) {
      setError(err?.message || 'No se pudo guardar la foto de perfil. Intentá nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="avatar-modal-overlay" onClick={onClose}>
      <div className="avatar-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="avatar-modal-close" onClick={onClose} aria-label="Cerrar modal">
          <Icon name="close" size={20} />
        </button>

        <div className="avatar-modal-header">
          <h3 className="am-title">Foto de Perfil</h3>
          <p className="am-sub">
            Subí una foto desde tu computadora o elegí uno de los avatares predeterminados.
          </p>
        </div>

        {error && <div className="am-error">{error}</div>}

        {/* Vista previa actual */}
        <div className="am-preview-box">
          <div className="am-avatar-preview">
            {selectedPhoto ? (
              <img src={selectedPhoto} alt="Vista previa" className="am-avatar-img" />
            ) : (
              <span className="am-avatar-initial">{userName?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </div>
          <div className="am-preview-info">
            <span className="am-preview-title">{selectedPhoto ? 'Foto seleccionada' : 'Inicial predeterminada'}</span>
            <span className="am-preview-desc">Esta imagen se mostrará en tu perfil y barra superior.</span>
            {selectedPhoto && (
              <button type="button" className="am-remove-btn" onClick={handleRemovePhoto}>
                Restablecer a inicial
              </button>
            )}
          </div>
        </div>

        {/* Subida desde la computadora */}
        <div className="am-upload-section">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || saving}
          >
            <Icon name="upload" size={16} />
            {loading ? 'Procesando imagen...' : 'Subir foto desde tu dispositivo'}
          </button>
        </div>

        {/* Galería de avatares predeterminados */}
        <div className="am-presets-section">
          <span className="am-presets-title">O elegí un avatar temático:</span>
          <div className="am-presets-grid">
            {PRESET_AVATARS.map((p) => {
              const uri = createPresetSvgUri(p);
              const isSelected = selectedPhoto === uri;
              return (
                <button
                  type="button"
                  key={p.id}
                  className={`am-preset-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectPreset(p)}
                  title={p.label}
                >
                  <span className="am-preset-emoji">{p.icon}</span>
                  <span className="am-preset-name">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="avatar-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={loading || saving}>
            {saving ? 'Guardando...' : 'Guardar Foto'}
          </button>
        </div>
      </div>
    </div>
  );
}
