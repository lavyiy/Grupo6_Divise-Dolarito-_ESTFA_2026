# Actualización de Carpeta Funcional — Proyecto Divise / Dolarito
**Grupo 6 — Divise-Dolarito | ESTFA 2026**  
**Documento:** Anexo de Actualización Funcional y Técnico — Sprint de Correcciones, Rol Administrador y Experiencia de Usuario  
**Versión:** 3.2.0  
**Fecha:** Octubre 2026  
**Área:** Evaluación de Proyectos (EVPR) / Prácticas Profesionalizantes  

---

## 1. Resumen Ejecutivo de la Actualización

En el marco del ciclo de mejoras continuas y estabilización del sistema **Divise / Dolarito**, se desarrolló e integró un sprint integral enfocado en corregir inconsistencias en el procesamiento numérico regional, dotar de operatividad real al rol de Administrador con auditoría de mensajería Gmail, robustecer los mecanismos de soporte al usuario, aislar la interfaz gráfica modal para evitar desacomodamientos visuales y permitir la personalización de perfiles.

### Requerimientos abordados:
1. **Normalización Numérica Argentina en Calculadora y Alertas:** Compatibilidad absoluta con números grandes, múltiples puntos como separadores de miles (`15.000`, `15.000.000`), comas decimales (`15.000.000,50`) y prevención de errores `NaN`.
2. **Canal Oficial de Contacto con Administradores:** Integración de modal accesible desde el Navbar, Sidebar y Perfil, con correo oficial `deviseproyect@gmail.com`, enlace directo a WhatsApp y formulario de contacto.
3. **Operatividad del Rol Administrador y Log de Correos:** Implementación de panel `/dashboard/admin` con visor de auditoría de todos los correos Gmail enviados (destinatario, asunto, código de 6 dígitos, estado, fecha) y control de roles de usuarios.
4. **Aislamiento y Estabilidad de Ventanas Modales:** Corrección definitiva de colisiones de nombres de clases CSS globales que deformaban la ventana emergente de alertas y perfil.
5. **Personalización con Foto de Perfil:** Soporte para subida de fotos locales desde el equipo (comprimidas en cliente a Base64) y selección rápida entre 8 avatares vectoriales prediseñados.
6. **Cartel de Validación de Correo Electrónico:** Mensaje explícito unificado en Login y Recuperación de Contraseña: *"El correo electrónico no es válido o no está registrado en la base de datos."*
7. **Documentación Formal:** Consolidación de especificaciones, historias de usuario y casos de prueba para la Carpeta Funcional.

---

## 2. Historias de Usuario Agregadas / Actualizadas

### **HU #51 – Soporte de Formato Numérico Argentino y Grandes Cifras**
- **Como** usuario del sistema Divise,  
- **Quiero** ingresar montos utilizando la convención argentina con puntos para separar miles (ej. `15.000` o `15.000.000`) y coma para decimales,  
- **Para** convertir divisas y configurar alertas sin que el sistema rechace cifras grandes o calcule valores incorrectos.
- **Criterios de Aceptación:**
  - Si el usuario ingresa `15.000`, el sistema interpreta exactamente quince mil pesos/unidades.
  - Si el usuario ingresa `15.000.000`, el sistema interpreta quince millones sin arrojar error ni truncar los ceros.
  - Si el usuario ingresa `15.000.000,50`, el cálculo toma los decimales con coma correctamente.
  - En caso de caracteres inválidos (letras, símbolos extraños), se notifica de forma no bloqueante bajo el campo.

### **HU #52 – Canal Directo de Contacto y Soporte con Administradores**
- **Como** usuario o visitante,  
- **Quiero** acceder rápidamente a un medio de contacto directo con los administradores de Divise,  
- **Para** reportar inconvenientes técnicos, realizar consultas o solicitar asistencia.
- **Criterios de Aceptación:**
  - Existe un botón accesible "Contacto" en la cabecera, barra lateral y pantalla de perfil.
  - La ventana modal presenta la dirección de correo oficial `deviseproyect@gmail.com` con botón de copiado en un clic.
  - Ofrece enlace de comunicación directa por WhatsApp (`+54 9 11 2345-6789`).
  - Incluye formulario para enviar mensajes directos que quedan registrados en el sistema.

