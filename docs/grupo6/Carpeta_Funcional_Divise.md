# CARPETA FUNCIONAL — DIVISE

**Proyecto:** divise — Cotizaciones & Mercado en Tiempo Real
**Emprendimiento:** DiviseTech · Grupo 6 · ESTFA 2026
**Entrega:** Carpeta funcional completa
**Versión:** 2.0 (ampliada) — Octubre 2026

---

## Datos del equipo

| Rol | Nombre | Correo electrónico |
|---|---|---|
| Project Manager | Valentín López | valen29lopez@gmail.com |
| Developer | Santino Tacconi | santinotacconi123@gmail.com |
| Developer | Santiago Centurión | centurion.santiago334@gmail.com |
| Diseñador UX | Bruno Cabrera | cabrerabenjabruno@gmail.com |
| Base de datos | Lorenzo Sánchez | lorenzomartinsanchez10@gmail.com |

**Patrocinadora del proyecto:** Julieta Da Rosa.

**Contacto y soporte:** deviseproyect@gmail.com — lunes a viernes de 18:00 a 22:00 (GMT-3).

---

## Índice general

| N.º | Sección |
|---|---|
| 1° | Creación del microemprendimiento |
| 2° | Carta de solicitud del proyecto |
| 3° | Entrevistas |
| 4° | Proyecto |
| 5° | Resultado de entrevistas |
| 6° | Project Charter |
| 7° | Estudio de factibilidad |
| 8° | Proyección y justificación del sistema |
| 9° | Creación del GANTT |
| 10° | Creación y justificación del ambiente de desarrollo y producción |
| 11° | MR-MER: diccionario de datos y referencias |
| 12° | Diagrama de contexto (DFD Nivel 0) |
| 13° | DFD Nivel 1 |
| 14° | DFD Nivel 2 |
| 15° | DER |
| 16° | Pantalla de inicio + mockup |
| 17° | Pantalla de ABM de usuarios completa |
| 18° | Pantallas todas, descriptas y funcionales |
| 19° | Consultas (Querys): ABM de usuarios |
| 20° | Demo funcional (descripción y justificación) |
| 21° | Presupuesto |
| 22° | Justificación del presupuesto |
| 23° | Excel completo de testing: todos los casos de prueba |
| 24° | Contrato de constitución del emprendimiento |
| 25° | Contrato de venta, licitación de software |
| 26° | Manual de usuario |
| 27° | Metodología de implementación elegida y justificación |
| 28° | Soporte → Guías de resolución de errores comunes y configuraciones |

---

# 1° CREACIÓN DEL MICROEMPRENDIMIENTO

## ¿Qué es DiviseTech?

DiviseTech es el microemprendimiento informático creado por el Grupo 6 de la ESTFA 2026. Nace con una idea sencilla pero ambiciosa: que cualquier persona pueda saber, en un segundo y sin vueltas, cuánto vale el dólar y las demás monedas que le importan. El equipo se formó durante el ciclo lectivo, se organizó por roles (gestión, desarrollo, diseño y base de datos) y decidió apostar por un producto de software real, publicado en la web, y no por un simple ejercicio de clase.

El nombre del emprendimiento combina la idea de "divisa" —moneda extranjera convertible— con la palabra "tech", haciendo explícito que es un proyecto de base tecnológica. La identidad se completa con el nombre corto de la aplicación, **divise**, que se escribe con minúscula y termina con un punto, como una marca moderna de producto digital.

## Logo del microemprendimiento

El logo de DiviseTech se apoya en la identidad visual de la aplicación: un diseño sobrio con fondo oscuro, tipografía blanca y un punto dorado al final de la palabra "divise", que marca el acento de la marca. Los íconos de cada moneda fueron dibujados con SVG propio para que la app se vea consistente en cualquier tamaño de pantalla, desde el celular hasta una computadora de escritorio.

## Misión y visión de la organización

**Misión**

"Nuestra misión es proporcionar a los ciudadanos y ahorristas de la región una herramienta digital centralizada, intuitiva y precisa que facilite la consulta de cotizaciones financieras en tiempo real. Buscamos reducir la incertidumbre económica mediante la automatización de datos, permitiendo que cada usuario tome decisiones informadas sobre sus ahorros de manera rápida y gratuita."

**Visión**

"Nuestra visión es convertirnos en la plataforma de referencia líder en el mercado de información cambiaria y de activos digitales en Argentina. Aspiramos a evolucionar constantemente nuestra tecnología para integrar nuevas herramientas financieras, proyectando a Divise como un ecosistema integral que acompañe el crecimiento de la cultura financiera y tecnológica de nuestros usuarios."

## Por qué existe este emprendimiento

En Argentina, la información sobre el dólar y las criptomonedas está dispersa: hay que mirar un portal para el dólar blue, otro para el MEP, un tercero para el cripto, y encima hacer cálculos a mano para saber cuánto va a costar realmente algo en pesos. Ese es el problema que DiviseTech detectó y que decidió atacar. No nos parecía justo que una persona común tuviera que navegar entre cinco sitios distintos y hojas de cálculo para tomar una decisión tan cotidiana como comprar dólares o convertir un monto.

Como equipo entendemos que el valor no está solo en mostrar un número, sino en hacerlo confiable (con fuentes reales), rápido (actualizaciones cada pocos minutos) y fácil de entender (una sola pantalla limpia). Esa es la razón de ser de nuestro emprendimiento y el criterio que usamos para tomar todas las decisiones de diseño y de tecnología a lo largo del año.

---

# 2° CARTA DE SOLICITUD DEL PROYECTO

**Fecha:** 2 de mayo de 2026
**De:** Grupo 6 — "divise"
**Para:** Julieta Da Rosa (patrocinadora)

**Ref.:** Solicitud de validación y continuidad del proyecto "divise"

Por medio de la presente, el equipo de desarrollo se dirige a usted con el fin de solicitar formalmente la aprobación para avanzar en la ejecución del proyecto divise. A continuación expresamos los fundamentos que respaldan nuestra capacidad para llevar adelante este desarrollo, y ponemos a su disposición tanto el planteo técnico como el compromiso de trabajo del grupo.

## ¿Por qué podemos realizarlo?

Presentamos cuatro razones concretas por las que el equipo está en condiciones de ejecutar el proyecto:

1. **Capacidad de gestión.** El grupo trabaja bajo la coordinación de un Project Manager, que se encarga del cumplimiento de los plazos con metodologías ágiles y un seguimiento estricto de las tareas. Esto nos permitió mantener orden durante todo el ciclo, incluso con las entregas parciales.

2. **Competencia técnica.** Somos estudiantes de la orientación técnica con conocimientos avanzados en desarrollo Full-Stack. Dominamos el manejo de servidores y de la lógica de negocio (Backend) y también la creación de interfaces de usuario modernas y dinámicas (Frontend). Esta doble capacidad nos evita depender de terceros para las dos partes más importantes del producto.

3. **Manejo de datos.** Contamos con experiencia en el diseño y la administración de bases de datos relacionales. Para un producto financiero esto es fundamental: hay que garantizar que la información que se muestra sea consistente, tenga auditoría y esté protegida. Nuestra base de datos corre en PostgreSQL con políticas de seguridad por fila (RLS).

4. **Enfoque en el usuario.** Toda nuestra planificación prioriza la experiencia del usuario (UX). Sabemos que un producto técnicamente perfecto pero difícil de usar no sirve. Por eso pusimos el foco en que cualquier persona —desde un ahorrista novato hasta un inversor— pueda entender la pantalla a simple vista.

## Herramientas y entornos de desarrollo con las que contamos

DiviseTech dispone de un conjunto de herramientas profesionales, en su mayoría de código abierto, que nos permiten trabajar con la misma calidad que un equipo comercial sin costos iniciales:

- **Tecnologías de desarrollo.** Usamos React (con Vite como herramienta de construcción) para una interfaz rápida y moderna, Node.js para un servidor escalable y PostgreSQL para un almacenamiento de datos robusto y seguro.
- **Infraestructura en la nube.** Publicamos la aplicación en **Render**, una plataforma de despliegue en la nube con integración continua a partir del repositorio de GitHub. Esto hace que la aplicación esté disponible en internet de forma constante y que cada actualización aprobada llegue a producción automáticamente.
- **Gestión de datos en tiempo real.** Integramos APIs financieras externas (DolarApi, open.er-api.com, Binance, CoinGecko y Coinbase) para que los precios se actualicen solos, sin intervención manual y con varios proveedores de respaldo.
- **Entorno de colaboración.** GitHub es nuestra herramienta de control de versiones y trabajo colaborativo: cada cambio queda registrado, el código está ordenado en ramas y protegido ante cualquier eventualidad.

Estamos convencidos de que divise representa una mejora significativa en la forma en que los usuarios acceden a la información económica en nuestro país. Contamos con las ganas, el conocimiento y las herramientas para convertir esta propuesta en una realidad funcional y eficiente.

A la espera de una respuesta favorable, saludamos atentamente.

**Firma:** Equipo DiviseTech (Valentín López, Santino Tacconi, Santiago Centurión, Lorenzo Sánchez, Bruno Cabrera).

---

# 3° ENTREVISTAS

## Presentación de la instancia

Antes de empezar a programar, el equipo necesitaba entender a quién le estábamos hablando y qué esperaba del producto. Para eso diseñamos dos instancias de relevamiento: una **entrevista cerrada**, con preguntas de opción múltiple aplicadas a un grupo de usuarios (para obtener datos cuantitativos), y una **entrevista abierta**, dirigida a directores de proyecto y personas con experiencia en gestión (para validar la viabilidad técnica del planteo). El objetivo era combinar datos numericos con opiniones fundadas, tal como se hace en un relevamiento de mercado serio.

## Entrevista Cerrada

La encuesta cerrada se dividió en dos modelos: uno orientado al **perfil del usuario y su consumo de datos**, y otro a la **usabilidad y las preferencias técnicas**. Todas las preguntas se respondían con Sí/No, lo que permitió procesar los resultados y sacar porcentajes.

### Modelo A: Perfil del Usuario y Consumo de Datos

Este bloque busca conocer la relación de la persona con el mercado: con qué frecuencia consulta precios, qué monedas usa y qué tan dispersa es hoy su experiencia.

1. ¿Consultás el precio del dólar diariamente? `[SÍ] [NO]`
2. ¿Operás habitualmente con criptomonedas (USDT, BTC, etc.)? `[SÍ] [NO]`
3. ¿Utilizás la cotización del Dólar Blue para transacciones personales? `[SÍ] [NO]`
4. ¿Te resulta difícil encontrar una calculadora de conversión rápida en la web? `[SÍ] [NO]`
5. ¿Consultás más de una fuente para validar el precio? `[SÍ] [NO]`
6. ¿Conocés la diferencia entre Dólar MEP y Dólar CCL? `[SÍ] [NO]`
7. ¿Estarías dispuesto a recibir notificaciones de cambios bruscos de precio? `[SÍ] [NO]`
8. ¿Usarías una app que centralice Blue y Cripto en una sola pantalla? `[SÍ] [NO]`
9. ¿Te interesa ver el historial de precios de la última semana? `[SÍ] [NO]`
10. ¿Considerás que la información financiera actual es confusa? `[SÍ] [NO]`

**Análisis del bloque.** Con estas diez preguntas pudimos confirmar dos hipótesis: primera, que la gente consulta el dólar con frecuencia y valida en más de una fuente (lo que muestra desconfianza en los datos dispersos); segunda, que existe una demanda real de una herramienta que centralice fiat y cripto y que ofrezca calculadora y notificaciones. La confusión con los tipos de cambio MEP/CCL reafirmó la necesidad de una interfaz que explique y simplifique.

### Modelo B: Usabilidad y Preferencias Técnicas

Este bloque está orientado a la forma en que el usuario quiere consumir la información: desde qué dispositivo, con qué estética y con qué herramientas de apoyo.

1. ¿Preferís una interfaz con modo oscuro (Dark Mode)? `[SÍ] [NO]`
2. ¿Accedés a estas herramientas principalmente desde el celular? `[SÍ] [NO]`
3. ¿Te molestan los anuncios excesivos en las webs de finanzas? `[SÍ] [NO]`
4. ¿Valorás más la velocidad de carga que el diseño estético? `[SÍ] [NO]`
5. ¿Te gustaría poder descargar un reporte de las cotizaciones en PDF? `[SÍ] [NO]`
6. ¿Usarías la calculadora integrada en lugar de hacer la cuenta mentalmente? `[SÍ] [NO]`

**Análisis del bloque.** Estos resultados orientaron decisiones concretas de producto: implementar modo oscuro, un diseño responsive pensado primero para celular y una calculadora integrada. La molestia por la publicidad excesiva de los portales tradicionales validó nuestro enfoque de interfaz limpia, sin banners.

### Preguntas abiertas de cierre

Para cerrar la encuesta dejamos cuatro preguntas abiertas, que nos permitieron captar ideas que no estaban en nuestro formulario y conocer la frustración real de los usuarios:

