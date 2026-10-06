# ENTREGA FUNCIONAL DIVISE — SECCIONES COMPLETAS PARA COPIAR Y PEGAR

> Documento auxiliar generado el 04/10/2026 para completar la "Primera Entrega Funcional"
> (46 págs.) y alinearla con el modelo de 28 secciones (referencia "Linking the World").
> Contiene: índice de 28 secciones, completudes de secciones 4°, 5°, 7°, 17° y 19°,
> y el texto completo de las secciones 24° a 28°.
>
> NOTA DE DATOS: donde figura "EJEMPLO" el texto incluye un valor ilustrativo que
> debe reemplazarse por el dato real. Los DNIs, edades y domicilios de los socios del
> contrato 24° son inventados (autorizado por el cliente) y deben revisarse antes de firmar.

---

## ÍNDICE ACTUALIZADO (28 secciones) — para reemplazar el índice actual del documento

```
ÍNDICE
1° Creación del microemprendimiento
2° Carta de solicitud del proyecto
3° Entrevistas
4° Proyecto (nombre, objetivo y logo)
5° Resultado de entrevistas
6° PROJECT CHARTER
7° Estudio de factibilidad
8° Proyección y justificación del sistema
9° Creación del GANTT
10° Creación y justificación del ambiente de desarrollo y producción
11° MR-MER: diccionario de datos
12° Diagrama de contexto (DFD Nivel 0)
13° DFD Nivel 1
14° DFD Nivel 2
15° DER
16° Pantalla de inicio + mockup
17° Pantalla de ABM de usuarios completa
18° Pantallas todas, descriptas y funcionales
19° Consultas (querys): ABM de usuarios
20° Demo funcional
21° Presupuesto
22° Justificación del presupuesto
23° Excel completo de testing (todos los casos de prueba)
24° Contrato de constitución del emprendimiento
25° Contrato de venta, licitación de software
26° Manual de usuario
27° Metodología de implementación elegida y justificación
28° Soporte: guías de resolución de errores comunes y configuraciones
```

---

# SECCIÓN 4° — OBJETIVO DEL PROYECTO

Pegar dentro de "4. Elección del nombre del proyecto".

```
Objetivo del proyecto:
Desarrollar y poner en funcionamiento la plataforma web "Divise" en un plazo de 16 semanas,
garantizando la consulta de cotizaciones de al menos 25 activos financieros (fiat y cripto)
con actualización automática cada 5 minutos, una calculadora de conversión con desglose de
impuestos argentinos, y módulos de alertas, favoritos, historial y gráficos operativos desde
cualquier dispositivo con conexión a internet.
```

---

# SECCIÓN 5° — FICHA TÉCNICA DE LA ENCUESTA

Pegar arriba de "RESULTADO ENTREVISTAS".

```
Ficha técnica de la encuesta
- Zona encuestada: [COMPLETAR]  (EJEMPLO: Berazategui, Ciudad Autónoma de Buenos Aires y alrededores)
- Período: [COMPLETAR]  (EJEMPLO: del 5 al 20 de abril de 2026)
- Método: cuestionario cerrado (preguntas SÍ/NO y de opción múltiple) complementado con
  una entrevista abierta dirigida a directores de proyecto.
- Edad referencial: 18 a 50 años (media aproximada: [COMPLETAR] años — EJEMPLO: 28).
- Rangos educacionales: secundario completo (mayoría), técnico/profesional en curso y
  universitario (minoría).
- Tamaño de la muestra: [COMPLETAR] encuestados/as.
```

---

# SECCIÓN 7° — COMPLETUDES DEL ESTUDIO DE FACTIBILIDAD

## 7.1 Análisis FODA

