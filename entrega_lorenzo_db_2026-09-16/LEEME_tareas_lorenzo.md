# DIVISE: entrega de Lorenzo - Base de datos

Revision final: 16 de septiembre de 2026.
Proyecto Supabase: `base de datos` (`jdykctocvbhojditregf`).
Repositorio: https://github.com/lavyiy/Grupo6_Divise-Dolarito-_ESTFA_2026
Los cambios de codigo parten del commit `ea699c1`. No se hizo commit, push ni despliegue.

## Que podes marcar como hecho

| Punto | Estado | Alcance |
| --- | --- | --- |
| 1. Eliminar perfil, DB completa | Hecho en la base | FK en cascada verificadas y probadas; baja definitiva disponible mediante Auth |
| 2. Politicas RLS | Hecho en Supabase | Todas las tablas publicas protegidas; aislamiento y acceso sin identidad probados |
| 3. Agregar USDT, BNB y Dogecoin | Hecho en Supabase | Registros existentes conservados; categoria `crypto` e IDs CoinGecko correctos |
| 16. Criptos visibles en la pagina | Codigo preparado y probado localmente | Falta integrar/publicar backend y frontend y comprobar el sitio desplegado |

No se borro ningun usuario real. Las pruebas de eliminacion crearon registros ficticios dentro de una transaccion y terminaron con ROLLBACK.

## 1. Eliminacion de perfil

Se verifico el circuito de hard delete:

`auth.users -> usuarios -> favoritos / historial_de_consultas / consultas / alertas`

Todas esas relaciones usan `ON DELETE CASCADE`. Eliminar un perfil desde `usuarios` borra sus registros dependientes, pero NO borra hacia arriba la cuenta de Auth. Para una baja completa con Supabase Auth se debe iniciar la eliminacion en Auth mediante su API administrativa, no con un DELETE directo del navegador.

La Edge Function `eliminar-mi-cuenta` ya esta publicada y activa. Requiere un JWT valido de Supabase Auth y el cuerpo `{"confirmacion":"ELIMINAR MI CUENTA"}`. Comprueba la identidad y el perfil vinculado, revoca sesiones y elimina la cuenta de Auth. El frontend debe pedir confirmacion al usuario y limpiar su sesion despues del exito.

La base no tiene una tabla separada llamada `notificaciones`: los registros relacionados con avisos estan en `alertas`. Divisas, cotizaciones compartidas y datos de otros usuarios se conservan. Esta baja no elimina copias de seguridad ni datos externos.

No se concede DELETE directo sobre `usuarios` a `authenticated`, para evitar una baja parcial que deje la cuenta de Auth existente. Los JWT emitidos no desaparecen magicamente: los servicios deben comprobar la identidad y que la cuenta siga existiendo. Las pruebas confirman que un perfil eliminado ya no obtiene filas privadas mediante RLS.

## 2. RLS y permisos

Se corrigio una politica del repositorio que permitia leer cualquier perfil con `USING (true)`. La condicion ahora exige `auth_user_id = auth.uid()`, perfil activo y sin `deleted_at`. Las politicas de favoritos, historial, consultas y alertas comprueban la misma titularidad.

| Acceso | Tablas publicas de lectura | Tablas privadas |
| --- | --- | --- |
| Sin sesion | `divisas`, `tipos_de_cambio` | Sin acceso |
| Con Supabase Auth | `divisas`, `tipos_de_cambio` | Solo registros propios de una cuenta activa |

`_migrations` queda sin acceso para visitantes y clientes autenticados. Los permisos de columnas impiden leer hashes, codigos y tokens privados, cambiar la identidad o autoverificarse. La clave WhatsApp puede escribirse en campos permitidos, pero no leerse desde el cliente.

**Pendiente del equipo de backend:** el codigo actual usa JWT propio y conexion PostgreSQL privilegiada, que omite RLS. Todavia no usa Supabase Auth. El 16/09 se observaron 6 perfiles, ninguno vinculado a Auth, y 0 cuentas en Auth. Las cuentas existentes deben migrarse/vincularse verificando su identidad; no asignar UUIDs al azar ni confiar solo en un email enviado por el navegador. Tampoco se agrego un trigger automatico de creacion de perfiles.

Hasta completar esa integracion, el backend debe seguir validando autenticacion y titularidad en cada consulta. RLS no reemplaza esas validaciones cuando se usa `postgres` o `service_role`. Nunca exponer esas credenciales en el frontend.

## 3. Catalogo cripto

Las tres monedas ya existian en la base. No se duplicaron ni se reemplazaron sus IDs o cotizaciones. Se normalizo `tipo = 'crypto'` y se agrego `coingecko_id` con indice unico para los valores no nulos.

| Codigo | CoinGecko ID |
| --- | --- |
| BTC | bitcoin |
| ETH | ethereum |
| USDT | tether |
| BNB | binancecoin |
| DOGE | dogecoin |

Los IDs se comprobaron contra el catalogo publico de CoinGecko. No se insertaron precios inventados. Se ajusto el sincronizador local para obtener USDT desde `tether`, en vez de guardar siempre 1 USD; si la consulta falla, conserva la cotizacion anterior.

## 16. Conexion con la pantalla

Cambios incluidos en la carpeta `codigo`:

