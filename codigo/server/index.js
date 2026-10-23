require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middlewares
app.use(cors());
// Límite explícito para poder guardar fotos de perfil en Base64 (data URL).
// El frontend comprime la imagen antes de enviarla, así que 2 MB es holgado.
app.use(express.json({ limit: '2mb' }));

// Servir el frontend compilado (deploy único en Render)
const distPath = path.join(__dirname, '..', 'dist');
const hasFrontend = fs.existsSync(distPath);
if (hasFrontend) {
  app.use(express.static(distPath));
}

// Rutas
const authRoutes = require('./routes/authRoutes');
const ratesRoutes = require('./routes/ratesRoutes');
const alertRoutes = require('./routes/alertRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const userRoutes = require('./routes/userRoutes');
const historialRoutes = require('./routes/historialRoutes'); // Tarea 14
const newsRoutes = require('./routes/newsRoutes');
const fxHistoryRoutes = require('./routes/fxHistoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');
const supportRoutes = require('./routes/supportRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api/cotizaciones', ratesRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/historial', historialRoutes); // Tarea 14
app.use('/api/news', newsRoutes);
app.use('/api/fx-history', fxHistoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/support', supportRoutes);

// Ruta raíz de la API para evitar "Cannot GET /api"
app.get('/api', (req, res) => {
  res.json({
    message: 'Divise API',
    endpoints: ['/api/auth', '/api/rates', '/api/cotizaciones', '/api/alerts', '/api/favorites', '/api/users', '/api/historial', '/api/news', '/api/admin', '/api/contact', '/api/support']
  });
});

// Sincronización de cotizaciones y migraciones
const { syncRates } = require('./services/syncService');
const { runMigrations } = require('./migrate');

// Cualquier endpoint de API inexistente responde JSON (nunca HTML),
// para que el frontend no intente parsear una página de error como JSON.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint de API no encontrado.' });
});

// SPA fallback: cualquier ruta que no empiece con /api devuelve el index.html del frontend
app.get(/^\/(?!api(\/|$)).*/, (req, res) => {
  if (hasFrontend) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    res.send('Divise API Running');
  }
});

// Manejador de errores global: siempre responde JSON para evitar que el
// frontend reciba HTML (por ejemplo, en errores 413 o JSON malformado).
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'La solicitud es demasiado grande. Si estás subiendo una foto, probá con una imagen más liviana.',
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'El cuerpo de la solicitud no es JSON válido.' });
  }

  console.error('Error no manejado:', err);
  res.status(err?.status || 500).json({
    error: err?.message || 'Error interno del servidor',
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// Sincroniza sin tumbar el servidor si la DB o la API externa fallan
const runSync = async () => {
  try {
    await syncRates();
  } catch (err) {
    console.error('Error en sincronización de cotizaciones:', err.message);
  }
};

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);

  // Ejecutar migraciones automáticas en Supabase
  try {
    await runMigrations({ closePool: false });
  } catch (err) {
    console.error('Advertencia al verificar migraciones:', err.message);
  }

  // Ejecutar primera sincronización al iniciar el servidor
  runSync();

  // Ejecutar sincronización cada 5 minutos (300,000 ms)
  setInterval(runSync, 5 * 60 * 1000);
});
