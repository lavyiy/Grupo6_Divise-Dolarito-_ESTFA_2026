# Divise — v1.0

Plataforma web de cotizaciones multidivisa: seguimiento de tipos de cambio en tiempo real
(dólares oficial/blue/MEP/CCL, monedas regionales e internacionales y criptoactivos),
conversor de divisas, gráficos históricos, alertas de precios, noticias económicas,
historial de consultas y gestión de cuenta con verificación de email y 2FA.

Identificada en la interfaz como **divise** (proyecto "Dolarito").

## Stack

| Capa        | Tecnología                                                          |
| ----------- | ------------------------------------------------------------------- |
| Frontend    | React 18 + Vite 7 + React Router 6, Chart.js / react-chartjs-2      |
| Backend     | Node.js + Express 5                                                  |
| Base de datos | Supabase (PostgreSQL) — `@supabase/supabase-js` + `pg`            |
| Email       | Nodemailer (Gmail App Password), Resend o Brevo (configurable)      |
| Auth        | JWT + bcrypt, verificación por código de 6 dígitos, 2FA por email   |
| Deploy      | Render (build del frontend + API en un solo servicio)               |

## Estructura del proyecto

```
codigo/
├── index.html
├── package.json            # Frontend (React + Vite)
├── vite.config.js          # Proxy /api → http://localhost:5000
├── src/                    # Código fuente de la aplicación React
│   ├── components/         # UI compartida (Icon, Layout, TarjetaAuth)
│   ├── context/            # AuthContext (sesión)
│   ├── pages/
│   │   ├── Auth/           # Login, Registro, Verificación, Recuperación
│   │   └── Dashboard/      # Inicio, Cotizaciones, Gráficos, Calculadora,
│   │                       # Alertas, Noticias, Favoritos, Historial, Perfil
│   └── services/           # api.js (fetch a backend + APIs de cotización),
│                           # rateTypes.mjs, history.js
└── server/                 # Backend (Express)
    ├── index.js            # Entry point, arranca sync cada 5 min
    ├── .env.example        # Plantilla de variables de entorno
    ├── controllers/        # auth, rates, alerts, favorites, user, historial
    ├── routes/             # Rutas REST
    ├── services/           # syncService (cotizaciones), authService,
    │                       # emailService (Nodemailer/Resend/Brevo), ...
    └── migrate.js          # Migraciones automáticas de tablas
```

## Requisitos

- **Node.js 18 o superior** (recomendado Node 20 LTS o 22 LTS).
- **npm** 9+ (viene con Node).
- Una cuenta en **Supabase** (gratuita) con proyecto y credenciales.
- Opcional: cuenta Gmail para el envío de emails, o API keys de Resend/Brevo.
- Git (para clonar).

## Variables de entorno

Copy del backend — `codigo/server/.env.example` → `codigo/server/.env`:

```bash
PORT=5000

# Supabase
SUPABASE_URL=https://TU_PROYECTO.supabase.co
SUPABASE_ANON_KEY=TU_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.TU_PROYECTO.supabase.co:5432/postgres

# Seguridad
JWT_SECRET=UNA_CLAVE_SECRETA_LARGA

# Email (Gmail SMTP — usar "Contraseña de aplicación")
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
EMAIL_FROM="Divise" <tu_correo@gmail.com>

# URL del frontend (usada en links de verificación/recuperación)
FRONTEND_URL=http://localhost:5173
```

> Las migraciones de tablas se ejecutan solas al arrancar el servidor (`migrate.js`).
> No hace falta crear tablas manualmente.

## Instalación y puesta en marcha

### 1) Clonar el repositorio

```bash
git clone https://github.com/lavyiy/Grupo6_Divise-Dolarito-_ESTFA_2026.git
cd Grupo6_Divise-Dolarito-_ESTFA_2026/codigo
```

### 2) Levantar el backend (API + cotizaciones)

```bash
cd server
npm install
# Configurar las variables de entorno:
Copy-Item .env.example .env    # Windows PowerShell
# cp .env.example .env         # Linux/macOS
# → editar .env con tus credenciales de Supabase y email
npm run dev                    # desarrollo (nodemon, reinicio automático)
# npm start                    # producción
```

El servidor queda escuchando en **http://localhost:5000** y ejecuta una
sincronización de cotizaciones al iniciar y luego cada 5 minutos
(persiste los valores en la tabla `tipos_de_cambio`).

### 3) Levantar el frontend (React + Vite)

En otra terminal:

```bash
cd codigo
npm install
npm run dev
```

Vite arranca en **http://localhost:5173** y proxya `/api/*` hacia el backend
local (`vite.config.js`). Abrí esa URL en el navegador.

## Flujo de arranque rápido

```bash
# Terminal 1 — backend
cd codigo/server
npm install && npm run dev

# Terminal 2 — frontend
cd codigo
npm install && npm run dev
```

## Build de producción

```bash
cd codigo
npm run build      # genera codigo/dist (index.html + assets)
```

En Render se compila el frontend y el propio backend sirve estáticamente la
carpeta `dist` (ver `server/index.js`), de modo que la app queda en un solo servicio.

## Deploy (Render)

El repo hace deploy automático desde la rama `main`. Comandos típicos:

- Build: `cd codigo && npm install && npm run build && cd server && npm install`
- Start: `cd codigo/server && node index.js`

Las variables de entorno se cargan en el panel de Render. La app de producción está en:
**https://dolarito.onrender.com**

## Cuenta de demostración

```text
Email:    demo.divise@example.com
Password: Demo1234!
```

## Funcionalidades

- **Inicio** (`/dashboard`): KPI de Dólar Blue, Oficial, Euro y Bitcoin con variación y sparkline.
- **Cotizaciones** (`/dashboard/divisas`): catálogo completo en vivo con búsqueda, filtros
  (Todos / Divisas / Cripto) y auto-refresh cada 15 s.
- **Gráficos** (`/dashboard/graficos`): series históricas 7/30/90 días y 1 año, curvas superpuestas.
- **Calculadora** (`/dashboard/calculadora`): conversión cruzada entre monedas y criptos (vía USD).
- **Alertas** (`/dashboard/alertas`): reglas por umbral con aviso por email/WhatsApp.
- **Noticias** (`/dashboard/noticias`): feed de economía, mercados y cripto.
- **Favoritos** (`/dashboard/favoritos`): monedas preferidas con re-consulta al gráfico.
- **Historial** (`/dashboard/historial`): auditoría de consultas guardadas en la DB.
- **Perfil** (`/dashboard/perfil`): edición de datos, cambio de contraseña, 2FA y baja de cuenta.

## Fuentes de cotización

- Dólares y euros: [DolarApi](https://dolarapi.com)
- Monedas mundiales: open.er-api.com (en vivo) y currency-api (históricos)
- Criptos: Binance, CoinGecko y Coinbase (dólares), cruzados contra pesos usando el dólar blue
- Históricos de dólares: api.argentinadatos.com

## Licencia y equipo

Trabajo práctico final — FAM Fameghino, Grupo 6, 2026.