- `server/routes/ratesRoutes.js`: entrega la ultima cotizacion por divisa y mercado, con `tipo`, `coingecko_id`, compra, venta y fecha. Conserva los nombres de campos anteriores.
- `server/index.js`: agrega `/api/cotizaciones`, manteniendo `/api/rates`.
- `server/services/syncService.js`: consulta el precio de USDT a CoinGecko.
- `src/services/api.js`: agrega la consulta del frontend a `/api/cotizaciones`.
- `src/services/rateTypes.mjs`: reconoce `crypto` y la categoria anterior `Cripto`; no confunde un dolar fiat negociado en mercado cripto con una criptomoneda.
- `src/pages/Dashboard/Divisas.jsx`: muestra los resultados de la base, su fecha y un error con reintento si falla la API. Quita los porcentajes y minigraficos ficticios de esta vista.
- Archivos `*.test.js` y `*.test.mjs`: pruebas automatizadas del endpoint, clasificador y sincronizacion de USDT.

La comprobacion visual uso el componente real y el router real con una captura de cotizaciones publicas de Supabase, sin autenticar una cuenta. Se probaron escritorio (1440 px), movil (390 px), cinco criptos, busqueda, filtro fiat, error de API y reintento. Las capturas incluidas no son una promesa de precios actuales: reflejan ese conjunto de prueba.

La pagina publicada NO fue modificada. La comprobacion de `/api/cotizaciones` en el host de API identificado termino por timeout; no permite afirmar que esa ruta funcione en produccion. Las pruebas locales no sustituyen la verificacion posterior al despliegue.

## Que hacer con esta entrega

1. Entregar este ZIP a Santino/Santiago. La carpeta `codigo` contiene SOLO archivos nuevos o modificados, no todo el proyecto. Integrarlos revisando los cambios frente al commit de origen; no reemplazar ciegamente una version mas nueva del equipo.
2. Publicar primero el backend con `/api/cotizaciones`. Confirmar su conexion a la base y que devuelve USDT, BNB y DOGE con `tipo = 'crypto'`.
3. En el frontend, configurar `VITE_API_URL` con el origen correcto del backend, sin agregar `/api` al final. Mantener el dominio de Netlify permitido en CORS.
4. Compilar y desplegar el frontend en Netlify. En Cotizaciones > Cripto comprobar BTC, ETH, USDT, BNB y DOGE, incluidos los filtros y errores de conexion.
5. Completar aparte la integracion de Supabase Auth y probar la baja desde la pagina con una cuenta de prueba. Esa tarea de backend no esta terminada por haber configurado la base.

**Las migraciones 009 y 010 ya estan aplicadas y registradas en este Supabase. No necesitas volver a pegar todo el SQL.** Son cambios incrementales, no un dump ni un script para recrear la base desde cero. En otro entorno requieren el esquema y migraciones anteriores del proyecto. No ejecutar la antigua 006 por separado despues de 010: reintroduciria reglas incorrectas o fallaria por politicas existentes.

## Archivos SQL y funcion

- `codigo/server/migrations/009_crypto_catalog.sql`: catalogo `crypto` y IDs CoinGecko.
- `codigo/server/migrations/010_harden_rls_supabase_auth.sql`: complemento de las politicas previas y permisos de clientes.
- `sql/supabase_consulta_criptos_dashboard.sql`: consulta de lectura para revisar las criptos y sus cotizaciones en SQL Editor.
- `sql/supabase_pruebas_tareas_lorenzo.sql`: prueba de catalogo, cascada desde usuarios y RLS sin identidad; usa ROLLBACK.
- `sql/supabase_pruebas_eliminacion_rls.sql`: prueba con dos identidades ficticias, aislamiento, columnas privadas, cuenta inactiva y cascada desde Auth; usa ROLLBACK.
- `sql/supabase_verificar_eliminacion_rls.sql`: consultas de inspeccion, sin modificar datos.
- `supabase/functions/eliminar-mi-cuenta/`: codigo y pruebas de la funcion ya publicada; `supabase/config.toml` exige JWT.

Los SQL de pruebas deben ejecutarse COMPLETOS como administrador en SQL Editor. No ejecutar solo fragmentos de alta o baja. No van en MySQL Workbench: esta entrega corresponde a PostgreSQL/Supabase.

## Verificacion

- Dos suites SQL de aislamiento/cascada: aprobadas con ROLLBACK.
- Seguridad de Supabase: ninguna alerta del asesor; todas las tablas de `public` con RLS.
- Prueba HTTP sin JWT: tablas privadas rechazadas, catalogo publico accesible.
- Ocho pruebas locales de API, tipos y USDT: aprobadas.
- Compilacion Vite: aprobada.
- Prueba visual y funcional local con Playwright: aprobada en escritorio y movil, sin errores JavaScript ni desbordamiento horizontal.

Desde la raiz del repositorio, ejecutar:

```sh
node --test codigo/server/routes/ratesRoutes.test.js codigo/server/services/syncService.test.js codigo/src/services/rateTypes.test.mjs
```

Para compilar, ejecutar `npm run build` dentro de `codigo` despues de instalar las dependencias del proyecto.

## Observaciones para una siguiente etapa

- El sincronizador existente actualiza cotizaciones, no construye una serie historica inmutable. Para graficos reales deben acordar un almacenamiento historico y su periodicidad.
- Las cotizaciones actuales no guardan explicitamente su moneda de referencia. El codigo trata criptos como USD y divisas fiat como ARS; formalizar ese dato evita conversiones ambiguas.
- La precision de dos decimales limita monedas de precio bajo. Evaluar mayor precision antes de ampliar el catalogo.
- Otras pantallas conservan su logica anterior de precios/variaciones. Esta entrega modifica la vista Cotizaciones; no es una auditoria completa de todos los modulos de frontend.
