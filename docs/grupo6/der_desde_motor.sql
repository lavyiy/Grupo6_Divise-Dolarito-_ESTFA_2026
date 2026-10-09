-- ============================================================
-- DER DESDE EL MOTOR - Proyecto Divise
-- Motor: PostgreSQL (Supabase) - esquema public
-- Uso: pgAdmin (Query Tool) / DBeaver (SQL Editor) / Supabase (SQL Editor)
-- Fecha de extraccion: 06/10/2026
-- Todas las consultas son de SOLO LECTURA sobre el catalogo.
-- ============================================================

-- 1) ENTIDADES (tablas del esquema public)
SELECT c.table_name                         AS entidad,
       obj_description(('public.'||c.table_name)::regclass) AS comentario
FROM information_schema.tables c
WHERE c.table_schema = 'public'
  AND c.table_type   = 'BASE TABLE'
ORDER BY c.table_name;

-- 2) ATRIBUTOS (columnas: tipo, largo, nulidad, defecto)
SELECT table_name       AS entidad,
       ordinal_position AS n,
       column_name      AS atributo,
       data_type        AS tipo,
       CASE
         WHEN data_type = 'character varying' THEN 'varchar('||character_maximum_length||')'
         WHEN data_type = 'numeric'           THEN 'numeric('||numeric_precision||','||numeric_scale||')'
         WHEN data_type = 'integer'           THEN 'integer'
         WHEN data_type = 'uuid'              THEN 'uuid'
         WHEN data_type = 'boolean'           THEN 'boolean'
         WHEN data_type = 'timestamp without time zone' THEN 'timestamp'
         ELSE data_type
       END              AS tipo_natural,
       is_nullable      AS admite_nulo,
       column_default   AS valor_defecto
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3) CLAVE PRIMARIA
SELECT tc.table_name AS entidad,
       kcu.column_name AS atributo,
       kcu.ordinal_position AS orden
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
 AND tc.table_schema   = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema    = 'public'
ORDER BY tc.table_name, kcu.ordinal_position;

-- 4) CLAVES FORANEAS (relaciones del DER, con reglas de integridad)
SELECT rel.relname             AS entidad,
       a.attname               AS atributo,
       rel2.relname            AS entidad_referenciada,
       a2.attname              AS atributo_referenciado,
       con.conname             AS constraint,
       CASE con.confdeltype WHEN 'c' THEN 'CASCADE'
                            WHEN 'n' THEN 'SET NULL'
                            WHEN 'a' THEN 'NO ACTION'
                            WHEN 'r' THEN 'RESTRICT' END AS al_borrar,
       CASE con.confupdtype WHEN 'c' THEN 'CASCADE'
                            WHEN 'n' THEN 'SET NULL'
                            WHEN 'a' THEN 'NO ACTION'
                            WHEN 'r' THEN 'RESTRICT' END AS al_actualizar
FROM pg_constraint con
JOIN pg_class rel     ON rel.oid = con.conrelid
JOIN pg_namespace n   ON n.oid = rel.relnamespace AND n.nspname = 'public'
JOIN pg_class rel2    ON rel2.oid = con.confrelid
JOIN unnest(con.conkey)   WITH ORDINALITY ck(attnum, ord) ON true
JOIN unnest(con.confkey)  WITH ORDINALITY fk(attnum, ord) ON fk.ord = ck.ord
JOIN pg_attribute a       ON a.attrelid  = con.conrelid  AND a.attnum  = ck.attnum
JOIN pg_attribute a2      ON a2.attrelid = con.confrelid AND a2.attnum = fk.attnum
WHERE con.contype = 'f'
ORDER BY rel.relname, a.attnum;

-- 5) CLAVES UNICAS (dominios de negocio)
SELECT rel.relname AS entidad,
       con.contype AS tipo,          -- p = primaria, u = unica
       string_agg(a.attname, ', ' ORDER BY k.ord) AS atributos
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace n ON n.oid = rel.relnamespace AND n.nspname = 'public'
JOIN unnest(con.conkey) WITH ORDINALITY k(attnum, ord) ON true
JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = k.attnum
WHERE con.contype IN ('p','u')
GROUP BY rel.relname, con.conname, con.contype
ORDER BY rel.relname;

-- 6) INDICES (rendimiento)
SELECT tablename AS entidad, indexname AS indice, indexdef AS definicion
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 7) VOLUMEN DE FILAS (para decidir cardinalidades reales)
SELECT relname AS entidad, n_live_tup AS filas_aproximadas
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY relname;

-- 8) POLITICAS RLS (seguridad a nivel de fila)
SELECT c.relname AS tabla, p.polname AS politica,
       CASE WHEN p.polcmd = 'r' THEN 'SELECT'
            WHEN p.polcmd = 'a' THEN 'INSERT'
            WHEN p.polcmd = 'w' THEN 'UPDATE'
            WHEN p.polcmd = 'd' THEN 'DELETE' END AS operacion
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public'
ORDER BY c.relname, p.polname;