```
Análisis FODA

FORTALEZAS
● Integración: reúne en una sola pantalla cotizaciones fiat y cripto que hoy se consultan
  por separado (dólar oficial, blue, MEP, CCL, tarjeta, BTC, ETH, USDT).
● Roles definidos y completos (Project Manager, Developers, Base de Datos, Diseño UX).
● Baja inversión inicial: stack 100% gratuito y de código abierto en la fase de desarrollo.
● Actualización automática de cotizaciones (auto-refresh cada 15 s en el panel y
  sincronización del backend cada 5 minutos).
● Interfaz simple, clara y enfocada en el usuario no especialista.

DEBILIDADES
● Dependencia de terceros: la disponibilidad depende de APIs externas gratuitas
  (dolarapi, CoinGecko) y de las capas free de Supabase y Render.
● El plan gratuito de Render puede "dormir" el backend, lo que genera demoras en el
  primer acceso tras un período de inactividad (cold start).
● Riesgo de errores si una API externa cambia el formato de sus respuestas.
● Sin aplicación móvil nativa en la primera versión.

OPORTUNIDADES
● Crecimiento del mercado de criptomonedas y del ahorro en dólar en Argentina.
● Poca competencia con una interfaz tan simple e integrada (calculadora + alertas +
  gráficos en un mismo lugar).
● Monetización futura mediante espacios publicitarios para empresas FinTech.
● Expansión a aplicación móvil (Android/iOS) y a otros países de la región.

AMENAZAS
● Portales de noticias y aplicaciones financieras pueden incorporar funcionalidades
  equivalentes en el mediano plazo.
● Cambios en el régimen cambiario argentino pueden modificar o eliminar tipos de cambio
  (por ejemplo, el dólar tarjeta o los impuestos vigentes).
● Límites de las APIs gratuitas (cantidad de consultas) ante picos de demanda.
● Desactualización de los datos si una fuente externa deja de operar.
```

## 7.2 Riesgos técnicos

```
Riesgos técnicos del proyecto

| Riesgo                         | Probabilidad | Impacto | Mitigación                          |
|--------------------------------|--------------|---------|-------------------------------------|
| Caída de una API externa       | Media        | Alto    | Caché de últimos datos + fallback   |
| Cold start de Render (sleep)   | Media        | Medio   | Ping periódico y mensajes de carga  |
| Inyección SQL                  | Baja         | Alto    | Querys parametrizadas con $1, $2…   |
| Acceso no autorizado           | Baja         | Alto    | JWT + bcrypt + 2FA + rate limiting  |
| Cambio de formato de una API   | Baja         | Medio   | Validación del JSON recibido        |
| Pérdida de datos               | Baja         | Alto    | PostgreSQL en la nube con backups   |
```

## 7.3 Seguridad y cumplimiento legal

```
Seguridad del sistema
● Autenticación de usuarios: inicio de sesión con contraseña encriptada mediante el
  algoritmo Bcrypt, emisión de token JWT con expiración de 24 horas y opción de
  verificación en dos pasos (2FA).
● Protección de datos personales: el tratamiento de las cuentas de usuario respeta la Ley
  Nacional de Protección de Datos Personales N° 25.326. Los datos se almacenan en
  PostgreSQL (Supabase) con transporte SSL.
● Manejo de contraseñas: las claves nunca se guardan en texto plano; se almacena
  únicamente su hash bcrypt.
● Protección de claves de APIs externas: las claves no se exponen en el frontend; se
  resguardan en variables de entorno del servidor (.env), que no se suben al repositorio.
● Cumplimiento legal: la plataforma es estrictamente informativa; no ejecuta transacciones
  financieras, por lo que no constituye un bróker ni una billetera virtual. La aplicación
  incluye un aviso legal con esta aclaración.
```

## 7.4 Escalabilidad

```
Escalabilidad
La arquitectura permite escalar la base de datos a un plan superior de Supabase y
configurar auto-escalado en Render ante picos de tráfico. La separación frontend / backend /
base de datos facilita sumar caché, balanceadores de carga y una aplicación móvil nativa en
el mediano plazo sin rediseñar el sistema. Las funciones futuras planificadas incluyen:
alertas personalizadas, feed de noticias ampliado, modo privacidad y versión móvil.
```

## 7.5 Evaluación financiera complementaria

