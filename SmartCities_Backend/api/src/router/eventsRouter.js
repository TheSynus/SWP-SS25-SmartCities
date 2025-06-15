const express = require('express');
const pool = require('../db.js');

const router = express.Router();

router.post('/add_event', async (req, res) => {
  const { title, category, tags, additional_info } = req.body;
  console.log("DAS SOLLTE IN DIE DB" + JSON.stringify(req.body))

  let tagsArray = null;
  if (tags && tags.trim() !== '') {
    tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }

  try {
    await pool.query(
      `INSERT INTO events (title, category, tags, additional_info)
       VALUES ($1, $2, $3, $4)`,
      [title, category || null, tagsArray, additional_info || null]
    );
    res.json({ status: 'success', message: 'Event gespeichert.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'DB error' });
  }
});

router.get('/select_events', async (req, res) => {
  try {
    await pool.query(
      'SELECT * FROM events'  
    );
    res.json({ status: 'success', message: 'Event gespeichert.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'DB error' });
  }
});

router.get('/test', async (req, res) => {
  try {
    result = "test"
    res.json(result.rows);
    console.log("Good")
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Serverfehler');
  }
});

module.exports = router;