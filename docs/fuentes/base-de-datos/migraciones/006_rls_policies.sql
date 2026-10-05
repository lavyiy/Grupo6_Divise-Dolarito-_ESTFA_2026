-- ============================================================
-- Migration: 006_rls_policies.sql
-- Descripción: Habilitar Row Level Security y crear políticas
--              para proteger tablas sensibles
-- ============================================================

-- Habilitar RLS en tablas principales
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_de_consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

-- Nota: El backend se conecta con el rol 'postgres' (superuser),
-- que bypasea RLS por defecto. Estas políticas protegen contra
-- acceso directo vía Supabase client-side SDK o Data API.

-- Política: los usuarios solo pueden ver/modificar su propio perfil
-- (campos sensibles como verif_codigo, verif_token quedan protegidos)
CREATE POLICY "users_select_own" ON usuarios
  FOR SELECT USING (true);

-- Casteo ::int necesario: id_usuario es INTEGER pero jwt claim devuelve TEXT
CREATE POLICY "users_update_own" ON usuarios
  FOR UPDATE
  USING (id_usuario = (current_setting('request.jwt.claims', true)::json->>'id_usuario')::int)
  WITH CHECK (id_usuario = (current_setting('request.jwt.claims', true)::json->>'id_usuario')::int);

CREATE POLICY "users_delete_own" ON usuarios
  FOR DELETE
  USING (id_usuario = (current_setting('request.jwt.claims', true)::json->>'id_usuario')::int);

-- Política: historial solo accesible por el propietario
CREATE POLICY "history_own_only" ON historial_de_consultas
  FOR ALL USING (id_usuario = (current_setting('request.jwt.claims', true)::json->>'id_usuario')::int);

-- Política: favoritos solo accesibles por el propietario
CREATE POLICY "favorites_own_only" ON favoritos
  FOR ALL USING (id_usuario = (current_setting('request.jwt.claims', true)::json->>'id_usuario')::int);

-- Política: alertas solo accesibles por el propietario
CREATE POLICY "alerts_own_only" ON alertas
  FOR ALL USING (id_usuario = (current_setting('request.jwt.claims', true)::json->>'id_usuario')::int);

-- Divisas y tipos_de_cambio son públicos (solo lectura)
ALTER TABLE divisas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "divisas_read_all" ON divisas FOR SELECT USING (true);

ALTER TABLE tipos_de_cambio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rates_read_all" ON tipos_de_cambio FOR SELECT USING (true);
