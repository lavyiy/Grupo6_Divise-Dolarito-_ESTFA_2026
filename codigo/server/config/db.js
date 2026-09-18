// ── server/config/db.js ──────────────────────────────────────────────────────
// Inicialización y exportación de los clientes de base de datos.
//
// 1) Cliente oficial de Supabase (@supabase/supabase-js) para todo el acceso
//    CRUD sobre las tablas existentes (usuarios, divisas, tipos_de_cambio,
//    favoritos, alertas, historial_de_consultas).
// 2) Pool directo de PostgreSQL (pg) para operaciones que requieren
//    transacciones o SQL avanzado (sincronización de cotizaciones, migraciones).
//
// El cliente con SERVICE_ROLE omite RLS: nunca debe exponerse en el frontend.

const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.warn('⚠️  Falta SUPABASE_URL en el entorno. El cliente de Supabase no podrá autenticarse.');
}

// Cliente privilegiado (backend). Se usa por defecto para las consultas del
// servidor porque el backend valida la titularidad con su propio JWT.
const supabase = createClient(
  SUPABASE_URL || 'http://localhost',
  SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY || 'anon-key-not-configured',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

// Cliente con la ANON KEY expuesto sólo por si se necesita una operación
// con RLS activo (por ejemplo, validar tokens de Supabase Auth).
const supabaseAnon = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;

// Pool PostgreSQL directo: transacciones y SQL avanzado (DISTINCT ON, BEGIN/COMMIT).
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('Conectado a la base de datos PostgreSQL en Supabase (pool directo)');
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err.message);
});

// Se exporta el pool como export por defecto para mantener compatibilidad con
// el código y las pruebas existentes, y se adjuntan los clientes de Supabase.
pool.supabase = supabase;
pool.supabaseAnon = supabaseAnon;

module.exports = pool;
module.exports.supabase = supabase;
module.exports.supabaseAnon = supabaseAnon;
module.exports.pool = pool;