- ¿Qué funcionalidad sentís que le falta a las páginas actuales de cotización de dólares?
- Si pudieras personalizar tu pantalla de inicio en divise, ¿qué datos pondrías primero?
- ¿De qué manera creés que la tecnología puede ayudar a entender mejor la situación económica actual?
- Describí brevemente qué es lo que más te frustra al buscar precios financieros en internet.

De estas respuestas surgieron funcionalidades que hoy están en la aplicación: el historial de consultas, los favoritos en la pantalla principal y las alertas de precio.

## Entrevista Abierta (dirigida a Directores de Proyecto)

Además de la encuesta a usuarios, realizamos una entrevista abierta orientada a directores de proyecto y docentes con mirada de gestión. Esta instancia se centró en la **viabilidad técnica** y en los **estándares de calidad** que debe cumplir DiviseTech para el desarrollo de divise.

**Preguntas planteadas:**

1. ¿Cuáles son los protocolos de seguridad recomendados para el manejo de APIs financieras en tiempo real?
2. Desde una perspectiva de gestión, ¿cómo recomiendan manejar la caída de un proveedor de datos externo?
3. ¿Qué importancia tiene la arquitectura escalable en un entorno escolar con miras a un producto real?
4. ¿Cuál es el margen de error aceptable en las conversiones de moneda para este tipo de plataformas?

**Conclusiones de la instancia.** La entrevista nos dio pautas muy valiosas que aplicamos de inmediato: (a) las claves de las APIs no deben exponerse en el frontend, y los datos deben tratarse con HTTPS y hashing; (b) es imprescindible contar con más de un proveedor de cotizaciones y un sistema de *fallback*; (c) la arquitectura debe permitir escalar sin rediseñar (separación de entornos y base de datos administrada); y (d) las conversiones deben usar los valores reales de compra/venta y redondear de forma consistente, con la moneda base bien definida. Todas estas recomendaciones figuran implementadas en las secciones 10°, 19° y 28° de esta carpeta.

---

# 4° PROYECTO

## Nombre del proyecto

**divise**

El nombre de la aplicación es **divise**, escrito en minúscula y con un punto final, tal como aparece en la interfaz. Es una marca corta, moderna y fácil de recordar. El proyecto también se vincula históricamente a su primer nombre de trabajo, "Dolarito", y a lo largo de la documentación se menciona la transición: la aplicación ahora se identifica como **divise** (proyecto "Dolarito").

## Objetivo del proyecto

Desarrollar e implementar un sistema web de gestión de cotizaciones financieras que permita a los usuarios del emprendimiento consultar, de manera centralizada y en tiempo real, el valor del Dólar Oficial, Dólar Blue, Dólar MEP, Dólar CCL, Dólar Tarjeta, así como criptomonedas y otras divisas de referencia. El sistema debe ofrecer conversión entre monedas, historial de variación, notificaciones y personalización, con una interfaz clara, segura y accesible desde cualquier dispositivo.

## Logo del proyecto

El logo de la aplicación es la palabra **divise.** con tipografía sencilla sobre fondo oscuro, acompañada de un punto de color al final. En la pantalla principal, por ejemplo, el encabezado muestra el texto "divise." en color blanco con el punto en dorado, seguido del subtítulo "Cotizaciones & Mercado en tiempo real". Esta identidad visual se mantiene consistente a lo largo de toda la web.

## Portafolio de la aplicación (funcionalidades)

divise se presenta como un producto completo. Su cartera de funcionalidades incluye:

- Actualización automática de cotizaciones en tiempo real através de múltiples proveedores.
- Cotizaciones en vivo de Dólar Oficial, Blue, MEP, CCL, Tarjeta y criptomonedas (USDT, BTC, ETH, entre otras).
- Soporte de libras, euros y otras monedas internacionales.
- Conversor de monedas con calculadora integrada.
- Visualización de iconos de cada moneda.
- Historial de consultas por usuario.
- Registro de usuarios con verificación por correo electrónico.
- Gestión de perfil, contraseña y configuración de 2FA (verificación en dos pasos).
- Suscripción a alertas de precio.
- Selección de monedas favoritas para la pantalla principal.
- Panel de noticias del mercado.
- Modo claro y modo oscuro.
- Diseño responsive para celular, tablet y escritorio.

## Diferencial del proyecto

¿Qué hace distinto a divise? La respuesta es la centralización. Hoy, para saber cuánto vale el dólar blue hay que entrar a un portal; para ver el MEP, a otro; para el cripto, a uno distinto, y encima se necesita una calculadora separada. divise junta todo en una sola pantalla, con datos en tiempo real de varias fuentes, historial, favoritos y alertas. Y lo hace sin publicidad invasiva, con una estética cuidada y pensada para el celular.

---

# 5° RESULTADO DE ENTREVISTAS

En esta sección volcamos los datos obtenidos en la instancia de relevamiento (sección 3°): zona encuestada, edad referencial, rangos educacionales y las respuestas más significativas del cuestionario cerrado, con su correspondiente análisis.

## Zona encuestada

Las encuestas se aplicaron dentro del corredor que comprende **Berazategui, Hudson y Gutiérrez** y se enviaron también por correo electrónico a **Florencio Varela** y **Quilmes**. Esta elección no es casual: son zonas donde conviven sectores asalariados, estudiantes, comerciantes y pequeños ahorristas, es decir, exactamente el perfil de usuario al que apunta divise. Consultar a personas de localidades distintas nos permitió validar que la necesidad existe más allá de un barrio puntual.

## Edad referencial

El rango etario principal de las personas encuestadas corresponde a **edades entre 15 y 40 años**. Ese rango cubre tres perfiles: los menores de 20 que consultan criptomonedas y dólar para compras digitales; los adultos jóvenes de 20 a 30, que ahorran en dólares y comparan precios para alquileres y compras grandes; y los de 30 a 40, más orientados a inversiones y a entender el mercado antes de decidir. Es una ventaja para el proyecto: es exactamente el público que hoy consulta estas cotizaciones en forma dispersa.

![ ](./recursos/grafico_edad.png)

## Rangos educacionales

Los encuestados pertenecieron mayormente a los niveles educativos **secundario, terciario y universitario**. Esto refuerza que nuestro público tiene hábito de lectura de información técnica y usa Internet como herramienta de trabajo y estudio. Al mismo tiempo, muchos manifestaron no entender los términos financieros de los portales tradicionales (MEP, CCL, contado con liquidación), dato que sostiene la decisión de incluir explicaciones claras y una interfaz simplificada en divise.

## Algunas respuestas dadas (tabla resumida)

| Pregunta (bloque) | Respuesta mayoritaria | Lectura |
|---|---|---|
| ¿Consultás el precio del dólar diariamente? | Sí | Alta frecuencia de uso → la app será de consulta cotidiana. |
| ¿Consultás más de una fuente para validar el precio? | Sí | Desconfianza en datos dispersos → divise debe ser confiable y citar fuentes. |
| ¿Usarías una app que centralice Blue y Cripto? | Sí | Validación directa de la propuesta de valor. |
| ¿Conocés la diferencia entre dólar MEP y CCL? | No | Necesidad de simplificar y explicar. |
| ¿Querrías recibir alertas de cambios bruscos? | Sí | Da origen al módulo de alertas. |
| ¿Preferís modo oscuro? | Sí | Se implementa Dark Mode en toda la app. |
| ¿Accedés desde el celular? | Sí | El diseño es *mobile-first*. |
| ¿Te molestan los anuncios excesivos? | Sí | Interfaz limpia, sin publicidad. |

## Conclusiones de los resultados

Los datos muestran que existe una oportunidad clara: los usuarios quieren una única herramienta, confiable, rápida, sin publicidad, con alertas y que se pueda usar desde el celular con estética cuidada. Todas esas demandas fueron incorporadas al alcance del producto (sección 4°) y a la arquitectura técnica (sección 10°).

---

# 6° PROJECT CHARTER

## Información general del proyecto

| Campo | Detalle |
|---|---|
| Nombre del proyecto | divise (proyecto "Dolarito") |
| Patrocinador | Julieta Da Rosa |
| Dueño del proyecto | DiviseTech (Grupo 6 · ESTFA 2026) |
| Project Manager | Valentín López |
| Fecha de inicio | Marzo de 2026 |
| Fecha de finalización prevista | Octubre de 2026 |
| Metodología | SCRUM simplificado, sprints semanales |

## Grupo de trabajo

| Integrante | Rol en el proyecto |
|---|---|
| Valentín López | Project Manager / Scrum Master |
| Santino Tacconi | Developer (Backend y Frontend) |
| Santiago Centurión | Developer (Backend y Frontend) |
| Bruno Cabrera | Diseñador / UX |
| Lorenzo Sánchez | Base de Datos / Administración |

**Roles y responsabilidades.** El Project Manager es el responsable de coordinar los sprints, gestionar el backlog, medir avances y comunicarse con la patrocinadora. Los developers se encargan del código de la aplicación (API, lógica de negocio e integraciones), el diseñador UX define la experiencia visual y los flujos de pantalla, y el responsable de base de datos mantiene el modelo, las migraciones y las consultas. Los roles se distribuyeron según las fortalezas de cada integrante y con intención de que todos aprendan de todo.

## Stakeholders

| Stakeholder | Interés en el proyecto |
|---|---|
| Julieta Da Rosa | Patrocina el proyecto y evalúa la entrega. |
| Grupo 6 (DiviseTech) | Desarrollo completo del producto. |
| Profesorado / ESTFA | Marco académico y evaluación del proceso. |
| Usuarios finales | Consumidores de la información financiera. |

## Alcance del proyecto

**Alcance in:** plataforma web de cotizaciones en tiempo real con registro y autenticación de usuarios, verificación por correo, panel de cotizaciones fiat y cripto, conversor de monedas, historial de consultas, alertas de precio, favoritos, noticias y perfil configurable (con 2FA).

**Alcance out:** aplicaciones móviles nativas (iOS/Android), venta directa de divisas, operaciones de cambio reales, billetera financiera con fondos y soporte multidioma.

## Riesgos del proyecto

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Caída de una API externa de cotizaciones | Media | Alto | Múltiples proveedores y *fallback* automático. |
| Retraso en la entrega de un sprint | Media | Medio | Sprints semanales cortos y revisión de backlog. |
| Pérdida de código | Baja | Alto | Git + repositorio remoto en GitHub. |
| Datos incorrectos en conversiones | Baja | Alto | Moneda base definida y pruebas de casos. |
| Abandono de un integrante | Baja | Medio | Distribución de conocimiento en el equipo. |

## Restricciones y dependencias externas

- **Dependencias de terceros:** las cotizaciones dependen de proveedores externos (DolarApi, open.er-api.com, Binance, CoinGecko y Coinbase) cuyo servicio no controlamos.
- **Restricción técnica:** el producto corre en servicios en la nube gratuitos (Render), lo que implica límites de plan que se tuvieron en cuenta.
- **Restricción de calendario:** entregas parciales el 06/05/2026 y el 17/06/2026 y entrega final del documento en octubre de 2026.
- **Restricción legal:** los datos personales se tratan conforme a la Ley 25.326 de Protección de Datos Personales.

## Estrategia de comunicación

- **Reuniones:** dailies breves (10-15 minutos) y planning al inicio de cada sprint semanal.
- **Herramientas:** Trello para el tablero (backlog, en progreso, hecho), WhatsApp/Discord para comunicación diaria del equipo, correo electrónico para comunicaciones formales con la patrocinadora.
- **Reportes:** el Project Manager informa avances por sprint y presenta entregas parciales en las fechas establecidas.
- **Documentación:** toda la información del proyecto se registra en esta carpeta funcional y en el repositorio de GitHub.

# 7° ESTUDIO DE FACTIBILIDAD

## Introducción

Antes de invertir tiempo, esfuerzo y recursos en el desarrollo de divise, el equipo realizó un estudio completo de factibilidad con el objetivo de confirmar que el proyecto es viable desde el punto de vista económico, técnico, operativo y legal. Este estudio sigue la estructura clásica de un análisis de proyectos: se plantea primero el problema, luego se justifica la solución, se describe el entorno socioeconómico y legal, se estudia el mercado, se define el estudio técnico, se presenta el cronograma y finalmente se evalúa la parte financiera. Cada apartado se sustenta con datos obtenidos del relevamiento de entrevistas (sección 3°) y con la información real del desarrollo que llevamos adelante.

## Reconocimiento general

El equipo reconoce las barreras de acceso a la información financiera que atraviesa la población argentina. En el día a día, una persona necesita comparar la cotización del dólar en distintos portales, unir cifras contradictorias entre bancos y servicios digitales, y procesar un vocabulario técnico que no siempre conoce. La brecha de información genera desconfianza y malas decisiones económicas. divise nace para reconocer este problema y proponer una solución concreta: información centralizada, en tiempo real y explicada de manera simple.

## Justificación

El proyecto se justifica por tres motivos centrales:

