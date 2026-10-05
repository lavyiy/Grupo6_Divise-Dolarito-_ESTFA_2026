# Presupuesto / Propuesta Comercial
## Divise App · Grupo 6 — ESTFA 2026

---

## 1. Datos generales

| Campo | Detalle |
|---|---|
| **Nombre del proyecto** | Divise App — Plataforma web de cotizaciones de divisas y criptomonedas en tiempo real |
| **Emisor** | Grupo 6 — ESTFA 2026 |
| **Destinatario** | Cliente / Inversor inicial del proyecto |
| **Fecha de emisión** | 14 de agosto de 2026 |
| **Período de validez** | 30 días corridos desde la fecha de emisión |
| **Moneda** | Dólar estadounidense (USD). El tipo de cambio ARS/USD se fija a la fecha de contratación o firma del contrato |

---

## 2. Resumen ejecutivo

Divise App es una plataforma web que permite consultar, en tiempo real, el valor de compra y venta de dólares (oficial, blue, MEP/Bolsa, contado con liquidación, tarjeta, mayorista y cripto), monedas extranjeras (EUR, GBP, BRL, JPY, CAD, CHF) y criptomonedas (BTC, ETH, SOL, USDT, BNB). Ofrece evolución histórica mediante gráficos interactivos, conversor de monedas, favoritos, alertas de precio por correo electrónico y noticias de mercado.

El presente presupuesto cubre el análisis, diseño, desarrollo, pruebas y puesta en producción del producto, con una dedicación estimada de **290 horas** y un valor total de **USD 5.941,10 (IVA 21 % incluido)**.

---

## 3. Alcance del proyecto

- **Diseño UX/UI:** arquitectura de información, wireframes, prototipo navegable y sistema visual (tema oscuro, iconografía SVG).
- **Base de datos PostgreSQL:** modelado entidad-relación, DDL, índices, datos semilla y política de migraciones.
- **Backend Node.js/Express:** autenticación JWT, 17 endpoints REST, integración con DolarApi, CoinGecko y Resend, sincronización automática de cotizaciones cada 5 minutos y verificación de alertas.
- **Frontend React/Vite:** 11 pantallas funcionales (login, registro, inicio, cotizaciones, gráficos, calculadora, noticias, alertas, favoritos, historial y perfil), gráficos históricos Chart.js y conversor de monedas.
- **Testing funcional documentado (112 casos),** documentación técnica, manual de usuario y despliegue en Render.

**Fuera del alcance:** campañas de marketing, mantenimiento posterior al período de garantía y costos externos de infraestructura (hosting pago, dominio, API keys), detallados en la sección 7.

> **Nota de alcance:** las pantallas de Historial y Perfil, y el registro de conversiones de la Calculadora, corresponden a funcionalidad planificada para el Sprint 2 y se completan dentro del alcance aquí definido.

---

## 4. Detalle económico

| N.º | Servicio | Descripción | Hs. est. | Valor/h (USD) | Subtotal (USD) |
|---|---|---|---|---|---|
| 1 | Análisis y diseño UX/UI | Relevamiento de requisitos, arquitectura de información, wireframes, prototipo navegable y sistema de colores / identidad visual (tema oscuro premium, iconografía SVG). | 40 | 15 | 600,00 |
| 2 | Diseño de base de datos | Modelado entidad-relación (usuarios, divisas, tipos de cambio, favoritos, alertas), script DDL, índices, datos semilla y política de migraciones sobre PostgreSQL. | 20 | 15 | 300,00 |
| 3 | Desarrollo backend | API Node.js/Express con arquitectura MVC: autenticación JWT y bcrypt, 17 endpoints REST (auth, usuarios, favoritos, alertas, cotizaciones), integración con APIs externas (DolarApi, CoinGecko, Resend), sincronización automática de cotizaciones cada 5 minutos y verificación de alertas por correo. | 80 | 20 | 1.600,00 |
| 4 | Desarrollo frontend | Interfaz web React/Vite: componentes reutilizables, rutas protegidas, dashboard con KPIs, módulo de cotizaciones con tabs (Dólares/Forex/Cripto), gráficos históricos Chart.js (14 monedas, períodos 24 h/7 d/30 d/1 año, modo velas OHLC), calculadora de conversión, noticias RSS, favoritos y alertas. | 80 | 20 | 1.600,00 |
| 5 | Testing y QA | Diseño y ejecución de 112 casos de prueba documentados, testing manual de flujos críticos (autenticación, favoritos, conversión, sincronización), validación de datos reales de cotizaciones y reporte de defectos. | 30 | 12 | 360,00 |
| 6 | Documentación técnica | Documentación de arquitectura, esquema de base de datos, endpoints de la API, configuración de despliegue y manual de usuario. | 20 | 10 | 200,00 |
| 7 | Gestión del proyecto y presupuesto | Planificación de sprints, seguimiento de tareas, reuniones de coordinación del equipo y elaboración de la propuesta comercial. | 10 | 10 | 100,00 |
| 8 | Infraestructura y despliegue | Configuración del entorno de producción en Render (frontend y backend), despliegue de PostgreSQL, variables de entorno, health checks y verificación final. Honorarios estimativos; los costos externos de hosting, dominio y API keys no están incluidos. | 10 | 15 | 150,00 |
| | **SUBTOTAL** | | **290** | | **4.910,00** |
| | **IVA (21 %)** | | | | **1.031,10** |
| | **TOTAL** | | | | **5.941,10** |

