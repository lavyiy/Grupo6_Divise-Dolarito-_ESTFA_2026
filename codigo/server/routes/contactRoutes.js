const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

// POST /api/contact - Permite enviar un mensaje de consulta a los administradores
router.post('/', async (req, res) => {
  try {
    const { nombre, email, asunto, mensaje } = req.body;

    if (!email || !mensaje) {
      return res.status(400).json({ error: 'El correo electrónico y el mensaje son obligatorios.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return res.status(400).json({ error: 'El correo electrónico ingresado no tiene un formato válido.' });
    }

    const result = await emailService.sendContactEmail({
      nombre: nombre ? String(nombre).trim() : 'Usuario Divise',
      email: String(email).trim(),
      asunto: asunto ? String(asunto).trim() : 'Consulta de soporte',
      mensaje: String(mensaje).trim(),
    });

    res.json({
      success: true,
      message: '¡Tu mensaje fue enviado con éxito a los administradores! Nos pondremos en contacto a la brevedad.',
      data: result,
    });
  } catch (err) {
    console.error('Error al procesar mensaje de contacto:', err.message);
    res.status(500).json({ error: 'No se pudo enviar el mensaje. Por favor intentá nuevamente.' });
  }
});

module.exports = router;
