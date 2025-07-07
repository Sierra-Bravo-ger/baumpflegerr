const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Routen importieren
const treesRoutes = require('./routes/trees');
const metricsRoutes = require('./routes/metrics');
const locationsRoutes = require('./routes/locations');
const speciesRoutes = require('./routes/species');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API-Routen
app.use('/api/trees', treesRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/species', speciesRoutes);

// Basis-Route für API-Status
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Baumpflegerr API ist aktiv',
    version: '1.0.0',
    endpoints: [
      '/api/trees - Alle Bäume abrufen',
      '/api/trees/:id - Details zu einem bestimmten Baum',
      '/api/locations - Alle Standorte abrufen',
      '/api/species - Alle Baumarten abrufen'
    ]
  });
});

// Server starten
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf Port ${PORT} und ist über alle Netzwerkschnittstellen erreichbar`);
});