---

## 5. Resumen económico

| Concepto | USD |
|---|---|
| Subtotal (sin IVA) | 4.910,00 |
| IVA (21 %) | 1.031,10 |
| **Total final** | **5.941,10** |

---

## 6. Forma de pago

| Hito | Porcentaje | USD |
|---|---|---|
| Inicio del proyecto (contra firma del contrato) | 40 % | 2.376,44 |
| Cierre del Sprint 1 | 30 % | 1.782,33 |
| Cierre del Sprint 2 y entrega final | 30 % | 1.782,33 |
| **Total** | **100 %** | **5.941,10** |

---

## 7. Infraestructura / Deploy — incluido y no incluido

El ítem 8 del detalle económico (USD 150) corresponde **exclusivamente a honorarios estimativos** por las horas de configuración, despliegue y verificación del entorno de producción. No representa ni compromete el pago de servicios externos.

**Incluidos en la estimación (USD 150):**
- Configuración del entorno de producción en Render (plan gratuito inicial).
- Despliegue del backend y del frontend, variables de entorno y health checks.
- Despliegue y configuración de la base de datos PostgreSQL (plan gratuito de Supabase).
- Verificación del despliegue y pruebas finales de producción.

**Posibles costos externos no incluidos (a cargo del cliente, facturados a valor de costo):**
- Hosting/VPS o planes pagos de Render cuando el tráfico supere el plan gratuito (aprox. USD 7–25/mes).
- Base de datos administrada más allá del plan gratuito de Supabase.
- Registro y renovación anual de un dominio propio (aprox. USD 10–15/año).
- Servicios de terceros: plan pago de Resend para correos transaccionales y API keys con límites mayores.

Estos costos se cotizan por separado y **no forman parte de los honorarios del equipo**.

---

## 8. Condiciones comerciales

1. **Validez:** 30 días corridos desde la fecha de emisión.
2. **Tipo de cambio:** el tipo de cambio ARS/USD se determina a la fecha de contratación o firma del contrato.
3. **Alcance:** el desarrollo se limita estrictamente al alcance definido en la sección 3. Los cambios de alcance pueden modificar la estimación de horas y, en consecuencia, el total del presupuesto.
4. **Costos externos:** los costos de terceros no incluidos (hosting, dominio, API keys) pueden variar y se facturan por separado a valor de costo, previa autorización.
5. **Honorarios por entregable:** los valores por hora son referenciales para la estimación; la facturación se realiza por entregable aprobado según el cronograma de sprints.
6. **Plazos:** los plazos de entrega dependen de la disponibilidad del equipo y de la aprobación de los entregables por parte del cliente al cierre de cada sprint.
7. **Comunicación:** el seguimiento se realiza mediante informes de avance al cierre de cada sprint.
8. **Garantía:** se incluye un período de corrección de defectos de 30 días corridos posteriores a la entrega final.

---

## Anexo A — Desglose de horas por servicio

### 1. Análisis y diseño UX/UI — 40 horas
| Actividad | Hs. |
|---|---|
| Relevamiento de requisitos y entrevistas con el cliente | 6 |
| Arquitectura de la información y flujos de usuario | 6 |
| Wireframes de baja fidelidad (11 pantallas) | 8 |
| Prototipo navegable de alta fidelidad | 10 |
| Sistema de colores, identidad visual y guía de estilos | 6 |
| Validación de usabilidad y ajustes finales | 4 |
| **Subtotal** | **40** |

