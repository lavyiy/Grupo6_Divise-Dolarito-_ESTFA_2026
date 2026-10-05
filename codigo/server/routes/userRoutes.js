const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

// Todas las rutas de usuarios requieren token.
router.use(verifyToken);

// Todos los endpoints bajo /api/users expondrían datos personales (email,
// WhatsApp). Se restringen por rol (ADMIN_EMAILS) o por recurso propio (CP-087).

const isAdmin = (req) => {
  if (req.user?.es_admin) return true;
  const admins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(String(req.user?.email || '').toLowerCase());
};

const requireSelfOrAdmin = (req, res, next) => {
  const targetId = Number(req.params.id);
  if (isAdmin(req) || targetId === Number(req.user.id_usuario)) {
    return next();
  }
  return res.status(403).json({ error: 'No tenés permisos para acceder a este recurso.' });
};

// El listado de usuarios queda reservado a administradores.
const requireAdmin = (req, res, next) => {
  if (isAdmin(req)) return next();
  return res.status(403).json({ error: 'No tenés permisos para listar usuarios.' });
};

// /me debe declararse antes de /:id para no capturar "me" como parámetro.
router.get('/me', userController.getProfile);
router.put('/me', userController.updateProfile);
router.put('/me/password', userController.changePassword);
router.put('/me/2fa', userController.toggleTwoFactor);
router.put('/me/whatsapp', userController.updateWhatsApp);
router.post('/me/whatsapp/test', userController.testWhatsApp);
router.delete('/me', userController.deleteAccount);

router.get('/', requireAdmin, userController.listUsers);
router.get('/:id', requireSelfOrAdmin, userController.getProfile);
router.put('/:id', requireSelfOrAdmin, userController.updateProfile);
router.delete('/:id', requireSelfOrAdmin, userController.deleteAccount);

module.exports = router;
