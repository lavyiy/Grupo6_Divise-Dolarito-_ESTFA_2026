# CONTEXTO_IA.md — Divise / Dolarito

> **PARA LA IA QUE CONTINÚE ESTE TRABAJO**
> Este documento describe el estado del proyecto al 16/09/2026 después de los cambios del sprint.
> Leé esto completo antes de tocar cualquier archivo.

---

## ¿Qué es este proyecto?

**Divise** (también llamado Dolarito) es una plataforma web de cotizaciones multidivisa para Argentina.
Muestra precios en tiempo real de: Dólar Blue, Oficial, MEP, CCL, Tarjeta, Euro, Real Brasileño (BRL), Bitcoin, Ethereum, USDT, BNB, DOGE.

- **Frontend:** React 18 + Vite 7, en `d:\Proyecto\codigo\src\`
- **Backend:** Express 5 + PostgreSQL (Supabase), en `d:\Proyecto\codigo\server\`
- **Deploy:** Render.com — el backend sirve también el frontend compilado en `dist/`
- **DB:** Supabase (PostgreSQL). Variables de entorno en `d:\Proyecto\codigo\server\.env`

---

## Arquitectura del proyecto

```
d:\Proyecto\codigo\
├── src/                          # Frontend React
│   ├── App.jsx                   # Router (React Router DOM v6)
│   ├── context/AuthContext.jsx   # JWT global: login, logout, updateUser
│   ├── services/api.js           # Todas las llamadas HTTP al backend
│   ├── pages/
│   │   ├── Auth/                 # LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage
│   │   └── Dashboard/            # Inicio, Divisas, Favoritos, Calculadora, Historial, Alertas, Perfil, Graficos, Noticias
│   └── components/
│       ├── Layout/DashboardLayout.jsx  # Sidebar + header del dashboard
│       ├── ui/Icon.jsx                 # Iconos SVG centralizados
│       └── ui/Sparkline.jsx            # Mini gráfico decorativo
│
└── server/                       # Backend Node.js
    ├── index.js                  # Entry point Express, monta rutas, inicia syncRates
    ├── config/db.js              # Pool de PostgreSQL (pg)
    ├── migrate.js                # Corre las migraciones SQL al iniciar
    ├── routes/                   # authRoutes, userRoutes, ratesRoutes, alertRoutes, favoritesRoutes, historialRoutes
    ├── controllers/              # authController, userController
    ├── services/                 # authService, userService, emailService, syncService, alertService, whatsappService
    ├── models/userModel.js       # Todas las queries SQL de usuarios
    ├── middlewares/authMiddleware.js  # verifyToken: valida JWT, maneja TokenExpiredError
    ├── migrations/               # SQL numeradas (001-008), se corren automáticamente al iniciar
    └── database/init.sql         # Schema inicial (referencia)