### 2. Diseño de base de datos — 20 horas
| Actividad | Hs. |
|---|---|
| Relevamiento de entidades y reglas de negocio | 4 |
| Modelado entidad-relación (usuarios, divisas, tipos de cambio, favoritos, alertas, historial) | 6 |
| Script DDL de esquema y restricciones | 4 |
| Índices y optimización de consultas | 3 |
| Datos semilla (seed) y política de migraciones | 3 |
| **Subtotal** | **20** |

### 3. Desarrollo backend — 80 horas
| Actividad | Hs. |
|---|---|
| Arquitectura del servidor (Express, estructura MVC, configuración) | 6 |
| Modelos y acceso a datos (PostgreSQL / pg) | 8 |
| Autenticación y autorización (JWT, bcrypt, middlewares) | 10 |
| Endpoints REST de autenticación (register, login, forgot/reset password) | 8 |
| Endpoints REST de usuarios, favoritos, alertas y cotizaciones | 12 |
| Integración con APIs externas (DolarApi, CoinGecko, Resend) | 10 |
| Sincronización automática de cotizaciones (cron 5 min) y verificación de alertas | 8 |
| Validaciones, manejo de errores y respuestas consistentes | 8 |
| Pruebas de endpoints y ajustes finales | 10 |
| **Subtotal** | **80** |

### 4. Desarrollo frontend — 80 horas
| Actividad | Hs. |
|---|---|
| Configuración del proyecto (React/Vite, enrutamiento, estructura de carpetas) | 5 |
| Sistema de diseño: componentes reutilizables, iconos SVG, tema visual | 10 |
| Autenticación (login, registro, recuperación de contraseña, rutas protegidas) | 8 |
| Dashboard principal con KPIs y mini-gráficos | 8 |
| Módulo de cotizaciones (Divisas) con tabs Dólares/Forex/Cripto | 10 |
| Gráficos históricos (Chart.js: 14 monedas, períodos, modo velas OHLC, comparación) | 14 |
| Calculadora de conversión entre monedas | 8 |
| Favoritos, alertas, noticias RSS, historial y perfil | 12 |
| Integración con backend y APIs de cotizaciones, estados de carga y error | 5 |
| **Subtotal** | **80** |

### 5. Testing y QA — 30 horas
| Actividad | Hs. |
|---|---|
| Diseño de casos de prueba (112 casos documentados) | 8 |
| Testing manual funcional (flujos críticos: autenticación, favoritos, conversión) | 10 |
| Validación de datos e integridad (cotizaciones, sincronización, alertas) | 6 |
| Pruebas de regresión y correcciones | 4 |
| Documentación de defectos y reporte final | 2 |
| **Subtotal** | **30** |

### 6. Documentación técnica — 20 horas
| Actividad | Hs. |
|---|---|
| Documentación de arquitectura del sistema | 4 |
| Documentación de endpoints de la API | 5 |
| Documentación del esquema de base de datos y consultas | 4 |
| Manual de usuario de la aplicación | 4 |
| Documentación de despliegue (Render) y configuración | 3 |
| **Subtotal** | **20** |

### 7. Gestión del proyecto y presupuesto — 10 horas
| Actividad | Hs. |
|---|---|
| Planificación de sprints y seguimiento de tareas | 4 |
| Reuniones de equipo y coordinación | 3 |
| Elaboración del presupuesto y propuesta comercial | 2 |
| Presentación de avances y reportes | 1 |
| **Subtotal** | **10** |

### 8. Infraestructura y despliegue — 10 horas
| Actividad | Hs. |
|---|---|
| Configuración del entorno de producción (Render, variables de entorno) | 3 |
| Despliegue y configuración de la base de datos en producción | 3 |
| Configuración de dominio / certificado y verificación | 2 |
| Pruebas del despliegue y documentación de configuración | 2 |
| **Subtotal** | **10** |

**TOTAL GENERAL: 290 horas**

---

## Anexo B — Justificación económica detallada

### 1. Análisis y diseño UX/UI — 40 hs — USD 600

**¿Qué se realiza?** La fase de análisis y diseño define cómo el usuario interactúa con Divise App: relevamiento de requisitos, arquitectura de información, wireframes, prototipo navegable y sistema visual (tema oscuro premium, paleta dorada y iconografía SVG propia).