```
Evaluación financiera complementaria
● Inversión en activos fijos: $0 (se utilizan computadoras personales y servicios en
  capas gratuitas durante la fase académica).
● Capital de trabajo: $0 (los gastos operativos se cubren con las capas gratuitas de
  Render, Supabase y las APIs públicas).
● Los estados proyectados (Estado de Resultados, Flujo de Efectivo y Balance General)
  reflejan una estructura de costo cero. El principal activo es intangible: el software,
  la base de datos y el diseño generados por el equipo.
● Criterios de rentabilidad:
  • VAN: con una inversión inicial de $0, todo beneficio futuro (ahorro de tiempo y
    precisión) arroja un VAN positivo.
  • TIR: excepcionalmente alta por la ausencia de egresos iniciales.
  • Relación Beneficio/Costo: el beneficio operativo supera ampliamente al costo de
    mantenimiento ($0), resultando altamente favorable.
```

---

# SECCIÓN 17° y 19° — ABM DE USUARIOS (descripción + querys SQL)

## 17.a Descripción del flujo ABM (para la sección de pantallas)

```
ABM de Usuarios
Rol descripción
- Usuario Visitante: accede a cotizaciones, calculadora y gráficos sin registrarse.
- Usuario Registrado: guarda favoritos, configura alertas y consulta su historial.
- Administrador: gestiona usuarios, parámetros fiscales y monitorea el estado de las APIs.

Alta: validación de email único, hashing de contraseña con Bcrypt y cuenta creada con
estado activo en TRUE.
Modificación: el usuario actualiza nombre, email, moneda preferida e interfaz; el cambio de
contraseña exige la clave vigente como confirmación de identidad.
Baja: baja lógica (el campo activo pasa a FALSE), preservando los registros históricos;
las alertas asociadas se desactivan automáticamente.
```

## 19.b Querys SQL del ABM (agregar a la sección 19 Consultas)

```
ABM de usuarios — Consultas SQL

1. Alta (Create / Insert):
INSERT INTO usuarios (nombre, email, password_hash, moneda_preferida, modo_oscuro, activo)
VALUES ($1, $2, $3, $4, $5, TRUE)
RETURNING id_usuario;

2. Baja (Delete / Baja lógica):
UPDATE usuarios
SET activo = FALSE
WHERE id_usuario = $1;

3. Modificación (Update / Actualizar):
UPDATE usuarios
SET nombre = $1, email = $2, moneda_preferida = $3, modo_oscuro = $4
WHERE id_usuario = $5;

4. Lectura (Read / Seleccionar):
SELECT id_usuario, nombre, email, moneda_preferida, modo_oscuro, activo, fecha_registro
FROM usuarios
WHERE id_usuario = $1;
```

---

# SECCIÓN 24° — CONTRATO DE CONSTITUCIÓN DEL EMPRENDIMIENTO

