-- Ejecutar COMPLETO en SQL Editor como postgres. No conserva datos de prueba.
BEGIN;
DO $test$
DECLARE
  usuario_prueba integer := -1999000001;
  moneda integer;
  tabla text;
  cantidad integer;
  perfiles_antes integer;
BEGIN
  SELECT count(*) INTO perfiles_antes FROM public.usuarios;
  SELECT min(id_divisa) INTO moneda FROM public.divisas;
  IF moneda IS NULL THEN RAISE EXCEPTION 'Falta una divisa para las pruebas'; END IF;

  IF EXISTS (
    SELECT 1 FROM pg_class
    WHERE relnamespace='public'::regnamespace AND relkind='r' AND NOT relrowsecurity
  ) THEN RAISE EXCEPTION 'Hay tablas publicas sin RLS'; END IF;

  IF EXISTS (
    SELECT 1
    FROM (VALUES ('USDT','tether'),('BNB','binancecoin'),('DOGE','dogecoin')) AS esperado(codigo,gecko_id)
    LEFT JOIN public.divisas d ON d.codigo=esperado.codigo
    WHERE d.id_divisa IS NULL OR d.tipo IS DISTINCT FROM 'crypto'
      OR d.coingecko_id IS DISTINCT FROM esperado.gecko_id
  ) THEN RAISE EXCEPTION 'Catalogo cripto incorrecto'; END IF;

  INSERT INTO public.usuarios (id_usuario,nombre,email)
    VALUES (usuario_prueba,'Prueba de cascada',gen_random_uuid()::text || '@example.invalid');
  INSERT INTO public.favoritos (id_favorito,id_usuario,id_divisa)
    VALUES (usuario_prueba,usuario_prueba,moneda);
  INSERT INTO public.historial_de_consultas (id_historial,id_usuario,par_consultado,valor_momento)
    VALUES (usuario_prueba,usuario_prueba,'TEST/ARS',1);
  INSERT INTO public.consultas (id_consulta,id_usuario,codigo,nombre,precio)
    VALUES (usuario_prueba,usuario_prueba,'TEST','Prueba',1);
  INSERT INTO public.alertas (id_alerta,id_usuario,codigo_divisa,condicion,valor_limite)
    VALUES (usuario_prueba,usuario_prueba,'TEST','mayor',1);

  DELETE FROM public.usuarios WHERE id_usuario=usuario_prueba;
  FOREACH tabla IN ARRAY ARRAY['usuarios','favoritos','historial_de_consultas','consultas','alertas'] LOOP
    EXECUTE format('SELECT count(*) FROM public.%I WHERE id_usuario=$1',tabla)
      INTO cantidad USING usuario_prueba;
    IF cantidad <> 0 THEN RAISE EXCEPTION 'Quedaron datos del usuario en %',tabla; END IF;
  END LOOP;
  IF (SELECT count(*) FROM public.usuarios) <> perfiles_antes THEN
    RAISE EXCEPTION 'Se modificaron perfiles originales';
  END IF;

  -- Aunque se adopte el rol authenticated, sin identidad no hay datos privados.
  PERFORM set_config('request.jwt.claim.sub','',true);
  PERFORM set_config('request.jwt.claims','{}',true);
  SET LOCAL ROLE authenticated;
  FOREACH tabla IN ARRAY ARRAY['usuarios','favoritos','historial_de_consultas','consultas','alertas'] LOOP
    EXECUTE format('SELECT count(*) FROM public.%I',tabla) INTO cantidad;
    IF cantidad <> 0 THEN RAISE EXCEPTION 'Datos privados sin identidad en %',tabla; END IF;
  END LOOP;
  RESET ROLE;

  PERFORM set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
  PERFORM set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO cantidad FROM public.usuarios;
  IF cantidad <> 0 THEN RAISE EXCEPTION 'Identidad sin perfil lee perfiles ajenos'; END IF;
  RESET ROLE;

  SET LOCAL ROLE anon;
  SELECT count(*) INTO cantidad FROM public.divisas
    WHERE tipo='crypto' AND codigo IN ('USDT','BNB','DOGE');
  IF cantidad <> 3 THEN RAISE EXCEPTION 'Catalogo cripto no disponible para lectura publica'; END IF;
  RESET ROLE;
END;
$test$;
ROLLBACK;
SELECT 'OK: cascada desde usuarios, RLS sin identidad y catalogo cripto' AS resultado;