### **HU #53 – Panel de Control del Administrador y Auditoría de Gmails Enviados**
- **Como** administrador de la plataforma Divise,  
- **Quiero** acceder a un panel exclusivo para visualizar el registro histórico de correos enviados y gestionar usuarios,  
- **Para** verificar la entrega de códigos de verificación, asistir a usuarios con dificultades de recepción y administrar permisos del sistema.
- **Criterios de Aceptación:**
  - Los usuarios con `rol = 'admin'` o `es_admin = true` disponen de la ruta protegida `/dashboard/admin` y su correspondiente pestaña en el menú.
  - El visor muestra tabla completa con: destinatario, asunto, tipo de correo, código de seguridad generado, estado de entrega y fecha/hora.
  - Permite filtrar y buscar correos por dirección o código.
  - Permite listar usuarios registrados y alternar su rol entre `usuario` y `admin`.

### **HU #54 – Personalización y Foto de Perfil de Usuario**
- **Como** usuario registrado,  
- **Quiero** subir una imagen desde mi computadora o elegir un avatar temático,  
- **Para** personalizar mi cuenta e identificarme visualmente en la barra superior y perfil.
- **Criterios de Aceptación:**
  - El usuario puede subir archivos JPG, PNG o WEBP locales.
  - Las imágenes se comprimen automáticamente en el navegador a 256x256 px en formato DataURL Base64 para optimizar la red y la base de datos.
  - Dispone de 8 avatares vectoriales prediseñados (Finanzas, Gráficos, Bitcoin, Escudo, etc.).
  - La foto seleccionada se actualiza de inmediato en el Navbar, Menú de Usuario y Perfil.

### **HU #55 – Aislamiento Visual de Formularios Modales**
- **Como** usuario que interactúa con alertas o configuraciones de perfil,  
- **Quiero** que al abrir cualquier modal la pantalla mantenga sus proporciones y no se desacomode el formulario,  
- **Para** tener una experiencia fluida, legible y estéticamente profesional.
- **Criterios de Aceptación:**
  - Las clases de estilo CSS de cada modal (`.alert-modal-*`, `.perfil-modal-*`, `.contact-modal-*`, `.avatar-modal-*`) no colisionan entre sí.
  - Las ventanas disponen de contención de altura (`max-height: min(90vh, 740px)`) y desplazamiento interno suave en pantallas compactas o dispositivos móviles.

### **HU #56 – Validación Precisa de Correo Electrónico en Autenticación**
- **Como** usuario que ingresa credenciales o solicita recuperación de acceso,  
- **Quiero** recibir un mensaje claro si el correo no tiene un formato válido o no existe en la plataforma,  
- **Para** saber de inmediato si debo corregir la dirección tipeada o crear una cuenta nueva.
- **Criterios de Aceptación:**
  - Si se ingresa un correo sin formato de email o con un dominio inválido, se alerta antes del envío.
  - Si el correo no existe en la base de datos durante el Login o Recuperación, se exhibe el mensaje: *"El correo electrónico no es válido o no está registrado en la base de datos."*

---

## 3. Especificación Técnica y Arquitectura

### 3.1. Modelo de Base de Datos (Migración SQL `011_admin_and_email_logs.sql`)
Se agregaron campos y tablas para soportar las nuevas capacidades:

```sql
-- Extensión de la tabla de usuarios
ALTER TABLE IF EXISTS usuarios 
  ADD COLUMN IF NOT EXISTS rol VARCHAR(30) DEFAULT 'usuario',
  ADD COLUMN IF NOT EXISTS es_admin BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS foto_perfil TEXT;

-- Creación de la tabla de auditoría de correos enviados
CREATE TABLE IF NOT EXISTS emails_enviados (
  id_log SERIAL PRIMARY KEY,
  destinatario VARCHAR(255) NOT NULL,
  asunto VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  codigo VARCHAR(20),
  estado VARCHAR(20) DEFAULT 'enviado',
  error_detalle TEXT,
  metadata JSONB,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emails_enviados_destinatario ON emails_enviados(destinatario);
CREATE INDEX IF NOT EXISTS idx_emails_enviados_fecha ON emails_enviados(creado_en DESC);
```

### 3.2. Módulo de Normalización Numérica (`src/utils.js`)
Función `parseArgentineNumber(raw)`:
- Detecta automáticamente el uso de puntos para miles y comas para decimales.
- Evalúa la cantidad de dígitos tras los separadores (ej. `.000` con 3 dígitos equivale a miles).
- Acepta sin pérdida de precisión montos de cualquier escala (`15.000`, `15.000.000`, `100.000.000.000`).
- Retorna objeto tipado: `{ ok: true, value: 15000000, normalized: "15000000" }` o `{ ok: false, error: "..." }`.

### 3.3. Nuevos Endpoints API REST

| Método | Ruta | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/emails` | Admin | Obtiene los últimos 100 correos enviados con filtros de búsqueda. |
| `GET` | `/api/admin/users` | Admin | Lista completa de usuarios, roles y estados de verificación. |
| `PUT` | `/api/admin/users/:id/role` | Admin | Modifica el rol de un usuario (`admin` / `usuario`). |
| `GET` | `/api/admin/stats` | Admin | Métricas globales de usuarios, emails y alertas. |
| `POST` | `/api/contact` | Público | Envía mensaje de contacto y lo audita en el log. |

---

## 4. Matriz de Casos de Prueba (QA)

| ID Caso | Componente / Flujo | Entrada de Prueba | Resultado Esperado | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **CP-01** | Calculadora Divise | `15.000` USD a ARS | Interpreta 15.000 unidades y multiplica por tipo de cambio. | **Aprobado** |
| **CP-02** | Calculadora Divise | `15.000.000` ARS a USD | Interpreta 15 millones sin error `NaN` y muestra resultado exacto. | **Aprobado** |
| **CP-03** | Calculadora Divise | `15.000.000,75` EUR a ARS | Parsea coma decimal correctamente. | **Aprobado** |
| **CP-04** | Alertas de Cotización | Apertura de modal y valor `1.500.000` | El modal no se colapsa ni estira, valor guardado correctamente. | **Aprobado** |
| **CP-05** | Login | Email inexistente `usuario.falso@correo.com` | Cartel: *"El correo electrónico no es válido o no está registrado en la base de datos."* | **Aprobado** |
| **CP-06** | Recuperación Clave | Email no registrado `nadie@gmail.com` | Cartel: *"El correo electrónico no es válido o no está registrado en la base de datos."* | **Aprobado** |
| **CP-07** | Contacto | Click en botón "Contacto" | Abre modal con `deviseproyect@gmail.com`, botón copiar y WhatsApp. | **Aprobado** |
| **CP-08** | Foto de Perfil | Carga de archivo PNG local | Se procesa a 256x256 Base64 y se refleja en Navbar y Perfil. | **Aprobado** |
| **CP-09** | Rol Administrador | Usuario con rol `admin` ingresa al Dashboard | Visualiza ítem "Panel Admin", accede a `/dashboard/admin` y ve los correos. | **Aprobado** |
| **CP-10** | Auditoría Gmail | Usuario solicita restablecimiento de contraseña | El código generado aparece inmediatamente en el panel de emails enviados. | **Aprobado** |

---

## 5. Integrantes del Proyecto y Aprobación
- **Proyecto:** Divise — Cotizaciones y Finanzas en Tiempo Real
- **Institución:** Escuela de Educación Secundaria Técnica (ESTFA)
- **Comisión:** EVPR 2026 — Grupo 6
- **Canal de Contacto Oficial:** `deviseproyect@gmail.com`
