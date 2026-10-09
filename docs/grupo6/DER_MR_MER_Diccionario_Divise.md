# DER, MODELO RELACIONAL (MR) Y DICCIONARIO DE DATOS — Proyecto Divise

## 1. Fuente de los datos

Este modelo se generó **desde el motor de base de datos real**, no a mano.

- Motor: PostgreSQL alojado en Supabase (esquema `public`).
- Fecha de extracción: 06/10/2026.
- Método: consultas de solo lectura sobre el catálogo del sistema (`pg_catalog` y `information_schema`), incluidas en el archivo `der_desde_motor.sql`. Ese script se puede volver a ejecutar tal cual en pgAdmin, DBeaver o el SQL Editor de Supabase y reproduce exactamente los listados siguientes.
- Resultados verificados en el motor: **8 tablas, 60 columnas, 8 relaciones (claves foráneas), 27 índices** y políticas de seguridad a nivel de fila (RLS).

De las 8 tablas, 7 pertenecen al negocio y 1 (`_migrations`) es de control del proceso de migraciones, por lo que no se incluye en el diagrama pero sí en el diccionario.

## 2. De dónde salía la diferencia de nombres

Los nombres antiguos (USUARIO, MONEDA, COTIZACION) provienen del dump MySQL `Dump20260707.sql` (base `cotizaciones_db`), que corresponde a un sprint anterior al esquema actual. Ese dump quedó en la carpeta `codigo/` y es la causa de que las secciones 11, 15 y 19 del documento usen nombres distintos.

| Nombre del documento (sect. 11 y 15) | Nombre real en el motor | Estado |
| --- | --- | --- |
| USUARIO | `usuarios` | Renombrar |
| MONEDA / MONEDAS | `divisas` | `moneda`/`monedas` no existen |
| COTIZACION | `tipos_de_cambio` | `cotizacion` solo existe en el dump MySQL viejo |
| COTIZACIONES_HISTORIAL | no existe | Eliminar; el histórico real es `historial_de_consultas` |
| FAVORITO | `favoritos` | Coincide |
| HISTORIAL_CONSULTA | `historial_de_consultas` | Coincide |
| — (no estaba) | `alertas` | Falta en MR, MER y DER |
| — (no estaba) | `consultas` | Falta en MR, MER y DER |
| — (no estaba) | `_migrations` | Tabla de control, no se dibuja |

Conclusión del profesor: el DER tiene que salir del motor. Con el modelo de esta sección, el MR, el MER y el diccionario quedan alineados con las queries de la sección 19 y con el código real.

## 3. DER (DIAGRAMA ENTIDAD-RELACIÓN)

Se entrega el diagrama `DER_desde_motor.png` (y su versión vectorial `DER_desde_motor.svg`), generado a partir de los datos extraídos del motor. Representa las 7 entidades de negocio más `auth.users` (entidad externa del esquema `auth` de Supabase, con la que `usuarios` se vincula por `auth_user_id`).

Entidades:

- **DIVISAS**: catálogo de monedas y criptoactivos (USD, EUR, BRL, BTC, ETH, USDT, BNB, DOGE…).
- **USUARIOS**: cuentas, credenciales, verificación de email, 2FA y baja lógica.
- **TIPOS_DE_CAMBIO**: cotizaciones de cada divisa por mercado (Oficial, Blue, Cripto) con precio compra/venta.
- **FAVORITOS**: divisas que cada usuario guardó (asociativa USUARIOS–DIVISAS).
- **HISTORIAL_DE_CONSULTAS**: auditoría de las consultas de cada usuario registrado.
- **ALERTAS**: alertas de precio configuradas por el usuario.
- **CONSULTAS**: registros de consultas, incluso de usuarios sin sesión (invitados).
- **AUTH.USERS** (externa): usuarios de autenticación administrados por Supabase Auth.

Relaciones y cardinalidades (1 = lado de la clave primaria, N/0..1 = lado de la clave foránea):

