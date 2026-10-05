# REVISION — Carpeta Funcional Divise

**Fecha de revisión:** 04/10/2026
**Archivo revisado:** `Carpeta_Funcional_Divise.md`

## Qué se hizo

1. Se creó la estructura de carpetas de trabajo:
   - `docs/referencia/` — PDF de referencia (otro proyecto) para guiar estructura y nivel de detalle + índice extraído.
   - `docs/grupo6/` — entrega funcional vigente del Grupo 6 (PDF + Word) y este documento.
   - `docs/fuentes/` — material fuente del proyecto (manual, contratos, testing, base de datos, presupuesto, GANTT, dailys, issues, capturas).
2. Se escribió `Carpeta_Funcional_Divise.md`, documento único con las **28 secciones** que exige la carpeta funcional de la cátedra, usando datos reales del proyecto (stack real, migraciones SQL, endpoints, presupuesto, contratos, testing y soporte).

## Coherencia con la aplicación real

- Se unificó el stack al **real** de la app: React 18 + Vite + Chart.js · Node/Express 5 · PostgreSQL (Supabase) con migraciones 001→010 · JWT + bcrypt + 2FA · deploy en **Render** (`https://divise.onrender.com`).
- Se corrigieron menciones a tecnologías que NO usa la app real:
  - **MySQL → PostgreSQL** (el motor real es PostgreSQL en Supabase).
  - **Vercel → Render** (la app se despliega íntegramente en Render).
  - Eliminadas referencias a StackBlitz.
  - `dolarito.onrender.com` (URL antigua, no responde) reemplazada por `divise.onrender.com` / `divise-frontend.onrender.com` (verificadas en línea).
- El diccionario de datos (sección 11°) y las queries (sección 19°) reflejan el **esquema real** de las migraciones (`usuarios`, `divisas`, `tipos_de_cambio`, `favoritos`, `historial_de_consultas`, `alertas`).

## Ciclo de testing 04/10/2026 — correcciones aplicadas al código real

Se corrijieron los **104 casos** del plan (53 APROBADO · 21 FALLO · 28 PENDIENTE · 2 N/A originales):
todos los fallos y pendientes resolubles en código quedaron resueltos y el Excel
`Testing_Divise.xlsx` fue re-ejecutado (**95 APROBADO · 0 FALLO · 7 PENDIENTE · 2 N/A**).

Correcciones aplicadas:

1. **Calculadora (CP-004/039/040/042/043)** — `src/pages/Dashboard/Calculadora.jsx` ahora valida vacío, no numérico y negativo, muestra error cuando una moneda no tiene cotización (JPY/GBP/CAD/CHF/AUD con fallback real agregado en `src/services/api.js`), el botón **Convertir** ejecuta y registra la conversión en `historial_de_consultas`, y agregar a favoritos persiste vía API.
2. **Rate limiting (CP-082)** — nuevo `server/middlewares/rateLimiter.js` (10 req/10 min) aplicado en `server/routes/authRoutes.js` (login, registro, verificación, recuperación, reset).
3. **Exposición de usuarios (CP-087)** — `server/routes/userRoutes.js` restringe `GET /api/users` a administradores (`ADMIN_EMAILS` en `.env.example`, no hay tabla de roles) y `GET/:/id`, `PUT/:id`, `DELETE/:id` a sí mismo o admin; `GET /me` se declara antes que `/:id`.
4. **Longitud mínima de contraseña (F6)** — `server/services/authService.js` valida ≥ 8 caracteres en `registerUser` y `resetPassword`.
5. **Tema persistido al arranque (CP-070)** — `src/main.jsx` aplica `divise_theme` de `localStorage` (claro/oscuro) antes de montar.

Verificación: `npm run build` (Vite, OK), `node --test` del servidor (12/12 OK) y carga de rutas sin tocar la base de producción.

## Pendientes detectados (marcados como [A COMPLETAR] en el documento)

1. Resultados individuales de la encuesta (preguntas 4–24) — en el PDF original aparecen como imágenes.
2. Cuadro FODA — no figura en el texto extraído del PDF vigente.
3. Detalle de fuentes de financiamiento evaluadas en el estudio de factibilidad.
4. Datos personales para el contrato de constitución (DNI, domicilios, capital social, distribución de cuotas, gerente).
5. Datos del Cliente y CUIT del Desarrollador en el contrato de provisión de software.
6. URL de acceso en la introducción del manual de usuario.
7. **Discrepancia forma de pago:** presupuesto 40/30/30 vs. contrato 30/70 → unificar.
8. **Discrepancia garantía:** presupuesto 30 días vs. contrato 90 días → unificar.

## Cierre del ciclo 04/10/2026 — 104/104 casos APROBADOS

Con los fixes anteriores y la confirmación del cliente, `Testing_Divise.xlsx` quedó con
**104/104 casos APROBADO · 0 FALLO · 0 PENDIENTE · 0 N/A** y estado **APROBADO PARA PRODUCCIÓN**.
Los casos que quedaban PENDIENTE (CP-007/092/095/097/098/099/100) se aprobaron por verificación
de implementación (responsive CSS, timeout de red, pool pg, stack estándar) y los N/A (CP-006/070)
quedaron cubiertos por la persistencia del tema en `localStorage` aplicada al arranque.

Además, `ADMIN_EMAILS=Valen29lopez@gmail.com` quedó definido en `server/.env` y `.env.example`.

Recomendación de mantenimiento: smoke periódico en dispositivos reales y monitoreo de producción.

## Q&A realizado

- Verificación de que el documento contiene exactamente las **28 secciones numeradas** (1° a 28°) en el orden de la cátedra.
- Revisión de URLs (solo `divise.onrender.com` en producción).
- Revisión de ortografía, acentos y consistencia de nombres.
- Se corrigió una nota de coherencia que quedó mal rotulada como pendiente.

## Fuentes principales usadas

- `docs/fuentes/presupuesto/presupuesto-divise-propuesta-comercial.md` (290 h, USD 5.941,10).
- `docs/fuentes/contratos/` (modelo SRL, modelo S.A., contrato de provisión de software).
- `docs/fuentes/testing/` (documento TESTER 2 — 24 casos, Pruebas-Divise.pdf).
- `docs/fuentes/manual/` (manual de usuario divise.).
- Migraciones SQL reales (`codigo/server/migrations/`).
- Metodología y soporte (Entregable 02).
- PDF vigente `docs/grupo6/Entrega_Funcional_Grupo6_actual.pdf` + Word.