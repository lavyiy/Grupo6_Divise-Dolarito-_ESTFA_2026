# Manual de Usuario — divise.

## Tabla de Contenidos

1. Introducción
2. Requisitos del sistema
3. Primeros pasos
4. Funcionalidades principales
5. Casos de uso comunes
6. Preguntas frecuentes (FAQ)
7. Solución de problemas
8. Contacto y soporte

---

## 1. Introducción

### ¿Qué es divise.?
**divise.** es una aplicación web gratuita que reúne en un solo lugar las cotizaciones del mercado cambiario argentino e internacional, con valores en tiempo real. Se puede usar desde la computadora o el celular, sin instalar nada, y agrupa tres mundos de monedas:

- **Dólar y sus variantes:** Oficial, Blue (informal), MEP/Bolsa, CCL/Contado con Liqui, Tarjeta, Mayorista y Solidario.
- **Monedas del mundo:** Euro, Real Brasileño, Peso Uruguayo, Peso Chileno, Libra Esterlina, Yen Japonés, Peso Mexicano, Franco Suizo y Yuan Chino.
- **Criptomonedas:** Bitcoin, Ethereum, Tether, Binance Coin y Dogecoin.

Además de ver los precios, la app permite **convertir montos** con una calculadora, seguir la **evolución histórica** con gráficos, armar una lista de **favoritos**, recibir **alertas por correo** cuando un precio cruza un valor que te importa, leer **noticias** del mercado y consultar el **historial** de lo que buscaste.

### ¿A quién está dirigida?
- **Ahorristas particulares:** gente que quiere saber cuánto está el dólar para cuidar sus ahorros o planificar gastos. Es el usuario más frecuente.
- **Comerciantes, autónomos y freelancers:** quienes fijan presupuestos, compran insumos o cobran servicios en moneda extranjera y necesitan pasar todo a pesos en el momento.
- **Analistas y curiosos del mercado:** usuarios que siguen la brecha cambiaria, comparan monedas y miran tendencias históricas (hasta 5 años o la serie completa).

### ¿Qué problema resuelve y qué beneficio ofrece?
En una economía con muchos tipos de cambio y alta volatilidad, la información suele estar dispersa, desactualizada o llena de publicidad. divise. la junta en una pantalla limpia, con datos reales y al instante. El beneficio principal es simple: **saber cuánto está el dólar y convertir en segundos**, sin ser experto ni saltar de página en página.

- Conversiones exactas con el tipo de cambio del momento.
- Alertas automáticas por correo ante oscilaciones importantes.
- Gráficos con datos históricos reales para decidir con contexto.
- Historial propio para no perder de vista lo que uno consulta.

---

## 2. Requisitos del sistema

divise. es una aplicación web moderna (React + Vite con una API en Node.js/Express y base de datos PostgreSQL). **No requiere instalar programas** ni tener una máquina potente: alcanza con un navegador actualizado.

| Componente | Requisito |
| :--- | :--- |
| Sistemas operativos | Windows 10/11, macOS 11+, Linux (Ubuntu, Debian, Fedora), Android 9+ e iOS 14+. |
| Navegadores | Chrome (v90+), Edge (v90+), Firefox (v88+), Safari (v14+) o cualquier navegador basado en Chromium actualizado. |
| Instalación como app (PWA) | Opcional. Desde el menú del navegador se puede "Instalar aplicación" / "Agregar a la pantalla principal". Queda con icono propio y se abre en pantalla completa, igual que una app nativa. |
| Conexión a internet | Sí, para recibir los precios en vivo. Se sugiere una conexión estable (mínimo 1 Mbps). |
| Cuenta de usuario | Se necesita para entrar al panel y usar favoritos, alertas, historial y perfil. |
| Permisos especiales | Ninguno. No pide cámara, micrófono ni ubicación. Los códigos y avisos llegan por correo. |

> Tip: si vas a usarla seguido en el celular, instalala como PWA — queda más cómoda, con navegación táctil en la parte inferior.

---

## 3. Primeros pasos

### 3.1 Acceso a la plataforma e instalación como PWA
1. Abrí el navegador y entrá a **https://dolarito.onrender.com**.
2. Verificá que aparezca el **candado de conexión segura** (HTTPS) en la barra de direcciones.
3. **Opcional:** para instalarla como app, tocá el menú del navegador y elegí *"Instalar aplicación"* o *"Agregar a la pantalla principal"*.

![Pantalla de inicio de sesión](img/Captura_login.png)

