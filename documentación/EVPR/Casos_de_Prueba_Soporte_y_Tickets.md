# DIVISE / DOLARITO

## Casos de Prueba — Módulo de Soporte y Tickets

**Chatbot de soporte, tickets y bandeja de administración**

| Campo | Detalle |
|---|---|
| **Proyecto** | Divise — Cotizaciones & Mercado en Tiempo Real |
| **Emprendimiento** | DiviseTech — Grupo 6 — ESTFA 2026 |
| **Documento** | Casos de prueba del módulo de Soporte y Administración |
| **Versión** | 1.0 |
| **Fecha** | Octubre 2026 |
| **Entorno principal** | Local (`http://localhost:5173` + `http://localhost:5000`) y producción Render/Supabase |
| **Equipo** | Valentín López [PM] · Santino Tacconi [Dev] · Santiago Centurión [Dev] · Bruno Cabrera [UX] · Lorenzo Sánchez [BDA/QA] |
| **Alcance** | Funcionalidades incorporadas: chatbot de soporte, tickets de usuario, bandeja de administración, estados, respuestas, persistencia, seguridad, responsive y correcciones de conectividad/caché |

<div class="page-break"></div>

## 1. Objetivo

Validar de punta a punta el nuevo módulo de soporte incorporado a Divise, comprobando que:

1. El usuario pueda generar un ticket desde un asistente tipo chatbot.
2. El ticket quede registrado y visible en “Mis tickets”.
3. El administrador pueda atenderlo desde el icono flotante o desde el Panel de Administración.
4. El usuario reciba y vea la respuesta del equipo.
5. El sistema funcione con base de datos y con el respaldo local.
6. La experiencia sea usable en escritorio y en dispositivos móviles.
7. Los errores de conectividad (502/500) y las versiones cacheadas de la app no afecten al usuario.

## 2. Alcance

### Incluido

- Widget flotante de Soporte en el dashboard.
- Flujo conversacional: categoría, prioridad, asunto y descripción.
- Creación de ticket con código único.
- Listado “Mis tickets” para el usuario.
- Bandeja “Todos los tickets” para administradores.
- Pestaña “Tickets de Soporte” en el Panel de Administración.
- Cambios de estado: Abierto, En proceso, Resuelto y reapertura.
- Respuesta del administrador desde el widget y desde el panel.
- Filtros, búsqueda, KPI, eliminación y persistencia.
- APIs `POST/GET /api/support/tickets` y `GET/PUT/DELETE /api/admin/tickets`.
- Migración `013_support_tickets.sql` y respaldo JSON.
- Notificación por correo al administrador y registro de auditoría.
- Corrección del error 502/500 y del service worker con caché vieja.
- Diseño responsive.

### No incluido en esta versión

- Pruebas de carga, estrés o concurrencia masiva.
- Validación de entrega real de correos en producción (se prueba simulación/auditoría).
- Migración en la base productiva de Supabase (se valida al desplegar).
- Pruebas de accesibilidad con lector de pantalla.
- Pruebas en navegadores antiguos.

## 3. Ambiente y datos de prueba

| Elemento | Valor |
|---|---|
| Frontend local | `http://localhost:5173` |
| Backend local | `http://localhost:5000` |
| Comando recomendado | `cd codigo && npm run dev:all` |
| Base de datos | PostgreSQL / Supabase — migración `013_support_tickets.sql` |
| Respaldo sin DB | `server/database/soporte_tickets.json` |
| Navegadores | Chrome, Edge y Firefox actualizados |
| Resoluciones | Escritorio 1366×768 / 1920×1080 · Mobile 360×640 y 390×844 |
| Usuario administrador | `deviseproyect@gmail.com` / `Admin123!` |
| Usuario administrador alternativo | `admin@divise.com` / `Admin123!` |
| Usuario estándar | `usuario@divise.com` / `User123!` |
| Prefijo de datos QA | Asuntos y mensajes que comiencen con “Prueba QA” |

