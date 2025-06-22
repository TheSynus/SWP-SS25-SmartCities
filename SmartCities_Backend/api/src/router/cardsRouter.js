const express = require('express');
const pool = require('../db.js');
const router = express.Router();


router.post('/', async (req, res) => {
    const { title, type, position, graph_id } = req.body;

    if (!title || !type || position === undefined) {
        return res.status(400).json({ error: "Titel, Typ und Position sind Pflichtfelder." });
    }

    try {
        const newCard = await pool.query(
            `INSERT INTO card (title, type, position, graph_id) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [title, type, position, graph_id || null]
        );

        res.status(201).json(newCard.rows[0]);

    } catch (err) {
        console.error("Fehler beim Erstellen der Karte:", err.message);
        res.status(500).json({ error: "Serverfehler beim Erstellen der Karte." });
    }
});


router.get('/', async (req, res) => {
    try {

        const allCards = await pool.query("SELECT * FROM card ORDER BY position ASC");

        res.status(200).json(allCards.rows);
        console.log('cardsRouter Test');

    } catch (err) {
        console.error("Fehler beim Abrufen der Karten:", err.message);
        res.status(500).json({ error: "Serverfehler beim Abrufen der Karten." });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, position, type, graph_id } = req.body;

        if (!title || position === undefined || !type) {
            return res.status(400).json({ error: "Titel, Position und Typ sind Pflichtfelder." });
        }

        const updatedCard = await pool.query(
            `UPDATE card 
             SET title = $1, position = $2, type = $3, graph_id = $4, updated_at = NOW() 
             WHERE id = $5 
             RETURNING *`,
            [title, position, type, graph_id || null, id]
        );

        if (updatedCard.rows.length === 0) {
            return res.status(404).json({ error: "Karte nicht gefunden." });
        }

        res.status(200).json(updatedCard.rows[0]);

    } catch (err) {
        console.error("Fehler beim Aktualisieren der Karte:", err.message);
        res.status(500).json({ error: "Serverfehler beim Aktualisieren der Karte." });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deleteOp = await pool.query("DELETE FROM card WHERE id = $1 RETURNING *", [id]);

        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ error: "Karte nicht gefunden." });
        }

        res.status(204).send();

    } catch (err) {
        console.error("Fehler beim Löschen der Karte:", err.message);
        res.status(500).json({ error: "Serverfehler beim Löschen der Karte." });
    }
});


module.exports = router;