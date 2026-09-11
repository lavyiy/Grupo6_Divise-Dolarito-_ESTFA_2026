/**
 * backup_db.js — Genera un backup JSON de toda la base de datos Supabase
 * Uso: node backup_db.js
 */
const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function backup() {
  const client = await pool.connect();
  const backup = {
    timestamp: new Date().toISOString(),
    tables: {}
  };

  // Obtener todas las tablas del schema public
  const tablesRes = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
  );
  const tableNames = tablesRes.rows.map(r => r.tablename);
  console.log('📋 Tablas encontradas:', tableNames.join(', ') || '(ninguna)');

  for (const tableName of tableNames) {
    // Estructura (columnas)
    const colsRes = await client.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_name = $1 AND table_schema = 'public'
       ORDER BY ordinal_position`,
      [tableName]
    );

    // Datos (máx 5000 filas por tabla)
    const dataRes = await client.query(`SELECT * FROM "${tableName}" LIMIT 5000`);

    backup.tables[tableName] = {
      columns: colsRes.rows,
      rows: dataRes.rows,
      rowCount: dataRes.rows.length
    };

    console.log(`  ✓ ${tableName}: ${dataRes.rows.length} filas`);
  }

  client.release();
  await pool.end();

  const filename = `backup_supabase_${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(backup, null, 2), 'utf8');
  console.log(`\n✅ Backup guardado en: ${filename}`);
}

backup().catch(e => {
  console.error('❌ Error en backup:', e.message);
  process.exit(1);
});
