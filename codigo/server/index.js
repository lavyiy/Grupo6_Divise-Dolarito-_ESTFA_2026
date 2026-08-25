require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

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
app.use('/api/auth', authRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/users', userRoutes);

// Ruta raíz de la API para evitar "Cannot GET /api"
app.get('/api', (req, res) => {
  res.json({
    message: 'Divise API',
    endpoints: ['/api/auth', '/api/rates', '/api/alerts', '/api/favorites', '/api/users']
  });
});

// Sincronización de cotizaciones y migraciones
const { syncRates } = require('./services/syncService');
const { runMigrations } = require('./migrate');

// SPA fallback: cualquier ruta que no empiece con /api devuelve el index.html del frontend
app.get(/^\/(?!api(\/|$)).*/, (req, res) => {
  if (hasFrontend) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    res.send('Divise API Running');
  }
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