```
CONTRATO DE SOCIEDAD DE RESPONSABILIDAD LIMITADA
ESCRITURA NÚMERO 0405 - De la localidad de Berazategui, partido de Berazategui, a los 6
días del mes de julio del año 2026, ante mí, Escribano Autorizante, comparecen los señores
Valentin Lopez, de 24 años de edad, domiciliado en Calle 138 N° 1827 de la localidad de
Berazategui, provincia de Buenos Aires, soltero, argentino, comerciante, DNI 40578219;
Santino Tacconi, de 23 años de edad, domiciliado en Calle 95 N° 2401 de la localidad de
Berazategui, provincia de Buenos Aires, soltero, argentino, comerciante, DNI 41288903;
Santiago Centurion, de 23 años de edad, domiciliado en Calle 18 N° 3314 de la Ciudad
Autónoma de Buenos Aires, soltero, argentino, comerciante, DNI 41933677;
Lorenzo Sanchez, de 22 años de edad, domiciliado en Calle 129 N° 2010 de la localidad de
Berazategui, provincia de Buenos Aires, soltero, argentino, comerciante, DNI 39657412;
Bruno Cabrera, de 22 años de edad, domiciliado en Calle 44 N° 2890 de la Ciudad Autónoma
de Buenos Aires, soltero, argentino, comerciante, DNI 42817095;
quienes resuelven celebrar el siguiente contrato de Sociedad de Responsabilidad Limitada,
que se regirá por las cláusulas que se indican a continuación y las disposiciones de la Ley
de Sociedades Comerciales, doy fe.

Primero: La sociedad girará bajo la denominación de "Divise S.R.L." y tendrá su sede social
en Calle 138 N° 1827, de la localidad de Berazategui, partido de Berazategui, pudiendo
establecer sucursales, agencias o representaciones en cualquier parte del país y/o del
extranjero.

Segundo: Su duración es de 99 años, contados a partir de la fecha de su inscripción en el
Registro Público de Comercio.

Tercero: El objeto social será la realización por cuenta propia, o de terceros, o asociada a
terceros en el país o en el extranjero, de las siguientes actividades: la investigación,
diseño, desarrollo, producción, comercialización, implementación, importación, exportación
y prestación de servicios de soluciones tecnológicas, software, hardware y herramientas
digitales, destinadas al desarrollo de plataformas de información financiera, cotizaciones
de divisas y criptomonedas, educación financiera y demás productos o servicios tecnológicos
relacionados.

Cuarto: El capital social se fija en la suma de quinientos mil pesos ($500.000), dividido en
50 cuotas iguales de diez mil pesos ($10.000) cada una, que los socios suscriben
completamente en este acto de acuerdo al siguiente detalle: el socio Valentin Lopez suscribe
diez (10) cuotas sociales por un total de cien mil pesos ($100.000), lo que representa un
veinte por ciento (20%) del capital social; el socio Santino Tacconi suscribe diez (10)
cuotas sociales por un total de cien mil pesos ($100.000), lo que representa un veinte por
ciento (20%) del capital social; el socio Santiago Centurion suscribe diez (10) cuotas
sociales por un total de cien mil pesos ($100.000), lo que representa un veinte por ciento
(20%) del capital social; el socio Lorenzo Sanchez suscribe diez (10) cuotas sociales por un
total de cien mil pesos ($100.000), lo que representa un veinte por ciento (20%) del capital
social; el socio Bruno Cabrera suscribe diez (10) cuotas sociales por un total de cien mil
pesos ($100.000), lo que representa un veinte por ciento (20%) del capital social.

Quinto: El capital suscripto se integra totalmente en este acto.

Sexto: La administración, representación legal y uso de la firma social estarán a cargo de
uno o más gerentes en forma individual e indistinta, socios o no, por el término de un (1)
ejercicio, siendo reelegibles. Los gerentes tendrán todas las facultades que sean necesarias
para realizar los actos y contratos tendientes al cumplimiento del objeto de la sociedad,
inclusive los previstos en los artículos 1881 del Código Civil y 9° del decreto-ley 5965/63.
A tal efecto, en este acto los socios designan para tal función al socio Valentin Lopez, DNI
40578219, domiciliado en Calle 138 N° 1827 de la localidad de Berazategui, provincia de
Buenos Aires.

Séptimo: Las resoluciones sociales se adoptarán en la forma dispuesta por el segundo párrafo
de la primera parte del artículo 159 de la ley 19550 y las mayorías serán las establecidas
por el artículo 160 de la referida ley. Cada cuota da derecho a un voto. Toda citación o
notificación a los socios deberá realizarse conforme lo dispuesto en el artículo 159, último
párrafo, de la ley 19550.

Octavo: Las cuotas son libremente transmisibles: no existe prohibición acerca de la
transmisibilidad de las cuotas, por lo cual los socios podrán transmitirlas a otros socios o
a extraños a la sociedad, siendo de aplicación el artículo 152 de la ley 19550.

Noveno: El ejercicio social cierra el 31 de diciembre de cada año. La gerencia confeccionará
a dicha fecha el balance general, que se pondrá a disposición de los socios con la
anticipación prevista por el artículo 67 de la ley 19550 para su consideración.

Décimo: De las ganancias realizadas y líquidas se destinará el 5% a reserva legal, hasta
alcanzar el 20% del capital social (artículo 70 de la ley 19550); el importe que fije la
reunión de socios para retribución de los gerentes; y el remanente, previa deducción de
cualquier otra reserva voluntaria que los socios dispusieran constituir, se distribuirá
entre los socios según sus respectivas participaciones en el capital social.

Décimo primero: Si se produjera el fallecimiento de alguno de los socios, sus herederos
podrán incorporarse a la sociedad desde el momento en que acrediten su calidad de tales.

En la Provincia de Buenos Aires, a los 6 días del mes de julio de 2026, se firman tres
ejemplares de un mismo tenor y a un solo efecto, recibiendo cada parte el suyo en este acto.

Valentin Lopez (DNI 40578219)          Santino Tacconi (DNI 41288903)
Santiago Centurion (DNI 41933677)      Lorenzo Sanchez (DNI 39657412)
Bruno Cabrera (DNI 42817095)
```

