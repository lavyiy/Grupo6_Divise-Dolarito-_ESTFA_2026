const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

// GET /api/favorites
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.codigo 
       FROM favoritos f
       JOIN divisas d ON f.id_divisa = d.id_divisa
       WHERE f.id_usuario = $1`,
      [req.user.id_usuario]
    );
    const favorites = result.rows.map(r => r.codigo);
    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/favorites/toggle
router.post('/toggle', async (req, res) => {
  try {
    const { codigo_divisa } = req.body;
    
    if (!codigo_divisa) {
      return res.status(400).json({ error: 'Falta codigo_divisa' });
    }
    
    // Buscar id_divisa
    const divisaRes = await pool.query('SELECT id_divisa FROM divisas WHERE codigo = $1', [codigo_divisa]);
    if (divisaRes.rows.length === 0) {
      return res.status(404).json({ error: 'Divisa no encontrada' });
    }
    const id_divisa = divisaRes.rows[0].id_divisa;
    
    // Comprobar si ya es favorito
    const checkRes = await pool.query(
      'SELECT id_favorito FROM favoritos WHERE id_usuario = $1 AND id_divisa = $2',
      [req.user.id_usuario, id_divisa]
    );
    
    let isFavorite = false;
    if (checkRes.rows.length > 0) {
      // Eliminar
      await pool.query('DELETE FROM favoritos WHERE id_favorito = $1', [checkRes.rows[0].id_favorito]);
      isFavorite = false;
    } else {
      // Agregar
      await pool.query(
        'INSERT INTO favoritos (id_usuario, id_divisa) VALUES ($1, $2)',
        [req.user.id_usuario, id_divisa]
      );
      isFavorite = true;
    }
    
    res.json({ success: true, isFavorite });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
