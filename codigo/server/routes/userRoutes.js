const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

// Todas las rutas de usuarios requieren token.
router.use(verifyToken);

// /me debe declararse antes de /:id para no capturar "me" como parámetro.
router.get('/me', userController.getProfile);
router.put('/me', userController.updateProfile);
router.delete('/me', userController.deleteAccount);

// Alcance actual: no hay tabla de roles, por lo que GET / y GET /:id
// no tienen restricción por rol (solo requieren estar autenticado).
router.get('/', userController.listUsers);
router.get('/:id', userController.getProfile);
router.put('/:id', userController.updateProfile);
router.delete('/:id', userController.deleteAccount);

module.exports = router;