---

# SECCIÓN 25° — CONTRATO DE VENTA, LICITACIÓN DE SOFTWARE

```
CONTRATO DE PROVISIÓN Y VENTA DE SOFTWARE

Entre "Divise S.R.L." (en adelante "El Desarrollador"), con domicilio en Calle 138 N° 1827,
Berazategui, Provincia de Buenos Aires, representada por su gerente Valentin Lopez, DNI
40578219, por una parte; y [A COMPLETAR: nombre o razón social del Cliente], con domicilio
en [A COMPLETAR], CUIT [A COMPLETAR] (en adelante "El Cliente"), por la otra, se celebra el
presente Contrato de Provisión y Venta de Software, que se regirá por las siguientes
cláusulas:

PRIMERA — OBJETO: El Desarrollador se obliga a diseñar, desarrollar, implementar y entregar
al Cliente la plataforma web de cotizaciones financieras "Divise" (en adelante "El
Software"), que incluye: panel de cotizaciones en tiempo real de divisas y criptomonedas;
calculadora de conversión con desglose de impuestos argentinos; módulos de alertas,
favoritos, historial y gráficos interactivos; gestión de usuarios con autenticación segura;
módulo de noticias financieras; tema claro/oscuro y diseño responsive.

SEGUNDA — PLAZO DE DESARROLLO: El proyecto se ejecutará en un plazo de 16 semanas a partir
de la firma del presente contrato, contemplando las etapas de análisis, diseño, desarrollo,
pruebas y puesta en producción.

TERCERA — PRECIO: El precio del Software asciende a CUATRO MIL NOVECIENTOS DIEZ DÓLARES
ESTADOUNIDENSES (USD 4.910,00) sin IVA, más el 21% de IVA (USD 1.031,10), totalizando CINCO
MIL NOVECIENTOS CUARENTA Y UNO CON 10/100 DÓLARES ESTADOUNIDENSES (USD 5.941,10). Tipo de
cambio: a convenir a la fecha de firma de cada pago.

CUARTA — FORMA DE PAGO: El Cliente abonará el precio total según el siguiente cronograma:
● 40% (USD 2.376,44) a la firma del contrato, como adelanto;
● 30% (USD 1.782,33) contra la entrega de la versión funcional en ambiente de pruebas;
● 30% (USD 1.782,33) contra la entrega final y su puesta en producción.

QUINTA — ENTREGA Y RECEPCIÓN: El Software se entrega junto con su documentación técnica, el
manual de usuario y los casos de prueba ejecutados. La recepción definitiva se produce
cuando el Software supera la prueba de aceptación acordada, sin defectos críticos de
funcionamiento.

SEXTA — GARANTÍA: El Desarrollador garantiza el correcto funcionamiento del Software durante
TREINTA (30) días corridos desde la recepción definitiva; en ese período se corregirán sin
cargo los errores detectados que sean imputables al desarrollo.

SÉPTIMA — PROPIEDAD INTELECTUAL: El Software se entrega con licencia de uso por el plazo y en
las condiciones que acuerden las partes. La titularidad sobre el código fuente pertenece al
Desarrollador mientras la licencia no sea transferida expresamente mediante contrato
adicional.

OCTAVA — CONFIDENCIALIDAD: Las partes se obligan a mantener la confidencialidad de toda la
información técnica, comercial y financiera a la que accedan en virtud del presente
contrato, durante su vigencia y por dos (2) años posteriores a su finalización.

NOVENA — SOPORTE Y MANTENIMIENTO: El Desarrollador prestará soporte técnico para la
resolución de errores comunes (según la guía del capítulo 28° de Soporte) durante la
vigencia de la garantía. Todo mantenimiento evolutivo posterior será facturado por
separado.

DÉCIMA — RESOLUCIÓN: Cualquiera de las partes podrá rescindir el contrato ante
incumplimiento de la otra, previa notificación fehaciente con quince (15) días de
anticipación, sin perjuicio de la liquidación de los trabajos realizados.

En la Provincia de Buenos Aires, a los 6 días del mes de julio de 2026, se firman dos
ejemplares de un mismo tenor y a un solo efecto.

Por El Desarrollador: Divise S.R.L. — Valentin Lopez
Por El Cliente: [A COMPLETAR — nombre, firma y aclaración]
```