**Actividades concretas:**
- Entrevistas con el cliente para relevar requisitos.
- Definición de los flujos de usuario (login, consulta de cotizaciones, conversión, alertas, favoritos).
- Wireframes de baja fidelidad de las 11 pantallas.
- Prototipo navegable de alta fidelidad.
- Sistema de colores, tipografía e iconografía.
- Validación de usabilidad con el cliente.

**Por qué es necesario para Divise:** un producto de cotizaciones en tiempo real debe presentar mucha información (precios, variaciones, gráficos) de forma clara y rápida. El diseño previo evita que el desarrollo construya pantallas que luego deban rehacerse por problemas de usabilidad o estética.

**Entregables:** prototipo navegable aprobado, guía de estilos e identidad visual, mapa de navegación.

**Estimación de horas y complejidad:** 40 horas (10 % del proyecto). El diseño de 11 pantallas con dos flujos distintos (visitante autenticado y no autenticado) requiere iteraciones. Complejidad media: es una plataforma informativa con interacciones simples, pero muy cargada de datos.

**Valor que aporta / riesgos que evita:** reduce el retrabajo en desarrollo (el prototipo funciona como especificación), mejora la retención del usuario y aporta la identidad visual que el cliente necesita para posicionar la marca.

**Por qué el costo es razonable:** USD 15/h es una tarifa de entrada para perfiles jr./micro-emprendimiento; el valor total (USD 600) representa solo el 10 % del presupuesto, proporción correcta para un proyecto que depende fuertemente de la claridad visual.

### 2. Diseño de base de datos — 20 hs — USD 300

**¿Qué se realiza?** Modelado del esquema PostgreSQL que sustenta toda la aplicación: entidades, relaciones, restricciones, índices y datos semilla.

**Actividades concretas:**
- Relevamiento de entidades y reglas de negocio.
- Modelado entidad-relación: usuarios, divisas, tipos de cambio, favoritos, alertas e historial de consultas.
- Script DDL con restricciones y tipos adecuados.
- Índices sobre las consultas más frecuentes.
- Datos semilla de monedas y mercados.
- Política de migraciones versionadas.

**Por qué es necesario para Divise:** consulta y actualiza cotizaciones cada 5 minutos y relaciona datos entre usuarios, favoritos y alertas. Un esquema mal diseñado genera consultas lentas, datos duplicados y errores difíciles de rastrear.

**Entregables:** modelo ER documentado, script DDL, script de seed y migraciones versionadas.

**Estimación de horas y complejidad:** 20 horas (7 % del proyecto). El modelo es acotado (6 entidades), pero la política de migraciones y los índices requieren cuidado. Complejidad media.

**Valor que aporta / riesgos que evita:** evita retrabajo por cambios de esquema tardíos, garantiza la consistencia de las cotizaciones y permite evolucionar el modelo sin perder datos.

**Por qué el costo es razonable:** USD 15/h; es un entregable previo al backend que lo desbloquea, con una inversión proporcionalmente baja frente al costo que tendría corregir un esquema deficiente en producción.

### 3. Desarrollo backend — 80 hs — USD 1.600

**¿Qué se realiza?** Construcción de la API REST en Node.js/Express con arquitectura MVC que da soporte a toda la lógica de negocio, la integración con proveedores de cotizaciones y el envío de alertas.

**Actividades concretas:**
- Arquitectura y configuración del servidor (Express, variables de entorno, CORS, estructura de carpetas).
- Modelos y acceso a datos con PostgreSQL (pool de conexiones, consultas parametrizadas).
- Autenticación y autorización: JWT, hashing con bcrypt, middleware de verificación.
- 17 endpoints REST: auth (register, login, forgot/reset password), usuarios (/me y CRUD), favoritos (listar, toggle), alertas (crear, listar, eliminar) y cotizaciones.
- Integración con APIs externas: DolarApi (dólares y euro), CoinGecko (criptomonedas) y Resend (correos transaccionales).
- Sincronización automática de cotizaciones cada 5 minutos (cron) con upsert en base de datos.
- Verificación automática de alertas («sube a»/«baja a») y envío de correo al usuario.
- Validaciones de entrada, manejo de errores y respuestas consistentes.
- Pruebas de endpoints con herramientas de API.

**Por qué es necesario para Divise:** no puede depender de consultar las APIs de terceros directamente desde el navegador para todo: el backend centraliza la obtención de datos, los guarda en PostgreSQL, protege los datos de los usuarios (autenticación), administra favoritos y alertas, y dispara notificaciones por correo.

