// ── server/routes/historialRoutes.js ─────────────────────────────────────────
// Endpoint para registrar consultas de cotizaciones en historial_de_consultas.
// Tarea 14: Guardar consulta al entrar a ver una moneda.
//
// Endpoint:
//   POST /api/historial   — registra un par consultado (requiere JWT)
//   GET  /api/historial   — devuelve el historial del usuario autenticado

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middlewares/authMiddleware');

// El cliente se lee dinámicamente desde db para permitir inyección en tests.
const supabase = () => db.supabase;

// Todas las rutas requieren token válido
router.use(verifyToken);

// ── POST /api/historial ───────────────────────────────────────────────────────
// Body: { par_consultado: string, valor_momento: number }
// Ejemplo: { par_consultado: "Dólar Blue - USD", valor_momento: 1540 }
router.post('/', async (req, res) => {
  try {
    const { par_consultado, valor_momento } = req.body;
    const id_usuario = req.user.id_usuario;

    if (!par_consultado || valor_momento === undefined || valor_momento === null) {
      return res.status(400).json({ error: 'Faltan campos: par_consultado y valor_momento son obligatorios.' });
    }

    const valorNum = parseFloat(valor_momento);
    if (isNaN(valorNum)) {
      return res.status(400).json({ error: 'valor_momento debe ser un número válido.' });
    }

    const { data, error } = await supabase().from('historial_de_consultas')
      .insert({
        id_usuario,
        par_consultado: String(par_consultado).trim(),
        valor_momento: valorNum,
      })
      .select('id_historial, par_consultado, valor_momento, fecha')
      .single();

    if (error) throw error;

    console.log(`📊 [HISTORIAL] Usuario ${id_usuario} consultó: ${par_consultado} = $${valorNum}`);
    res.status(201).json({ success: true, historial: data });
  } catch (error) {
    console.error('Error al guardar historial:', error);
    res.status(500).json({ error: 'Error interno al guardar la consulta.' });
  }
});

// ── GET /api/historial ────────────────────────────────────────────────────────
// Devuelve el historial del usuario autenticado, ordenado por fecha desc, límite 100.
router.get('/', async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    const { data, error } = await supabase().from('historial_de_consultas')
      .select('id_historial, par_consultado, valor_momento, fecha')
      .eq('id_usuario', id_usuario)
      .order('fecha', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error interno al obtener el historial.' });
  }
});

module.exports = router;