### 3.2 Registro y creación de cuenta
1. En la pantalla de inicio tocá **"Crear cuenta"**.
2. Completá los campos: **nombre completo**, **correo electrónico** válido, **contraseña** de mínimo 8 caracteres y su **confirmación**.
3. Aceptá los términos de uso y tocá **"Registrarse"**.
4. El sistema envía un **código de verificación de 6 dígitos** al correo. Ingresalo en la pantalla de validación para activar la cuenta — y entrás directo.

> Si el correo no llega en unos segundos, revisá la carpeta de Spam o tocá "Reenviar código".

### 3.3 Inicio de sesión, verificación y recuperación de contraseña
1. Escribí tu **correo** y tu **contraseña**, y tocá **"Iniciar sesión"**.
2. **Verificación:** si tenés activada la verificación en dos pasos (2FA), te llega un código de 6 dígitos al correo. Ingresalo para completar el acceso.
3. **¿Olvidaste la contraseña?** Tocá el enlace, poné tu correo y vas a recibir un **código de recuperación de 6 dígitos** (válido 30 minutos). Ingresalo en la pantalla de restablecimiento, junto con una contraseña nueva (mínimo 8 caracteres), y recuperás el acceso al instante.

### 3.4 Recorrido inicial
Al entrar, la interfaz se adapta al tamaño de la pantalla:
- **En computadora:** la barra superior tiene el logo **divise.**, el menú completo (Inicio, Cotizaciones, Gráficos, Calculadora, Noticias, Alertas, Favoritos, Historial), el avatar de Perfil y el botón de Cierre de Sesión.
- **En celular:** la navegación principal está abajo, al alcance del pulgar: Inicio, Cotizaciones, Gráficos y Alertas, más un botón **"Más"** que desliza una hoja con el resto (Calculadora, Noticias, Favoritos, Historial y Perfil).

La primera pantalla que se ve después de entrar es el panel de **Inicio**, con los precios del día.

---

## 4. Funcionalidades principales

### 4.1 Inicio (panel principal) — `/dashboard`
**¿Qué hace?** Es el resumen del día. Muestra las 4 cotizaciones más consultadas — **Dólar Blue, Dólar Oficial, Euro y Bitcoin** — en tarjetas con el precio de venta en vivo, el porcentaje de variación diaria y una mini-gráfica de tendencia. Además, en la parte inferior hay atajos a las cotizaciones completas y a la calculadora.

**¿Cómo se usa?** Entrá y mirá. Las tarjetas se actualizan solas; tocá "Ver todas" para ver el resto de las monedas o "Calcular" para ir directo a la conversión.

![Panel de inicio](img/Captura_inicio.png)

### 4.2 Cotizaciones — `/dashboard/divisas`
**¿Qué hace?** Es el catálogo completo del mercado. Para cada moneda muestra el precio de **compra** y de **venta**, el tipo de mercado (Oficial, Informal o Cripto) y la variación. Incluye dólares (todas las variantes), monedas del mundo y criptomonedas (BTC, ETH, USDT, BNB, DOGE).

**¿Cómo se usa?**
1. Entrá a **Cotizaciones** desde el menú.
2. Filtrá por categoría: *Todas*, *Divisas* o *Cripto*.
3. Buscá por nombre o código (ej. "Real", "BRL", "Libra", "BTC"). El filtrado es instantáneo.
4. Tocá la estrella (★) de una tarjeta para guardarla en Favoritos.
5. Tocá cualquier tarjeta para registrar esa consulta en tu Historial.

![Catalogo de cotizaciones](img/Captura_cotizaciones.png)

### 4.3 Calculadora — `/dashboard/calculadora`
**¿Qué hace?** Convierte un monto de una moneda a otra usando el tipo de cambio del momento. Resuelve también el cruce de **cripto a pesos** (primero pasa la cripto a dólares y después a pesos usando como referencia el dólar Blue), de forma transparente.

**¿Cómo se usa?**
1. Escribí el **monto** a convertir (ej. 1000).
2. Elegí la **moneda de origen** en el desplegable izquierdo y la **moneda de destino** en el derecho.
3. Usá el botón circular **⇄ (Swap)** para invertir el sentido de la conversión, si hace falta.
4. El resultado aparece al instante, con el tipo de cambio unitario aplicado.

![Calculadora](img/Captura_calculadora.png)

### 4.4 Gráficos — `/dashboard/graficos`
**¿Qué hace?** Grafica la **evolución real** de una moneda con datos históricos, con distintos horizontes temporales: 7 días, 30 días, 90 días, 1 año, 5 años o la serie completa. Permite también **comparar dos monedas** en un mismo plano.

