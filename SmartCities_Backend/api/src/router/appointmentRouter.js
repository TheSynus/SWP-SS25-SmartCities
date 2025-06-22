const express = require('express');
const pool = require('../db.js');

const router = express.Router();



router.post('/', async (req, res) => {
    const { title, start_time, end_time, location, category_id, recurrence, description } = req.body;

    if (!title || !start_time || !end_time || !category_id) {
        return res.status(400).json({ error: "Titel, Startzeit, Endzeit und Kategorie-ID sind Pflichtfelder." });
    }

    try {
        const newAppointment = await pool.query(
            `INSERT INTO appointments (title, start_time, end_time, location, category_id, recurrence, description) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [title, start_time, end_time, location, category_id, recurrence, description]
        );

        res.status(201).json(newAppointment.rows[0]);
        console.log("Neuer Termin erstellt:", newAppointment.rows[0].title);

    } catch (err) {
        console.error("Fehler beim Erstellen des Termins:", err.message);
        res.status(500).json({ error: "Serverfehler beim Erstellen des Termins." });
    }
});


router.get('/', async (req, res) => {
    try {
        const allAppointments = await pool.query(
            `SELECT
                a.id,
                a.title,
                a.start_time,
                a.end_time,
                a.location,
                a.recurrence,
                a.description,
                c.title AS category_title,
                c.color AS category_color
            FROM appointments a
            LEFT JOIN category c ON a.category_id = c.id
            ORDER BY a.start_time ASC`
        );

        res.status(200).json(allAppointments.rows);
        console.log("AppointmentRouter Good");

    } catch (err) {
        console.error("Fehler beim Abrufen der Termine:", err.message);
        res.status(500).json({ error: "Serverfehler beim Abrufen der Termine." });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, start_time, end_time, location, category_id, recurrence, description } = req.body;

        if (!title || !start_time || !end_time || !category_id) {
            return res.status(400).json({ error: "Titel, Startzeit, Endzeit und Kategorie-ID sind Pflichtfelder." });
        }

        const updatedAppointment = await pool.query(
            `UPDATE appointments 
             SET title = $1, start_time = $2, end_time = $3, location = $4, category_id = $5, recurrence = $6, description = $7, updated_at = NOW() 
             WHERE id = $8 
             RETURNING *`,
            [title, start_time, end_time, location, category_id, recurrence, description, id]
        );

        if (updatedAppointment.rows.length === 0) {
            return res.status(404).json({ error: "Termin mit dieser ID nicht gefunden." });
        }

        res.status(200).json(updatedAppointment.rows[0]);

    } catch (err) {
        console.error("Fehler beim Aktualisieren des Termins:", err.message);
        res.status(500).json({ error: "Serverfehler beim Aktualisieren des Termins." });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteOp = await pool.query("DELETE FROM appointments WHERE id = $1 RETURNING *", [id]);

        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ error: "Termin mit dieser ID nicht gefunden." });
        }

        res.status(204).send();

    } catch (err) {
        console.error("Fehler beim Löschen des Termins:", err.message);
        res.status(500).json({ error: "Serverfehler beim Löschen des Termins." });
    }
});

module.exports = router;