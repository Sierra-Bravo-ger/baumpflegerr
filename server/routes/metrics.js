const express = require('express');
const router = express.Router();
const db = require('../db');

// GET alle Metriken
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM tree_metrics
      ORDER BY measurement_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Abrufen der Metriken' });
  }
});

// GET Metriken für einen bestimmten Baum
router.get('/tree/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      SELECT * FROM tree_metrics
      WHERE tree_id = $1
      ORDER BY measurement_date DESC
    `, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Abrufen der Metriken' });
  }
});

// POST eine neue Metrik erstellen
router.post('/', async (req, res) => {
  console.log('POST /api/metrics - Request-Body:', req.body);
  
  const { 
    tree_id, 
    measurement_date, 
    height, 
    trunk_diameter, 
    crown_diameter, 
    crown_height, 
    health_score,
    leaf_density,
    notes
  } = req.body;
  
  // Validierung der Eingabedaten
  if (!tree_id) {
    console.error('Fehler: tree_id ist erforderlich');
    return res.status(400).json({ error: 'tree_id ist erforderlich' });
  }
  
  // Client für Transaktion erstellen
  const client = await db.connect();
  
  try {
    // Transaktion starten
    await client.query('BEGIN');
    
    console.log('SQL-Parameter für Metrik:', [tree_id, measurement_date, height, trunk_diameter, crown_diameter, crown_height, health_score, leaf_density]);
    
    // 1. Metrik ohne Notizen speichern
    const metricResult = await client.query(`
      INSERT INTO tree_metrics 
      (tree_id, measurement_date, height, trunk_diameter, crown_diameter, crown_height, health_score, leaf_density)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [tree_id, measurement_date, height, trunk_diameter, crown_diameter, crown_height, health_score, leaf_density]);
    
    // 2. Notizen in der trees-Tabelle aktualisieren, falls vorhanden
    if (notes) {
      console.log('Aktualisiere Notizen für Baum:', tree_id, notes);
      await client.query(`
        UPDATE trees
        SET notes = $1, updated_at = CURRENT_TIMESTAMP
        WHERE tree_id = $2
      `, [notes, tree_id]);
    }
    
    // Transaktion bestätigen
    await client.query('COMMIT');
    
    console.log('Metrik erfolgreich erstellt:', metricResult.rows[0]);
    res.status(201).json(metricResult.rows[0]);
  } catch (err) {
    // Bei Fehler: Transaktion zurückrollen
    await client.query('ROLLBACK');
    console.error('Fehler beim Erstellen der Metrik:', err.message);
    console.error('Vollständiger Fehler:', err);
    res.status(500).json({ error: 'Serverfehler beim Erstellen der Metrik', details: err.message });
  } finally {
    // Client in jedem Fall freigeben
    client.release();
  }
});

// GET eine bestimmte Metrik
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      SELECT * FROM tree_metrics
      WHERE metric_id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Metrik nicht gefunden' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Abrufen der Metrik' });
  }
});

// PUT eine Metrik aktualisieren
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    tree_id, 
    measurement_date, 
    height, 
    trunk_diameter, 
    crown_diameter, 
    crown_height, 
    health_score,
    leaf_density,
    notes
  } = req.body;
  
  try {
    const result = await db.query(`
      UPDATE tree_metrics
      SET tree_id = $1, measurement_date = $2, height = $3, trunk_diameter = $4, 
          crown_diameter = $5, crown_height = $6, health_score = $7, leaf_density = $8, notes = $9
      WHERE metric_id = $10
      RETURNING *
    `, [tree_id, measurement_date, height, trunk_diameter, crown_diameter, crown_height, health_score, leaf_density, notes, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Metrik nicht gefunden' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Aktualisieren der Metrik' });
  }
});

// DELETE eine Metrik löschen
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      DELETE FROM tree_metrics
      WHERE metric_id = $1
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Metrik nicht gefunden' });
    }
    
    res.json({ message: 'Metrik erfolgreich gelöscht', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Löschen der Metrik' });
  }
});

module.exports = router;