---

# SECCIÓN 26° — MANUAL DE USUARIO

```
MANUAL DE USUARIO — DIVISE

1. ¿Qué es Divise?
Divise es una plataforma web gratuita para consultar cotizaciones de dólar (oficial, blue,
MEP, CCL, tarjeta, mayorista) y criptomonedas (BTC, ETH, USDT), convertir montos con
impuestos argentinos, guardar favoritos, configurar alertas y ver gráficos históricos.

2. Acceso
● La aplicación se abre desde cualquier navegador web en:
  https://divise-frontend.onrender.com
● No requiere instalación.

3. Registro de una cuenta
1. Hacé clic en "Registrarse" en la pantalla de inicio.
2. Completá nombre, correo electrónico y contraseña (mínimo 8 caracteres).
3. Verificá tu correo con el código que enviamos a tu casilla.
4. Ingresá con tu correo y contraseña.

4. Inicio de sesión y recuperación de contraseña
● Ingresá tu correo y contraseña. Si olvidaste la clave, tocá "¿Olvidaste tu contraseña?",
  ingresá el código de 6 dígitos que recibís por correo y definí una contraseña nueva.

5. Panel de cotizaciones (Inicio / Divisas)
● Las tarjetas muestran la compra y la venta de cada activo y se actualizan solas cada 15
  segundos. La hora de actualización figura en la tarjeta.
● Con la estrella ★ marcás un activo como favorito.

6. Calculadora
1. Elegí la moneda de origen y destino.
2. Ingresá el monto. Si ponés letras, un valor negativo o dejás el campo vacío, la app
   muestra un mensaje de error.
3. Tocá "Convertir". Se muestra el resultado y la operación queda guardada en tu historial.
● La opción Dólar Tarjeta muestra el desglose de Impuesto PAIS y Ganancias.

7. Alertas
1. Entrá a "Alertas" y tocá "Nueva alerta".
2. Elegí la divisa, la condición (supera / cae por debajo de) y el valor objetivo.
3. Guardá la alerta. Se te notificará por correo cuando el precio alcance ese valor.

8. Favoritos
● En "Favoritos" se listan tus divisas marcadas. Podés buscar, filtrar por fiat/cripto,
  ordenar por precio y consultar el gráfico con el botón "Re-consultar".

9. Historial y gráficos
● "Historial" muestra tus consultas de conversión con fecha y hora; podés filtrar por
  rango de fechas.
● "Gráficos" muestra la evolución histórica de cada activo. Elegí el período (7 días, 30
  días, 1 año, 5 años, Todo) y el tipo de gráfico (línea, área, barras).

10. Noticias
● La sección Noticias muestra titulares económicos. Cada tarjeta abre la nota completa en
  una pestaña nueva.

11. Perfil
● Podés editar tu nombre y correo, cambiar la contraseña y activar la verificación en dos
  pasos (2FA).
● Podés alternar el tema oscuro/claro; tu elección queda guardada para la próxima visita.

12. Soporte
● Si algo no funciona, consultá la guía de errores comunes del capítulo 28° de Soporte, o
  escribinos a [A COMPLETAR: correo de soporte del grupo], con atención de 18 a 22 h.
```

---

# SECCIÓN 27° — METODOLOGÍA DE IMPLEMENTACIÓN ELEGIDA Y JUSTIFICACIÓN