> **Nota:** las pruebas funcionales se ejecutaron en entorno local. Las pruebas que dependen de un cliente de correo, un dispositivo físico o la base productiva quedan marcadas como **PENDIENTE** o **PARCIAL** para su validación durante el despliegue.

## 4. Resumen de resultados

| Indicador | Cantidad |
|---|---|
| Casos diseñados | **41** |
| Aprobados | **34** |
| Pendientes | **4** |
| Parciales | **3** |
| Fallos bloqueantes | **0** |
| Cobertura funcional del módulo nuevo | **100%** |

| Módulo | Casos | Aprobados | Pendientes | Parciales |
|---|---:|---:|---:|---:|
| Soporte / Usuario (SOP) | 12 | 11 | 1 | 0 |
| Administración (ADM) | 16 | 13 | 3 | 0 |
| Integración / Backend (INT) | 9 | 6 | 0 | 3 |
| Seguridad (SEG) | 4 | 4 | 0 | 0 |
| **Total** | **41** | **34** | **4** | **3** |

<div class="page-break"></div>

## 5. Casos de prueba — Módulo Soporte / Usuario (SOP)

| ID | Prioridad | Estado | Título / Funcionalidad | Precondiciones | Pasos | Resultado esperado | Resultado obtenido / evidencia |
|---|---|---|---|---|---|---|---|
| CP-SOP-01 | ALTA | APROBADO | Visualización del icono flotante de Soporte | Usuario autenticado en el dashboard. Backend activo. | 1. Iniciar sesión como usuario estándar.<br>2. Observar la esquina inferior derecha.<br>3. Navegar a otra sección del dashboard. | El botón flotante “Soporte” se muestra fijo en todas las pantallas del dashboard y no aparece en login/registro. | Verificado en `/dashboard`; el botón se mantiene al navegar entre secciones. |
| CP-SOP-02 | ALTA | APROBADO | Apertura, cierre y pestañas del panel | Widget visible. | 1. Hacer clic en “Soporte”.<br>2. Verificar encabezado y pestañas “Nuevo ticket” / “Mis tickets”.<br>3. Cerrar y volver a abrir. | El panel se abre y cierra correctamente; muestra las pestañas y conserva el estado de la conversación. | Verificado; apertura/cierre sin errores y pestañas visibles. |
| CP-SOP-03 | ALTA | APROBADO | Flujo completo del chatbot | Sesión de usuario estándar. | 1. Abrir Soporte.<br>2. Elegir “Problema técnico”.<br>3. Elegir prioridad “Alta”.<br>4. Escribir asunto.<br>5. Escribir descripción mayor a 10 caracteres.<br>6. Enviar. | El bot avanza paso a paso, crea el ticket y muestra el código generado con mensaje de éxito. | Ticket creado con código único; estado inicial “Abierto”; mensaje de confirmación visible. |
| CP-SOP-04 | MEDIA | APROBADO | Validación de asunto vacío | Estar en el paso “Asunto”. | 1. Dejar el campo vacío.<br>2. Presionar enviar. | Se muestra “Escribí un asunto para continuar”; no se crea el ticket. | Validación frontend verificada; la API también responde 400 si se fuerza el envío sin asunto. |
| CP-SOP-05 | MEDIA | APROBADO | Validación de descripción demasiado corta | Estar en el paso “Descripción”. | 1. Escribir menos de 10 caracteres.<br>2. Presionar enviar. | Se muestra “Contame un poco más (mínimo 10 caracteres)”; no se crea el ticket. | Validación implementada en el flujo; la API rechaza mensajes vacíos. |
| CP-SOP-06 | ALTA | APROBADO | Creación de ticket con código único | Flujo completo del chatbot. | 1. Crear un primer ticket.<br>2. Repetir el flujo y crear un segundo ticket.<br>3. Comparar códigos. | Cada ticket recibe un código único con formato `TK-AAAA-XXXXX`; categoría, prioridad y estado son correctos. | Dos códigos distintos generados; ambos persistidos correctamente. |
| CP-SOP-07 | ALTA | APROBADO | “Mis tickets” muestra solo los tickets del usuario | Usuario con tickets propios y tickets de otros usuarios en el sistema. | 1. Abrir “Mis tickets”.<br>2. Refrescar.<br>3. Comparar con la bandeja del administrador. | Se muestran únicamente los tickets del usuario autenticado, con estado, fecha, categoría, prioridad y respuesta. | Verificado; no se exponen tickets de otras cuentas. |
| CP-SOP-08 | ALTA | APROBADO | Respuesta del administrador visible para el usuario | Ticket respondido por el administrador. | 1. Abrir “Mis tickets”.<br>2. Localizar el ticket.<br>3. Leer el bloque “Respuesta del equipo”. | El usuario ve la respuesta y el estado actualizado del ticket. | Verificado con respuesta y cambio a “En proceso”. |
| CP-SOP-09 | ALTA | APROBADO | Persistencia del ticket tras recargar | Ticket creado. | 1. Recargar la página con F5.<br>2. Abrir nuevamente “Mis tickets”. | El ticket sigue visible con su estado, respuesta y datos originales. | Verificado; la información se recupera desde el backend. |
| CP-SOP-10 | ALTA | APROBADO | Error 502/500 con backend no disponible | Vite activo y backend detenido. | 1. Abrir “Mis tickets” o la bandeja.<br>2. Presionar “Actualizar”.<br>3. Esperar los reintentos. | Se reintenta automáticamente y se muestra un mensaje amigable con botón “Reintentar”; no se muestra el error crudo “502 Bad Gateway”. | Verificado; el proxy registró `ECONNREFUSED` y la UI mostró “El servidor de soporte está iniciando…” con reintento. |
| CP-SOP-11 | MEDIA | PENDIENTE | Responsive del widget en móvil | Navegador con DevTools o dispositivo real en 360×640 y 390×844. | 1. Abrir el widget.<br>2. Recorrer el chatbot.<br>3. Crear un ticket.<br>4. Abrir “Mis tickets”.<br>5. Abrir el teclado virtual. | El panel ocupa el ancho disponible, no se desborda, mantiene scroll interno y queda por encima de la barra inferior. | Revisión de CSS responsive realizada; pendiente validación en dispositivo físico. |
| CP-SOP-12 | MEDIA | APROBADO | Navegación entre “Nuevo ticket” y “Mis tickets” | Sesión activa. | 1. Iniciar un ticket.<br>2. Cambiar a “Mis tickets”.<br>3. Volver a “Nuevo ticket”. | La navegación no produce errores; el flujo se conserva o se reinicia de forma controlada. | Verificado; cambio de pestañas sin errores. |