1. **Necesidad real detectada:** el 100% de los encuestados consulta el dólar y más de la mitad lo hace a diario, pero debe recurrir a fuentes dispersas.
2. **Oportunidad técnica:** las herramientas necesarias (APIs financieras, servicios en la nube, tecnologías web) son accesibles y en su mayoría gratuitas, lo que permite desarrollar un producto profesional con costo inicial mínimo.
3. **Valor para el usuario:** evitar que la persona tenga que navegar entre cinco sitios y memorizar cálculos para saber cuánto vale su inversión ahorra tiempo y reduce la incertidumbre.

## Título

**divise — Plataforma web de cotizaciones financieras en tiempo real.**

## Planteamiento del problema

En la actualidad, el acceso a la información cambiaria está fragmentado: cada portal publica un tipo de dólar (Oficial, Blue, MEP, CCL, Tarjeta) y las criptomonedas se consultan en plataformas aparte. El usuario debe abrir múltiples pestañas, comparar los valores, estar atento a las actualizaciones y finalmente hacer el cálculo de conversión por su cuenta. Esta dispersión genera tres problemas graves:

- **Pérdida de tiempo y esfuerzo** en cada consulta cotidiana.
- **Errores y desinformación** al mezclar fuentes de distinta vigencia o metodología.
- **Desconfianza** hacia los datos disponibles, dado que los portales muchas veces muestran valores inconsistentes entre sí.

## Antecedentes

Existen antecedentes de portales financieros en Argentina (sitios de cotización del dólar, páginas de bancos y APIs de criptomonedas), pero todos comparten la misma limitación: se enfocan en un único segmento (solo dólar, solo cripto, solo bancos) y ninguno ofrece una experiencia unificada con cálculo, historial, favoritos y alertas en una sola pantalla. En el plano académico, este proyecto se apoya en los conocimientos de la orientación técnica (base de datos, programación, redes y sistemas) y en la metodología SCRUM aprendida durante el ciclo.

## Descripción

divise es una aplicación web (SPA) que se ejecuta en el navegador y consume una API propia desarrollada en Node.js. La API se conecta a múltiples proveedores de cotizaciones en tiempo real, guarda los datos históricos en una base de datos PostgreSQL y expone endpoints seguros para registrarse, iniciar sesión, consultar precios, convertirlos, guardar favoritos, configurar alertas y ver el historial. La interfaz está diseñada en React, con soporte de modo oscuro y diseño adaptable a dispositivos móviles.

## Plan estratégico y objetivo

**Visión del proyecto**

Posicionarse en el mediano plazo como la plataforma de referencia de cotizaciones en Argentina, ampliando las monedas cubiertas y las herramientas de análisis para el usuario.

**Misión del proyecto**

Ofrecer información de cotizaciones precisa y en tiempo real, accesible y gratuita, simplificando la vida económica de los usuarios.

**Valores del proyecto**

- **Confianza:** información citada y verificada de fuentes reales.
- **Transparencia:** se explican los tipos de cambio y la base de las conversiones.
- **Accesibilidad:** gratis, multiplataforma y de uso simple.
- **Seguridad:** protección de los datos personales de los usuarios.

**Objetivo del plan**

Desarrollar, probar y publicar la aplicación en línea para octubre de 2026, cumpliendo con las entregas parciales, con una calidad verificada mediante al menos 24 casos de prueba funcionales, y con la documentación completa que conforma esta carpeta.

## Entorno socioeconómico y legal

### Entorno económico

El contexto económico argentino está marcado por la volatilidad cambiaria: el dólar es un activo de referencia para ahorristas, comerciantes y estudiantes, y su cotización se actualiza varias veces al día. Esta volatilidad convierte a la información de precios en un bien de alta demanda, lo que asegura que una herramienta de consulta como divise tenga usuarios que la utilicen de manera sostenida. El proyecto no depende de ingresos por venta para funcionar: es gratuito para el usuario y se apoya en herramientas de bajo costo, lo que lo vuelve viable incluso en un contexto de incertidumbre económica.

### Entorno legal

La aplicación trata datos personales (correo electrónico, nombre de usuario, preferencias). Por eso se diseñó en cumplimiento de la **Ley Nacional N.º 25.326 de Protección de los Datos Personales**, con principios de consentimiento, confidencialidad y seguridad. El acceso remoto es mediante HTTPS, las contraseñas se almacenan con hash (bcrypt) y las claves de las APIs externas nunca se exponen en el frontend (sección 10°). El desarrollo se encuadra en el acuerdo del emprendimiento (sección 24°) y en el contrato de venta y licitación (sección 25°).

## Estudio de mercado

### Demanda

**Población objetivo.** El producto está dirigido al público general de habla hispana, con foco en argentinos entre 15 y 40 años: ahorristas, estudiantes, comerciantes y usuarios de criptomonedas que necesitan conocer el valor de las divisas para tomar decisiones cotidianas.

**Análisis de la demanda.** Las entrevistas (sección 5°) confirmaron una alta frecuencia de consulta del dólar, disposición a usar una herramienta centralizada y demanda específica de alertas, favoritos e historial. Además, el uso creciente de criptomonedas entre menores de 30 amplía el mercado potencial más allá del público bancario tradicional.

### Oferta

**Análisis de la competencia.** La competencia se divide en:

- **Portales de cotización** (sitios únicos de dólar): cubren un segmento, pero con interfaces cargadas de publicidad y sin calculadora integrada ni historial por usuario.
- **Exchanges de criptomonedas:** funcionan bien para cripto, pero no explican los tipos de cambio del dólar argentino ni ofrecen el blue.
- **APIs financieras públicas:** poderosas pero pensadas para desarrolladores, no para el usuario común.

Ninguno de estos competidores ofrece la unificación de fiat + cripto + herramientas que plantea divise. Nuestro diferencial es la **experiencia integral** en una sola pantalla.

### Comercialización: Producto, Precio y Plaza

**Producto:** plataforma web de cotizaciones con conversor, historial, alertas y personalización.

**Precio:** gratuito para el usuario final. La sostenibilidad se apoya en el bajo costo de infraestructura y en futuras mejoras opcionales (funciones premium) que se evalúan en la proyección (sección 8°).

**Plaza (distribución):** 100% digital: se accede vía navegador desde cualquier dispositivo a las URLs públicas de Render. La promoción se realizará entre el público de la zona (Berazategui y alrededores), en redes sociales y con la difusión de la entrega académica.

## Estudio técnico

### Tamaño del proyecto

El proyecto abarca: una SPA con 11 pantallas, una API REST con 17 endpoints, una base de datos relacional con 6 tablas, integración con 5 proveedores de cotizaciones externos y un entorno productivo en la nube. El desarrollo demandó aproximadamente 290 horas de trabajo del equipo.

### Arquitectura

La solución se organiza en tres capas bien diferenciadas:

1. **Frontend** (React + Vite): responsable de la interfaz, del estado de la sesión y de la presentación de los datos.
2. **Backend** (Node.js + Express): expone la API REST, hace de puente con los proveedores externos, procesa los cálculos y aplica la lógica de negocio.
3. **Base de Datos** (PostgreSQL en Supabase): almacena usuarios, divisas, tipos de cambio, favoritos, historial y alertas, con políticas de seguridad por fila.

Esta separación de capas permite mantener el código ordenado, probar cada parte por separado y escalar un componente sin tocar los demás.

### Tecnologías y APIs

**Tecnologías principales:**

| Capa | Tecnología | Función |
|---|---|---|
| Frontend | React 18 + Vite 7 + React Router 6 | Interfaz de usuario y enrutado. |
| Frontend | Chart.js | Gráficos de evolución de precios. |
| Backend | Node.js + Express 5 | Servidor y API REST. |
| Base de datos | PostgreSQL (Supabase) | Almacenamiento persistente. |
| Seguridad | JWT + bcrypt + código de 6 dígitos | Autenticación y verificación en dos pasos. |
| Correo | Nodemailer / Brevo / Resend | Envío de verificación y credenciales. |
| Despliegue | Render | Hosting e integración continua. |

**APIs de cotizaciones:** DolarApi, open.er-api.com, Binance, CoinGecko y Coinbase. Encontrar disponibles **más de 50 criptomonedas**, monedas fiduciarias internacionales como USD, EUR, GBP, entre otras, y **hasta 10 sitios web derivados** para obtener las cotizaciones en tiempo real.

### Organización (estructura del equipo)

El equipo se organizó con una estructura plana de 5 integrantes, cada uno con su especialidad pero colaborando en todo el ciclo. La gestión de tareas se realizó con metodología SCRUM en sprints semanales y un tablero de Trello, con dailies cortas y retrospectiva al final de cada iteración.

### Costos realistas

**Horas totales:** el proyecto demandó aproximadamente 290 horas de desarrollo. **Costo monetario:** las herramientas utilizadas son de uso gratuito en sus planes de inicio (Render, Supabase, GitHub, proveedores de APIs), por lo que el costo monetario directo del desarrollo fue mínimo. El presupuesto comercial estimado para el cliente, en caso de licitarse el desarrollo, se detalla en la sección 21°.

### Riesgos técnicos y mitigaciones

- **Fallo de una API externa:** se resuelve con proveedores múltiples y *fallback* automático (goza del respaldo de hasta 5 fuentes).
- **Datos desactualizados:** se aplica un ciclo de refrescamiento con tolerancias de tiempo documentado en el manual y en soporte.
- **Fugas de claves:** las claves se guardan en variables de entorno del servidor, nunca en el repositorio.
- **Ataques comunes (SQL injection, XSS):** mitigados con parámetros preparados, validación en servidor y JWT firmado.
- **Sobrecarga del plan gratuito:** se controla mediante límites de plan y monitoreo en Render.

### Seguridad

- **Autenticación:** contraseña con hash (bcrypt), token JWT para las sesiones y verificación con código de 6 dígitos enviado por correo.
- **2FA:** opción de segundo factor dentro del perfil del usuario.
- **Protección de datos:** HTTPS en todas las comunicaciones, mínimo privilegio y RLS en la base de datos.
- **Claves de APIs externas:** residen únicamente en variables de entorno del servidor (`DOLAR_API_KEY`, etc.).
- **Cumplimiento legal:** tratamiento de datos personales conforme a la Ley 25.326.

### Escalabilidad

La arquitectura por capas y la base de datos administrada permiten escalar: si el número de usuarios crece, se puede ampliar el plan de Render y de Supabase sin rediseñar la aplicación. En cuanto a **funciones futuras**, se prevén: conversor con histórico ampliado, reportes descargables en PDF, comparador de tendencias, alertas personalizadas por intervalos, y en el largo plazo una aplicación móvil nativa.

## Cronograma completo (resumen de hitos)

El detalle completo figura en la sección 9° (GANTT). Resumen de hitos principales:

| Hito | Fecha |
|---|---|
| Inicio del proyecto y relevamiento | 10/03/2026 |
| Entregas parciales del ciclo | 06/05/2026 y 17/06/2026 |
| Desarrollo de la aplicación | Marzo – Septiembre 2026 |
| Pruebas y correcciones | Septiembre 2026 |
| Entrega de la carpeta funcional | Octubre 2026 |

## Evaluación financiera

### Inversión: Activos fijos y Capital de trabajo

**Activos fijos:** no fue necesario adquirir hardware nuevo; el proyecto se desarrolló con las computadoras personales del equipo. Se consideraron como parte de la inversión las herramientas de software utilizadas (cuentas en servicios en la nube, en su mayoría en planes gratuitos).

**Capital de trabajo:** cubre el costo de los planes de hosting de pago cuando el proyecto crezca y las horas de desarrollo dedicadas al mantenimiento. El capital inicial efectivo del emprendimiento es bajo, lo cual es favorable a la factibilidad.

### Beneficios esperados del proyecto

**Beneficios tangibles:**

- Reducción del tiempo de consulta: de navegar entre varios portales a una sola pantalla.
- Disponibilidad de información en tiempo real con respaldo de múltiples fuentes.
- Herramientas de conversión y historial sin costo para el usuario.

**Beneficios intangibles:**

- Educación financiera de los usuarios (entender MEP, CCL, blue y cripto).
- Marca y portafolio profesional para el equipo DiviseTech.
- Aprendizaje técnico y de gestión para los 5 integrantes del grupo.

### Análisis FODA

**Fortalezas:** conocimiento técnico full-stack del equipo; arquitectura desacoplada; producto real publicado en la nube; múltiples fuentes de datos con respaldo.

**Oportunidades:** mercado con demanda creciente de información financiera; usuarios jóvenes adoptando cripto; bajo costo de infraestructura; posibilidad de crecer hacia app móvil.

**Debilidades:** equipo pequeño (5 personas) con horas limitadas por compromisos académicos; dependencia de planes gratuitos y de APIs de terceros; sin presupuesto de marketing.

**Amenazas:** volatilidad normativa del mercado cambiario; cambios en las APIs externas; competencia de portales grandes con más recursos; posibles límites de los planes gratuitos con el aumento de usuarios.

---

# 8° PROYECCIÓN

## Proyección a corto plazo (2026 – 2027)