| Relación | Cardinalidad | Reglas de integridad |
| --- | --- | --- |
| DIVISAS 1 ──────⟶ N TIPOS_DE_CAMBIO | 1 a N | ON DELETE CASCADE · ON UPDATE CASCADE |
| USUARIOS 1 ──────⟶ N TIPOS_DE_CAMBIO (vía divisa_base) | — | Sobre `divisas.id_divisa` |
| DIVISAS 1 ──────⟶ N FAVORITOS | 1 a N | ON DELETE CASCADE · ON UPDATE CASCADE |
| USUARIOS 1 ──────⟶ N FAVORITOS | 1 a N | ON DELETE CASCADE · ON UPDATE CASCADE |
| USUARIOS 1 ──────⟶ N HISTORIAL_DE_CONSULTAS | 1 a N | ON DELETE CASCADE · ON UPDATE CASCADE |
| USUARIOS 1 ──────⟶ N ALERTAS | 1 a N | ON DELETE CASCADE |
| USUARIOS 1 ──────⟶ N CONSULTAS | 1 a N | ON DELETE CASCADE · ON UPDATE CASCADE |
| USUARIOS 1 ──────⟶ N DIVISAS (divisa_base_id) | 1 a N | ON DELETE SET NULL · ON UPDATE CASCADE |
| AUTH.USERS 1 ──────⟶ 0..1 USUARIOS (auth_user_id) | 1 a 0..1 | ON DELETE CASCADE; índice único parcial |

## 4. MR (MODELO RELACIONAL) — NOTACIÓN DE CODD

Convención: **negrita y (PK)** = clave primaria; (FK) y `→` = clave foránea y tabla referenciada; se marcan las únicas de negocio con (**UQ**).

- **USUARIOS**( **id_usuario (PK)**, nombre, email (**UQ**), password_hash, divisa_base_id (FK) → DIVISAS, created_at, reset_token, reset_token_expires, email_verificado, verif_codigo, verif_expira, whatsapp_phone, whatsapp_api_key, verif_token, two_factor_enabled, activo, updated_at, deleted_at, auth_user_id (FK, UQ) → AUTH.USERS, delete_codigo, delete_expira )
- **DIVISAS**( **id_divisa (PK)**, codigo (**UQ**), nombre, tipo, created_at, coingecko_id (UQ parcial) )
- **TIPOS_DE_CAMBIO**( **id_tipo_cambio (PK)**, id_divisa (FK) → DIVISAS, precio_compra, precio_venta, tipo_mercado, fecha_actualizacion )
- **FAVORITOS**( **id_favorito (PK)**, id_usuario (FK) → USUARIOS, id_divisa (FK) → DIVISAS, notificacion_activa, created_at, **UQ**(id_usuario, id_divisa) )
- **HISTORIAL_DE_CONSULTAS**( **id_historial (PK)**, id_usuario (FK) → USUARIOS, par_consultado, valor_momento, fecha )
- **ALERTAS**( **id_alerta (PK)**, id_usuario (FK) → USUARIOS, codigo_divisa, condicion, valor_limite, notificada, created_at )
- **CONSULTAS**( **id_consulta (PK)**, id_usuario (FK, nula) → USUARIOS, codigo, nombre, precio, tipo_mercado, fecha )

En la notación de Codd, todas las tablas están en 3FN: no hay dependencias transitivas ni atributos multivaluados; los atributos de cada tabla dependen de su clave primaria completa.

## 5. MER (MODELO ENTIDAD-RELACIÓN)

Descripción conceptual de entidades, identificadores y relaciones:

