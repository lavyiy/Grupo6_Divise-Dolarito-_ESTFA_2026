-- Solo lectura. Para SQL Editor de Supabase.
SELECT c.relname AS tabla, c.relrowsecurity AS rls_habilitado,
  (SELECT count(*) FROM pg_policy p WHERE p.polrelid=c.oid) AS politicas
FROM pg_class c
WHERE c.relnamespace='public'::regnamespace AND c.relkind='r'
ORDER BY c.relname;

SELECT conrelid::regclass AS tabla, conname AS relacion,
  pg_get_constraintdef(oid) AS definicion
FROM pg_constraint
WHERE contype='f' AND (
  confrelid='public.usuarios'::regclass OR
  (conrelid='public.usuarios'::regclass AND confrelid='auth.users'::regclass)
);

SELECT (SELECT count(*) FROM auth.users) AS cuentas_auth,
  count(*) AS perfiles,
  count(*) FILTER (WHERE auth_user_id IS NULL) AS perfiles_sin_vincular
FROM public.usuarios;

SELECT
  has_table_privilege('anon','public.consultas','SELECT') AS visitante_puede_leer_consultas,
  has_table_privilege('authenticated','public.consultas','TRUNCATE') AS usuario_puede_vaciar_consultas,
  has_column_privilege('authenticated','public.usuarios','nombre','UPDATE') AS puede_editar_nombre,
  has_column_privilege('authenticated','public.usuarios','email_verificado','UPDATE') AS puede_autoverificar_email,
  has_column_privilege('authenticated','public.usuarios','delete_codigo','SELECT') AS puede_leer_codigo_privado;

SELECT tablename,policyname,roles,cmd,qual,with_check
FROM pg_policies WHERE schemaname='public'
ORDER BY tablename,cmd;