```

---

## Variables de entorno del backend (server/.env)

```
DATABASE_URL=postgresql://...supabase...
JWT_SECRET=...
EMAIL_USER=divise.grupo6@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx    # contraseña de app de Google (16 chars)
FRONTEND_URL=https://dolarito.onrender.com
PORT=5000
```

---

## Schema de base de datos

### `usuarios`
- id_usuario, nombre, email, password_hash, divisa_base_id -> divisas
- email_verificado BOOLEAN, verif_codigo VARCHAR(10), verif_expira TIMESTAMP, verif_token VARCHAR(100)
- two_factor_enabled BOOLEAN, reset_token VARCHAR(100), reset_token_expires TIMESTAMP
- whatsapp_phone VARCHAR(20), whatsapp_api_key TEXT, created_at

### `divisas`
- id_divisa, codigo (UNIQUE: 'USD','BTC','EUR'), nombre, tipo ('Fiat'/'Cripto'), created_at

### `tipos_de_cambio`
- id_tipo_cambio, id_divisa -> divisas, precio_compra, precio_venta, tipo_mercado, fecha_actualizacion

### `favoritos`
- id_favorito, id_usuario -> usuarios ON DELETE CASCADE, id_divisa -> divisas ON DELETE CASCADE
- notificacion_activa BOOLEAN, created_at, UNIQUE(id_usuario, id_divisa)

### `historial_de_consultas`
- id_historial, id_usuario -> usuarios ON DELETE CASCADE
- par_consultado VARCHAR(100) -- ej: "Dólar Blue - USD"
- valor_momento DECIMAL(18,2) -- precio de venta en el momento de la consulta
- fecha TIMESTAMP DEFAULT NOW()

### `alertas`
- id_alerta, id_usuario -> usuarios ON DELETE CASCADE
- codigo_divisa VARCHAR(10), condicion ('mayor_a'/'menor_a'), valor_limite DECIMAL(18,4)
- activa BOOLEAN DEFAULT TRUE, created_at

---

## Estado de las tareas del sprint 16/09/2026

### Tarea 4 — Eliminar perfil COMPLETADA
- DELETE /api/users/me ya existía. Se mejoró con logging y campo `logout: true` en la respuesta.
- El frontend hace deleteMyAccount(token).then(() => logout()). Borrado en cascada configurado en SQL.

### Tarea 5 — Verificación de Gmail COMPLETADA (ya estaba)
- DECISION TOMADA: SIN 2FA obligatorio. Verificación UNA VEZ al crear la cuenta.
- El 2FA es opcional, activable en Perfil. Sistema propio (no Supabase Auth).

### Tarea 6 — Sacar login con Google/teléfono COMPLETADA (no existía)
- El proyecto NUNCA tuvo OAuth. Login es email+password desde el inicio.

### Tarea 7 — Manejo de JWT expirado COMPLETADA (ya estaba)
- Backend: authMiddleware.js devuelve { tokenExpired: true } con 401.
- Frontend: api.js intercepta, limpia localStorage, redirige a /login?expired=1.
- AuthContext.jsx verifica expiración al cargar. LoginPage muestra aviso.

### Tarea 14 — Guardar consulta en historial IMPLEMENTADA HOY
- NUEVO: server/routes/historialRoutes.js con POST /api/historial y GET /api/historial
- MODIFICADO: server/index.js monta /api/historial
- MODIFICADO: src/services/api.js agrega recordHistorial() y getHistorial()
- MODIFICADO: src/pages/Dashboard/Divisas.jsx
  - handleCardClick(divisa) registra el par cuando el usuario hace clic en una card
  - Formato: "Dólar Blue - USD" (nombre - codigo)
  - Falla silenciosamente (.catch) para no interrumpir UX
- MODIFICADO: src/pages/Dashboard/Historial.jsx
  - Carga el historial real del usuario desde getHistorial(token)
  - Muestra cotización al momento, fecha y hora formateada, bandera y nombre
  - Permite filtrar por fecha, buscar divisa y refrescar en vivo
  - Modo demostración automático si no hay sesión iniciada

### Tarea 15 — Reset de contraseña MEJORADA HOY
- MODIFICADO: src/pages/Auth/ResetPasswordPage.jsx
  - Mensajes de error específicos para token expirado vs inválido
  - Link "Solicitar nuevo enlace" cuando el token falla

---

## Todos los endpoints del backend

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | /api/auth/register | No | Registra usuario, envía código 6 dígitos por email |
| POST | /api/auth/login | No | Login email+password |
| POST | /api/auth/verify-email | No | Verifica código de 6 dígitos |
| GET | /api/auth/verify-email?token= | No | Verifica por link clickeable |
| POST | /api/auth/resend-verification | No | Reenvía código |
| POST | /api/auth/forgot-password | No | Genera link de reset (30 min) |
| POST | /api/auth/reset-password | No | Restablece contraseña con token |
| GET | /api/users/me | JWT | Perfil del usuario |
| PUT | /api/users/me | JWT | Actualiza nombre/email/divisa_base |
| PUT | /api/users/me/password | JWT | Cambia contraseña |
| PUT | /api/users/me/2fa | JWT | Activa/desactiva 2FA |
| DELETE | /api/users/me | JWT | Elimina cuenta (cascada en DB) |
| GET | /api/favorites | JWT | Lista favoritos |
| POST | /api/favorites/toggle | JWT | Agrega/quita favorito |
| GET | /api/alerts | JWT | Lista alertas |
| POST | /api/alerts | JWT | Crea alerta |
| DELETE | /api/alerts/:id | JWT | Elimina alerta |
| GET | /api/historial | JWT | Historial de consultas (limit=50) |
| POST | /api/historial | JWT | Registra una consulta |

---

## Flujo de autenticación

1. POST /api/auth/register → envía código 6 dígitos a Gmail
2. POST /api/auth/verify-email { email, codigo } → activa cuenta, devuelve JWT
3. POST /api/auth/login → si no verificado o 2FA: 403 needsVerification. Si OK: { user, token }
4. JWT dura 24h. Al expirar: 401 tokenExpired -> frontend limpia storage -> /login?expired=1
5. Reset: POST forgot-password -> email con link /reset-password?token= -> POST reset-password

---

## Cómo levantar el proyecto localmente

```bash
# Terminal 1 - Backend
cd d:\Proyecto\codigo\server
node index.js  # o npm run dev

# Terminal 2 - Frontend
cd d:\Proyecto\codigo
npm run dev    # Vite en http://localhost:5173
```

Vite proxya /api/* al puerto 5000 (ver vite.config.js).

---

*Documento generado el 16/09/2026. Actualizar con cada nuevo sprint.*