**¿Cómo se usa?** Elegí la divisa (ej. Dólar Blue, Euro, Real, Tether), el período, y alterná entre estilo de **línea** o **área**. Si querés, activá "Comparar divisas" para superponer una segunda. Pasá el cursor por el gráfico para ver la fecha y el precio exacto de cada punto.

![Gráficos históricos](img/Captura_graficos.png)

### 4.5 Favoritos — `/dashboard/favoritos`
**¿Qué hace?** Arma una lista personal con las monedas que querés tener siempre a la vista. La lista queda guardada en tu cuenta y se sincroniza entre dispositivos.

**¿Cómo se usa?** Tocá la estrella (★) en cualquier cotización para sumarla o sacarla. En Favoritos podés filtrar por tipo (Todas/Divisas/Cripto), ordenarlas como prefieras y, con el botón de **conversión rápida**, mandar la moneda directo a la calculadora.

![Favoritos](img/Captura_favoritos.png)

### 4.6 Alertas — `/dashboard/alertas`
**¿Qué hace?** Vigila una moneda por vos y te **avisa por correo** cuando supera un precio que definiste o cae por debajo de él. Aplica a dólares, monedas del mundo y cripto.

**¿Cómo se usa?**
1. Entrá a **Alertas** y tocá **"+ Nueva Alerta"**.
2. Elegí la divisa a vigilar (ej. Dólar Blue, Euro, Real, Bitcoin).
3. Definí la regla: *"Supera el valor"* o *"Cae por debajo de"*, y el precio límite.
4. Tocá **Guardar Alerta**. No hace falta poner el correo: se usa el de tu cuenta. Podés eliminarla cuando quieras.

![Alertas](img/Captura_alertas.png)

### 4.7 Noticias — `/dashboard/noticias`
**¿Qué hace?** Reúne titulares de economía y finanzas en tarjetas fáciles de leer, separados por región: **Argentina, Mundo y Cripto**. Incluye la fecha relativa ("Hace 15 min") y la fuente.

**¿Cómo se usa?** Entrá a **Noticias**, filtrá por región (*Todas / Argentina / Mundo / Cripto*), ordená por relevancia o por más recientes, y tocá una tarjeta para leer el artículo completo en la fuente original (se abre en una pestaña nueva).

![Noticias](img/Captura_noticias.png)

### 4.8 Historial — `/dashboard/historial`
**¿Qué hace?** Guarda un registro con **fecha, hora, moneda y precio** de cada cotización que consultaste, para auditoría y trazabilidad.

**¿Cómo se usa?** Entrá a **Historial** y usá los filtros: rango de fechas (Fecha Desde / Fecha Hasta), tipo (Todas/Fiat/Cripto), una moneda específica o una palabra. Podés ordenar del más reciente al más antiguo y tocá "Limpiar filtros" para volver a la vista completa.

![Historial](img/Captura_historial.png)

### 4.9 Perfil — `/dashboard/perfil`
**¿Qué hace?** Te deja manejar tu cuenta: datos personales, apariencia, contraseña, verificación en dos pasos y baja de la cuenta.

**¿Cómo se usa?**
- **Editar perfil:** corregir nombre o correo registrado.
- **Apariencia:** elegir el tema *oscuro* o *claro*, y la divisa principal que se muestra por defecto en los tableros.
- **Cambiar contraseña:** ingresar la actual y la nueva (mínimo 8 caracteres).
- **Verificación en dos pasos (2FA):** al activarla, cada inicio de sesión pide un código de 6 dígitos que llega al correo. Suma una capa extra de seguridad.
- **Eliminar cuenta:** escribí **ELIMINAR** en el diálogo de confirmación. Borra de forma permanente el perfil, favoritos, alertas e historial.

![Perfil](img/Captura_perfil.png)

---

## 5. Casos de uso comunes

- **"Quiero saber cuánto está el dólar blue hoy"** → Entrá y mirá la primera tarjeta del Inicio. Si querés, compará con el Oficial para ver la brecha.
- **"Tengo que cobrar 750 dólares y quiero saber cuánto es en pesos"** → Calculadora: monto 750, origen USD, destino ARS.
- **"Quiero comprar dólar solo si baja de cierto precio"** → Creá una alerta con la condición *"Cae por debajo de"* y el valor que te sirva: te avisa por correo sin tener la página abierta.
- **"Quiero ver cómo estuvo el euro este año"** → Gráficos: elegí Euro y el período 1 año, y pasá el cursor por los puntos para ver los valores.
- **"No quiero mirar toda la lista, solo 3 monedas"** → Marcalas con la estrella y trabajá desde Favoritos.
- **"Quiero que mi cuenta sea más segura"** → Perfil → "Activar 2FA". Desde ese momento, cada inicio de sesión pide además un código que llega a tu correo.