```
Metodología de implementación elegida y su justificación

Metodología elegida: Scrum (marco ágil).

Justificación:
● Se eligió Scrum porque el proyecto Divise presenta requisitos que evolucionan a medida
  que la aplicación se prueba con usuarios reales (cotizaciones, alertas, cálculo de
  impuestos), lo que exige entregas parciales y correcciones frecuentes.
● Las sprints (ciclos de dos semanas) permiten entregar una versión funcional en cada
  iteración, validando progresivamente el diseño de pantallas, la calculadora, la
  integración de APIs, las alertas y los gráficos.
● El equipo es autoorganizado y cuenta con roles claros (Project Manager, Developers, Base
  de Datos, Diseño UX), compatibles con la organización que define Scrum.
● Las ceremonias (daily, sprint review y retrospective) garantizan comunicación frecuente y
  detección temprana de riesgos, como la caída de una API externa.

Cómo se aplicó en Divise:
● Roles: Product Owner (la cátedra), Scrum Master / Project Manager (Valentin Lopez) y
  equipo de desarrollo (resto de los integrantes).
● Artefactos: Product Backlog con las funcionalidades priorizadas (cotizaciones,
  calculadora, favoritos, alertas, historial, gráficos, noticias, perfil), Sprint Backlog
  por entrega e incremento funcional al final de cada sprint.
● Cronograma: el proyecto se organizó en 16 semanas distribuidas entre investigación,
  diseño, desarrollo del núcleo, integración de APIs, pruebas (QA) y despliegue a
  producción.
```

---

# SECCIÓN 28° — SOPORTE: GUÍAS DE RESOLUCIÓN DE ERRORES COMUNES Y CONFIGURACIONES

```
SOPORTE — Guía de resolución de errores comunes

1. "Servidor backend no disponible" o demora al entrar
● Causa: el servidor de Render (plan free) se ha dormido por inactividad.
● Solución: recargar la página y esperar entre 30 y 60 segundos mientras el servidor
  arranca.

2. Mensaje de error de red / "No se pudo conectar"
● Causa: sin conexión a internet o caída del proveedor de datos.
● Solución: verificar la conexión; la app muestra un mensaje claro y no se traba.

3. Error 401 al iniciar sesión
● Causa: correo o contraseña incorrectos.
● Solución: verificar que el correo esté en minúsculas y sin espacios, o usar la
  recuperación de contraseña.

4. "Token inválido o expirado"
● Causa: la sesión venció (el token dura 24 horas) o el código de recuperación venció.
● Solución: volver a iniciar sesión, o solicitar un nuevo código de recuperación.

5. No llegan las alertas por correo
● Causa: correo mal configurado, alerta pausada o verificación de la casilla pendiente.
● Solución: revisar la casilla (incluida la carpeta de spam) y confirmar que la alerta esté
  activa.

6. "Ingresá un monto..." en la calculadora
● Causa: monto vacío, con letras o negativo.
● Solución: ingresar solo números con punto o coma decimal (ej: 1.000,50).

7. "La cotización de X no está disponible por el momento"
● Causa: la divisa no tiene datos del proveedor en ese instante.
● Solución: reintentar en unos minutos.

8. Se alcanzó el límite de intentos (error 429)
● Causa: demasiados intentos de login/registro en poco tiempo (protección anti fuerza
  bruta).
● Solución: esperar unos minutos e intentar nuevamente.

9. Las noticias no cargan
● Causa: el proveedor de noticias está temporalmente caído.
● Solución: la app muestra un mensaje de error con el botón Reintentar; volver a intentar
  más tarde.

10. Gráfico vacío
● Causa: el historial del activo no tiene datos para el período elegido.
● Solución: cambiar el período o la moneda; si el error persiste, reintentar.

CONFIGURACIONES PARA EL EQUIPO (DESARROLLADORES)
● Variables de entorno: copiar codigo/server/.env.example a .env y completar
  SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, JWT_SECRET,
  EMAIL_USER, EMAIL_PASS, FRONTEND_URL y ADMIN_EMAILS.
● Instalación local: ejecutar npm install en codigo y en codigo/server; aplicar las
  migraciones 001→010 sobre PostgreSQL (Supabase).
● Despliegue: frontend con "vite build" y backend con el cron de sincronización de
  cotizaciones programado cada 5 minutos.
```

---

## REGISTRO DE CAMBIOS

- 04/10/2026: generación de este documento con el índice de 28 secciones, completudes
  (4°, 5°, 7°, 17°, 19°) y las secciones 24° a 28° completas para copiar y pegar.
- Pagos unificados con el presupuesto oficial: 40/30/30. Garantía unificada: 30 días.