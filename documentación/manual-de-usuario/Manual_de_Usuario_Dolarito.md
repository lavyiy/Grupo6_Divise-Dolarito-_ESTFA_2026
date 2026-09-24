# Manual de Usuario — Dolarito (divise.)
**Documentación Oficial de Producto · Versión 1.2**  
*Última actualización: Septiembre 2026*  
*Plataforma Cubierta: Plataforma Web & PWA v1.0 (React 18 + Vite 7 + Express 5 + PostgreSQL/Supabase)*  
*Estado de Edición: Vigente y Verificado con la Última Versión del Código (Git Main)*

---

## Tabla de Contenidos

1. [Introducción](#1-introducción) *(Pág. 2)*
2. [Requisitos del Sistema y PWA](#2-requisitos-del-sistema-y-pwa) *(Pág. 3)*
3. [Primeros Pasos](#3-primeros-pasos) *(Pág. 4)*
   - 3.1 Acceso a la Plataforma e Instalación como PWA
   - 3.2 Registro y Creación de Cuenta
   - 3.3 Inicio de Sesión y Recuperación de Contraseña con Código OTP
   - 3.4 Recorrido Inicial e Interfaz (Desktop y Navegación Móvil App-like)
4. [Funcionalidades Principales](#4-funcionalidades-principales) *(Pág. 5)*
   - 4.1 Panel de Inicio (Dashboard y Cotizaciones Clave)
   - 4.2 Monitor de Cotizaciones y Catálogo Multidivisa Mundial
   - 4.3 Calculadora y Conversor de Divisas
   - 4.4 Gráficos Interactivos, Series Históricas Reales y Horizontes Temporales
   - 4.5 Gestión de Divisas Favoritas con Filtro Fiat/Cripto
   - 4.6 Sistema de Alertas de Precios Automáticas
   - 4.7 Centro de Noticias por Región (Argentina, Mundo, Cripto)
   - 4.8 Historial de Consultas con Filtros Avanzados
   - 4.9 Perfil de Usuario, Preferencias Visuales y Verificación en Dos Pasos (2FA)
5. [Casos de Uso Comunes](#5-casos-de-uso-comunes) *(Pág. 10)*
6. [Preguntas Frecuentes (FAQ)](#6-preguntas-frecuentes-faq) *(Pág. 11)*
7. [Solución de Problemas](#7-solución-de-problemas) *(Pág. 12)*
8. [Contacto y Soporte](#8-contacto-y-soporte) *(Pág. 13)*

---

## 1. Introducción

### ¿Qué es Dolarito?
**Dolarito** (identificado en la interfaz web como **`divise.`**) es una plataforma digital centralizada, ágil y moderna diseñada para el seguimiento, cálculo, conversión y análisis técnico del mercado cambiario internacional y local. La aplicación recopila y sincroniza valores en tiempo real de:
- **Dólar estadounidense y variantes locales:** Mercado Oficial, Informal (*Dólar Blue*), Financieros (*MEP / Bolsa* y *CCL / Contado con Liqui*), Dólar Tarjeta, Dólar Mayorista y Dólar Solidario.
- **Monedas de la región y del mundo:** Euro (*EUR*), Real Brasileño (*BRL*), Peso Uruguayo (*UYU*), Peso Chileno (*CLP*), Libra Esterlina (*GBP*), Yen Japonés (*JPY*), Peso Mexicano (*MXN*), Franco Suizo (*CHF*) y Yuan Chino (*CNY*).
- **Criptoactivos líderes:** Bitcoin (*BTC*), Ethereum (*ETH*), Tether (*USDT* con paridad real contra el peso argentino), Binance Coin (*BNB*) y Dogecoin (*DOGE*).

### ¿A quién está dirigida? (Perfil del usuario)
La plataforma fue concebida con un enfoque accesible, eliminando barreras técnicas complejas para servir a distintos perfiles:
- **Particulares y ahorristas:** Personas que desean conocer la cotización del día para proteger sus ahorros o planificar gastos cotidianos.
- **Comerciantes, autónomos y freelancers:** Trabajadores independientes y pequeñas empresas que fijan presupuestos, compran insumos o facturan servicios en múltiples monedas extranjeras.
- **Operadores y analistas:** Usuarios interesados en observar la brecha cambiaria, tendencias históricas reales (hasta 5 años o serie completa) y fluctuaciones de corto y mediano plazo.

### ¿Qué problema resuelve y qué beneficio principal ofrece?
En economías con múltiples tipos de cambio y alta volatilidad, la información cambiaria suele encontrarse fragmentada, desactualizada o saturada de publicidad invasiva.  
**Dolarito** resuelve este obstáculo brindando una fuente confiable, inmediata y unificada:
- Realizar conversiones exactas con tipos de cambio reales.
- Registrar consultas en una base de datos segura para auditoría y trazabilidad.
- Recibir alertas automáticas por correo electrónico ante oscilaciones significativas.
- Estudiar el comportamiento del mercado mediante gráficos interactivos basados en datos históricos reales de mercado.
- Utilizar la aplicación en modo nativo desde el celular gracias a su soporte PWA e interfaz optimizada para pantallas táctiles.

---

## 2. Requisitos del Sistema y PWA

Dolarito funciona íntegramente como una aplicación web moderna (*Single Page Application* en React 18 impulsada por Vite 7 y respaldada por una API REST en Node.js/Express 5 con base de datos PostgreSQL en Supabase), por lo que **no requiere la instalación de programas pesados ni dependencias en el equipo del usuario**.

| Componente | Requisito o Especificación |
| :--- | :--- |
| **Sistemas Operativos** | Windows 10 / 11, macOS (11.0 o superior), distribuciones Linux de escritorio (Ubuntu, Debian, Fedora), Android 9.0+ e iOS 14.0+. |
| **Navegadores Compatibles** | Google Chrome (v90+), Mozilla Firefox (v88+), Microsoft Edge (v90+), Apple Safari (v14+) o cualquier navegador moderno basado en Chromium. |
| **Soporte PWA (Instalable)** | Compatible con Progressive Web App. Puede instalarse en el escritorio o en la pantalla de inicio del teléfono móvil desde el menú del navegador (*"Instalar aplicación"* o *"Agregar a pantalla de inicio"*), ejecutándose en ventana independiente sin barra de navegación del explorador. |
| **Conexión a Internet** | Requerida. Se sugiere una conexión estable (mínimo 1 Mbps) para la recepción fluida de cotizaciones y flujos de precios en vivo. |
| **Cuenta de Usuario** | Requerida para acceder al Panel de Control (`/dashboard`), guardar divisas favoritas, registrar alertas y almacenar historiales personales. |
| **Permisos Especiales** | **No requiere permisos de cámara, micrófono ni geolocalización.** Las alertas y códigos de seguridad se despachan directamente por **correo electrónico**, por lo que no es necesario otorgar permisos especiales en el navegador. |

---

## 3. Primeros Pasos

### 3.1 Acceso a la Plataforma e Instalación como PWA
Para ingresar a la plataforma, abra su navegador web e ingrese a la dirección oficial:  
**`https://dolarito.onrender.com`** (o el dominio web provisto).  
Verifique que el navegador muestre el icono de candado de conexión segura (SSL/TLS HTTPS) en la barra de direcciones.

> [!TIP]
> **Instalación como App Móvil (PWA):** En dispositivos móviles (Android/iOS) o de escritorio (Chrome/Edge), presione el menú del navegador y seleccione **"Instalar aplicación"** o **"Agregar a la pantalla principal"**. Dolarito se añadirá con su icono oficial (`icon-192.png`/`icon-512.png`), abriéndose en modo pantalla completa como una app nativa.

### 3.2 Registro y Creación de Cuenta
Si es su primera visita, cree una cuenta personal siguiendo estos pasos:
1. Desde la pantalla principal o de inicio de sesión, presione el enlace **"Crear cuenta"** o **"Registrarse"**.
2. Complete los campos requeridos:
   - **Nombre completo:** Su nombre o alias de usuario.
   - **Correo electrónico:** Una casilla de correo válida y accesible.
   - **Contraseña:** Cree una contraseña segura (**mínimo 8 caracteres obligatorios**).
   - **Confirmar Contraseña:** Vuelva a escribir la contraseña exactamente igual.
3. Marque la casilla obligatoria: **"Acepto los términos y condiciones de uso"**.
4. Haga clic en **"Registrarse"**. El sistema enviará inmediatamente un **código de verificación de 6 dígitos** a la casilla de correo provista.
5. Ingrese el código de 6 dígitos en la pantalla de verificación para activar su usuario e iniciar sesión automáticamente.  
   *(Si el código no llega en unos instantes, revise la carpeta de Spam o presione "Reenviar código").*

### 3.3 Inicio de Sesión y Recuperación de Contraseña con Código OTP
1. Acceda a la ruta de ingreso (`/login`) y escriba su **Correo electrónico** y **Contraseña**.
2. Presione el botón **"Iniciar Sesión"**.
3. **Paso de Verificación (si aplica):**
   - Si tiene activada la **Verificación en Dos Pasos (2FA)**, el sistema enviará un código numérico de 6 dígitos a su correo electrónico. Ingréselo en el campo emergente para completar el acceso.
   - Si su cuenta aún tenía la verificación de correo pendiente, el sistema le solicitará el código correspondiente antes de conceder acceso.
4. Al autenticar con éxito, el sistema lo redirigirá automáticamente a la vista general de **Inicio** (`/dashboard`).
5. **Recuperación con Código de 6 dígitos (`/forgot` y `/reset-password`):**  
   Si olvidó su contraseña, presione *"¿Olvidaste tu contraseña?"*. Ingrese su correo electrónico y el servidor le enviará un **código de recuperación de 6 dígitos** (válido por 30 minutos). Ingrese dicho código en la pantalla de restablecimiento junto con su nueva clave (mínimo 8 caracteres) para recuperar el acceso de inmediato.

### 3.4 Recorrido Inicial e Interfaz (Desktop y Navegación Móvil App-like)
Al iniciar sesión, la interfaz adapta su estructura según el tipo de pantalla:
- **En computadoras de escritorio (Desktop):**
  - **Barra Superior (Navbar):** Contiene el logotipo **`divise.`** (acceso a Inicio), el menú completo de 8 módulos (**Inicio**, **Cotizaciones**, **Gráficos**, **Calculadora**, **Noticias**, **Alertas**, **Favoritos**, **Historial**), el avatar de **Perfil** y el botón de **Cierre de Sesión**.
- **En dispositivos móviles (Smartphones / Tablets):**
  - **Barra Inferior Flotante (*Bottom Nav*):** Diseñada para pulgares (*touch-friendly*), con acceso directo a las 4 pantallas clave: **Inicio**, **Cotizaciones**, **Gráficos** y **Alertas**, más el botón **"Más"**.
  - **Hoja Desplegable (*Bottom Sheet*):** Al pulsar "Más", se desliza un panel interactivo con las secciones secundarias: **Calculadora**, **Noticias**, **Favoritos**, **Historial** y **Perfil**.

---

## 4. Funcionalidades Principales

### 4.1 Panel de Inicio (Dashboard y Cotizaciones Clave)
*Ruta: `/dashboard`*  
**Monitor principal de referencia con indicadores KPI de alto impacto.**

#### ¿Qué hace?
Centraliza los tipos de cambio más consultados en el mercado argentino: **Dólar Blue**, **Dólar Oficial**, **Euro Oficial** y **Bitcoin**. Cada tarjeta exhibe el precio de venta en vivo mediante contadores animados (*CountUp*), su porcentaje de variación diaria y una micro-gráfica (*sparkline*) de tendencia.

#### ¿Cómo se usa?
1. Al entrar al Dashboard, observe las 4 tarjetas superiores con los precios actualizados al instante.
2. En la sección inferior izquierda, visualice las **Cotizaciones destacadas** con atajo directo hacia el monitor completo (*"Ver todas"*).
3. En la sección inferior derecha, consulte el resumen de accesos rápidos para calcular conversiones o configurar alertas preventivas.

---

### 4.2 Monitor de Cotizaciones y Catálogo Multidivisa Mundial
*Ruta: `/dashboard/divisas`*  
**Catálogo exhaustivo de divisas fiduciarias internacionales y criptomonedas.**

#### ¿Qué hace?
Ofrece un catálogo ordenado de cotizaciones con desglose detallado de precios de **Compra** y **Venta**, tipo de mercado (Oficial, Informal, Cripto) y cálculo de variación porcentual. Incluye las monedas más transaccionadas del mundo (USD, EUR, BRL, UYU, CLP, GBP, JPY, MXN, CHF, CNY, BTC, ETH, USDT, BNB, DOGE).

#### ¿Cómo se usa?
1. Navegue a la pestaña **Cotizaciones** desde la barra superior o inferior.
2. Utilice los filtros rápidos por categoría: **"Todos"**, **"Divisas"** o **"Cripto"** para delimitar el conjunto de datos.
3. En la barra de búsqueda, ingrese el nombre o código de la divisa (ej. *"Real"*, *"BRL"*, *"Libra"*, *"BTC"*). El filtrado es instantáneo.
4. Presione el icono de estrella (**★**) en cualquier tarjeta para fijarla en sus favoritos.
5. Al hacer clic sobre cualquier tarjeta o fila de cotización, el sistema registra automáticamente el par y el valor del momento en su **Historial de Consultas** personal.

---

### 4.3 Calculadora y Conversor de Divisas
*Ruta: `/dashboard/calculadora`*  
**Conversión instantánea entre monedas nacionales, internacionales y cripto.**

#### ¿Qué hace?
Permite ingresar un monto en una divisa origen y calcular al instante su equivalente exacto en la divisa destino, aplicando los tipos de cambio de venta vigentes y resolviendo el cruce cambiario adecuado (incluso para criptoactivos valuados en USD contra pesos argentinos a través del Dólar Blue).

#### ¿Cómo se usa?
1. Ingrese en el campo **"Monto"** la cantidad numérica a convertir (ej. `1000`).
2. Seleccione la **Moneda de Origen** en el desplegable izquierdo (ej. `USD - Dólar Estadounidense`).
3. Seleccione la **Moneda de Destino** en el desplegable derecho (ej. `ARS - Peso Argentino` o `BRL - Real Brasileño`).
4. Presione el botón circular **Swap (⇄)** en cualquier momento para invertir inmediatamente el sentido de la conversión.
5. Visualice el resultado numérico en tiempo real en la tarjeta de conversión con desglose del tipo de cambio unitario aplicado.

---

### 4.4 Gráficos Interactivos, Series Históricas Reales y Horizontes Temporales
*Ruta: `/dashboard/graficos`*  
**Análisis gráfico con series de precios históricas reales y comparativa multi-horizonte.**

#### ¿Qué hace?
Renderiza gráficos vectoriales dinámicos conectados a datos de mercado reales (a través de APIs de cotizaciones históricas y endpoints backend `/api/fx-history`). Admite todas las variantes del dólar, monedas internacionales (Euro, Real, Libra, Yen, Yuan, etc.) y criptomonedas (con serie histórica real de USDT en pesos).

#### ¿Cómo se usa?
1. Seleccione la divisa principal en el selector superior (ej. `Dólar Blue`, `Dólar Oficial`, `Euro`, `Real Brasileño`, `Tether (USDT)`).
2. Elija el horizonte temporal de análisis: **7 días**, **30 días**, **90 días**, **1 año**, **5 años** o **Todo** (serie histórica completa).
3. Active o desactive el interruptor **"Comparar divisas"** para proyectar una segunda línea de referencia sobre el mismo plano.
4. Alterne entre el estilo de gráfico de **Línea** o **Área**.
5. Pase el cursor sobre cualquier punto de la gráfica para ver la etiqueta con la fecha exacta y el precio correspondiente.

---

### 4.5 Gestión de Divisas Favoritas con Filtro Fiat/Cripto
*Ruta: `/dashboard/favoritos`*  
**Panel personalizado de seguimiento rápido para monedas de uso frecuente.**

#### ¿Qué hace?
Permite armar una lista personalizada con las monedas que el usuario necesita tener siempre a la vista, persistida en la base de datos, con atajos directos para transferir el valor directamente a la calculadora o solicitar una actualización puntual de precio.

#### ¿Cómo se usa?
1. En la vista de **Favoritos** o **Cotizaciones**, haga clic sobre el icono de **Estrella (★)** junto a cualquier divisa para fijarla o removerla.
2. Utilice las pestañas para alternar entre ver *"Todas"* o exclusivamente *"Mis Favoritas"*.
3. Utilice los filtros rápidos por tipo: **"Todas"**, **"Divisas"** o **"Cripto"**.
4. Presione el botón de **Conversión rápida** en la tarjeta de la divisa para abrir la Calculadora con dicha moneda preseleccionada como origen.
5. Use los criterios de ordenamiento (favoritas primero, nombre, código o precio) para organizar visualmente sus tarjetas.

---

### 4.6 Sistema de Alertas de Precios Automáticas
*Ruta: `/dashboard/alertas`*  
**Monitoreo automático con notificaciones configuradas por umbral.**

#### ¿Qué hace?
Supervisa el mercado y envía un aviso automático por **correo electrónico** cuando una divisa supera un valor máximo establecido o desciende por debajo de un valor mínimo de interés. Soporta todas las variantes de dólar, monedas globales y criptoactivos.

#### ¿Cómo se usa?
1. Presione el botón **"+ Nueva Alerta"** en la cabecera del módulo.
2. En la ventana modal, escoja la divisa a vigilar (ej. *Dólar Blue*, *Dólar Oficial*, *Euro*, *Real Brasileño*, *Peso Uruguayo*, *Peso Chileno*, *Libra Esterlina*, *Bitcoin*, *Ethereum*, *USDT*, *BNB*, *Dogecoin*).
3. Defina la regla de activación: **"Supera el valor"** o **"Cae por debajo de"**.
4. Especifique el precio objetivo (umbral).  
   *(No es necesario ingresar su correo electrónico, ya que el sistema lo asociará automáticamente a la casilla de su cuenta registrada).*
5. Haga clic en **"Guardar Alerta"**. La regla quedará activa y visible en su tablero, pudiendo eliminarla en cualquier momento con el botón "Eliminar".

---

### 4.7 Centro de Noticias por Región (Argentina, Mundo, Cripto)
*Ruta: `/dashboard/noticias`*  
**Feed de actualidad económica en tiempo real servido por el backend con clasificación regional.**

#### ¿Qué hace?
Sincroniza y presenta titulares y síntesis informativas del mercado financiero a través del servicio interno de noticias de Dolarito, organizado en tarjetas legibles con fecha relativa (*"Hace 15 min"*, *"Hace 2 h"*), fuente periodística y etiqueta temática.

#### ¿Cómo se usa?
1. Ingrese a la sección **Noticias** en el menú principal o desde la barra inferior móvil.
2. Filtre las noticias por región temática: **"Todas"**, **"Argentina"**, **"Mundo"** o **"Cripto"**.
3. Elija el criterio de ordenamiento: **"Relevancia"** o **"Más recientes"**.
4. Haga clic en cualquier tarjeta o titular para abrir el artículo completo en la fuente original en una pestaña nueva.

---

### 4.8 Historial de Consultas con Filtros Avanzados
*Ruta: `/dashboard/historial`*  
**Auditoría y registro cronológico de consultas realizadas por el usuario con filtros validados.**

#### ¿Qué hace?
Conserva un registro en base de datos con fecha, hora, divisa y precio registrado cada vez que el usuario consulta o interactúa con una cotización en la plataforma, permitiendo auditoría y trazabilidad histórica.

#### ¿Cómo se usa?
1. Acceda al módulo **Historial**.
2. Filtre por rango de fechas ingresando una **Fecha Desde** y una **Fecha Hasta** (con validación automática: fecha máxima no superior a hoy y fecha mínima respetando la creación de la cuenta).
3. Utilice los filtros rápidos por tipo: **"Todas"**, **"Fiat"** o **"Cripto"**, o seleccione una moneda específica en el desplegable de divisas.
4. Escriba en el buscador si desea ver únicamente las consultas de una palabra o par particular.
5. Ordene por consultas más recientes o más antiguas.
6. Presione **"Limpiar filtros"** para restablecer la vista completa paginada.

---

### 4.9 Perfil de Usuario, Preferencias Visuales y Verificación en Dos Pasos (2FA)
*Ruta: `/dashboard/perfil`*  
**Gestión de credenciales, preferencias visuales, verificación en dos pasos y cuenta.**

#### ¿Qué hace?
Permite actualizar los datos personales del titular, personalizar el aspecto visual de la aplicación, cambiar la contraseña de acceso, activar la protección con **Verificación en Dos Pasos (2FA por correo electrónico)** y gestionar la baja voluntaria de la cuenta.

#### ¿Cómo se usa?
1. **Acceso:** Haga clic en su avatar en la esquina superior derecha (o desde el menú "Más" en móviles) para entrar a **Mi Perfil**.
2. **Editar Perfil:** Presione *"Editar Perfil"* para corregir su nombre o dirección de correo electrónico registrada.
3. **Preferencias Visuales:**
   - **Tema de la Aplicación:** Elija entre el modo **Oscuro (Divise Pro)** o modo **Claro (Light Gold)** según su preferencia visual.
   - **Divisa Principal:** Seleccione la cotización que se prioriza por defecto en sus tableros (ej. *USD - Dólar Blue*, *EUR*, *BTC*, etc.).
4. **Cambio de Contraseña:** Presione *"Cambiar Contraseña"*, ingrese su contraseña actual seguida de la nueva contraseña (**mínimo 8 caracteres**) y su confirmación.
5. **Verificación en Dos Pasos (2FA):** Presione el botón **"Activar 2FA"**. A partir de ese momento, la cuenta quedará protegida: en cada nuevo inicio de sesión el sistema despachará un código de seguridad numérico de 6 dígitos a su correo electrónico. Para desactivarlo, presione nuevamente el botón *"Desactivar"*.
6. **Eliminar Cuenta (Zona de Peligro):** Presione *"Eliminar cuenta"*. Por seguridad, el sistema abrirá un diálogo donde deberá escribir la palabra confirmatoria **`ELIMINAR`** en mayúsculas. Al confirmar, se eliminarán permanentemente el perfil, favoritos, alertas e historial asociado.

---

## 5. Casos de Uso Comunes

### Caso 1: Comparar la brecha entre el Dólar Blue y el Dólar Oficial antes de una operación
- **Objetivo:** Un usuario desea saber cuántos pesos de diferencia existen entre la cotización bancaria y la del mercado libre para definir una compra o cobro de servicios.
- **Solución:** Ingrese a **Inicio** o **Cotizaciones**. Observe directamente las tarjetas de Dólar Blue y Dólar Oficial colocadas de forma contigua en el panel. El valor de venta y la variación diaria le permitirán calcular el spread cambiario en cuestión de segundos.

### Caso 2: Calcular el valor en pesos de una compra internacional o presupuesto
- **Objetivo:** Un profesional recibe una cotización o presupuesto de 750 USD y necesita saber el monto equivalente exacto en pesos argentinos al momento de abonar.
- **Solución:** Diríjase a **Calculadora** (`/dashboard/calculadora`). Digite `750` en el campo monto, elija origen `USD` y destino `ARS`. En pantalla obtendrá el importe total con los centavos calculados sobre el tipo de cambio oficial o paralelo según corresponda.

### Caso 3: Recibir un aviso preventivo cuando una cotización supere un umbral crítico
- **Objetivo:** Un usuario desea comprar divisa únicamente si el precio baja de un valor objetivo, o proteger un activo si el valor sobrepasa un determinado nivel.
- **Solución:** Vaya a **Alertas** (`/dashboard/alertas`) > presione `"+ Nueva Alerta"` > seleccione la divisa > elija la condición (ej. *"Cae por debajo de"*) y determine la cifra límite. La plataforma se encargará de avisarle por correo electrónico automáticamente sin necesidad de que usted permanezca con la página abierta todo el día.

### Caso 4: Reforzar la seguridad personal activando la verificación en dos pasos (2FA)
- **Objetivo:** Garantizar que nadie pueda acceder a la cuenta personal aunque conozca o adivine la contraseña.
- **Solución:** Abra **Perfil** (`/dashboard/perfil`) > presione el botón **"Activar 2FA"**. Desde ese momento, cada inicio de sesión requerirá su contraseña habitual y un código numérico temporal de 6 dígitos que llegará al instante a su correo electrónico.

---

## 6. Preguntas Frecuentes (FAQ)

- **¿Cada cuánto tiempo se actualizan las cotizaciones mostradas?**  
  Las cotizaciones se sincronizan continuamente con los proveedores oficiales y mercados en línea. En la parte superior de las pantallas principales encontrará un reloj en vivo que le indica la hora exacta de la última lectura recibida.

- **¿Tiene algún costo o suscripción utilizar Dolarito?**  
  No. Dolarito es una plataforma de acceso libre y gratuito para el usuario final. El registro solo es requerido para resguardar de forma segura sus preferencias, divisas favoritas, alertas personalizadas y su historial de consultas.

- **¿Cómo calcula la plataforma los valores de conversión de Bitcoin y Ethereum a Pesos?**  
  Las criptomonedas cotizan globalmente en dólares estadounidenses (USD). La Calculadora realiza una conversión cruzada en dos fases: primero calcula el valor en USD del criptoactivo y luego lo convierte a pesos argentinos utilizando la referencia del tipo de cambio del mercado (Dólar Blue), logrando un valor fiel y transparente.

- **¿Qué debo hacer si no recibí el código de verificación por correo?**  
  Verifique en primer lugar su carpeta de correo no deseado o Spam. Si tras unos instantes no lo visualiza, presione el botón *"Reenviar código"* desde la misma ventana de verificación para que el servidor genere y envíe una nueva clave de acceso de 6 dígitos.

- **¿Se almacenan mis transacciones financieras reales en la plataforma?**  
  No. Dolarito es una herramienta estrictamente informativa, de cálculo y seguimiento de cotizaciones. No opera como billetera virtual, no procesa dinero físico ni solicita datos bancarios o números de tarjeta de crédito.

- **¿Puedo instalar Dolarito como una app en mi teléfono móvil?**  
  Sí. La plataforma está construida con tecnología PWA (*Progressive Web App*). Desde el menú de opciones de su navegador móvil (Chrome, Safari o Edge), seleccione *"Instalar aplicación"* o *"Agregar a la pantalla principal"*. La app se instalará en su dispositivo con icono propio y funcionará en pantalla completa, incorporando navegación táctil inferior optimizada para móviles.

---

## 7. Solución de Problemas

Si experimenta algún comportamiento inesperado durante el uso de la aplicación, consulte la siguiente tabla de diagnóstico rápido:

| Problema Observado | Posible Causa | Solución Recomendada |
| :--- | :--- | :--- |
| **No puedo iniciar sesión** | Contraseña incorrecta, correo mal tipeado o cuenta pendiente de validación. | Revise que la tecla Bloq Mayús no esté activada. Asegúrese de que su contraseña tenga al menos 8 caracteres. Si olvidó su clave, utilice la opción *"¿Olvidaste tu contraseña?"* para recibir un código de recuperación de 6 dígitos. |
| **El sistema rechaza el código de verificación / 2FA** | Código temporal expirado, error de tipeo o solicitud de múltiples reenvíos sucesivos. | Verifique su bandeja de entrada (y carpeta Spam) e introduzca el código de 6 dígitos del correo más reciente. Si el código ya venció, solicite uno nuevo mediante *"Reenviar código"*. |
| **Las cotizaciones no cambian o se muestran en cero** | Interrupción momentánea de la conexión a internet o mantenimiento de la API de origen. | Compruebe su acceso a internet y recargue la página (F5 o Ctrl+R). Si el servidor se encuentra actualizándose, la plataforma utilizará de respaldo el último valor registrado de forma segura en la base de datos. |
| **El gráfico temporal no muestra datos** | Par de monedas sin historial para el rango de tiempo seleccionado o corte de red. | Seleccione un rango temporal alternativo (ej. *30 días*, *1 año* o *Todo*) o elija pares tradicionales con volumen continuo como `USD/ARS`, `EUR/ARS`, `BRL/ARS` o `BTC`. |
| **No recibo las alertas de precio configuradas** | El mercado aún no alcanzó el umbral fijado o el correo fue clasificado como correo no deseado. | Revise en su panel de Alertas que la regla figure como "Activa" y verifique que las notificaciones del remitente no estén bloqueadas en su bandeja de correo o carpeta Spam. |
| **No puedo eliminar mi cuenta** | No se escribió exactamente la palabra de confirmación requerida. | En la ventana modal de confirmación, escriba la palabra **`ELIMINAR`** en letras mayúsculas antes de presionar el botón de confirmación definitiva. |

---

## 8. Contacto y Soporte

Si necesita asistencia adicional, desea reportar una inconsistencia o requiere soporte sobre su cuenta, ponemos a disposición los siguientes canales de atención institucional:

- **Correo de Soporte Técnico:** `soporte@dolarito.app` / `divise.grupo6@gmail.com`
- **Mesa de Ayuda y Acceso:** `https://dolarito.onrender.com`
- **Horario de Atención:** Lunes a Viernes, 09:00 a 18:00 (GMT-3)
- **Tiempo promedio de respuesta:** Menor a 24 horas hábiles

> [!TIP]
> **Recomendación para solicitar soporte:** Al reportar un incidente, adjunte una descripción del paso que intentaba realizar, la hora aproximada y el mensaje de aviso observado en pantalla. Esto facilitará una resolución rápida por parte del equipo técnico.

---
*Dolarito (divise.) — Plataforma de Consulta de Cotizaciones Multidivisa · Manual de Usuario v1.2*
