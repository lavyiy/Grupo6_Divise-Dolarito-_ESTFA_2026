-- Prueba con datos sinteticos. ROLLBACK elimina todos los cambios de la prueba.
-- Ejecutar el archivo COMPLETO como postgres en SQL Editor.
BEGIN;
DO $test$
DECLARE
  uid_a uuid := gen_random_uuid();
  uid_b uuid := gen_random_uuid();
  id_a integer := -2000000101;
  id_b integer := -2000000102;
  moneda integer;
  tabla text;
  pk text;
  cantidad integer;
  bloqueado boolean;
BEGIN
  SELECT min(id_divisa) INTO moneda FROM public.divisas;
  IF moneda IS NULL THEN RAISE EXCEPTION 'La prueba requiere una divisa existente'; END IF;

  INSERT INTO auth.users (id, email, aud, role) VALUES
    (uid_a, uid_a::text || '@example.invalid', 'authenticated', 'authenticated'),
    (uid_b, uid_b::text || '@example.invalid', 'authenticated', 'authenticated');
  INSERT INTO public.usuarios (id_usuario, auth_user_id, nombre, email)
    VALUES (id_a, uid_a, 'Prueba A', uid_a::text || '@example.invalid'),
           (id_b, uid_b, 'Prueba B', uid_b::text || '@example.invalid');
  INSERT INTO public.favoritos (id_favorito, id_usuario, id_divisa)
    VALUES (id_a, id_a, moneda), (id_b, id_b, moneda);
  INSERT INTO public.historial_de_consultas (id_historial, id_usuario, par_consultado, valor_momento)
    VALUES (id_a, id_a, 'TEST/ARS', 1), (id_b, id_b, 'TEST/ARS', 1);
  INSERT INTO public.consultas (id_consulta, id_usuario, codigo, nombre, precio)
    VALUES (id_a, id_a, 'TEST', 'Prueba', 1), (id_b, id_b, 'TEST', 'Prueba', 1);
  INSERT INTO public.alertas (id_alerta, id_usuario, codigo_divisa, condicion, valor_limite)
    VALUES (id_a, id_a, 'TEST', 'mayor', 1), (id_b, id_b, 'TEST', 'mayor', 1);

  PERFORM set_config('request.jwt.claim.sub', uid_a::text, true);
  PERFORM set_config('request.jwt.claims', jsonb_build_object('sub',uid_a,'role','authenticated')::text, true);
  SET LOCAL ROLE authenticated;

  SELECT count(*) INTO cantidad FROM public.usuarios;
  IF cantidad <> 1 THEN RAISE EXCEPTION 'RLS perfiles: esperaba solo el perfil propio'; END IF;
  UPDATE public.usuarios SET nombre = 'Cambio propio' WHERE id_usuario = id_a;
  GET DIAGNOSTICS cantidad = ROW_COUNT;
  IF cantidad <> 1 THEN RAISE EXCEPTION 'No permite editar nombre propio'; END IF;
  UPDATE public.usuarios SET nombre = 'Cambio ajeno' WHERE id_usuario = id_b;
  GET DIAGNOSTICS cantidad = ROW_COUNT;
  IF cantidad <> 0 THEN RAISE EXCEPTION 'Permite editar perfil ajeno'; END IF;

  bloqueado := false;
  BEGIN
    UPDATE public.usuarios SET email_verificado = true WHERE id_usuario = id_a;
  EXCEPTION WHEN insufficient_privilege THEN bloqueado := true;
  END;
  IF NOT bloqueado THEN RAISE EXCEPTION 'Permite autoverificar email'; END IF;
  bloqueado := false;
  BEGIN
    PERFORM delete_codigo FROM public.usuarios WHERE id_usuario = id_a;
  EXCEPTION WHEN insufficient_privilege THEN bloqueado := true;
  END;
  IF NOT bloqueado THEN RAISE EXCEPTION 'Expone codigos privados'; END IF;
  bloqueado := false;
  BEGIN
    DELETE FROM public.usuarios WHERE id_usuario = id_a;
  EXCEPTION WHEN insufficient_privilege THEN bloqueado := true;
  END;
  IF NOT bloqueado THEN RAISE EXCEPTION 'Permite una baja parcial sin Auth'; END IF;

  FOREACH tabla IN ARRAY ARRAY['favoritos','historial_de_consultas','consultas','alertas'] LOOP
    EXECUTE format('SELECT count(*) FROM public.%I', tabla) INTO cantidad;
    IF cantidad <> 1 THEN RAISE EXCEPTION 'RLS %: esperaba solo una fila propia', tabla; END IF;
    EXECUTE format('UPDATE public.%I SET id_usuario = $1 WHERE id_usuario = $1', tabla) USING id_a;
    GET DIAGNOSTICS cantidad = ROW_COUNT;
    IF cantidad <> 1 THEN RAISE EXCEPTION 'No permite modificar fila propia en %', tabla; END IF;
    bloqueado := false;
    BEGIN
      EXECUTE format('UPDATE public.%I SET id_usuario = $1 WHERE id_usuario = $2', tabla) USING id_b,id_a;
    EXCEPTION WHEN insufficient_privilege THEN bloqueado := true;
    END;
    IF NOT bloqueado THEN RAISE EXCEPTION 'Permite transferir filas a otro usuario en %', tabla; END IF;
    EXECUTE format('DELETE FROM public.%I WHERE id_usuario = $1', tabla) USING id_b;
    GET DIAGNOSTICS cantidad = ROW_COUNT;
    IF cantidad <> 0 THEN RAISE EXCEPTION 'Permite borrar datos ajenos en %', tabla; END IF;
  END LOOP;

  bloqueado := false;
  BEGIN
    INSERT INTO public.consultas (id_consulta,id_usuario,codigo,nombre,precio)
      VALUES (id_a-2,id_b,'TEST','Ajena',1);
  EXCEPTION WHEN insufficient_privilege THEN bloqueado := true;
  END;
  IF NOT bloqueado THEN RAISE EXCEPTION 'Permite insertar consulta ajena'; END IF;
  bloqueado := false;
  BEGIN
    INSERT INTO public.consultas (id_consulta,id_usuario,codigo,nombre,precio)
      VALUES (id_a-2,NULL,'TEST','Sin titular',1);
  EXCEPTION WHEN insufficient_privilege THEN bloqueado := true;
  END;
  IF NOT bloqueado THEN RAISE EXCEPTION 'Permite insertar consulta sin titular'; END IF;
  INSERT INTO public.consultas (id_consulta,id_usuario,codigo,nombre,precio)
    VALUES (id_a-2,id_a,'TEST','Propia',1);
  DELETE FROM public.consultas WHERE id_consulta=id_a-2;
  GET DIAGNOSTICS cantidad = ROW_COUNT;
  IF cantidad <> 1 THEN RAISE EXCEPTION 'No permite borrar consulta propia'; END IF;

  RESET ROLE;
  UPDATE public.usuarios SET activo=false WHERE id_usuario=id_a;
  SET LOCAL ROLE authenticated;
  FOREACH tabla IN ARRAY ARRAY['usuarios','favoritos','historial_de_consultas','consultas','alertas'] LOOP
    EXECUTE format('SELECT count(*) FROM public.%I', tabla) INTO cantidad;
    IF cantidad <> 0 THEN RAISE EXCEPTION 'Cuenta inactiva accede a %', tabla; END IF;
  END LOOP;
  RESET ROLE;
  UPDATE public.usuarios SET activo=true WHERE id_usuario=id_a;

  SET LOCAL ROLE anon;
  PERFORM id_divisa FROM public.divisas LIMIT 1;
  PERFORM id_tipo_cambio FROM public.tipos_de_cambio LIMIT 1;
  FOREACH tabla IN ARRAY ARRAY['usuarios','favoritos','historial_de_consultas','consultas','alertas','_migrations'] LOOP
    bloqueado := false;
    BEGIN
      EXECUTE format('SELECT count(*) FROM public.%I', tabla) INTO cantidad;
    EXCEPTION WHEN insufficient_privilege THEN bloqueado := true;
    END;
    IF NOT bloqueado THEN RAISE EXCEPTION 'Visitante accede a %', tabla; END IF;
  END LOOP;
  RESET ROLE;

  -- Solo se elimina el Auth ficticio de esta transaccion.
  DELETE FROM auth.users WHERE id=uid_a;
  IF EXISTS(SELECT 1 FROM auth.users WHERE id=uid_a) THEN RAISE EXCEPTION 'Quedo Auth A'; END IF;
  FOREACH tabla IN ARRAY ARRAY['usuarios','favoritos','historial_de_consultas','consultas','alertas'] LOOP
    EXECUTE format('SELECT count(*) FROM public.%I WHERE id_usuario=$1', tabla) INTO cantidad USING id_a;
    IF cantidad <> 0 THEN RAISE EXCEPTION 'El borrado dejo datos en %', tabla; END IF;
    EXECUTE format('SELECT count(*) FROM public.%I WHERE id_usuario=$1', tabla) INTO cantidad USING id_b;
    IF cantidad <> 1 THEN RAISE EXCEPTION 'El borrado afecto al usuario B en %', tabla; END IF;
  END LOOP;

  -- Un JWT antiguo de la cuenta borrada no recupera datos ni recrea su perfil.
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO cantidad FROM public.consultas;
  IF cantidad <> 0 THEN RAISE EXCEPTION 'JWT de cuenta borrada accede a datos'; END IF;
  RESET ROLE;
  bloqueado := false;
  BEGIN
    INSERT INTO public.usuarios (id_usuario,auth_user_id,nombre,email)
      VALUES (id_a,uid_a,'Recreacion',uid_a::text || '@example.invalid');
  EXCEPTION WHEN foreign_key_violation THEN bloqueado := true;
  END;
  IF NOT bloqueado THEN RAISE EXCEPTION 'Se recrea perfil sin cuenta Auth'; END IF;
END;
$test$;
ROLLBACK;
SELECT 'OK: aislamiento, permisos de columnas, visitante, baja en cascada y rollback' AS resultado;