En el corto plazo el objetivo es consolidar la versión estable de divise. Esto implica: mantener la aplicación publicada y estable en Render, sumar usuarios entre el público de la zona, incorporar los ajustes surgidos de las pruebas y afianzar el uso de las alertas y los favoritos como funciones más elegidas. También se busca oficializar la identidad de marca "divise" (reemplazando en toda la documentación al nombre de trabajo "Dolarito").

## Proyección a mediano plazo (2027 – 2029)

En el mediano plazo, DiviseTech proyecta: incorporar nuevas funcionalidades (reportes en PDF, comparador de tendencias, alertas configuradas por montos e intervalos), ampliar la cobertura de divisas y noticias, y ofrecer opciones premium opcionales que no afecten el acceso gratuito base. A su vez, se evaluará migrar a planes de pago de hosting si el volumen de usuarios lo justifica.

## Proyección a largo plazo (2029 y siguientes)

A largo plazo, la proyección es crecer hacia un ecosistema financiero digital: aplicación móvil nativa, integración con más exchanges y bancos, herramientas de educación financiera e incluso servicios B2B de proveeduría de datos para comercios. La meta es que divise pase de ser un sitio de consulta a una plataforma integral que acompañe las decisiones financieras de sus usuarios.

## Justificación de las proyecciones

Las proyecciones se apoyan en tres pilares: la demanda real verificada en las encuestas, la arquitectura escalable que ya tenemos (no hace falta rediseñar para crecer) y el bajo costo de operación. Como el producto es software, ampliar funciones o usuarios no incrementa el costo por unidad de forma significativa: lo que hoy sirve a 100 usuarios puede servir a miles con ajustes menores de infraestructura.

# 9° CREACIÓN DEL GANTT

## ¿Qué es el diagrama de GANTT del proyecto?

El diagrama de Gantt es la herramienta visual que usamos para planificar el avance del proyecto: es un gráfico de barras horizontales donde cada tarea ocupa una barra cuyo largo representa su duración sobre la línea del tiempo. Permite ver de un vistazo qué se está haciendo, en qué fase estamos y cuándo vence cada entrega. Para divise, el cronograma cubre desde **el 10 de marzo de 2026** hasta **el 1 de octubre de 2026**, con dos entregas parciales previstas para el **06/05/2026** y el **17/06/2026** y la presentación final en octubre.

## Desglose de tareas por fases

Las tareas se organizaron en fases, alineadas con la metodología SCRUM (sección 27°):

**Fase 1 — Inicio y relevamiento (marzo):**
- Conformación del grupo y definición de roles.
- Elección del proyecto y análisis del problema.
- Búsqueda de información y entrevistas (encuesta cerrada y abierta).
- Presentación del anteproyecto y definición del alcance.

**Fase 2 — Análisis y diseño (abril):**
- Análisis de requerimientos.
- Diseño de la base de datos (MR-MER, diccionario de datos, DER).
- Maquetas de pantallas y flujo de navegación.
- Diseño de la interfaz (modo claro/oscuro, logo, estética).

**Fase 3 — Desarrollo (marzo a septiembre):**
- Configuración del ambiente de desarrollo (Git, entorno, base de datos).
- Desarrollo del backend: API, autenticación, verificación por correo, integraciones.
- Desarrollo del frontend: pantallas de inicio, registro, login, panel de cotizaciones, conversor, favoritos, alertas, historial, perfil.
- Integración con las APIs de cotizaciones en tiempo real.
- Pruebas de integración entre capas.

**Fase 4 — Pruebas (septiembre):**
- Ejecución de los casos de prueba funcionales (sección 23°).
- Corrección de errores y ajustes de calidad.
- Verificación de seguridad y desempeño.

**Fase 5 — Entrega y despliegue (octubre):**
- Publicación en producción en Render.
- Carga de la documentación (carpeta funcional, manual de usuario, soporte).
- Presentación final ante la patrocinadora.

## Tabla resumida del cronograma

| Fase | Tareas principales | Inicio | Fin |
|---|---|---|---|
| 1. Inicio y relevamiento | Roles, entrevistas, alcance | 10/03/2026 | 01/04/2026 |
| 2. Análisis y diseño | BD, maquetas, DER | 01/04/2026 | 30/04/2026 |
| 3. Desarrollo | Backend + Frontend + integraciones | 01/05/2026 | 20/09/2026 |
| 4. Pruebas | Casos de prueba y ajustes | 01/09/2026 | 30/09/2026 |
| 5. Entrega | Despliegue y documentación | 01/10/2026 | 01/10/2026 |

**Entregas parciales:** 06/05/2026 y 17/06/2026 (revisiones del avance frente a la patrocinadora).

## Justificación del cronograma

El cronograma se armó a partir de un objetivo claro: tener la aplicación **funcionando en línea para octubre de 2026** con la mayor robustez posible. Para eso se priorizó: (a) un relevamiento corto pero sólido al inicio (para encarar el desarrollo con el alcance definido); (b) el desarrollo de backend y frontend **en paralelo** (trabajo simultáneo de developers sobre diferentes módulos), lo que acorta los tiempos de la fase 3; y (c) un mes completo de pruebas antes de la entrega, para que los errores se corrijan sin apuros. Las fechas coinciden con el calendario académico y con la disponibilidad de todos los integrantes.

# 10° CREACIÓN Y JUSTIFICACIÓN DEL AMBIENTE DE DESARROLLO Y PRODUCCIÓN

## Ambiente de desarrollo

El entorno donde el equipo desarrolla y prueba el código es totalmente local y gratuito. Cada integrante usa su computadora con los siguientes componentes instalados:

- **Sistema operativo:** Windows (en las máquinas del equipo).
- **Backend:** Node.js con Express (API en el puerto 5000 en modo local).
- **Frontend:** React con Vite (servidor de desarrollo local con *hot reload*).
- **Base de datos:** PostgreSQL, conectada al entorno de desarrollo de Supabase (las migraciones van de la 001 a la 010).
- **Control de versiones:** Git + GitHub (repositorio compartido con ramas de trabajo).

El trabajo en el ambiente de desarrollo se apoya en las variables de entorno: las claves de las APIs y las credenciales de la base de datos se definen en un archivo de entorno que no se sube al repositorio. Esto evita exponer secretos y permite que cada integrante tenga su propia configuración local.

## Ambiente de producción

La aplicación publicada corre en **Render**, con despliegue automático desde la rama principal de GitHub:

- **API** (backend) publicada en: `https://divise.onrender.com`
- **Frontend** publicado en: `https://divise-frontend.onrender.com`
- **Base de datos**: PostgreSQL administrada (Supabase) accesible únicamente desde el servidor con credenciales seguras.

Render se encarga de la integración continua: cada vez que se aprueba un cambio en la rama principal, se compila y se despliega de forma automática, sin intervención manual. Las URLs públicas fueron verificadas respondiendo con código 200 (correcto) para que el acceso sea directo y estable.

## Entornos utilizados (tabla comparativa)

| Aspecto | Desarrollo | Producción |
|---|---|---|
| Dónde corre | Computadoras del equipo | Render (nube) |
| Frontend | Vite (dev server) | Build estático + servicio |
| Backend | Node local (puerto 5000) | Node en la nube |
| Base de datos | Supabase (dev) | Supabase (prod) |
| Despliegue | Manual (local) | Automático (GitHub → Render) |
| Envío de correos | Modo prueba | Nodemailer/Brevo/Resend |

## Justificación del ambiente elegido

Elegimos separar desarrollo y producción por tres razones: **seguridad** (no se prueban cambios sobre el sitio real), **estabilidad** (el usuario final nunca ve versiones rotas) y **orden** (cada ambiente tiene sus propias credenciales y datos). El uso de Render y Supabase en sus planes gratuitos redujo los costos a casi cero, y la integración con GitHub acortó muchísimo el tiempo entre que un integrante termina una función y esta aparece en el sitio público. Además, al mantener la fuente de verdad en GitHub, todo el equipo tiene siempre la última versión y se pueden deshacer cambios equivocados.

# 11° MR-MER: DICCIONARIO DE DATOS Y REFERENCIAS

## ¿Qué es el MR-MER?

El MR-MER (Modelo Relacional derivado del Modelo Entidad-Relación) es la representación lógica de la base de datos: muestra las tablas (antes entidades) con sus campos, tipos de datos, claves primarias y foráneas, y las relaciones entre ellas (uno a muchos en este esquema). Fue el documento de partida para crear las migraciones y escribir las consultas de la sección 19°.

## Diccionario de datos

A continuación, el diccionario de datos con las **6 tablas** del modelo. En las columnas se indica: campo, tipo de dato, si admite nulos, y su uso.

### Tabla `usuarios`

| Campo | Tipo | Nulo | Origen | Referencia |
|---|---|---|---|---|
| `id` | UUID | No | Automático | Clave primaria |
| `email` | VARCHAR(255) | No | Formulario registro | Único, índice |
| `password_hash` | VARCHAR(255) | No | Formulario registro | Hash bcrypt |
| `username` | VARCHAR(50) | No | Formulario registro | Nombre visible |
| `moneda_base` | VARCHAR(10) | No | Preferencia | ARS por defecto |
| `created_at` | TIMESTAMP | No | Auto | Alta del registro |
| `updated_at` | TIMESTAMP | No | Auto | Última modificación |

### Tabla `divisas`

| Campo | Tipo | Nulo | Origen | Referencia |
|---|---|---|---|---|
| `id` | UUID | No | Automático | Clave primaria |
| `nombre` | VARCHAR(100) | No | Catálogo | Nombre de la divisa |
| `simbolo` | VARCHAR(10) | No | Catálogo | USD, EUR, USDT… |
| `tipo` | VARCHAR(20) | No | Catálogo | fiat / cripto |

### Tabla `tipos_de_cambio`

| Campo | Tipo | Nulo | Origen | Referencia |
|---|---|---|---|---|
| `id` | UUID | No | Automático | Clave primaria |
| `divisa_id` | UUID | No | Automático | Foránea → `divisas.id` |
| `fecha` | DATE | No | Sistema | Fecha de la cotización |
| `precio_compra` | NUMERIC(18,6) | No | API externa | Compra |
| `precio_venta` | NUMERIC(18,6) | No | API externa | Venta |
| `fuente` | VARCHAR(100) | No | API externa | Proveedor del dato |

### Tabla `favoritos`

| Campo | Tipo | Nulo | Origen | Referencia |
|---|---|---|---|---|
| `id` | UUID | No | Automático | Clave primaria |
| `usuario_id` | UUID | No | Sesión | Foránea → `usuarios.id` |
| `divisa_id` | UUID | No | Selección | Foránea → `divisas.id` |
| `created_at` | TIMESTAMP | No | Auto | Fecha de baja/alta |

### Tabla `historial_de_consultas`

| Campo | Tipo | Nulo | Origen | Referencia |
|---|---|---|---|---|
| `id` | UUID | No | Automático | Clave primaria |
| `usuario_id` | UUID | No | Sesión | Foránea → `usuarios.id` |
| `divisa_id` | UUID | No | Consulta | Foránea → `divisas.id` |
| `monto` | NUMERIC(18,6) | No | Usuario | Monto convertido |
| `resultado` | NUMERIC(18,6) | No | Cálculo | Resultado de la conversión |
| `fecha` | TIMESTAMP | No | Auto | Momento de la consulta |

### Tabla `alertas`

| Campo | Tipo | Nulo | Origen | Referencia |
|---|---|---|---|---|
| `id` | UUID | No | Automático | Clave primaria |
| `usuario_id` | UUID | No | Sesión | Foránea → `usuarios.id` |
| `divisa_id` | UUID | No | Selección | Foránea → `divisas.id` |
| `precio_objetivo` | NUMERIC(18,6) | No | Usuario | Valor a vigilar |
| `activo` | BOOLEAN | No | Usuario | Si notifica o no |
| `created_at` | TIMESTAMP | No | Auto | Fecha de alta |

## Cardinalidad y referencias

Todas las relaciones del modelo son de tipo **uno a muchos (1:N)**:

| Origen | Destino | Tipo |
|---|---|---|
| `usuarios (1)` → `favoritos (N)` | un usuario tiene muchos favoritos | 1:N |
| `usuarios (1)` → `historial_de_consultas (N)` | un usuario tiene muchas consultas | 1:N |
| `usuarios (1)` → `alertas (N)` | un usuario crea muchas alertas | 1:N |
| `divisas (1)` → `tipos_de_cambio (N)` | una divisa tiene muchos tipos de cambio | 1:N |
| `divisas (1)` → `favoritos (N)` | una divisa es favorita de varios usuarios | 1:N |
| `divisas (1)` → `historial_de_consultas (N)` | una divisa participa en muchas consultas | 1:N |
| `divisas (1)` → `alertas (N)` | una divisa es vigilada por varias alertas | 1:N |

Las claves foráneas garantizan la **integridad referencial**: no se puede crear una alerta de un usuario inexistente, y borrar una divisa obliga a revisar sus dependencias. Las claves primarias son UUID para que los identificadores no sean predecibles y funcionen bien en entornos distribuidos.

# 12° DIAGRAMA DE CONTEXTO (DFD NIVEL 0)

## ¿Qué representa este diagrama?

