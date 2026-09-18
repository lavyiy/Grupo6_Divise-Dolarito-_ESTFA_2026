-- Complementa 006 sin cambiar sus archivos ni eliminar politicas existentes.
-- El backend actual usa postgres y JWT propio: debe validar la titularidad.
-- Estas politicas protegen el acceso directo via Supabase Auth/Data API.
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS auth_user_id UUID;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.usuarios ALTER COLUMN password_hash DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_auth_user_id_key
  ON public.usuarios(auth_user_id) WHERE auth_user_id IS NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='usuarios_auth_user_id_fkey'
                 AND conrelid='public.usuarios'::regclass) THEN
    ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_auth_user_id_fkey
      FOREIGN KEY(auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER POLICY users_select_own ON public.usuarios TO authenticated
  USING (auth_user_id=(SELECT auth.uid()) AND activo AND deleted_at IS NULL);
ALTER POLICY users_update_own ON public.usuarios TO authenticated
  USING (auth_user_id=(SELECT auth.uid()) AND activo AND deleted_at IS NULL)
  WITH CHECK (auth_user_id=(SELECT auth.uid()) AND activo AND deleted_at IS NULL);
ALTER POLICY users_delete_own ON public.usuarios TO authenticated
  USING (auth_user_id=(SELECT auth.uid()) AND activo AND deleted_at IS NULL);

-- Las reglas nuevas y las heredadas deben exigir la misma titularidad.
DO $$
DECLARE item record; predicate text;
BEGIN
  FOR item IN SELECT * FROM (VALUES
    ('favoritos','favorites_own_only'),
    ('historial_de_consultas','history_own_only'),
    ('alertas','alerts_own_only'),
    ('consultas','consultas_auth_own')
  ) AS targets(table_name,policy_name) LOOP
    IF to_regclass('public.' || item.table_name) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',item.table_name);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC,anon,authenticated',item.table_name);
    EXECUTE format('GRANT SELECT,INSERT,UPDATE,DELETE ON public.%I TO authenticated',item.table_name);
    predicate := 'id_usuario IN (SELECT u.id_usuario FROM public.usuarios u '
      || 'WHERE u.auth_user_id=(SELECT auth.uid()) AND u.activo AND u.deleted_at IS NULL)';
    IF EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public'
              AND tablename=item.table_name AND policyname=item.policy_name) THEN
      EXECUTE format('ALTER POLICY %I ON public.%I TO authenticated USING (%s) WITH CHECK (%s)',
        item.policy_name,item.table_name,predicate,predicate);
    ELSE
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (%s) WITH CHECK (%s)',
        item.policy_name,item.table_name,predicate,predicate);
    END IF;
  END LOOP;
  IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public'
                 AND tablename='usuarios' AND policyname='usuarios_insert_own') THEN
    CREATE POLICY usuarios_insert_own ON public.usuarios FOR INSERT TO authenticated
      WITH CHECK(auth_user_id=(SELECT auth.uid()) AND activo AND deleted_at IS NULL);
  END IF;
END $$;

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.usuarios FROM PUBLIC,anon,authenticated;
GRANT SELECT (id_usuario,auth_user_id,nombre,email,divisa_base_id,created_at,
  email_verificado,whatsapp_phone,two_factor_enabled,activo,updated_at,deleted_at)
  ON public.usuarios TO authenticated;
GRANT INSERT (auth_user_id,nombre,email,divisa_base_id,whatsapp_phone,whatsapp_api_key)
  ON public.usuarios TO authenticated;
GRANT UPDATE (nombre,divisa_base_id,whatsapp_phone,whatsapp_api_key)
  ON public.usuarios TO authenticated;
GRANT USAGE ON SEQUENCE public.usuarios_id_usuario_seq,
  public.favoritos_id_favorito_seq,public.historial_de_consultas_id_historial_seq,
  public.alertas_id_alerta_seq TO authenticated;

ALTER TABLE public.divisas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_de_cambio ENABLE ROW LEVEL SECURITY;
ALTER POLICY divisas_read_all ON public.divisas TO anon,authenticated USING(true);
ALTER POLICY rates_read_all ON public.tipos_de_cambio TO anon,authenticated USING(true);
REVOKE ALL ON public.divisas,public.tipos_de_cambio FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.divisas,public.tipos_de_cambio TO anon,authenticated;
ALTER TABLE public._migrations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public._migrations FROM PUBLIC,anon,authenticated;
