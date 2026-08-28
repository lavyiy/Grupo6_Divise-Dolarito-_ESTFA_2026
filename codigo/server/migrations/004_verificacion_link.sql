-- Migration: 004_verificacion_link.sql
-- Descripción: Verificación de email también por enlace clickeable (token)

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS verif_token VARCHAR(64);
