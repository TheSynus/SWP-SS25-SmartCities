const express = require('express');
const pool = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

app.use(express.json());

// So würden die Routen aussehen
app.get('/test', async (req, res) => {
  try {
    result = "test"
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Serverfehler');
  }
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});