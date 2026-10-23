const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const supportService = require('../services/supportService');

// Todos los tickets están asociados a un usuario autenticado del dashboard.
router.use(verifyToken);

// POST /api/support/tickets - Crea un ticket desde el chatbot/asistente de soporte
router.post('/tickets', async (req, res) => {
  try {
    const { categoria, prioridad, asunto, mensaje } = req.body || {};
    const email = String(req.user?.email || req.body?.email || '').trim();
    const nombre = String(req.user?.nombre || req.body?.nombre || 'Usuario Divise').trim();

    if (!email) {
      return res.status(400).json({ error: 'No se pudo identificar el correo del usuario.' });
    }
    if (!asunto || !String(asunto).trim()) {
      return res.status(400).json({ error: 'El asunto del ticket es obligatorio.' });
    }
    if (!mensaje || !String(mensaje).trim()) {
      return res.status(400).json({ error: 'La descripción del ticket es obligatoria.' });
    }

    const ticket = await supportService.createTicket({
      id_usuario: req.user?.id_usuario,
      nombre,
      email,
      categoria,
      prioridad,
      asunto: String(asunto).trim(),
      mensaje: String(mensaje).trim(),
    });

    // Notificación por Gmail al equipo administrador (no bloquea la respuesta).
    supportService.notifyNewTicket(ticket).catch(() => {});

    res.status(201).json({
      success: true,
      message: `Tu ticket ${ticket.codigo} fue enviado al equipo de administración.`,
      ticket,
    });
  } catch (err) {
    console.error('Error al crear ticket de soporte:', err.message);
    res.status(500).json({ error: 'No se pudo generar el ticket. Intentá nuevamente.' });
  }
});

// GET /api/support/tickets - Lista los tickets del usuario autenticado
router.get('/tickets', async (req, res) => {
  try {
    const tickets = await supportService.getTicketsByUser({
      id_usuario: req.user?.id_usuario,
      email: req.user?.email,
    });
    res.json(tickets);
  } catch (err) {
    console.error('Error al listar tickets del usuario:', err.message);
    res.status(500).json({ error: 'No se pudieron obtener tus tickets de soporte.' });
  }
});

module.exports = router;
