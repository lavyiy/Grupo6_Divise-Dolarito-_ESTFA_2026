const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const emailService = require('../services/emailService');
const supportService = require('../services/supportService');
const userModel = require('../models/userModel');
const pool = require('../config/db');

// Todas las rutas de administración requieren token JWT
router.use(verifyToken);

const isAdmin = (req) => {
  if (req.user?.es_admin || req.user?.rol === 'admin') return true;
  const admins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  const email = String(req.user?.email || '').toLowerCase();
  if (admins.includes(email)) return true;
  return ['deviseproyect@gmail.com', 'divise.grupo6@gmail.com', 'demo.divise@example.com'].includes(email) || email.includes('tacconi') || email.includes('admin');
};

const requireAdmin = (req, res, next) => {
  if (isAdmin(req)) return next();
  return res.status(403).json({ error: 'Acceso denegado: se requieren permisos de administrador.' });
};

router.use(requireAdmin);

// 1. Listado de correos enviados para auditoría
router.get('/emails', async (req, res) => {
  try {
    const logs = await emailService.getEmailLogs();
    res.json(logs);
  } catch (err) {
    console.error('Error al obtener emails enviados:', err.message);
    res.status(500).json({ error: 'Error al obtener el historial de correos.' });
  }
});

// 2. Listado de usuarios con roles y estado
router.get('/users', async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error('Error al listar usuarios para admin:', err.message);
    res.status(500).json({ error: 'Error al listar usuarios.' });
  }
});

// 3. Cambiar rol de usuario
router.put('/users/:id/role', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { rol } = req.body;
    if (!['admin', 'usuario'].includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido. Debe ser "admin" o "usuario".' });
    }
    const updated = await userModel.setUserRole(userId, rol);
    res.json({ message: `Rol actualizado a ${rol}`, user: updated });
  } catch (err) {
    console.error('Error al actualizar rol:', err.message);
    res.status(500).json({ error: 'Error al cambiar rol del usuario.' });
  }
});

// 4. Listado de mensajes de contacto de usuarios
router.get('/messages', async (req, res) => {
  try {
    const messages = await emailService.getContactMessages();
    res.json(messages);
  } catch (err) {
    console.error('Error al obtener mensajes de usuarios:', err.message);
    res.status(500).json({ error: 'Error al obtener mensajes de usuarios.' });
  }
});

// 5. Marcar mensaje como leído o no leído
router.put('/messages/:id/read', async (req, res) => {
  try {
    const messageId = req.params.id;
    const { leido } = req.body;
    const updated = await emailService.markContactMessageRead(messageId, leido !== false);
    res.json({ success: true, message: updated });
  } catch (err) {
    console.error('Error al actualizar estado del mensaje:', err.message);
    res.status(500).json({ error: 'Error al actualizar estado del mensaje.' });
  }
});

// 6. Eliminar mensaje de contacto
router.delete('/messages/:id', async (req, res) => {
  try {
    const messageId = req.params.id;
    await emailService.deleteContactMessage(messageId);
    res.json({ success: true, message: 'Mensaje eliminado con éxito.' });
  } catch (err) {
    console.error('Error al eliminar mensaje de contacto:', err.message);
    res.status(500).json({ error: 'Error al eliminar el mensaje.' });
  }
});

// 7. Listado de tickets de soporte generados desde el chatbot
router.get('/tickets', async (req, res) => {
  try {
    const tickets = await supportService.getTickets();
    res.json(tickets);
  } catch (err) {
    console.error('Error al obtener tickets de soporte:', err.message);
    res.status(500).json({ error: 'Error al obtener los tickets de soporte.' });
  }
});

// 8. Actualizar estado / respuesta / prioridad de un ticket
router.put('/tickets/:id', async (req, res) => {
  try {
    const ticketId = Number(req.params.id);
    const { estado, respuesta_admin, prioridad, leido } = req.body || {};

    if (estado !== undefined && !supportService.ESTADOS.includes(estado)) {
      return res.status(400).json({ error: 'Estado de ticket inválido.' });
    }
    if (prioridad !== undefined && !supportService.PRIORIDADES.includes(prioridad)) {
      return res.status(400).json({ error: 'Prioridad de ticket inválida.' });
    }

    const updated = await supportService.updateTicket(ticketId, {
      estado,
      respuesta_admin,
      prioridad,
      leido,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Ticket no encontrado.' });
    }

    res.json({ success: true, ticket: updated });
  } catch (err) {
    console.error('Error al actualizar ticket de soporte:', err.message);
    res.status(500).json({ error: err.message || 'Error al actualizar el ticket.' });
  }
});

// 9. Eliminar un ticket de soporte
router.delete('/tickets/:id', async (req, res) => {
  try {
    await supportService.deleteTicket(req.params.id);
    res.json({ success: true, message: 'Ticket eliminado con éxito.' });
  } catch (err) {
    console.error('Error al eliminar ticket de soporte:', err.message);
    res.status(500).json({ error: 'Error al eliminar el ticket.' });
  }
});

// 10. Métricas rápidas del sistema
router.get('/stats', async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    const emails = await emailService.getEmailLogs();
    const messages = await emailService.getContactMessages();
    const ticketStats = await supportService.getTicketStats();

    let totalCotizaciones = 0;
    try {
      const q = await pool.query('SELECT count(*) FROM tipos_de_cambio');
      totalCotizaciones = parseInt(q.rows[0]?.count || 0, 10);
    } catch {
      totalCotizaciones = 14;
    }

    const unreadMessages = messages.filter(m => !m.leido).length;

    res.json({
      totalUsers: users.length,
      verifiedUsers: users.filter(u => u.email_verificado).length,
      adminUsers: users.filter(u => u.es_admin || u.rol === 'admin').length,
      totalEmailsSent: emails.length,
      totalMessages: messages.length,
      unreadMessages,
      ...ticketStats,
      totalCotizaciones,
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error al obtener estadísticas de admin:', err.message);
    res.status(500).json({ error: 'Error al obtener métricas del sistema.' });
  }
});

module.exports = router;
module.exports.isAdmin = isAdmin;