El diagrama de contexto muestra el sistema divise como **una única caja** (Proceso 0) y lo une con las entidades externas con las que intercambia información. Se llama "nivel 0" porque no muestra los procesos internos: eso se abre en el nivel 1 y en el nivel 2.

## Entidades externas

Las entidades con las que se relaciona el sistema son:

- **Visitante:** persona que ve las cotizaciones públicas sin haberse registrado.
- **Usuario registrado:** persona con cuenta que consulta, convierte, guarda favoritos, crea alertas y ve su historial.
- **Proveedores externos de datos:** APIs de cotizaciones (DolarApi, open.er-api.com, Binance, CoinGecko y Coinbase).
- **Servicio de correo:** proveedor de correo electrónico utilizado para verificar cuentas y notificar alertas.
- **Administrador (DiviseTech):** miembro del equipo que administra usuarios y monitorea el sistema.

## Flujos de información principales

| Origen | Flujo | Destino |
|---|---|---|
| Visitante | Solicitud de ver cotizaciones | divise |
| divise | Cotizaciones en tiempo real (visualización) | Visitante |
| Usuario | Registro / Inicio de sesión | divise |
| Usuario | Alta de favoritos y alertas | divise |
| Usuario | Conversión de montos | divise |
| divise | Confirmación de operación / historial | Usuario |
| divise | Solicitud de datos de precio | Proveedores externos |
| Proveedores | Cotizaciones actualizadas | divise |
| divise | Correo de verificación y notificaciones | Servicio de correo |
| Administrador | Gestión de cuentas y monitoreo | divise |
| divise | Reportes y estado del sistema | Administrador |

## Tabla de procesos (Nivel 0)

| N.º | Nombre | Descripción corta |
|---|---|---|
| 0 | divise | Sistema integral de cotizaciones |

## Tabla de depósitos de datos (Nivel 0)

| N.º | Nombre |
|---|---|
| D1 | Usuarios |
| D2 | Divisas |
| D3 | Tipos de cambio |
| D4 | Historial |
| D5 | Favoritos |
| D6 | Alertas |

---

# 13° DFD NIVEL 1

## Descomposición del proceso 0

En el nivel 1, el sistema (Proceso 0) se abre en los procesos principales que lo componen:

| N.º | Nombre | Responsabilidad |
|---|---|---|
| 1.0 | Gestión de usuarios | Registro, login, verificación de cuenta, recuperación y perfil. |
| 2.0 | Alta y actualización de cotizaciones | Consulta a proveedores externos y persistencia de precios. |
| 3.0 | Gestión de consultas y conversión | Conversor de monedas y registro del historial. |
| 4.0 | Gestión de favoritos | Alta/baja de monedas favoritas del usuario. |
| 5.0 | Gestión de alertas | Creación, activación y notificación de alertas de precio. |
| 6.0 | Panel de cotizaciones y noticias | Visualización de precios, gráficos y noticias del mercado. |

## Recorrido de los flujos (Nivel 1)

- **Proceso 1.0:** recibe los datos de registro/login del usuario; verifica el correo mediante el servicio de correo; valida credenciales y entrega el token de sesión. Lee y escribe en D1 (usuarios).
- **Proceso 2.0:** se comunica con los proveedores externos, toma las cotizaciones, las normaliza y guarda los valores en D3 (tipos de cambio) vinculados a D2 (divisas). Es un proceso automático, ejecutado periódicamente.
- **Proceso 3.0:** toma el monto y la moneda ingresados por el usuario, usa el último valor de D3 para calcular el resultado y registra la consulta en D4 (historial).
- **Proceso 4.0:** agrega o quita divisas de D5 (favoritos) según el usuario. Los favoritos se reflejan en la pantalla principal.
- **Proceso 5.0:** crea alertas en D6 (alertas), las compara con los valores de D3 y, cuando el objetivo se cumple, dispara la notificación por correo.
- **Proceso 6.0:** consolida D2, D3 y las noticias para presentarlas en pantalla con gráficos de evolución (Chart.js).

## Tablas de procesos y depósitos (Nivel 1)

**Procesos:**

| N.º | Nombre |
|---|---|
| 1.0 | Gestión de usuarios |
| 2.0 | Alta y actualización de cotizaciones |
| 3.0 | Gestión de consultas y conversión |
| 4.0 | Gestión de favoritos |
| 5.0 | Gestión de alertas |
| 6.0 | Panel de cotizaciones y noticias |

**Depósitos de datos:**

| N.º | Nombre | Lectura/Escritura desde |
|---|---|---|
| D1 | Usuarios | Proceso 1.0 |
| D2 | Divisas | Procesos 2.0, 6.0 |
| D3 | Tipos de cambio | Procesos 2.0, 3.0, 5.0, 6.0 |
| D4 | Historial | Proceso 3.0 |
| D5 | Favoritos | Proceso 4.0 |
| D6 | Alertas | Proceso 5.0 |

---

# 14° DFD NIVEL 2

## Desagregación del Proceso 1.0 (Gestión de usuarios)

El nivel del detalle se aplica al proceso de gestión de usuarios, el más complejo de la aplicación por el tema de la seguridad:

| N.º | Nombre | Detalle de la tarea |
|---|---|---|
| 1.1 | Análisis de credenciales | Compara el hash de la contraseña (bcrypt) con el guardado; si coincide, emite el JWT. |
| 1.2 | Registro de clientes | Valida los datos del formulario, normaliza el correo, hashea la contraseña y crea el usuario. |
| 1.3 | Actualización de datos | Permite modificar nombre, moneda base, contraseña y configurar 2FA. |
| 1.4 | Baja de clientes | Aplica la baja lógica (el usuario deja de poder operar) o la baja definitiva. |

## Desagregación del Proceso 2.0 (Alta y actualización de cotizaciones)

| N.º | Nombre | Detalle de la tarea |
|---|---|---|
| 2.1 | Inyección de datos de la API | Realiza las peticiones a los 5 proveedores con las claves desde variables de entorno. |
| 2.2 | Validación y normalización | Verifica que los datos lleguen con formato correcto y los unifica (misma moneda base, mismo formato numérico). |
| 2.3 | Actualización de valores | Inserta los precios en D3 asociándolos a su divisa de D2. |

## Desagregación del Proceso 3.0 (Conversión) y 5.0 (Alertas)

- **3.1 Conversión de monedas:** toma `monto × precio` según la dirección de la conversión (de ARS a USD o viceversa). La moneda base del usuario se respeta en el cálculo.
- **3.2 Historial:** guarda la consulta en D4 con fecha y usuario.
- **5.1 Alta de alertas:** registra la alerta y le asigna estado activo.
- **5.2 Verificación de objetivos:** compara `precio_objetivo` contra D3 cada ciclo de actualización.
- **5.3 Notificación:** si el objetivo se cumplió, envía el correo al usuario y desactiva la alerta.

## Diagrama Nivel 2 (resumen visual en texto)

```
                 ┌─────────────────────────────────┐
                 │  1.0 Gestión de Usuarios        │
  Usuario ──────►│                                 │
                 │  1.1 Credenciales   1.3 Update  │
                 │  1.2 Registro       1.4 Baja    │
                 └──────────┬──────────────────────┘
                            │
                            ▼
                  ┌─────────────────────┐
                  │  2.0 Cotizaciones    │◄── Proveedores externos
                  │  2.1 Inyección       │     (DolarApi, Binance,
                  │  2.2 Normalización   │      open.er-api, ...)
                  │  2.3 Actualización   │
                  └─────────────────────┘
```

---

# 15° DER

## ¿Qué es el DER?

El DER (Diagrama Entidad-Relación) representa gráficamente las entidades del modelo de datos y la forma en que se relacionan. Sobre él se basa el MR-MER de la sección 11°. A continuación se presenta una versión textual del diagrama, listando las entidades y sus relaciones tal como quedaron definidas.

## Entidades

**USUARIOS**
- `id` (PK), `email`, `password_hash`, `username`, `moneda_base`, `created_at`, `updated_at`

**DIVISAS**
- `id` (PK), `nombre`, `simbolo`, `tipo` (fiat/cripto)

**TIPOS_DE_CAMBIO**
- `id` (PK), `divisa_id` (FK), `fecha`, `precio_compra`, `precio_venta`, `fuente`

**FAVORITOS**
- `id` (PK), `usuario_id` (FK), `divisa_id` (FK), `created_at`

**HISTORIAL_DE_CONSULTAS**
- `id` (PK), `usuario_id` (FK), `divisa_id` (FK), `monto`, `resultado`, `fecha`

**ALERTAS**
- `id` (PK), `usuario_id` (FK), `divisa_id` (FK), `precio_objetivo`, `activo`, `created_at`

## Relaciones representadas en el DER

```
USUARIOS 1 ──< N FAVORITOS >── 1 DIVISAS
USUARIOS 1 ──< N HISTORIAL_DE_CONSULTAS >── 1 DIVISAS
USUARIOS 1 ──< N ALERTAS >── 1 DIVISAS
DIVISAS 1 ──< N TIPOS_DE_CAMBIO
```

## Convenciones del diagrama

- **PK:** clave primaria (identificador único de la entidad).
- **FK:** clave foránea (referencia a la clave primaria de otra entidad).
- **1:N:** un registro del lado "1" puede estar relacionado con muchos registros del lado "N" (ej.: un usuario puede tener muchas alertas, pero cada alerta pertenece a un único usuario).
- Las claves foráneas refuerzan la integridad referencial, de modo que no queden "registros huérfanos" en la base de datos.

## Justificación del modelo

Elegimos este esquema por varias razones: separar divisas de tipos de cambio nos permite guardar el histórico de cotizaciones sin repetir datos; los favoritos y las alertas se modelan como tablas relacionales para registrar "a quién" y "qué divisa" se refieren; y el historial de consultas es una tabla de hechos (transaccional), que crece con cada conversión y sirve de base para futuras estadísticas. El resultado es un modelo normalizado (sin redundancia evidente), fácil de consultar y de mantener con las 10 migraciones que se aplicaron a la base de datos.

# 16° PANTALLA DE INICIO + MOCKUP

## Descripción de la pantalla de inicio

La pantalla de inicio de divise es la tarjeta de presentación del sistema y, a la vez, su principal pantalla de trabajo. Está diseñada para que, apenas se abre la web, el usuario vea lo que importa: las cotizaciones en vivo. El encabezado muestra el logo de la marca **divise.** en color blanco con el punto dorado y el subtítulo *"Cotizaciones & Mercado en tiempo real"*.

## Flujo de inicio de sesión (Login)

Cuando el usuario ya tiene cuenta, ingresa su correo y contraseña. El sistema verifica las credenciales contra la base de datos y, si coinciden, genera un token de sesión (JWT). Si el token vence o el usuario decide cerrar sesión, la aplicación vuelve a pedir las credenciales. En caso de error (correo o contraseña incorrectos), se muestra un mensaje claro de aviso.

## Flujo de creación de cuenta (Registro)

El registro pide correo electrónico, nombre de usuario y contraseña. Al confirmar, el sistema envía un **código de verificación de 6 dígitos por correo**; hasta que ese código no se confirma, la cuenta no queda habilitada para operar. Esta doble verificación protege el alta de cuentas reales y legítimas.

## Mockup del menú principal

La pantalla principal se organiza en tarjetas, una por moneda, con los siguientes elementos:

- **Fila de monedas principales:** Dólar Oficial, Dólar Blue, Dólar MEP, Dólar CCL, Dólar Tarjeta y criptomonedas.
- **Cada tarjeta muestra:** icono de la moneda (SVG propio), nombre, precio de compra, precio de venta y la variación.
- **Botón de favoritos:** una estrella o corazón permite fijar la moneda para verla siempre al inicio, incluso en la versión móvil.
- **Calculadora / conversor:** campo de entrada de monto, selector de moneda origen y destino, y resultado en tiempo real con las cotizaciones vigentes.
- **Acceso rápido:** íconos de usuario (perfil), notificaciones (alertas), menú de configuración y selector de modo claro/oscuro.

## Tabla de elementos de la pantalla de inicio

| Elemento | Tipo | Función |
|---|---|---|
| Logo "divise." | Imagen/texto | Identidad de la marca |
| Tarjetas de monedas | Lista | Cotizaciones en vivo |
| Iconos de moneda | SVG | Identificación visual |
| Convertidor | Formulario | Cambio de moneda automático |
| Favoritos | Botón | Fijar monedas en el inicio |
| Modo claro/oscuro | Botón | Cambio de tema |
| Menú de navegación | Barra | Acceso al resto de las pantallas |

![Mockup de la pantalla de inicio](./recursos/mockup_inicio.png)

## Justificación del diseño

El diseño prioriza el **mobile-first**: la mayoría de los encuestados consulta desde el celular, por eso las tarjetas se apilan y los botones son grandes. La información crítica (precio de compra y venta) está siempre visible sin scroll; las funciones secundarias (perfil, alertas, historial) se ocultan en el menú para no saturar la pantalla. El modo oscuro reduce el cansancio visual en consultas nocturnas y fue una exigencia explícita del relevamiento.

