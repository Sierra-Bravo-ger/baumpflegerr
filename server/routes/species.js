const express = require('express');
const router = express.Router();
const db = require('../db');

// GET alle Baumarten
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM tree_species
      ORDER BY common_name, scientific_name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Abrufen der Baumarten' });
  }
});

// GET eine bestimmte Baumart
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      SELECT * FROM tree_species
      WHERE species_id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Baumart nicht gefunden' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Abrufen der Baumart' });
  }
});

// POST eine neue Baumart erstellen
router.post('/', async (req, res) => {
  const { scientific_name, common_name, description } = req.body;
  
  try {
    const result = await db.query(`
      INSERT INTO tree_species (scientific_name, common_name, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [scientific_name, common_name, description]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Erstellen der Baumart' });
  }
});

// PUT eine Baumart aktualisieren
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { scientific_name, common_name, description } = req.body;
  
  try {
    const result = await db.query(`
      UPDATE tree_species
      SET scientific_name = $1, common_name = $2, description = $3, updated_at = CURRENT_TIMESTAMP
      WHERE species_id = $4
      RETURNING *
    `, [scientific_name, common_name, description, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Baumart nicht gefunden' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Aktualisieren der Baumart' });
  }
});

// DELETE eine Baumart löschen
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Prüfen, ob die Baumart von Bäumen referenziert wird
    const checkResult = await db.query(`
      SELECT COUNT(*) FROM trees
      WHERE species_id = $1
    `, [id]);
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Baumart kann nicht gelöscht werden, da sie von Bäumen referenziert wird',
        referencedCount: parseInt(checkResult.rows[0].count)
      });
    }
    
    const result = await db.query(`
      DELETE FROM tree_species
      WHERE species_id = $1
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Baumart nicht gefunden' });
    }
    
    res.json({ message: 'Baumart erfolgreich gelöscht', deletedSpecies: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Löschen der Baumart' });
  }
});

module.exports = router;
