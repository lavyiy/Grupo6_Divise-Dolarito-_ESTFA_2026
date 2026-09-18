const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middlewares/authMiddleware');

// El cliente se lee dinámicamente desde db para permitir inyección en tests.
const supabase = () => db.supabase;

router.use(verifyToken);

// GET /api/favorites
// Devuelve el listado de códigos de divisa favoritos del usuario autenticado.
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase().from('favoritos')
      .select('id_favorito, created_at, divisas ( codigo )')
      .eq('id_usuario', req.user.id_usuario)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const favorites = (data || [])
      .map((row) => row.divisas?.codigo)
      .filter(Boolean);

    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/favorites/toggle
// Alterna una divisa como favorita para el usuario autenticado.
router.post('/toggle', async (req, res) => {
  try {
    const { codigo_divisa } = req.body;

    if (!codigo_divisa) {
      return res.status(400).json({ error: 'Falta codigo_divisa' });
    }

    const cleanCode = String(codigo_divisa).trim().toUpperCase();

    // Buscar id_divisa insensible a mayúsculas
    const { data: divisas, error: divisaError } = await supabase().from('divisas')
      .select('id_divisa, codigo')
      .ilike('codigo', cleanCode)
      .limit(1);

    if (divisaError) throw divisaError;
    if (!divisas || divisas.length === 0) {
      return res.status(404).json({ error: `Divisa ${cleanCode} no encontrada` });
    }

    const { id_divisa } = divisas[0];
    const resolvedCode = divisas[0].codigo;

    // Comprobar si ya es favorito
    const { data: existing, error: existingError } = await supabase().from('favoritos')
      .select('id_favorito')
      .eq('id_usuario', req.user.id_usuario)
      .eq('id_divisa', id_divisa)
      .limit(1);

    if (existingError) throw existingError;

    let isFavorite;
    if (existing && existing.length > 0) {
      // Eliminar
      const { error: deleteError } = await supabase().from('favoritos')
        .delete()
        .eq('id_favorito', existing[0].id_favorito);

      if (deleteError) throw deleteError;
      isFavorite = false;
    } else {
      // Agregar (ignora el conflicto si ya existiera por la UNIQUE)
      const { error: insertError } = await supabase().from('favoritos')
        .upsert(
          { id_usuario: req.user.id_usuario, id_divisa },
          { onConflict: 'id_usuario,id_divisa', ignoreDuplicates: true }
        );

      if (insertError) throw insertError;
      isFavorite = true;
    }

    res.json({ success: true, isFavorite, codigo: resolvedCode });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
