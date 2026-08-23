-- ============================================================
-- Migration: 002_sprint3_updates.sql
-- Descripción: Tablas y columnas nuevas para Sprint 3
-- ============================================================

-- 1. Agregar columnas para recuperación de contraseña
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

-- 2. Tabla de alertas
CREATE TABLE IF NOT EXISTS alertas (
  id_alerta SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  codigo_divisa VARCHAR(20) NOT NULL,
  condicion VARCHAR(20) NOT NULL, -- 'Sube a', 'Baja a'
  valor_limite DECIMAL(18,2) NOT NULL,
  notificada BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_alertas_usuario ON alertas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_alertas_notificada ON alertas(notificada);