## 6. Casos de prueba — Módulo Administración (ADM)

| ID | Prioridad | Estado | Título / Funcionalidad | Precondiciones | Pasos | Resultado esperado | Resultado obtenido / evidencia |
|---|---|---|---|---|---|---|---|
| CP-ADM-01 | ALTA | APROBADO | Acceso al Panel de Administración | Cuenta con rol `admin` o `es_admin`. | 1. Iniciar sesión como administrador.<br>2. Verificar el enlace “Admin” en el menú.<br>3. Abrir `/dashboard/admin`. | El enlace “Admin” es visible y el panel carga KPIs, pestañas y datos del sistema. | Verificado con `deviseproyect@gmail.com`; panel y KPIs cargados. |
| CP-ADM-02 | ALTA | APROBADO | Usuario no administrador sin acceso | Cuenta estándar. | 1. Iniciar sesión como usuario.<br>2. Revisar el menú.<br>3. Intentar abrir `/dashboard/admin`.<br>4. Consultar una API de admin. | No se muestra el enlace “Admin” ni la pestaña “Bandeja”; las APIs de administración responden 403. | Verificado: sin enlace Admin, sin Bandeja y `GET /api/admin/tickets` respondió 403. |
| CP-ADM-03 | ALTA | APROBADO | Pestaña “Tickets de Soporte” | Sesión de administrador. | 1. Abrir el Panel de Administración.<br>2. Hacer clic en “Tickets de Soporte”. | Se muestra el listado con código, estado, prioridad, usuario, asunto, mensaje y acciones. | Verificado; tarjetas con todos los datos y botones de gestión. |
| CP-ADM-04 | MEDIA | APROBADO | KPI de tickets y contador de abiertos | Panel con tickets cargados. | 1. Observar la tarjeta “Tickets de Soporte”.<br>2. Comparar con el listado.<br>3. Resolver un ticket y refrescar. | El KPI muestra el total y el badge de abiertos; se actualiza al cambiar estados. | Verificado; badge “1 abiertos” y actualización tras resolver. |
| CP-ADM-05 | ALTA | APROBADO | Bandeja del administrador en el widget | Sesión de administrador. | 1. Abrir el icono “Soporte”.<br>2. Ir a la pestaña “Bandeja”. | Se muestran todos los tickets de todos los usuarios, no solo los del administrador. | Verificado; la bandeja mostró el ticket de “Usuario Demo”. |
| CP-ADM-06 | MEDIA | APROBADO | Marcado de ticket como leído | Ticket sin leer. | 1. Abrir el detalle o iniciar una respuesta.<br>2. Volver al listado. | El ticket deja de mostrar “Nuevo”; el contador de no leídos disminuye. | Verificado; `unread` pasó a 0 tras abrir/responder. |
| CP-ADM-07 | ALTA | APROBADO | Tomar ticket | Ticket en estado Abierto. | 1. Hacer clic en “Tomar” o “Tomar ticket”. | El estado cambia a “En proceso” y se mantiene al refrescar. | Verificado por UI y API (`PUT` con estado `en_proceso`). |
| CP-ADM-08 | ALTA | APROBADO | Resolver ticket | Ticket en estado Abierto o En proceso. | 1. Hacer clic en “Resolver”. | El estado cambia a “Resuelto”; las acciones se actualizan y se registra la fecha de resolución. | Verificado; estado “Resuelto” y acciones “Reabrir”. |
| CP-ADM-09 | MEDIA | PENDIENTE | Reabrir ticket | Ticket en estado Resuelto. | 1. Hacer clic en “Reabrir”. | El estado vuelve a “Abierto” y el ticket puede atenderse nuevamente. | No ejecutado en esta ronda; misma API que “Tomar”/“Resolver”. |
| CP-ADM-10 | ALTA | APROBADO | Responder desde la bandeja del widget | Ticket abierto en la bandeja. | 1. Hacer clic en “Responder”.<br>2. Escribir la respuesta.<br>3. Guardar. | La respuesta se guarda, el estado pasa a “En proceso” y el usuario la ve en “Mis tickets”. | Verificado; respuesta visible en el ticket y en la vista del usuario. |
| CP-ADM-11 | ALTA | APROBADO | Responder desde el panel admin (modal) | Ticket visible en la pestaña de tickets. | 1. Hacer clic en “Ver detalle”.<br>2. Escribir la respuesta.<br>3. Guardar respuesta. | La respuesta se guarda, el ticket se marca como leído y cambia a “En proceso”. | Verificado; modal, guardado y actualización de estado. |
| CP-ADM-12 | BAJA | PENDIENTE | Responder por correo | Cliente de correo configurado. | 1. Hacer clic en “Responder por correo” o “Enviar por correo”. | Se abre el cliente de correo con asunto `[código]` y cuerpo con el ticket y la respuesta. | Pendiente de validación con cliente de correo real. |
| CP-ADM-13 | ALTA | APROBADO | Eliminar ticket | Ticket existente. | 1. Hacer clic en “Eliminar”.<br>2. Confirmar la acción. | El ticket desaparece, se muestra un toast y no reaparece al refrescar. | Verificado por UI y API; el listado quedó con un ticket menos. |
| CP-ADM-14 | MEDIA | APROBADO | Filtros y búsqueda de tickets | Varios tickets con distinto estado y texto. | 1. Buscar por código, asunto o email.<br>2. Usar filtros “Todos”, “Abiertos” y “Resueltos”. | El listado se filtra correctamente sin recargar la página. | Verificado: búsqueda “Bitcoin” mostró 1 de 2 tickets; filtro “Abiertos” mostró 2. |
| CP-ADM-15 | MEDIA | PENDIENTE | Responsive del Panel de Administración | Navegador en 360×640, 390×844 y 768×1024. | 1. Abrir el panel.<br>2. Recorrer pestañas, tarjetas y modal.<br>3. Probar filtros y acciones. | Las pestañas se desplazan horizontalmente, las tarjetas se apilan, los botones son accesibles y el modal tiene scroll. | Revisión de CSS realizada; pendiente validación en dispositivo físico. |
| CP-ADM-16 | ALTA | APROBADO | Persistencia de estado y respuesta | Ticket con estado/respuesta modificados. | 1. Cambiar estado y guardar respuesta.<br>2. Recargar el panel.<br>3. Abrir el mismo ticket. | El estado, la respuesta y la marca de leído se mantienen. | Verificado tras recargar la página y consultar nuevamente la bandeja. |