---

# 17° PANTALLA DE ABM DE USUARIOS COMPLETA

## ¿Qué es el ABM?

ABM significa **Alta, Baja y Modificación**: son las operaciones básicas que un usuario administrador (o el propio usuario, según el caso) puede hacer sobre los datos registrados. En divise, la gestión de usuarios incluye además la **lectura** (listado y búsqueda), por lo que hablamos de un ABM completo.

## Pantalla de Alta (registro de usuarios)

En la pantalla de registro se ingresan: correo electrónico, nombre de usuario y contraseña. El sistema valida el formato del correo, la fortaleza mínima de la contraseña y que el correo no esté repetido. Si todo es correcto, se crea la cuenta (con la contraseña guardada como hash) y se dispara el correo de verificación con el código de 6 dígitos.

## Pantalla de Lectura (listado y perfil)

El usuario puede ver su perfil en `GET /api/users/me`. En ese lugar consulta sus datos personales, su moneda base y sus preferencias. Además, existe el listado de usuarios (`GET /api/users`) al que accede la administración del sistema para gestionar cuentas (visible para el equipo DiviseTech).

## Pantalla de Modificación

Desde el perfil, el usuario puede:

- Modificar su nombre de usuario y moneda base (`PUT /api/users/me`).
- Cambiar su contraseña (`PUT /api/users/me/password`).
- Activar o desactivar la verificación en dos pasos (`PUT /api/users/me/2fa`).
- Configurar su número de WhatsApp para poder probar el envío de alertas (`PUT /api/users/me/whatsapp` y `POST` de prueba).

Todos los cambios requieren confirmar la sesión actual y, en el caso de la contraseña, ingresar la anterior.

## Pantalla de Baja

El usuario puede eliminar su cuenta (baja definitiva). Antes de la baja, el sistema pide confirmación para evitar borrados accidentales; una vez confirmada, la cuenta deja de existir y no puede volver a operar. La administración también puede dar de baja cuentas que incumplan las condiciones de uso (baja lógica, dejándola deshabilitada).

## Tabla resumen del ABM

| Operación | Pantalla / Endpoint | Función principal |
|---|---|---|
| Alta | Registro + verificación | Crear cuenta |
| Lectura | Perfil / listado | Ver datos del usuario |
| Modificación | Perfil / contraseña / 2FA / WhatsApp | Actualizar preferencias y seguridad |
| Baja | Eliminar cuenta | Dar de baja (definitiva o lógica) |

## Validaciones de la pantalla ABM

- **Correo:** formato válido, sin repetidos.
- **Contraseña:** longitud mínima y caracteres requeridos.
- **Sesión:** todo cambio requiere token válido.
- **Confirmación:** las acciones destructivas (baja) piden confirmación explícita.
- **Registro de auditoría:** cada modificación se registra en la base de datos con su `updated_at`.

---

# 18° PANTALLAS TODAS, DESCRIPTAS Y FUNCIONALES

divise cuenta con **11 pantallas**. A continuación se describe cada una, su propósito, sus elementos y el flujo de uso desde el punto de vista del usuario.

## 1. Pantalla de Inicio

Muestra las cotizaciones en vivo de las monedas y criptomonedas, con iconos, precios de compra/venta y variación. Permite fijar favoritos y acceder al conversor. Es el *dashboard* principal del sistema. Funcionalidad: lectura de cotizaciones en tiempo real desde la API y visualización responsive.

## 2. Pantalla de Inicio de Sesión (Login)

Formulario de correo y contraseña. Al validar, se crea la sesión y se redirige al inicio. Incluye enlace a registro y a recuperación de contraseña. Maneja errores (credenciales inválidas) con mensajes descriptivos.

## 3. Pantalla de Registro

Formulario de alta de cuenta con validación en pantalla y en servidor. Al completarse, dispara el envío del correo de verificación con código de 6 dígitos para habilitar la cuenta.

## 4. Pantalla de Verificación de Cuenta

Permite ingresar el código de verificación recibido por correo para activar la cuenta. Si el código es correcto, la cuenta queda operativa y se informa al usuario.

## 5. Pantalla de Recuperación de Contraseña

Permite solicitar un enlace o código de recuperación por correo y, una vez recibido, definir una nueva contraseña (pantalla de reset). Asegura que el usuario siempre pueda volver a entrar sin depender de soporte humano.

## 6. Pantalla de Conversor de Monedas

Calculadora que convierte montos entre monedas usando la cotización vigente. Incluye selector de moneda origen/destino, campo de monto y resultado en tiempo real. Guarda la consulta en el historial del usuario.

## 7. Pantalla de Favoritos

Lista las monedas marcadas por el usuario para verlas de forma rápida en el inicio. Permite agregar y quitar favoritas mediante el ícono correspondiente.

## 8. Pantalla de Alertas

Permite crear, activar, desactivar y eliminar alertas de precio sobre divisas seleccionadas, indicando el precio objetivo. Cuando el mercado alcanza ese valor, el sistema envía una notificación por correo o WhatsApp al usuario.

## 9. Pantalla de Historial de Consultas

Muestra las conversiones realizadas por el usuario con fecha, monto, moneda y resultado. Permite consultar la evolución de las operaciones propias.

## 10. Pantalla de Noticias del Mercado

Panel de noticias financieras integrado, con artículos relevantes del mercado. Complementa la información de cotizaciones con contexto y ayudan al usuario a interpretar por qué varían los precios.

## 11. Pantalla de Perfil de Usuario

Concentra los datos, preferencias y la seguridad de la cuenta: modificar nombre/moneda base, cambiar contraseña, configurar 2FA, vincular WhatsApp y eliminar la cuenta (ABM completo, sección 17°).

## Tabla resumen de pantallas

| N.º | Pantalla | Función principal |
|---|---|---|
| 1 | Inicio | Cotizaciones en vivo |
| 2 | Login | Inicio de sesión |
| 3 | Registro | Alta de cuenta |
| 4 | Verificación | Confirmar correo |
| 5 | Recuperación | Reponer contraseña |
| 6 | Conversor | Convertir monedas |
| 7 | Favoritos | Monedas destacadas |
| 8 | Alertas | Notificación de precios |
| 9 | Historial | Registro de consultas |
| 10 | Noticias | Información del mercado |
| 11 | Perfil | Datos y seguridad |

## Flujo general de navegación

`Inicio → Login/Registro → Verificación → (Inicio con sesión)` y desde el menú se accede a `Conversor`, `Favoritos`, `Alertas`, `Historial`, `Noticias` y `Perfil`. Todas las pantallas comparten la misma identidad visual (modo claro/oscuro, logo divise, responsive) para que la experiencia sea consistente.

---

# 19° CONSULTAS (QUERYS): ABM DE USUARIOS

## ¿Qué consultas se documentan?

En esta sección documentamos el **ABM de usuarios** completo con consultas SQL reales. Estas consultas fueron tomadas del documento original "ABM usuarios.docx" del proyecto y corresponden al backend de la aplicación (los endpoints reales de la sección 17°).

## Alta de un usuario (INSERT)

```sql
INSERT INTO usuarios (email, password_hash, username, moneda_base)
VALUES (:email, :password_hash, :username, :moneda_base);
```

Esta consulta corresponde al registro: el endpoint `POST /api/auth/register` valida los datos, hashea la contraseña y ejecuta esta inserción. La contraseña nunca se guarda en texto plano.

## Baja de un usuario (DELETE)

```sql
DELETE FROM usuarios WHERE id = :usuario_id;
```

La baja definitiva elimina el registro completo. En el sistema, además, se contempla la **baja lógica**: la cuenta se deshabilita (no puede operar) aunque el registro permanezca en la base de datos con el estado correspondiente, para conservar el historial y cumplir con la auditoría.

## Modificación (UPDATE)

```sql
UPDATE usuarios
SET username = :username,
    moneda_base = :moneda_base,
    updated_at = NOW()
WHERE id = :usuario_id;
```

Esta es la consulta detrás de `PUT /api/users/me`: permite al usuario actualizar su nombre y su moneda base. El campo `updated_at` se actualiza en cada modificación para llevar registro de auditoría.

## Lectura (SELECT)

```sql
SELECT id, email, username, moneda_base, created_at
FROM usuarios
WHERE id = :usuario_id;
```

La lectura respalda el perfil (`GET /api/users/me`) y el listado (`GET /api/users`). Se seleccionan únicamente los campos necesarios: nunca se devuelve el `password_hash` a la interfaz.

## Otras consultas relevantes del sistema

Además del ABM de usuarios, el sistema ejecuta consultas de lectura para las demás tablas:

- **Favoritos:** seleccionar las divisas favoritas del usuario y marcarlas en la pantalla de inicio.
- **Alertas:** leer las alertas activas para verificar si se alcanzó el precio objetivo.
- **Historial:** recuperar las últimas consultas de conversión del usuario con orden por fecha descendente.
- **Tipo de cambio:** obtener el último precio de compra/venta de cada divisa para mostrar en el panel.

## Seguridad en las consultas

Todas las consultas se ejecutan con **parámetros preparados** (los valores van por parámetro, no interpolados en el texto SQL), lo que bloquea los ataques de inyección SQL. El envío y la recepción se hacen por HTTPS, y el backend valida que el usuario que consulta sus datos sea el dueño legítimo de esos datos (a través del token JWT).

---

# 20° DEMO FUNCIONAL

## Descripción de la demo

La demo funcional es la presentación en vivo de divise funcionando en el ambiente de producción real (Render). Durante la demo, un usuario real recorre el flujo completo del sistema desde el registro hasta el uso de las funciones principales, demostrando que el producto no es una maqueta sino una aplicación desplegada y operativa en internet.

## Prototipo en vivo (URL de acceso)

La aplicación está disponible en:

- Frontend: `https://divise-frontend.onrender.com`
- API: `https://divise.onrender.com`

## Pasos que se demuestran

1. **Ingreso al sitio:** se abre el frontend y se muestra la pantalla de inicio con las cotizaciones en vivo.
2. **Registro de cuenta:** se crea una cuenta nueva con correo real.
3. **Verificación de correo:** se recibe el código de 6 dígitos y se valida.
4. **Inicio de sesión:** se entra con las credenciales creadas.
5. **Consulta de cotizaciones:** se navega por las monedas y criptomonedas con sus precios de compra/venta.
6. **Conversión:** se convierte un monto de pesos a dólares y se observa el resultado.
7. **Favoritos:** se agregan monedas como favoritas y se corrobora que aparecen fijadas.
8. **Alertas:** se crea una alerta con precio objetivo.
9. **Historial:** se revisa el registro de las consultas realizadas.
10. **Perfil y seguridad:** se muestra el cambio de moneda base y la configuración de 2FA.

## Justificación de la demo

La demo funcional es el cierre del ciclo de desarrollo: demuestra cumplimiento del alcance (sección 6°), calidad real (lo probado en la sección 23°) y puesta en producción (sección 10°). Al estar publicada en Render, la demo se puede mostrar en cualquier momento y desde cualquier dispositivo frente a la patrocinadora, sin necesidad de instalar nada.

# 21° PRESUPUESTO

## Presentación del presupuesto

El presupuesto comercial del proyecto divise fue elaborado por DiviseTech para ofrecer el desarrollo completo del sistema a un cliente. Contiene el desglose de horas de trabajo, los costos de cada fase y la forma de pago propuesta.

**Datos generales del presupuesto:**

| Campo | Detalle |
|---|---|
| Proyecto | divise |
| Prestatario | DiviseTech (Grupo 6 · ESTFA 2026) |
| Fecha de emisión | 14 de agosto de 2026 |
| Validez | 30 días a partir de la fecha de emisión |
| Duración estimada | 290 horas de trabajo |
| Total | USD 5.941,10 (IVA incluido) |

## Desglose de tareas y costos (resumen)

El presupuesto divide el trabajo en módulos, cada uno con su cantidad de horas y su valor:

| Ítem / Módulo | Horas | Concepto |
|---|---|---|
| Relevamiento y análisis | 30 h | Entrevistas, encuestas y documentación funcional |
| Diseño de la base de datos | 35 h | MER, diccionario de datos, migraciones |
| Diseño UX / UI | 35 h | Maquetas, logo, modo claro/oscuro, responsive |
| Desarrollo Backend | 80 h | API, autenticación, seguridad, integraciones |
| Desarrollo Frontend | 70 h | Pantallas, convertidor, gráficos, favoritos |
| Testing y control de calidad | 30 h | Casos de prueba funcionales y correcciones |
| Despliegue y documentación | 10 h | Puesta en producción y carpeta final |
| **Total** | **290 h** | |

## Forma de pago

La forma de pago propuesta, conforme a la documentación del proyecto, contempla un primer anticipo al inicio y la cancelación del saldo al momento de la entrega, protegiendo ambas partes: el cliente asegura el inicio del trabajo y el equipo cobra el resto al entregar el producto final funcionando.

## Alcance del presupuesto (qué incluye)

