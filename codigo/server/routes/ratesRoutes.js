const express = require('express');
const pool = require('../config/db');

const router = express.Router();

/**
 * GET /api/rates
 * Retorna las cotizaciones más recientes de la base de datos.
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        d.codigo,
        d.nombre,
        d.tipo,
        tc.precio_compra,
        tc.precio_venta,
        tc.tipo_mercado,
        tc.fecha_actualizacion
      FROM tipos_de_cambio tc
      JOIN divisas d ON tc.id_divisa = d.id_divisa
      ORDER BY d.codigo, tc.tipo_mercado
    `;
    const result = await pool.query(query);
    
    // Format the response to be easy to consume by the frontend
    const rates = result.rows.map(row => ({
      codigo: row.codigo,
      nombre: row.nombre,
      tipo: row.tipo,
      mercado: row.tipo_mercado,
      compra: parseFloat(row.precio_compra),
      venta: parseFloat(row.precio_venta),
      fecha: row.fecha_actualizacion
    }));

    res.json(rates);
  } catch (error) {
    console.error('Error fetching rates:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener cotizaciones' });
  }
});

module.exports = router;
