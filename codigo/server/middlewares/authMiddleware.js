const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'divise-secret-jwt-key-2026';
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Adjuntar info del usuario a la request
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Tu sesión expiró. Iniciá sesión nuevamente.',
        tokenExpired: true
      });
    }
    res.status(401).json({ error: 'Token inválido. Iniciá sesión nuevamente.' });
  }
};

module.exports = {
  verifyToken
};
