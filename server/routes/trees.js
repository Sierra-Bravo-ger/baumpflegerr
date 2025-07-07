const express = require('express');
const router = express.Router();
const db = require('../db');

// GET alle Bäume mit Grundinformationen
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.*, s.common_name as species_name, l.address, l.city
      FROM trees t
      LEFT JOIN tree_species s ON t.species_id = s.species_id
      LEFT JOIN locations l ON t.location_id = l.location_id
      ORDER BY t.tree_id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Abrufen der Bäume' });
  }
});

// GET einen bestimmten Baum mit allen Details
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Basisinformationen zum Baum
    const treeResult = await db.query(`
      SELECT t.*, s.scientific_name, s.common_name, l.address, l.city, l.postal_code, l.latitude, l.longitude
      FROM trees t
      LEFT JOIN tree_species s ON t.species_id = s.species_id
      LEFT JOIN locations l ON t.location_id = l.location_id
      WHERE t.tree_id = $1
    `, [id]);
    
    if (treeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Baum nicht gefunden' });
    }
    
    // Metriken zum Baum
    const metricsResult = await db.query(`
      SELECT * FROM tree_metrics
      WHERE tree_id = $1
      ORDER BY measurement_date DESC
    `, [id]);
    
    // Inspektionen zum Baum
    const inspectionsResult = await db.query(`
      SELECT * FROM tree_inspections
      WHERE tree_id = $1
      ORDER BY inspection_date DESC
    `, [id]);
    
    // Maßnahmen zum Baum
    const actionsResult = await db.query(`
      SELECT * FROM tree_actions
      WHERE tree_id = $1
      ORDER BY action_date DESC
    `, [id]);
    
    // Alle Informationen zusammenführen
    const tree = {
      ...treeResult.rows[0],
      metrics: metricsResult.rows,
      inspections: inspectionsResult.rows,
      actions: actionsResult.rows
    };
    
    res.json(tree);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Abrufen der Baumdaten' });
  }
});

// POST einen neuen Baum erstellen
router.post('/', async (req, res) => {
  const { species_id, location_id, tree_number, planting_date, height_at_planting, diameter_at_planting, status, notes } = req.body;
  
  try {
    const result = await db.query(`
      INSERT INTO trees (species_id, location_id, tree_number, planting_date, height_at_planting, diameter_at_planting, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [species_id, location_id, tree_number, planting_date, height_at_planting, diameter_at_planting, status, notes]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Erstellen des Baums' });
  }
});

// PUT einen Baum aktualisieren
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { species_id, location_id, tree_number, planting_date, height_at_planting, diameter_at_planting, status, notes } = req.body;
  
  try {
    const result = await db.query(`
      UPDATE trees
      SET species_id = $1, location_id = $2, tree_number = $3, planting_date = $4, 
          height_at_planting = $5, diameter_at_planting = $6, status = $7, notes = $8, updated_at = CURRENT_TIMESTAMP
      WHERE tree_id = $9
      RETURNING *
    `, [species_id, location_id, tree_number, planting_date, height_at_planting, diameter_at_planting, status, notes, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Baum nicht gefunden' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Aktualisieren des Baums' });
  }
});

// DELETE einen Baum löschen
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('DELETE FROM trees WHERE tree_id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Baum nicht gefunden' });
    }
    
    res.json({ message: 'Baum erfolgreich gelöscht', deletedTree: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Löschen des Baums' });
  }
});

module.exports = router;
