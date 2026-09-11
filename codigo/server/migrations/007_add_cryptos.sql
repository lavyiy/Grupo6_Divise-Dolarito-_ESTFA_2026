-- ============================================================
-- Migration: 007_add_cryptos.sql
-- Descripción: Agregar USDT, BNB y DOGE a la tabla de divisas
-- ============================================================

INSERT INTO divisas (codigo, nombre, tipo) VALUES
  ('USDT', 'Tether', 'Cripto'),
  ('BNB', 'Binance Coin', 'Cripto'),
  ('DOGE', 'Dogecoin', 'Cripto')
ON CONFLICT (codigo) DO NOTHING;

-- Tipos de cambio iniciales (se actualizarán con syncService)
INSERT INTO tipos_de_cambio (id_divisa, precio_compra, precio_venta, tipo_mercado)
SELECT id_divisa, 0.999, 1.00, 'Cripto' FROM divisas WHERE codigo = 'USDT'
ON CONFLICT DO NOTHING;

INSERT INTO tipos_de_cambio (id_divisa, precio_compra, precio_venta, tipo_mercado)
SELECT id_divisa, 598.00, 600.00, 'Cripto' FROM divisas WHERE codigo = 'BNB'
ON CONFLICT DO NOTHING;

INSERT INTO tipos_de_cambio (id_divisa, precio_compra, precio_venta, tipo_mercado)
SELECT id_divisa, 0.319, 0.32, 'Cripto' FROM divisas WHERE codigo = 'DOGE'
ON CONFLICT DO NOTHING;
