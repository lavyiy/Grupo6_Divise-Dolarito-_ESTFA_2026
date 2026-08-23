const express = require('express');
const router = express.Router();
const alertService = require('../services/alertService');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

// GET /api/alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await alertService.getUserAlerts(req.user.id_usuario);
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/alerts
router.post('/', async (req, res) => {
  try {
    const { codigo_divisa, condicion, valor_limite } = req.body;
    
    if (!codigo_divisa || !condicion || !valor_limite) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    const alert = await alertService.createAlert(
      req.user.id_usuario, 
      codigo_divisa, 
      condicion, 
      valor_limite
    );
    
    res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// DELETE /api/alerts/:id
router.delete('/:id', async (req, res) => {
  try {
    const success = await alertService.deleteAlert(req.params.id, req.user.id_usuario);
    if (!success) {
      return res.status(404).json({ error: 'Alerta no encontrada o no autorizada' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
