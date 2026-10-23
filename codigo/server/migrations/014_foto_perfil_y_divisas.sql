-- ============================================================
-- Migración 014: foto de perfil + divisas faltantes de la calculadora
-- ============================================================

-- 1. Columna para la foto de perfil (idempotente, por si 011 no se aplicó).
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_perfil TEXT;

-- 2. Divisas fiat que la calculadora muestra y que antes no existían en la
-- tabla `divisas` (por eso fallaban favoritos/alertas y no se sincronizaban).
INSERT INTO divisas (codigo, nombre, tipo) VALUES
  ('ARS', 'Peso Argentino',      'Fiat'),
  ('USD', 'Dólar Estadounidense','Fiat'),
  ('EUR', 'Euro',                'Fiat'),
  ('BRL', 'Real Brasileño',      'Fiat'),
  ('UYU', 'Peso Uruguayo',       'Fiat'),
  ('CLP', 'Peso Chileno',        'Fiat'),
  ('MXN', 'Peso Mexicano',       'Fiat'),
  ('GBP', 'Libra Esterlina',     'Fiat'),
  ('JPY', 'Yen Japonés',         'Fiat'),
  ('CAD', 'Dólar Canadiense',    'Fiat'),
  ('CHF', 'Franco Suizo',        'Fiat'),
  ('AUD', 'Dólar Australiano',   'Fiat'),
  ('CNY', 'Yuan Chino',          'Fiat')
ON CONFLICT (codigo) DO NOTHING;

-- 3. Recargar el cache de esquema de PostgREST para que Supabase reconozca
-- `foto_perfil` inmediatamente después de aplicar la migración.
NOTIFY pgrst, 'reload schema';