- Desarrollo de la SPA con las **11 pantallas** documentadas.
- API REST con **17 endpoints**.
- Integración con proveedores de cotizaciones en tiempo real.
- Base de datos PostgreSQL con políticas de seguridad.
- Registro, verificación por correo, 2FA, favoritos, alertas e historial.
- **Testing funcional documentado (112 casos de prueba).**
- Despliegue por 30 días en Render y entrega de la carpeta funcional.

## Supuestos y condiciones

- Los plazos se cuentan desde la firma del contrato de venta (sección 25°).
- La validez del presupuesto es de 30 días.
- Los valores se expresan en dólares estadounidenses (USD) con IVA incluido.
- Cualquier requerimiento adicional al alcance se presupuestará por separado.

> **Nota de coherencia:** según el presupuesto la forma de pago es un anticipo inicial más el saldo a la entrega; en el contrato de venta figura una distribución distinta (30% / 70%). Dejamos ambas como se encuentran en las fuentes porque no tenemos la autoridad de modificar ninguna sin una decisión del cliente. Lo mismo ocurre con la garantía: el presupuesto menciona 30 días y el contrato 90 días; ambas cifras se conservan tal cual figuran en cada documento.

---

# 22° JUSTIFICACIÓN DEL PRESUPUESTO

## ¿Por qué este precio?

El presupuesto de USD 5.941,10 (IVA incluido) surge de un cálculo simple pero fundamentado: **290 horas reales de trabajo** multiplicadas por una tarifa horaria competitiva de un emprendimiento de desarrollo. El precio no se eligió al azar: refleja el esfuerzo que el proyecto realmente demanda, manteniéndose por debajo de las tarifas de mercado de agencias grandes, lo cual es una ventaja competitiva para un emprendimiento como DiviseTech.

## Justificación de las horas por fase

- **Relevamiento y análisis (30 h):** las entrevistas, la encuesta cerrada y la abierta insumieron semanas de trabajo de preparación, aplicación y análisis. Además aquí se redactó el project charter y el estudio de factibilidad.
- **Diseño de la base de datos (35 h):** modelar 6 tablas con sus relaciones, armar el diccionario de datos y diseñar las 10 migraciones requiere tiempo de análisis antes de tocar código. Un error en el modelo cuesta caro después, por eso se invirtió esfuerzo en esta etapa.
- **Diseño UX/UI (35 h):** definir la identidad (logo divise), maquetas de las 11 pantallas, modo oscuro, y el diseño mobile-first llevó varias iteraciones basadas en la encuesta de usabilidad.
- **Backend (80 h):** es la fase más grande: API REST, autenticación con JWT, verificación por correo, 2FA, integración con 5 proveedores de cotizaciones, manejo de errores y seguridad. Es la columna vertebral del sistema.
- **Frontend (70 h):** las 11 pantallas, el conversor dinámico, los gráficos con Chart.js, la gestión de estado de sesión y el responsive. Todo lo que el usuario ve y toca.
- **Testing (30 h):** la sección 23° documenta los casos de prueba; el tiempo de testing no solo es ejecutar sino diseñarlos, corregir hallazgos y re-probar. También se verificó seguridad y se hicieron pruebas de integración.
- **Despliegue y documentación (10 h):** la puesta en producción en Render, el manual de usuario, el soporte y la consolidación de esta carpeta funcional.

## ¿Por qué es un costo razonable para el cliente?

El cliente recibe un producto completo, publicado en internet, con código fuente, base de datos, manual y soporte documentado, todo por menos de lo que cuesta un desarrollo equivalente en el mercado profesional. Los planes gratuitos de infraestructura (Render/Supabase) permiten bajar el mantenimiento inicial; el costo se concentra en el desarrollo, que es donde está el valor real.

## Justificación de la forma de pago y la garantía

La estructura de pagos protege al cliente (no paga todo por adelantado, sino un anticipo razonable y el resto contra entrega, logrando que el proyecto avance con hitos verificables). El plazo de garantía cubre las correcciones de errores que surjan tras la entrega, dando tranquilidad sobre la calidad del trabajo. Las diferencias entre documentos (sección 21°) se mantienen para respetar la literalidad de cada fuente.

---

# 23° EXCEL COMPLETO DE TESTING: TODOS LOS CASOS DE PRUEBA

## Metodología de testing

El testing funcional se realizó siguiendo la metodología de pruebas de software: se definieron **casos de prueba** con identificación (CP-xxx), descripción, pasos, dato de entrada, resultado esperado y resultado obtenido. Cada caso apunta a una funcionalidad concreta de la aplicación (dada la cantidad, se presentan acá los casos principales y el resumen general).

## Contexto y cobertura

- Los casos fueron ejecutados contra la versión publicada en Render (ambiente de producción).
- Se probaron los flujos completos: registro, verificación, login, cotizaciones, conversión, favoritos, alertas, historial, perfil y seguridad.
- El proyecto documenta **112 casos de prueba** en el presupuesto de testing; a su vez, el documento TESTER del proyecto registra **24 casos funcionales** (CP-001 a CP-024) y el informe Pruebas-Divise agrega la vista ampliada. Todos los casos se resuelven dentro del sistema real.

## Planilla de casos de prueba principales

| ID | Módulo | Descripción | Resultado esperado | Estado |
|---|---|---|---|---|
| CP-001 | Registro | Alta de cuenta con datos válidos | Cuenta creada y correo de verificación enviado | Correcto |
| CP-002 | Registro | Alta con correo repetido | Mensaje de error y no se duplica la cuenta | Correcto |
| CP-003 | Registro | Contraseña inválida (corta) | Formulario rechazado con aviso | Correcto |
| CP-004 | Verificación | Código de 6 dígitos correcto | Cuenta habilitada | Correcto |
| CP-005 | Verificación | Código incorrecto | Cuenta no habilitada, mensaje de error | Correcto |
| CP-006 | Login | Credenciales válidas | Sesión iniciada, se redirige al inicio | Correcto |
| CP-007 | Login | Contraseña incorrecta | Mensaje de error | Correcto |
| CP-008 | Recuperación | Solicitud de reset por correo | Enlace/código enviado | Correcto |
| CP-009 | Recuperación | Nueva contraseña aceptada | Se puede iniciar sesión con la nueva clave | Correcto |
| CP-010 | Cotizaciones | Pantalla de inicio muestra precios en vivo | Precios de compra/venta visibles | Correcto |
| CP-011 | Cotizaciones | Actualización automática de valores | Los precios se actualizan por ciclo | Correcto |
| CP-012 | Conversor | Conversión ARS → USD con monto válido | Resultado correcto según cotización | Correcto |
| CP-013 | Conversor | Monto cero o inválido | Validación de entrada | Correcto |
| CP-014 | Favoritos | Agregar moneda favorita | Aparece fijada en el inicio | Correcto |
| CP-015 | Favoritos | Quitar moneda favorita | Se elimina del inicio | Correcto |
| CP-016 | Alertas | Crear alerta con precio objetivo | Alerta creada y activa | Correcto |
| CP-017 | Alertas | Desactivar alerta | La alerta deja de notificar | Correcto |
| CP-018 | Alertas | Objetivo alcanzado | Notificación enviada al usuario | Correcto |
| CP-019 | Historial | Se registra cada conversión | La consulta aparece con fecha y resultado | Correcto |
| CP-020 | Perfil | Modificar moneda base | Cambio aplicado y visible | Correcto |
| CP-021 | Perfil | Cambiar contraseña | Solo se permite con la clave anterior | Correcto |
| CP-022 | 2FA | Activar/desactivar 2FA | Cambio de configuración aplicado | Correcto |
| CP-023 | Baja | Eliminar cuenta con confirmación | Cuenta dada de baja | Correcto |
| CP-024 | Seguridad | Acceso a datos de otro usuario | Denegado (token no autorizado) | Correcto |

## Observaciones del testing

- **Resultado:** el 100% de los casos ejecutados devolvió el resultado esperado en la versión final.
- **Hallazgos corregidos:** durante las iteraciones se detectaron y corrigieron errores de validación (por ejemplo, mensajes de error poco claros en el formulario de registro) y detalles de actualización de precios, que quedaron resueltos en la versión publicada.
- **Cobertura adicional:** el informe Pruebas-Divise amplía la cobertura a **104 casos** sobre funcionalidades menores de borde (campos vacíos, caracteres especiales, sesiones vencidas), todos resueltos satisfactoriamente.

## Conclusión de calidad

Con los casos de prueba aprobados, divise alcanza el nivel de calidad requerido para la entrega: las funcionalidades críticas (autenticación, cotizaciones y conversión) están verificadas, los flujos de datos son seguros y la aplicación se comporta según lo documentado. Esto respalda la demo funcional (sección 20°) y la garantía del contrato (sección 25°).

# 24° CONTRATO DE CONSTITUCIÓN DEL EMPRENDIMIENTO

## Introducción

El presente contrato regula la constitución de **DiviseTech**, el emprendimiento conformado por el Grupo 6 de la ESTFA 2026. En este documento se establecen las partes, el objeto, las obligaciones, el capital y las condiciones de funcionamiento del emprendimiento, tal como se acordó entre los integrantes al inicio del proyecto.

**Partes intervinientes:**

- DiviseTech, sociedad conformada para el desarrollo del proyecto divise.
- Integrantes: Valentín López, Santino Tacconi, Santiago Centurión, Lorenzo Sánchez y Bruno Cabrera (5 integrantes).
- Fecha de contrato: 01/10/2026, Berazategui.

## Objeto del contrato

El objeto es la constitución del emprendimiento DiviseTech para el desarrollo, comercialización y mantenimiento del sistema "divise", aplicación web de cotizaciones financieras en tiempo real. DiviseTech funciona como la persona jurídica que representa al Grupo 6 en la entrega del proyecto, la búsqueda del cliente y la celebración del contrato de venta del software (sección 25°).

## Capital y aportes

El capital de constitución del emprendimiento está integrado por los aportes técnicos y de trabajo de los 5 integrantes. El desglose nominal del capital (monto, cantidad de cuotas sociales y su valor) queda especificado en el instrumento constitutivo que acompaña esta carpeta:

| Dato | Detalle |
|---|---|
| Capital inicial | [A COMPLETAR: monto de capital] |
| Cantidad de cuotas | [A COMPLETAR: cantidad de cuotas] |
| Valor nominal por cuota | [A COMPLETAR: valor por cuota] |
| Distribución | Igualitaria entre los 5 integrantes |
| Administración | [A COMPLETAR: gerencia y representación] |

## Derechos y obligaciones de los integrantes

- **Compromiso de trabajo:** cada integrante debe cumplir las tareas de su rol y participar de los sprints, reuniones y entregas.
- **Confidencialidad:** la información del emprendimiento, del cliente y de los datos de las APIs no puede divulgarse a terceros.
- **Propiedad intelectual:** los desarrollos realizados pertenecen a DiviseTech; el software se licencia al cliente conforme al contrato de venta.
- **Responsabilidad:** cada integrante responde solidariamente ante el emprendimiento por sus obligaciones.

## Duración

El contrato tiene vigencia desde su firma y se mantiene mientras el emprendimiento desarrolle su actividad. La incorporación o retiro de integrantes debe ser aprobada por el conjunto de los miembros.

## Normativa y tratamiento de datos

DiviseTech se compromete a tratar los datos personales de los usuarios de divise conforme a la **Ley Nacional N.º 25.326**, aplicando las medidas de seguridad descriptas en la sección 10°.

## Firmas

**DiviseTech** — Grupo 6:
1. Valentín López
2. Santino Tacconi
3. Santiago Centurión
4. Lorenzo Sánchez
5. Bruno Cabrera

---

# 25° CONTRATO DE VENTA, LICITACIÓN DE SOFTWARE

## Introducción

El presente contrato regula la venta y entrega del sistema **divise** entre el emprendimiento **DiviseTech** (desarrollador) y el cliente. Fue confeccionado el **01/10/2026** en Berazategui y sigue el modelo de contrato de provisión de software de la institución.

**Partes:**

- **Desarrollador:** DiviseTech (micro-emprendimiento, Grupo 6 · ESTFA 2026), con 5 integrantes.
- **Cliente:** [A COMPLETAR: datos del cliente, nombre o denominación social, CUIT y domicilio].

## Objeto del contrato

El desarrollador se obliga a diseñar, desarrollar, entregar e implementar el sistema **divise**, aplicación web de cotizaciones financieras en tiempo real, conforme al alcance descripto en la sección 6° (Project Charter) y a la documentación técnica que forma parte de la carpeta funcional.

## Condiciones de entrega e implementación

- El sistema se entrega funcionando en internet por un período mínimo de despliegue, con la URL de acceso y las credenciales de administración.
- La fecha de puesta en marcha es la de la entrega final de la demo funcional (sección 20°).
- Incluye: código fuente, base de datos, manual de usuario (sección 26°) y guías de soporte (sección 28°).

## Pruebas de aceptación

- El cliente dispondrá de **10 días hábiles** desde la entrega para probar el sistema y formular observaciones.
- Las observaciones deben constar por escrito; el desarrollador deberá corregir los defectos que impidan el funcionamiento conforme al alcance.
- Vencido el plazo sin objeciones, el sistema se considera **aceptado**.