**Entregables:** API REST desplegable, base de datos migrada y sincronizada, integración de correos y documentación de endpoints.

**Estimación de horas y complejidad:** 80 horas (28 % del proyecto, el mayor esfuerzo junto al frontend). Complejidad alta: combina seguridad, integraciones externas y tareas programadas.

**Valor que aporta / riesgos que evita:** aporta la capa de datos segura y confiable del producto. Evita riesgos de seguridad (contraseñas en texto plano, endpoints expuestos), de disponibilidad (caídas de APIs de terceros no manejadas) y de pérdida de información de usuarios.

**Por qué el costo es razonable:** USD 20/h (tarifa jr./semisenior acorde al perfil del equipo). USD 1.600 para 80 horas de desarrollo de una API completa con autenticación, integraciones y procesos programados está por debajo del valor de mercado local para un trabajo equivalente (habitualmente USD 2.000–3.500).

### 4. Desarrollo frontend — 80 hs — USD 1.600

**¿Qué se realiza?** Construcción de la interfaz web en React/Vite: las 11 pantallas del producto, el sistema de componentes, la integración con la API y con las fuentes de cotizaciones, y los gráficos históricos.

**Actividades concretas:**
- Configuración del proyecto: Vite, enrutamiento con rutas protegidas, estructura de carpetas.
- Sistema de diseño: componentes reutilizables, iconos SVG por moneda, tema oscuro.
- Autenticación: login, registro, recuperación de contraseña y control de sesión (JWT en localStorage).
- Dashboard de inicio con KPIs, mini-gráficos y lista de cotizaciones.
- Módulo de cotizaciones con tabs (Dólares/Forex/Cripto), compra/venta y variación real de 24 h.
- Gráficos históricos con Chart.js: 14 monedas agrupadas, períodos 24 h/7 d/30 d/1 año, escala dinámica, modo velas OHLC y comparación con el dólar.
- Calculadora de conversión con cotizaciones en vivo.
- Favoritos, alertas, noticias RSS, historial y perfil.
- Estados de carga (spinners), de error y diseño responsive (mobile/desktop).

**Por qué es necesario para Divise:** el frontend es la cara del producto: el usuario consulta cotizaciones, ve evolución histórica y convierte monedas. La calidad visual y de interacción determina la percepción del servicio.

**Entregables:** aplicación web funcional y desplegada, con los 11 flujos operativos y responsive.

**Estimación de horas y complejidad:** 80 horas (28 % del proyecto). Complejidad media-alta por la cantidad de pantallas, la densidad de datos y los gráficos interactivos.

**Valor que aporta / riesgos que evita:** aporta la experiencia de uso completa y verificable. Evita problemas de compatibilidad móvil, de acceso a rutas no autorizadas y de percepción de lentitud o datos incorrectos.

**Por qué el costo es razonable:** USD 20/h; USD 1.600 por las 11 pantallas funcionales, el sistema de componentes y los gráficos (incluida la lógica de series históricas reales de dólar y criptomonedas) es consistente con el mercado para un trabajo de estas características.

### 5. Testing y QA — 30 hs — USD 360

**¿Qué se realiza?** Garantía de calidad: diseño y ejecución de casos de prueba, testing manual de los flujos críticos y validación de que los datos de cotizaciones mostrados sean correctos.

**Actividades concretas:**
- Diseño de 112 casos de prueba documentados (registro, login, navegación, cotizaciones, gráficos, calculadora, favoritos, alertas, noticias, despliegue).
- Testing manual de flujos críticos: autenticación, favoritos, conversión y sincronización.
- Validación de datos reales: verificación de valores de DolarApi/CoinGecko/bluelytics (incluida la corrección del histórico de 2011).
- Pruebas de regresión tras correcciones.
- Documentación de defectos y reporte final.

**Por qué es necesario para Divise:** un producto de cotizaciones cuya información sea incorrecta o que falle en la autenticación pierde toda confianza. El QA documentado demuestra al cliente que el producto fue verificado.

**Entregables:** documento de casos de prueba, reporte de defectos y acta de aprobación por sprint.

**Estimación de horas y complejidad:** 30 horas (10 % del proyecto); el esfuerzo se concentra en el testing manual de los flujos críticos. Complejidad media.

**Valor que aporta / riesgos que evita:** evita entregar defectos críticos (por ejemplo, mostrar cotizaciones históricas incorrectas), reduce el costo de correcciones tardías y aporta evidencia verificable del cumplimiento del alcance.

