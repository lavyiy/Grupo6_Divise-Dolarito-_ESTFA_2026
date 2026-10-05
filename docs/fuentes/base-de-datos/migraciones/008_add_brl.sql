-- ============================================================
-- Migration: 008_add_brl.sql
-- Descripción: Asegurar divisa BRL en la tabla de divisas
-- ============================================================

INSERT INTO divisas (codigo, nombre, tipo) VALUES
  ('BRL', 'Real Brasileño', 'Fiat')
ON CONFLICT (codigo) DO NOTHING;