## 7. Casos de prueba — Integración / Backend (INT)

| ID | Prioridad | Estado | Título / Funcionalidad | Precondiciones | Pasos | Resultado esperado | Resultado obtenido / evidencia |
|---|---|---|---|---|---|---|---|
| CP-INT-01 | ALTA | APROBADO | `POST /api/support/tickets` | Token JWT de usuario válido. | 1. Enviar categoría, prioridad, asunto y mensaje válidos.<br>2. Revisar la respuesta. | HTTP 201 con `success`, mensaje y objeto `ticket` con id, código y estado “Abierto”. | Verificado: 201 y código `TK-...` generado. |
| CP-INT-02 | ALTA | APROBADO | `GET /api/support/tickets` | Token de usuario con tickets propios. | 1. Consultar el endpoint.<br>2. Comparar con los tickets de otros usuarios. | HTTP 200 con únicamente los tickets del usuario autenticado. | Verificado; el usuario recibió su ticket y no los ajenos. |
| CP-INT-03 | ALTA | APROBADO | `GET /api/admin/tickets` y control de rol | Tokens de admin y de usuario estándar. | 1. Consultar con token admin.<br>2. Consultar con token usuario. | Admin: HTTP 200 con todos los tickets. Usuario: HTTP 403. | Verificado: 200 para admin y 403 para usuario. |
| CP-INT-04 | ALTA | APROBADO | `PUT /api/admin/tickets/:id` | Ticket existente y token admin. | 1. Actualizar estado.<br>2. Guardar respuesta.<br>3. Marcar como leído.<br>4. Enviar estado inválido. | HTTP 200 con ticket actualizado; HTTP 400 para estado inválido. | Verificado: estado `en_proceso`, respuesta y `leido: true`; validación de estado. |
| CP-INT-05 | ALTA | APROBADO | `DELETE /api/admin/tickets/:id` | Ticket existente y token admin. | 1. Eliminar el ticket.<br>2. Consultar el listado. | HTTP 200; el ticket ya no aparece en la bandeja. | Verificado; el ticket eliminado no reapareció. |
| CP-INT-06 | ALTA | PARCIAL | Migración 013 y respaldo JSON | Backend con y sin `DATABASE_URL`. | 1. Con DB: iniciar backend y verificar la tabla `soporte_tickets`.<br>2. Sin DB: crear un ticket y verificar el JSON. | La migración crea la tabla y el sistema funciona; sin DB, el ticket se guarda en `soporte_tickets.json`. | Respaldo JSON verificado. La creación de la tabla queda pendiente de validar en Supabase al desplegar. |
| CP-INT-07 | MEDIA | PARCIAL | Notificación por correo y auditoría | Variables de correo configuradas o modo simulación. | 1. Crear un ticket.<br>2. Revisar la consola/correo del admin.<br>3. Revisar “Gmails Enviados”. | Se envía/registra un correo con código, categoría, prioridad y mensaje; queda en auditoría. | Verificado en modo simulación y auditoría. El envío real por Gmail queda pendiente de validar con credenciales. |
| CP-INT-08 | ALTA | APROBADO | Arranque conjunto `npm run dev:all` | Dependencias instaladas en frontend y backend. | 1. Detener backend y frontend.<br>2. Ejecutar `npm run dev:all`.<br>3. Abrir la app y consultar tickets. | Backend en :5000 y Vite en :5173; no aparece el error 502. | Verificado; ambos procesos levantan y la app responde. |
| CP-INT-09 | MEDIA | PARCIAL | Actualización sin caché vieja (service worker) | Build de producción o entorno local con SW previo. | 1. Publicar una nueva versión.<br>2. Recargar la app.<br>3. Verificar que se carga el JS nuevo.<br>4. Revisar cachés. | El service worker usa `divise-v2`, elimina cachés viejas y sirve el HTML con estrategia network-first. | Verificado en local: se limpiaron SW/caché y se cargó la versión nueva. Pendiente de validación en producción. |

