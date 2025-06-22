const express = require('express');
const pool = require('../db.js');

const router = express.Router();



router.post('/', async (req, res) => {
    const { title, color } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Das Feld 'label' ist ein Pflichtfeld." });
    }
    try {
        const newCategory = await pool.query(
            "INSERT INTO category (title, color) VALUES ($1, $2) RETURNING *",
            [title, color]
        );
        res.status(201).json(newCategory.rows[0]);


    } catch (err) {
        console.error("Fehler beim Erstellen der Kategorie:", err.message);
        res.status(500).json({ error: "Serverfehler beim Erstellen der Kategorie." });
    }
});


router.get('/', async (req, res) => {
    try {
        const allCategories = await pool.query("SELECT * FROM category ORDER BY title ASC");

        res.status(200).json(allCategories.rows);
        console.log("categoryRouter good");
    } catch (err) {
        console.error("Fehler beim Abrufen der Kategorien:", err.message);
        res.status(500).json({ error: "Serverfehler beim Abrufen der Kategorien." });
    }
});



router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, color } = req.body;


        if (!title || !color) {
            return res.status(400).json({ error: "Die Felder 'title' und 'color' sind Pflichtfelder." });
        }

        const updatedCategory = await pool.query(
            "UPDATE category SET title = $1, color = $2 WHERE id = $3 RETURNING *",
            [title, color, id]
        );
        if (updatedCategory.rows.length === 0) {
            return res.status(404).json({ error: "Kategorie mit dieser ID nicht gefunden." });
        }

        res.status(200).json(updatedCategory.rows[0]);

    } catch (err) {
        console.error("Fehler beim Aktualisieren der Kategorie:", err.message);
        res.status(500).json({ error: "Serverfehler beim Aktualisieren der Kategorie." });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deleteOp = await pool.query("DELETE FROM category WHERE id = $1 RETURNING *", [id]);

        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ error: "Kategorie mit dieser ID nicht gefunden." });
        }
        res.status(204).send();

    } catch (err) {
        console.error("Fehler beim Löschen der Kategorie:", err.message);
        res.status(500).json({ error: "Serverfehler beim Löschen der Kategorie." });
    }
});

module.exports = router;


