-- Migration: 005_two_factor_auth.sql
-- Descripción: Soporte para autenticación en dos pasos (2FA) por correo electrónico

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE;