---

## 6. Preguntas frecuentes (FAQ)

| Pregunta | Respuesta |
| :--- | :--- |
| ¿La aplicación es paga? | No. Es gratuita. El registro solo es necesario para guardar favoritos, alertas, historial y preferencias. |
| ¿Cada cuánto se actualizan los precios? | Se sincronizan en tiempo real con los proveedores. Al lado de las cotizaciones hay un reloj que indica la última lectura. |
| ¿Guarda mis operaciones o datos bancarios? | No. Es una herramienta informativa: no es una billetera virtual, no procesa dinero ni pide datos de tarjeta o cuentas. |
| ¿Cómo convierte Bitcoin a pesos? | Primero pasa la cripto a dólares y después a pesos argentinos, usando como referencia el tipo de cambio del mercado (dólar Blue). |
| ¿Puedo usarla en el celular? | Sí, desde el navegador. Además se puede instalar como app (PWA) desde el menú del navegador, con icono propio y pantalla completa. |
| ¿Qué pasa con mis datos personales? | Las contraseñas se guardan con hash, el acceso está aislado por usuario en la base y se respeta la Ley 25.326 de Protección de Datos Personales. |

---

## 7. Solución de problemas

Si algo no funciona como esperabas, primero probá con esta tabla de verificación rápida (mismos casos que el Excel de testing):

| ID | Módulo | Qué probar | Resultado esperado |
| :--- | :--- | :--- | :--- |
| TC-01 | Registro | Crear una cuenta nueva con un correo válido. | Llega código de 6 dígitos y la cuenta queda activa. |
| TC-02 | Login | Iniciar sesión con las credenciales correctas. | Redirige al panel de Inicio. |
| TC-03 | Contraseña | Usar "¿Olvidaste tu contraseña?" y el código recibido. | Permite definir una contraseña nueva (mínimo 8 caracteres). |
| TC-04 | Cotizaciones | Filtrar por Divisas y buscar "Real" / "BRL". | La lista se filtra al instante. |
| TC-05 | Calculadora | Convertir 100 USD a ARS. | Muestra el equivalente con el tipo de cambio del momento. |
| TC-06 | Alertas | Crear una alerta con condición "Supera el valor". | La alerta queda activa y visible en el tablero. |
| TC-07 | Favoritos | Marcar una moneda con la estrella y abrir Favoritos. | La moneda aparece en la lista guardada. |
| TC-08 | Historial | Consultar una cotización y abrir Historial. | La consulta queda registrada con fecha y precio. |

Y si el problema es de uso cotidiano, esta tabla te orienta:

| Problema | Posible causa | Solución |
| :--- | :--- | :--- |
| No puedo iniciar sesión | Contraseña mal escrita o cuenta sin verificar. | Revisá que no esté activado Bloq Mayús. Si olvidaste la clave, usá "¿Olvidaste tu contraseña?". Si la cuenta no está verificada, chequeá el correo. |
| Rechaza el código de verificación / 2FA | Código vencido o mal tipeado. | Usá el código del correo más reciente y tocá "Reenviar código" si venció. |
| Las cotizaciones quedan en 0 o no cambian | Sin internet o la fuente de datos está de mantenimiento. | Comprobá la conexión y recargá (F5). Si la fuente falla, la app muestra el último valor guardado. |
| El gráfico no muestra datos | Par sin historial en ese rango de tiempo. | Probá otro período o un par con más datos (USD/ARS, EUR/ARS, BTC). |
| No me llegan las alertas | El precio no llegó al límite todavía, o el correo cayó en Spam. | Verificá que la alerta figure como activa y revisá la carpeta de no deseado. |
| No me deja eliminar la cuenta | La palabra de confirmación mal escrita. | Escribí EXACTAMENTE **ELIMINAR**, en mayúsculas. |

---

## 8. Contacto y soporte

- **Correo de soporte:** deviseproyect@gmail.com
- **Plataforma y documentación:** https://dolarito.onrender.com
- **Horario de atención:** lunes a viernes, de 18:00 a 22:00 (GMT-3).
- **Respuesta estimada:** en general, dentro de las 24 horas hábiles.

> Al escribir, contá qué estabas haciendo, a qué hora y qué mensaje viste en pantalla. Así resolvemos más rápido.

---

*divise. — Grupo 6 · ESTFA 2026 · Manual de usuario*