- **USUARIO**: entidad fuerte. Identificador `id_usuario`. Participa en las relaciones Tiene (FAVORITOS), Registra (HISTORIAL_DE_CONSULTAS), Configura (ALERTAS), Genera (CONSULTAS) y Elige (DIVISA base). Una fila de `usuarios` puede existir sin `auth.users` (cuentas creadas con contraseña local), por eso la relación con AUTH.USERS es opcional (0..1).
- **DIVISA**: entidad fuerte. Identificador `id_divisa`, con alt-key `codigo`. Se relaciona con TIPOS_DE_CAMBIO y FAVORITOS.
- **TIPO_DE_CAMBIO**: entidad fuerte con identificador propio `id_tipo_cambio`; cada uno pertenece a una única DIVISA (1:N). El diseño permite más de un mercado por divisa (Oficial, Blue, Cripto) y conserva el histórico de precios por `fecha_actualizacion` (sincronizado cada 5 minutos).
- **FAVORITO**: entidad asociativa (resuelve la relación N:M USUARIO–DIVISA). Su unicidad real está en la dupla (id_usuario, id_divisa); el `id_favorito` serial es la vista física de la PK.
- **HISTORIAL_DE_CONSULTAS**: entidad fuerte; cada registro pertenece a un USUARIO e incluye el par consultado (`par_consultado`), el `valor_momento` y la `fecha`. Es el sustituto correcto de la inexistente COTIZACIONES_HISTORIAL.
- **ALERTA**: entidad fuerte; cada una pertenece a un USUARIO y referencia una divisa por su código (columna `codigo_divisa`, denormalizada, sin FK). Guarda `condicion` (Sube a / Baja a), `valor_limite` y el flag `notificada` para no disparar la alerta dos veces.
- **CONSULTA**: entidad fuerte; registra consultas de cotizaciones. `id_usuario` admite NULL → permite contabilizar consultas de invitados sin sesión (input para las métricas del modelo de negocio).

## 6. DICCIONARIO DE DATOS

### 6.1. DIVISAS

| Atributo | Tipo | Nulo | Clave | Descripción |
| --- | --- | --- | --- | --- |
| id_divisa | integer (serial) | No | PK | Identificador único de la divisa o criptoactivo |
| codigo | varchar(10) | No | UQ | Código corto: USD, EUR, BRL, BTC, ETH, USDT, BNB, DOGE |
| nombre | varchar(100) | No | — | Nombre visible (Dólar Estadounidense, Bitcoin…) |
| tipo | varchar(50) | No | — | Categoría: Fiat o Cripto (también crypto) |
| created_at | timestamp | Sí | — | Fecha de alta del registro |
| coingecko_id | varchar(100) | Sí | UQ parcial | Identificador en la API CoinGecko (solo cripto) |

### 6.2. USUARIOS

| Atributo | Tipo | Nulo | Clave | Descripción |
| --- | --- | --- | --- | --- |
| id_usuario | integer (serial) | No | PK | Identificador único del usuario |
| nombre | varchar(100) | No | — | Nombre y apellido del usuario |
| email | varchar(150) | No | UQ | Correo electrónico, inicia sesión y recibe alertas |
| password_hash | varchar(255) | Sí | — | Hash bcrypt de la contraseña; es NULL si la cuenta la crea Supabase Auth |
| divisa_base_id | integer | Sí | FK → DIVISAS | Divisa base del usuario para conversiones |
| created_at | timestamp | Sí | — | Fecha de registro |
| reset_token | varchar(255) | Sí | — | Token para recuperar la contraseña (expira en 30 minutos) |
| reset_token_expires | timestamp | Sí | — | Vencimiento del token de recuperación |
| email_verificado | boolean | No | — | Flag de verificación del email |
| verif_codigo | varchar(6) | Sí | — | Código de 6 dígitos enviado para verificar el email |
| verif_expira | timestamp | Sí | — | Vencimiento del código de verificación |
| whatsapp_phone | varchar(20) | Sí | — | Teléfono utilizado para enviar alertas por WhatsApp (CallMeBot) |
| whatsapp_api_key | varchar(100) | Sí | — | Clave del servicio de WhatsApp para alertas |
| verif_token | varchar(64) | Sí | — | Token de verificación por enlace clickeable |
| two_factor_enabled | boolean | No | — | Autenticación en dos pasos (2FA) por email habilitada |
| activo | boolean | No | — | Estado del registro: TRUE = activo (baja lógica) |
| updated_at | timestamp | Sí | — | Última actualización del registro |
| deleted_at | timestamp | Sí | — | Fecha de la baja lógica (soft delete) |
| auth_user_id | uuid | Sí | FK → AUTH.USERS (UQ) | Vínculo opcional con el usuario de Supabase Auth |
| delete_codigo | varchar(6) | Sí | — | Código de confirmación para eliminar la cuenta propia |
| delete_expira | timestamp | Sí | — | Vencimiento del código de eliminación |

