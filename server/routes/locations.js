const express = require('express');
const router = express.Router();
const db = require('../db');

// GET alle Standorte
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM locations
      ORDER BY city, address
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Abrufen der Standorte' });
  }
});

// GET einen bestimmten Standort
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      SELECT * FROM locations
      WHERE location_id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Standort nicht gefunden' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Abrufen des Standorts' });
  }
});

// POST einen neuen Standort erstellen
router.post('/', async (req, res) => {
  const { address, city, postal_code, latitude, longitude } = req.body;
  
  try {
    const result = await db.query(`
      INSERT INTO locations (address, city, postal_code, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [address, city, postal_code, latitude, longitude]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Erstellen des Standorts' });
  }
});

// PUT einen Standort aktualisieren
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { address, city, postal_code, latitude, longitude } = req.body;
  
  try {
    const result = await db.query(`
      UPDATE locations
      SET address = $1, city = $2, postal_code = $3, latitude = $4, longitude = $5, updated_at = CURRENT_TIMESTAMP
      WHERE location_id = $6
      RETURNING *
    `, [address, city, postal_code, latitude, longitude, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Standort nicht gefunden' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Aktualisieren des Standorts' });
  }
});

// DELETE einen Standort löschen
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Prüfen, ob der Standort von Bäumen referenziert wird
    const checkResult = await db.query(`
      SELECT COUNT(*) FROM trees
      WHERE location_id = $1
    `, [id]);
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Standort kann nicht gelöscht werden, da er von Bäumen referenziert wird',
        referencedCount: parseInt(checkResult.rows[0].count)
      });
    }
    
    const result = await db.query(`
      DELETE FROM locations
      WHERE location_id = $1
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Standort nicht gefunden' });
    }
    
    res.json({ message: 'Standort erfolgreich gelöscht', deletedLocation: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Löschen des Standorts' });
  }
});

module.exports = router;