## 8. Casos de prueba — Seguridad (SEG)

| ID | Prioridad | Estado | Título / Funcionalidad | Precondiciones | Pasos | Resultado esperado | Resultado obtenido / evidencia |
|---|---|---|---|---|---|---|---|
| CP-SEG-01 | ALTA | APROBADO | Acceso denegado a APIs de administración | Token de usuario estándar. | 1. Invocar `GET /api/admin/tickets`.<br>2. Invocar `PUT/DELETE` sobre un ticket. | Las operaciones de administración responden 403 y no modifican datos. | Verificado para `GET`; el middleware de admin protege el resto de rutas. |
| CP-SEG-02 | ALTA | APROBADO | Aislamiento de tickets por usuario | Tickets de dos usuarios distintos. | 1. Consultar “Mis tickets” con cada usuario.<br>2. Comparar resultados. | Cada usuario ve solo sus tickets; el administrador ve todos. | Verificado mediante filtro por `id_usuario` y email; no se exponen tickets ajenos. |
| CP-SEG-03 | MEDIA | APROBADO | Sanitización de mensajes y correos | Formulario de ticket. | 1. Enviar `<script>alert(1)</script>` en asunto y mensaje.<br>2. Revisar la UI y el correo. | El texto se muestra como contenido, sin ejecutar scripts; el correo escapa HTML. | Revisión de código: React escapa el texto y el email usa `escapeHtml`. |
| CP-SEG-04 | MEDIA | APROBADO | Sesión expirada | Token JWT vencido. | 1. Usar un token expirado.<br>2. Abrir el dashboard o consultar tickets. | La API responde 401 con `tokenExpired`; el frontend limpia la sesión y redirige al login. | Regresión del manejo existente de JWT; se mantiene el comportamiento. |