### 6.3. TIPOS_DE_CAMBIO

| Atributo | Tipo | Nulo | Clave | Descripción |
| --- | --- | --- | --- | --- |
| id_tipo_cambio | integer (serial) | No | PK | Identificador único de la cotización |
| id_divisa | integer | No | FK → DIVISAS | Divisa cotizada (ON DELETE CASCADE) |
| precio_compra | numeric(18,2) | No | — | Precio de compra |
| precio_venta | numeric(18,2) | No | — | Precio de venta |
| tipo_mercado | varchar(50) | No | — | Mercado: Oficial, Blue, Cripto, etc. |
| fecha_actualizacion | timestamp | No | — | Hora de la última sincronización (cron cada 5 minutos) |

### 6.4. FAVORITOS

| Atributo | Tipo | Nulo | Clave | Descripción |
| --- | --- | --- | --- | --- |
| id_favorito | integer (serial) | No | PK | Identificador único del favorito |
| id_usuario | integer | No | FK → USUARIOS | Dueño del favorito (ON DELETE CASCADE) |
| id_divisa | integer | No | FK → DIVISAS | Divisa guardada (ON DELETE CASCADE) |
| notificacion_activa | boolean | No | — | Permite alertas de precio para esta divisa |
| created_at | timestamp | Sí | — | Fecha en que se guardó |

Restricción de unicidad: **UQ(id_usuario, id_divisa)** → un usuario no puede repetir la misma divisa.

### 6.5. HISTORIAL_DE_CONSULTAS

| Atributo | Tipo | Nulo | Clave | Descripción |
| --- | --- | --- | --- | --- |
| id_historial | integer (serial) | No | PK | Identificador único del registro |
| id_usuario | integer | No | FK → USUARIOS | Usuario que consultó (ON DELETE CASCADE) |
| par_consultado | varchar(100) | No | — | Par consultado, p. ej.: USD→ARS, BTC→USD |
| valor_momento | numeric(18,2) | No | — | Valor de la cotización al momento de la consulta |
| fecha | timestamp | No | — | Fecha y hora de la consulta |

### 6.6. ALERTAS

| Atributo | Tipo | Nulo | Clave | Descripción |
| --- | --- | --- | --- | --- |
| id_alerta | integer (serial) | No | PK | Identificador único de la alerta |
| id_usuario | integer | No | FK → USUARIOS | Usuario que la configuró (ON DELETE CASCADE) |
| codigo_divisa | varchar(20) | No | — | Código de la divisa vigilada (denormalizado, sin FK) |
| condicion | varchar(20) | No | — | Condición: «Sube a» o «Baja a» |
| valor_limite | numeric(18,2) | No | — | Valor que dispara la alerta |
| notificada | boolean | No | — | Evita notificar dos veces la misma pasada |
| created_at | timestamp | Sí | — | Fecha de creación |

### 6.7. CONSULTAS

