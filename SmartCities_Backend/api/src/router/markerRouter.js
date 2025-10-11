const express = require('express');
const pool = require('../db.js');
const Ajv = require('ajv');
const router = express.Router();
const ajv = new Ajv();

/*
-- Routen zum validieren und Speichern von neuen Markern
*/
router.post("/uploadJson", async (req, res) => {

    //Speichern aller aktuell verfügbaren Kategorien für Validierung
    const { rows } = await pool.query('SELECT id FROM category');
    const allowedCategorys = rows.map(r => r.id);

    // JSON-Schema für den Upload
    const uploadSchema = {
        type: "object",
        properties: {
            name: { type: "string" },
            description: { type: "string" },
            category_id: { type: "number", enum: allowedCategorys },
            latitude: { type: "number", minimum: -90, maximum: 90 },
            longitude: { type: "number", minimum: -180, maximum: 180 },
            is_public: { type: "boolean" },
        },
        required: ["name", "description", "category_id", "latitude", "longitude"],
        additionalProperties: false,
    }

    // AJV Kompilieren und Validieren
    const validateGraphUpload = ajv.compile(uploadSchema)
    const valid = validateGraphUpload(req.body)

    //Bei fehlgeschlagener Validierung
    if (!valid) {
        return res.status(400).json({
            status: "error",
            message: "Ungültige Daten",
            errors: validateGraphUpload.errors,
        })
    }

    const { name, description, category_id, latitude, longitude, is_public } = req.body;

    try {

        await pool.query(
            `INSERT INTO marker (name, description, category_id, latitude, longitude, is_public)
                VALUES ($1, $2, $3, $4, $5, $6)`,
            [name, description, category_id, latitude, longitude, is_public || false]
        );

        res.status(201).json({ status: "success", message: "Marker erstellt" });
    } catch (err) {
        console.error("Fehler beim UploadJson:", err.message)
        res.status(500).json({ error: "Serverfehler beim Speichern des Markers" })
    }
})

/*
-- Route zum Erhalten aller verfügbaren Marker
*/
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM marker");
        res.json(rows);
    } catch (err) {
        console.error('Fehler beim Abrufen der Marker:', err.message);
        res.status(500).json({ error: 'Serverfehler beim Abrufen der Marker' });
    }
});

/*
-- Route zum Erhalten eines Markers
*/
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const marker = await pool.query("SELECT * FROM marker WHERE id = $1", [id]);

        if (marker.rows.length === 0) {
            return res.status(404).json({ error: "Marker nicht gefunden" });
        }

        res.json(marker.rows[0]);
    } catch (err) {
        console.error('Fehler beim Abrufen des Markers:', err.message);
        res.status(500).json({ error: 'Serverfehler beim Abrufen der Marker' });
    }
});

/*
-- Routen zum Löschen eines Markers
*/
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const marker = await pool.query("DELETE FROM marker WHERE id = $1", [id]);

    if (marker.rowCount === 0) {
      return res.status(404).json({ error: 'Marker nicht gefunden' });
    }

    res.json({ status: 'success', message: `Marker ${id} gelöscht` });
  } catch (err) {
    console.error('Fehler beim Löschen des Markers:', err.message);
    res.status(500).json({ error: 'Serverfehler beim Löschen des Markers' });
  }
});

module.exports = router;