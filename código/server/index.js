require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

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

// Sincronización de cotizaciones
const { syncRates } = require('./services/syncService');

// Basic route
app.get('/', (req, res) => {
  res.send('Divise API Running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Ejecutar primera sincronización al iniciar el servidor
  await syncRates();
  
  // Ejecutar sincronización cada 5 minutos (300,000 ms)
  setInterval(syncRates, 5 * 60 * 1000);
});
