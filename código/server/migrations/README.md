# Política de Migraciones — Divise / Dolarito

## Convención de naming

```
NNN_descripcion_corta.sql
```

- `NNN` = número secuencial con ceros a la izquierda (001, 002, …)
- `descripcion_corta` = snake_case, descriptivo del cambio
- Ejemplos:
  - `001_init_schema.sql`
  - `002_seed_data.sql`
  - `003_add_column_avatar_usuarios.sql`

## Carpeta

```
server/
└── migrations/
    ├── 001_init_schema.sql
    ├── 002_seed_data.sql
    └── ...
```

## Herramienta

Las migraciones se corren con el script `migrate.js` ubicado en `/server/`:

```bash
node migrate.js
```

Este script lee todos los archivos de `/migrations/` en orden y los ejecuta
contra la base de datos solo si aún no fueron aplicados (tracking en tabla
`_migrations`).

## Reglas

1. **Nunca editar** una migración ya aplicada. Crear una nueva.
2. Los archivos deben ser **idempotentes** cuando sea posible (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`).
3. El número de secuencia es **permanente**; no se reutilizan números.
4. Antes de un deploy, ejecutar `node migrate.js` para aplicar migraciones pendientes.