| Atributo | Tipo | Nulo | Clave | Descripción |
| --- | --- | --- | --- | --- |
| id_consulta | integer (serial) | No | PK | Identificador único de la consulta |
| id_usuario | integer | Sí | FK → USUARIOS | NULA si la consulta la hizo un invitado sin sesión |
| codigo | varchar(20) | No | — | Código de la divisa consultada |
| nombre | varchar(100) | No | — | Nombre de la divisa al momento de consultar |
| precio | numeric(18,2) | No | — | Precio registrado de la consulta |
| tipo_mercado | varchar(50) | Sí | — | Mercado de la consulta (Oficial, Blue, Cripto) |
| fecha | timestamp | No | — | Fecha y hora de la consulta |

### 6.8. TABLA DE CONTROL: _MIGRATIONS

| Atributo | Tipo | Nulo | Clave | Descripción |
| --- | --- | --- | --- | --- |
| id | integer (serial) | No | PK | Identificador de la migración aplicada |
| filename | varchar(255) | No | UQ | Nombre del archivo de migración ejecutado |
| applied_at | timestamp | Sí | — | Fecha de aplicación |

## 7. Índices y claves de negocio

Índices de claves primarias (8): un índice sobre la PK de cada tabla.

Índices únicos de negocio (5): `divisas_codigo_key`, `usuarios_email_key`, `favoritos_id_usuario_id_divisa_key`, `usuarios_auth_user_id_key` y `divisas_coingecko_id_key` (parcial).

Índices de rendimiento (13): `idx_tipos_de_cambio_divisa`, `idx_favoritos_usuario`, `idx_favoritos_divisa`, `idx_historial_usuario`, `idx_historial_fecha`, `idx_alertas_usuario`, `idx_alertas_notificada`, `idx_consultas_usuario`, `idx_consultas_fecha`, `idx_usuarios_activo`, `idx_usuarios_deleted_at`, `idx_usuarios_divisa_base_id`, `idx_usuarios_auth_user_id`.

## 8. Seguridad a nivel de fila (RLS) y esquema externo

- Las tablas de negocio tienen activado Row Level Security; las políticas principales son: `users_select_own`, `users_update_own`, `users_delete_own`, `history_own_only`, `favorites_own_only`, `alerts_own_only`, `consultas_auth_own`, `divisas_read_all` y `rates_read_all`. Es decir: cada usuario solo ve/edita su propia información, y divisas e histórico de precios son de solo lectura pública.
- `usuarios.auth_user_id` referencia a `auth.users` (esquema `auth` de Supabase, externo al catálogo propio). En el DER se dibuja fuera del esquema `public`.

## 9. Correcciones a aplicar en el documento entregado

1. **Sección 11 (MR y MER):** reemplazar las entidades USUARIO, MONEDA y COTIZACION por `usuarios`, `divisas` y `tipos_de_cambio`; agregar `alertas` y `consultas`, que faltaban; eliminar cualquier referencia a COTIZACIONES_HISTORIAL y MONEDAS.
2. **Sección 15 (DER):** reemplazar el diagrama dibujado a mano por el del motor (`DER_desde_motor.png` / `.svg`) e incluir como anexo el script `der_desde_motor.sql` que lo reproduce.
3. **Sección 19 (queries):** los campos `activo`, `deleted_at`, `two_factor_enabled`, `reset_token`, `email_verificado` y `whatsapp_phone` que usan las queries SÍ existen en el esquema real (migraciones 003, 005 y 010); ahora quedan documentados en el diccionario. Documentar además que `alertas.codigo_divisa` está denormalizada (VARCHAR(20), sin FK) y que la tabla `consultas` no tiene queries propias en esa sección (registra consultas de invitados).
4. **Registrar el matiz de la arquitectura:** `usuarios` puede existir sin `auth.users` (contraseña local) y viceversa (registro social sin perfil local completo). El DER espeja esa opcionalidad.
5. **No usar el dump MySQL** `Dump20260707.sql` (esquema `cotizaciones_db`, nombres moneda/cotizacion) como fuente de los diagramas: es de un sprint anterior y quedó obsoleto.