**Por qué el costo es razonable:** USD 12/h (perfil de soporte/QA inicial); USD 360 por 30 horas de cobertura documentada de la totalidad de los módulos es proporcional y razonable.

### 6. Documentación técnica — 20 hs — USD 200

**¿Qué se realiza?** Producción de la documentación que permite operar, mantener y usar Divise App: arquitectura, API, base de datos, despliegue y manual de usuario.

**Actividades concretas:**
- Documentación de arquitectura (frontend/backend, flujo de datos).
- Documentación de los 17 endpoints de la API con ejemplos.
- Documentación del esquema de base de datos y consultas principales.
- Manual de usuario de la aplicación.
- Guía de despliegue en Render y configuración de variables de entorno.

**Por qué es necesario para Divise:** es un entregable independiente del código: permite que el cliente y el equipo retomen el proyecto sin depender de la memoria de sus autores, y es requisito habitual para la entrega académica y comercial.

**Entregables:** manual de usuario, guía técnica y documentación de API en formato digital.

**Estimación de horas y complejidad:** 20 horas (7 % del proyecto); documentar 11 pantallas, 17 endpoints y el modelo de datos requiere redacción y verificación. Complejidad baja-media.

**Valor que aporta / riesgos que evita:** evita la dependencia de una única persona, reduce el tiempo de incorporación de nuevos desarrolladores y asegura que la operación del servicio no dependa de conocimiento tácito.

**Por qué el costo es razonable:** USD 10/h; USD 200 por un paquete documental completo es un costo marginal frente al valor que protege.

### 7. Gestión del proyecto y presupuesto — 10 hs — USD 100

**¿Qué se realiza?** Coordinación del equipo: planificación de sprints, seguimiento de tareas, reuniones y elaboración de la propuesta comercial.

**Actividades concretas:**
- Planificación de dos sprints y asignación de tareas.
- Reuniones periódicas de coordinación y seguimiento de issues.
- Elaboración del presupuesto y la propuesta comercial.
- Presentación de avances al cierre de cada sprint.

**Por qué es necesario para Divise:** un proyecto con dos frentes de trabajo (frontend y backend) y entregables por sprint necesita coordinación para que los plazos se cumplan y las integraciones no se desfasen.

**Entregables:** cronograma de sprints, actas de reunión e informes de avance.

**Estimación de horas y complejidad:** 10 horas (3 % del proyecto); volumen acotado para un equipo pequeño y dos sprints. Complejidad baja.

**Valor que aporta / riesgos que evita:** evita desvíos de cronograma y malentendidos sobre el alcance, y asegura que la comunicación con el cliente sea profesional y ordenada.

**Por qué el costo es razonable:** USD 10/h; USD 100 por la gestión completa del proyecto es una proporción mínima (2 %) que no recarga el presupuesto.

### 8. Infraestructura y despliegue — 10 hs — USD 150

**¿Qué se realiza?** Puesta en producción de Divise App: despliegue del frontend y backend en Render, configuración de la base de datos PostgreSQL en producción y verificación final del servicio.

**Actividades concretas:**
- Configuración del entorno de producción (Render, variables de entorno, health checks).
- Despliegue de la base de datos en producción.
- Configuración del dominio y certificados (si se provee uno).
- Pruebas del despliegue y documentación de configuración.

**Por qué es necesario para Divise:** el objetivo del proyecto es una demo pública y un producto utilizable; sin un despliegue correcto la aplicación no es accesible para el cliente ni para los usuarios finales.

**Entregables:** aplicación en producción accesible por URL, con base de datos conectada y verificada.

**Estimación de horas y complejidad:** 10 horas (3 % del proyecto); configuración y verificación sobre servicios ya elegidos. Complejidad baja-media. **El valor es ESTIMATIVO y cubre únicamente horas de trabajo del equipo.**

**Valor que aporta / riesgos que evita:** evita problemas de disponibilidad y de configuración en producción, y deja documentado el procedimiento para réplicas futuras.

**Por qué el costo es razonable:** USD 15/h; USD 150 por el despliegue completo. Los costos externos (hosting pago, dominio, API keys) se detallan por separado en la sección 7 y **no forman parte de los honorarios**.

---

*Documento: Presupuesto / Propuesta Comercial — Divise App — Grupo 6 — ESTFA 2026 · Emitido el 14/08/2026 · Válido por 30 días*