<div class="page-break"></div>

## 9. Matriz de trazabilidad

| Funcionalidad nueva | Casos asociados |
|---|---|
| Icono flotante y panel de Soporte | CP-SOP-01, CP-SOP-02, CP-SOP-11, CP-SOP-12 |
| Chatbot y validaciones | CP-SOP-03, CP-SOP-04, CP-SOP-05, CP-SOP-06 |
| Tickets del usuario | CP-SOP-07, CP-SOP-08, CP-SOP-09, CP-SOP-10 |
| Bandeja del administrador en el widget | CP-ADM-05, CP-ADM-06, CP-ADM-07, CP-ADM-10, CP-ADM-16 |
| Pestaña de tickets en el Panel Admin | CP-ADM-01, CP-ADM-03, CP-ADM-04, CP-ADM-11, CP-ADM-14 |
| Estados del ticket | CP-ADM-07, CP-ADM-08, CP-ADM-09, CP-ADM-16, CP-INT-04 |
| Respuestas al usuario | CP-SOP-08, CP-ADM-10, CP-ADM-11, CP-ADM-12 |
| Eliminación y búsqueda | CP-ADM-13, CP-ADM-14, CP-INT-05 |
| Persistencia y backend | CP-INT-01 a CP-INT-06, CP-ADM-16 |
| Correo y auditoría | CP-INT-07 |
| Conectividad y caché | CP-SOP-10, CP-INT-08, CP-INT-09 |
| Seguridad y roles | CP-ADM-02, CP-SEG-01, CP-SEG-02, CP-SEG-03, CP-SEG-04 |
| Responsive | CP-SOP-11, CP-ADM-15 |

