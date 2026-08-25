// ── server/migrate.js ─────────────────────────────────────────────────────────
// Runner de migraciones SQL.
// Uso: node migrate.js
//
// Crea la tabla _migrations si no existe, luego aplica en orden
// todos los archivos de /migrations/ que todavía no fueron ejecutados.

require('dotenv').config();
const { Pool } = require('pg');
const fs   = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         SERIAL PRIMARY KEY,
      filename   VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getApplied(client) {
  const { rows } = await client.query('SELECT filename FROM _migrations');
  return new Set(rows.map(r => r.filename));
}

async function runMigrations({ closePool = true } = {}) {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  [MIGRATIONS] DATABASE_URL no está configurada. Omitiendo migraciones.');
    return;
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    await ensureMigrationsTable(client);

    const applied = await getApplied(client);

    // Leer solo archivos .sql, ordenados por nombre
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    let ran = 0;
    for (const file of files) {
      if (applied.has(file)) {
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      console.log(`  ▶  [MIGRATION] Aplicando: ${file}`);
      await client.query(sql);
      await client.query(
        'INSERT INTO _migrations (filename) VALUES ($1)',
        [file]
      );
      ran++;
    }

    await client.query('COMMIT');
    if (ran > 0) {
      console.log(`✅ [MIGRATIONS] ${ran} migración(es) aplicada(s) exitosamente en Supabase.`);
    } else {
      console.log('✅ [MIGRATIONS] Base de datos de Supabase al día.');
    }
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('❌ [MIGRATIONS] Error en migración:', err.message);
  } finally {
    if (client) client.release();
    if (closePool) await pool.end();
  }
}

if (require.main === module) {
  runMigrations({ closePool: true });
}

module.exports = { runMigrations };