## Garantía y mantenimiento

- La garantía cubre el período indicado en el contrato para la corrección de errores de funcionamiento (los documentos de origen indican este período: la referencia del presupuesto menciona 30 días y el contrato de venta 90 días — se conserva lo estipulado en cada documento).
- El mantenimiento posterior (nuevas funciones, adaptaciones a cambios de las APIs) se cotiza por separado mediante nuevos presupuestos.

## Confidencialidad

Ambas partes se comprometen a mantener la confidencialidad de la información técnica, comercial y de datos personales intercambiada durante el proyecto, conforme a la Ley 25.326 y a lo dispuesto en la Ley de confidencialidad aplicable.

## Propiedad intelectual

- El software, su código y su documentación son propiedad del desarrollador (DiviseTech).
- El cliente recibe una **licencia de uso** del sistema conforme a las condiciones pactadas en el contrato.
- No se transfiere la propiedad del código fuente salvo acuerdo expreso y por escrito.

## Pago

El pago se realizará conforme a lo estipulado en el presupuesto (sección 21°) y a la cláusula de forma de pago del contrato (el documento de origen estipula una distribución de pagos vinculada a la entrega — ver nota de coherencia en la sección 21°).

## Terminación

El contrato puede terminarse por: (a) mutuo acuerdo; (b) vencimiento del plazo con la aceptación del sistema; (c) incumplimiento grave de cualquiera de las partes, previa intimación escrita; y (d) imposibilidad objetiva de prestación del servicio.

## Firmas

**DiviseTech** — **Cliente**
1. Valentín López — [A COMPLETAR]
2. Santino Tacconi — [A COMPLETAR]
3. Santiago Centurión — [A COMPLETAR]
4. Lorenzo Sánchez — [A COMPLETAR]
5. Bruno Cabrera — [A COMPLETAR]

---

# 26° MANUAL DE USUARIO

## Introducción al manual

Este manual explica, paso a paso, cómo usar la aplicación **divise**: desde entrar por primera vez hasta configurar alertas y personalizar el perfil. Está pensado para cualquier usuario, sin conocimientos técnicos previos. divise es una aplicación web: **no hace falta instalar nada**, se usa desde el navegador (celular, tablet o computadora).

## Ingreso a la aplicación

1. Abrí el navegador en `https://divise-frontend.onrender.com`.
2. Vas a ver la pantalla de inicio con las cotizaciones en tiempo real (logo "divise." arriba).

## Creación de una cuenta

1. Tocá/tocá el botón de **Registrarse**.
2. Completá: correo electrónico, nombre de usuario y contraseña.
3. Confirmá el registro: vas a recibir un correo con un **código de 6 dígitos**.
4. Ingresá el código en la pantalla de verificación.
5. ¡Listo! Tu cuenta quedó habilitada.

## Inicio de sesión

1. Tocá **Ingresar**.
2. Poné tu correo y tu contraseña.
3. Vas a ser redirigido a tu pantalla de inicio personalizada.

## Consultar cotizaciones

- En la pantalla principal vas a ver las tarjetas de cada moneda: nombre, icono, **precio de compra** y **precio de venta**.
- Encontrarás Dólar Oficial, Blue, MEP, CCL, Tarjeta, criptomonedas (USDT, BTC, ETH) y divisas internacionales (EUR, GBP, etc.).
- Los precios se actualizan automáticamente gracias a los proveedores externos.

## Usar el conversor de monedas

1. Elegí la moneda de origen.
2. Elegí la moneda de destino.
3. Ingresá el monto.
4. El resultado se calcula al instante con la cotización vigente.

## Guardar favoritos

- Para fijar una moneda, tocá el ícono de favorito (estrella) en su tarjeta.
- Tu selección se guarda y se muestra de manera destacada en la pantalla principal.

## Crear una alerta

1. Andá a la sección **Alertas**.
2. Elegí la moneda y el precio objetivo (ej.: "avisame si el Blue llega a 1200").
3. Guardá la alerta: el sistema te notificará cuando se alcance el valor.
4. Podés activar o desactivar alertas cuando quieras.

## Ver el historial de consultas

1. Andá a la sección **Historial**.
2. Vas a ver tus conversiones con fecha, monto y resultado.
3. El historial te permite retomar valores previos o hacer seguimiento.

## Ver noticias del mercado

1. Andá a la sección **Noticias**.
2. Vas a encontrar artículos financieros actualizados para interpretar las variaciones.

## Configurar tu perfil

En **Perfil** podés:

- Cambiar tu nombre de usuario y tu **moneda base**.
- Cambiar tu contraseña (pidiendo la anterior).
- Activar la **verificación en dos pasos (2FA)** para mayor seguridad.
- Vincular tu número de **WhatsApp** (para recibir alertas).
- Eliminar tu cuenta si lo deseás (con confirmación).

## Modo oscuro

- Tocá el ícono de tema (sol/luna) para alternar entre modo claro y oscuro.
- El modo oscuro es ideal para consultas nocturnas y cuida la vista.

## Preguntas frecuentes

**¿divise es gratis?** Sí, la aplicación es de uso gratuito para todos los usuarios.

**¿Necesito conocimiento técnico?** No: divise está diseñado para uso simple, con un vistazo alcanza.

**¿De dónde salen los precios?** De multiples proveedores externos en tiempo real (DolarApi, open.er-api.com, Binance, CoinGecko y Coinbase), con respaldo entre fuentes.

**¿Puedo usar divise en el celular?** Sí, es responsive: se adapta automáticamente a cualquier pantalla.

**¿Qué hago si olvidé mi contraseña?** Usá "Recuperar contraseña": el sistema te envía un código por correo para restablecerla.

---

# 27° METODOLOGÍA DE IMPLEMENTACIÓN ELEGIDA Y JUSTIFICACIÓN

## Metodología elegida: SCRUM simplificado

El equipo eligió **SCRUM** en su versión simplificada, adaptada a un microemprendimiento escolar. La metodología se basa en iteraciones cortas llamadas **sprints** (en nuestro caso, semanales) que generan incrementos funcionales del producto, revisados al final de cada ciclo.

## Por qué elegimos SCRUM

- **Adaptabilidad:** el proyecto cambió durante el año (por ejemplo, la definición final del alcance y la identidad de marca a divise). SCRUM permite absorber esos cambios sin romper el plan.
- **Visibilidad:** con sprints de una semana, la patrocinadora y el equipo siempre saben en qué se está trabajando y qué se entregó.
- **Calidad continua:** cada sprint termina con un incremento probado; no se dejan errores acumulados para el final.
- **Clima de equipo:** las dailies breves (15 minutos) y las retrospectivas fortalecen la comunicación y permiten corregir hábitos a tiempo.

## Cómo la aplicamos

- **Sprint planning:** al inicio de cada semana, se eligen las tareas del backlog que se van a realizar.
- **Daily:** reunión corta diaria: ¿qué hice? ¿qué voy a hacer? ¿hay algún bloqueo?
- **Sprint review:** al cierre de cada sprint, se muestra lo logrado y se evalúa el incremento.
- **Retrospectiva:** se analiza qué salió bien y qué mejorar (proceso, comunicación, estimación).
- **MVP:** se priorizaron las funciones esenciales (cotizaciones y conversión) antes que las secundarias (alertas, noticias), garantizando un producto usable desde los primeros sprints.

## Herramientas de gestión

- **Trello:** tablero con columnas "Backlog", "En progreso", "Hecho" para visualizar las tareas.
- **GitHub:** control de versiones y repositorio del código con historial completo.
- **WhatsApp / Discord:** comunicación diaria del equipo.
- **Correo electrónico:** comunicaciones formales con la patrocinadora.

## Justificación final

SCRUM fue la mejor opción para un equipo pequeño, sin experiencia previa en proyectos grandes y con plazos académicos múltiples. Su estructura de sprints cortos nos dio orden sin burocracia, y su énfasis en incrementos funcionales hizo que la aplicación estuviera siempre en un estado usable, algo que valoramos al momento de la demo (sección 20°) y del testing (sección 23°).

---

# 28° SOPORTE → GUÍAS DE RESOLUCIÓN DE ERRORES COMUNES Y CONFIGURACIONES

## Introducción al soporte

Esta sección reúne las guías de resolución de errores comunes y de configuración, tanto para usuarios finales como para el equipo de mantenimiento de DiviseTech. El objetivo es que cualquier incidente frecuente se resuelva de forma autónoma, sin dependencia de un desarrollador.

## Contacto de soporte

- **Correo:** deviseproyect@gmail.com
- **Horario de atención:** lunes a viernes, de 18:00 a 22:00 (GMT-3).
- **Respuesta prevista:** SLA acordado con la documentación de soporte del proyecto.

## Guía 1 — No puedo iniciar sesión

**Síntoma:** aparece "credenciales incorrectas".

**Revisar:**
1. Confirmá que el correo esté bien escrito (sin espacios).
2. Verificá que la cuenta esté **verificada** (código de 6 dígitos).
3. Probá con "Recuperar contraseña" para generar una nueva.
4. Si seguís sin entrar, escribí al soporte con una captura del error.

## Guía 2 — No me llega el correo de verificación

**Revisar:**
1. Buscá en "No deseado" / "Spam".
2. Esperá 2 a 5 minutos (los envíos tienen demoras).
3. Verificá que hayas escrito bien el correo en el registro.
4. Si no llega, el soporte puede reenviar el envío.

## Guía 3 — Los precios no se actualizan

**Síntoma:** los valores se ven congelados por mucho tiempo.

**Revisar:**
1. Determiná si fue una caída temporaria de uno de los proveedores externos.
2. divise consulta varios proveedores con *fallback*: si una fuente cae, se usa otra.
3. Forzá la recarga de la página (F5 en computadora, actualizar en celular).
4. Si el problema persiste más de una hora, reportalo a soporte.

## Guía 4 — La alerta no notificó

**Revisar:**
1. Confirmá que la alerta esté **activa** (no desactivada).
2. Verificá que se configuró el canal de notificación (correo o WhatsApp).
3. Comprobá que el precio objetivo no esté lejos del valor actual.
4. Las alertas se evalúan en cada ciclo de actualización; puede haber demora de algunos minutos.

## Guía 5 — Configurar el envío de alertas por WhatsApp

1. Entrá a **Perfil → WhatsApp**.
2. Cargá tu número con el código de país (ej.: +54 9 11 ...).
3. Activá la opción y probá con la función de prueba de envío.
4. Usá la app de WhatsApp para recibir los avisos de alerta.

## Guía 6 — Configuración del equipo de mantenimiento (variables de entorno)

Para el equipo DiviseTech, la configuración del servidor se realiza mediante variables de entorno del backend:

| Variable | Función |
|---|---|
| `PORT` | Puerto del servidor (5000 en desarrollo). |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL (Supabase). |
| `JWT_SECRET` | Clave para firmar los tokens de sesión. |
| `EMAIL_SERVICE` / claves de correo | Proveedor de envío (Nodemailer/Brevo/Resend). |
| `DOLAR_API_KEY` y claves de APIs | Credenciales de los proveedores de cotizaciones. |

**Regla de oro:** estas variables **nunca** se suben al repositorio; se definen en el panel de configuración de Render o en el archivo local de entorno, protegido por Git.

## Guía 7 — Errores comunes de la API (respuestas)

| Código | Error | Solución |
|---|---|---|
| 400 | Datos inválidos | Revisar el formato de los datos enviados. |
| 401 | No autorizado | Renovar el token o reingresar sesión. |
| 404 | Recurso inexistente | Verificar la URL del endpoint. |
| 429 / 500 | Límite o error interno | Verificar logs; si es de un proveedor externo, usar el *fallback*. |

## Procedimiento de reporte de incidentes

1. Registrar el síntoma, la fecha, la hora y una captura.
2. Consultar estas guías.
3. Si no se resuelve, contactar a deviseproyect@gmail.com dentro del horario de soporte.
4. El soporte gestiona el incidente y responde conforme al SLA acordado.

---

# ANEXO — PENDIENTES DE COMPLETAR

Los siguientes datos no estaban disponibles en las fuentes del proyecto y quedan marcados para completar formalmente:

- Contrato de constitución: capital inicial, cantidad de cuotas, valor nominal por cuota y administración/gerencia.
- Contrato de venta: datos del cliente (nombre o razón social, CUIT, domicilio) y firmas.
- Resultados individuales detallados de cada pregunta de la encuesta (se procesaron y se resumieron en la sección 5°).
- Cuadro FODA completo con descripción de cada celda (el original contenía la matriz; el análisis se desarrolló en la sección 7°).
- Fuentes de financiamiento específicas del proyecto (se describieron los costos en la sección 7°).
- URL pública del manual de usuario (el acceso a la aplicación está publicado; el manual se entrega en documento).
- Transcripción completa de las capturas de pantalla del proyecto de referencia (páginas 43 a 93), que solo existen como imágenes.

---

*Fin de la carpeta funcional — divise (proyecto divise) · DiviseTech · Grupo 6 · ESTFA 2026*