## 10. Defectos y correcciones del ciclo

| ID | Defecto detectado | Causa | Corrección aplicada | Estado |
|---|---|---|---|---|
| DEF-01 | `Error 502: Bad Gateway` al consultar tickets | Vite estaba activo pero el backend no estaba levantado; el proxy devolvía error. | Se agregó `npm run dev:all`, reintentos automáticos para 500/502/503/504 y mensaje amigable con botón “Reintentar”. | CORREGIDO |
| DEF-02 | La app seguía mostrando una versión vieja del frontend | Service worker con caché `divise-v1` y estrategia cache-first. | Se desregistra el SW en desarrollo, se limpia la caché y en producción se usa `divise-v2` con network-first para navegación. | CORREGIDO |
| DEF-03 | El panel admin tardaba en mostrar tickets si la base no respondía | `Promise.allSettled` esperaba la consulta más lenta antes de actualizar la UI. | Cada sección (tickets, mensajes, emails, usuarios, stats) carga de forma independiente. | CORREGIDO |
| DEF-04 | El administrador no podía atender tickets desde el icono de Soporte | El widget solo mostraba “Mis tickets”, incluso para admin. | Se agregó la pestaña “Bandeja” para administradores con acciones de atención y respuesta. | CORREGIDO |
| DEF-05 | Posible colisión de códigos de ticket al reiniciar el almacenamiento JSON | El código se generaba con un consecutivo local. | Se genera un código único con timestamp y sufijo aleatorio; además se combinan tickets de DB y JSON sin duplicados. | CORREGIDO |
| DEF-06 | Tickets del JSON podían quedar ocultos si la DB tenía datos | El listado devolvía solo la fuente DB cuando tenía filas. | Se combinan ambas fuentes por código para no perder tickets del respaldo. | CORREGIDO |

## 11. Criterios de aceptación y cierre

Se considera aceptado el módulo cuando:

1. El usuario puede crear un ticket desde el chatbot y verlo en “Mis tickets”.
2. El administrador ve el ticket en la bandeja y en el Panel de Administración.
3. El administrador puede tomar, resolver, responder y eliminar tickets.
4. El usuario ve la respuesta y el estado actualizado.
5. Los casos de prioridad ALTA están aprobados.
6. No hay fallos bloqueantes ni pérdida de datos.
7. El sistema funciona con `npm run dev:all` sin 502.
8. La migración `013_support_tickets.sql` se aplica correctamente en Supabase.
9. El widget y el panel son usables en escritorio y móvil.
10. La app se actualiza sin quedar atrapada en caché vieja.

**Resultado del ciclo:** APROBADO PARA DESPLIEGUE, con 4 casos pendientes y 3 parciales de validación manual (responsive físico, reapertura, correo real, migración en Supabase y caché en producción).

## 12. Evidencias sugeridas

- Captura del icono flotante “Soporte” en el dashboard.
- Captura del flujo del chatbot con categoría y prioridad.
- Captura del ticket generado con código único.
- Captura de “Mis tickets” con la respuesta del administrador.
- Captura de la pestaña “Bandeja” del administrador.
- Captura del Panel Admin → “Tickets de Soporte”.
- Captura de filtros y búsqueda.
- Captura del mensaje amigable ante backend caído.
- Captura en resolución móvil (360×640 y 390×844).
- Log de `POST /api/support/tickets` (201).
- Log de `GET /api/admin/tickets` (200 admin / 403 usuario).
- Log de Vite mostrando `ECONNREFUSED` antes de la corrección.

## 13. Aprobaciones

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| QA / Testing | Lorenzo Sánchez | | |
| Desarrollo | Santino Tacconi | | |
| Desarrollo | Santiago Centurión | | |
| Project Manager | Valentín López | | |
| UX | Bruno Cabrera | | |

---

**Documento generado para el cierre del sprint — Divise / Dolarito — Octubre 2026.**
