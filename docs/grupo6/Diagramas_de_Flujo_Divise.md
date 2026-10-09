# Diagramas de Flujo — Grupo 6 · Divise

## 1. Recuperación de contraseña (proceso interno de la aplicación Divise)

**Imagen:** `Flujo_Recuperar_Contrasena.png` (fuente editable: `Flujo_Recuperar_Contrasena.html`)

### Qué representa
Este diagrama modela el proceso que ejecuta **Divise** cuando un usuario olvidó su contraseña y quiere recuperar el acceso a su cuenta. Es una de las funcionalidades críticas del sistema porque interviene en la seguridad de los datos personales de los usuarios (Ley 25.326) y coincide con la implementación real que ya está desarrollada y publicada en el repositorio (pantallas `ForgotPasswordPage` y `PasswordResetForm`, módulo de envío de `emailService`).

### Explicación paso a paso
1. Desde la pantalla de inicio de sesión, el usuario presiona el enlace **“¿Olvidaste tu contraseña?”**.
2. Ingresa su email y envía la solicitud.
3. La aplicación consulta en la base de datos si el email está registrado.
   - **No:** muestra un mensaje *genérico de seguridad*, idéntico al de éxito, para no revelar qué emails existen (evita la enumeración de usuarios). Fin de la solicitud.
   - **Sí:** continúa el proceso.
4. Se genera un **código de 6 dígitos** y un token de seguridad con vencimiento a los **30 minutos**.
5. Se guardan `reset_token` y `reset_token_expires` en la tabla `usuarios` de la base de datos.
6. Se envía el email con el código y el enlace a la pantalla “Paso 2 de 2”.
7. El usuario ingresa el código de 6 dígitos.
   - **No (código incorrecto o vencido):** se muestra el mensaje correspondiente y el usuario puede reintentar (hasta que el token expire).
   - **Sí:** continúa el proceso.
8. El usuario ingresa la nueva contraseña y su confirmación.
   - **No (no coinciden o menos de 8 caracteres):** error de validación y vuelve a cargarla.
   - **Sí:** continúa el proceso.
9. La nueva clave se cifra con **bcrypt**.
10. Se actualiza `password_hash` y se limpia `reset_token` (el token antiguo queda invalidado, impidiendo reutilizarlo).
11. Se redirige al login con el aviso “Contraseña actualizada”. **FIN.**

---

## 2. Transferencia de dinero por alias (proceso externo de referencia, ej. “Pago mis cuentas”)

**Imagen:** `Flujo_Transferencia_por_Alias.png` (fuente editable: `Flujo_Transferencia_por_Alias.html`)

### Qué representa
Este diagrama representa el proceso que realiza una aplicación de pagos (por ejemplo la billetera **“Pago mis cuentas”** u otra billetera digital) cuando un usuario quiere **transferir dinero a otra persona usando un alias** (el texto que se asocia al CBU, como `FAMILIA.GARCIA.2025`), en lugar de tipear el número de CBU completo. Se tomó como proceso de referencia para entender cómo funcionan los medios de pago externos con los que Divise se integra.

### Explicación paso a paso
1. El usuario abre la aplicación de pagos y selecciona la opción **“Transferencia por alias”**.
2. Ingresa el alias del destinatario.
3. La aplicación consulta la equivalencia **alias → CBU** en la red de compensación.
   - **No (alias inexistente o inactivo):** muestra el mensaje y termina la operación.
   - **Sí:** continúa el proceso.
4. Muestra el **titular y los datos de la cuenta destino** para que el usuario valide a quién le está transfiriendo.
   - **No (destinatario incorrecto):** vuelve a ingresar el alias.
   - **Sí:** continúa el proceso.
5. El usuario ingresa el monto a transferir.
   - **No (saldo insuficiente):** muestra el mensaje y permite reintentar.
   - **Sí:** continúa el proceso.
6. El usuario **autentica la operación** (contraseña, token/2FA o biometría).
   - **No (autenticación rechazada):** intento fallido, vuelve a autenticar.
   - **Sí:** continúa el proceso.
7. La aplicación **debita el saldo del emisor y acredita** el monto al destinatario.
8. Se genera y envía el **comprobante** de la operación. **FIN.**

---

## Referencia de la notación utilizada
- **Óvalo verde:** inicio / fin del proceso.
- **Rectángulo azul:** proceso o paso ejecutado.
- **Rombo amarillo:** decisión (sí / no).
- **Rectángulo rojo punteado:** mensaje de error o validación.
- **Flecha:** dirección del flujo (verde = “Sí”, roja = “No”).