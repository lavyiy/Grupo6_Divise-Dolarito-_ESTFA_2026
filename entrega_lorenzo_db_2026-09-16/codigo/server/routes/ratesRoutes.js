const express = require('express');
const pool = require('../config/db');

function createRatesRouter(database = pool) {
  const router = express.Router();

  // Ambas rutas publicas comparten la misma consulta y contrato.
  router.get('/', async (req, res) => {
    try {
      const query = `
      SELECT DISTINCT ON (d.id_divisa, tc.tipo_mercado)
        d.id_divisa,
        d.codigo,
        d.nombre,
        CASE WHEN lower(d.tipo) IN ('cripto', 'crypto') THEN 'crypto' ELSE d.tipo END AS tipo,
        d.coingecko_id,
        tc.precio_compra,
        tc.precio_venta,
        tc.tipo_mercado,
        tc.fecha_actualizacion
      FROM tipos_de_cambio tc
      JOIN divisas d ON tc.id_divisa = d.id_divisa
      ORDER BY d.id_divisa, tc.tipo_mercado,
               tc.fecha_actualizacion DESC, tc.id_tipo_cambio DESC
    `;
      const result = await database.query(query);
      const rates = result.rows.map(row => ({
        id_divisa: row.id_divisa,
        codigo: row.codigo,
        nombre: row.nombre,
        tipo: row.tipo,
        coingecko_id: row.coingecko_id,
        mercado: row.tipo_mercado,
        tipo_mercado: row.tipo_mercado === 'Blue' ? 'Informal' : row.tipo_mercado,
        compra: parseFloat(row.precio_compra),
        venta: parseFloat(row.precio_venta),
        fecha: row.fecha_actualizacion,
        updated_at: row.fecha_actualizacion
      }));

      res.json(rates);
    } catch (error) {
      console.error('Error fetching rates:', error);
      res.status(500).json({ error: 'Error interno del servidor al obtener cotizaciones' });
    }
  });

  return router;
}

module.exports = createRatesRouter();
module.exports.createRatesRouter = createRatesRouter;
