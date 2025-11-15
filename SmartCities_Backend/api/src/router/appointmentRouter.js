const express = require('express');
const pool = require('../db.js');
const Ajv = require('ajv'); 
const router = express.Router();
const ajv = new Ajv(); 

/*##############################---Routen---##############################*/

/*
Route zum Erstellen eines Termins
*/
router.post('/', async (req, res) => {
    
    const validation = await validateJSON(req.body);
    if (!validation.valid) {
        return res.status(400).json({
            status: "error",
            message: "Ungültige Daten",
            errors: validation.errors,
        });
    }

    const { title, start_time, end_time, location, category_id, recurrence, description } = req.body;

    try {
        const newAppointment = await pool.query(
            `INSERT INTO appointments (title, start_time, end_time, location, category_id, recurrence, description) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [title, start_time, end_time, location, category_id, recurrence, description]
        );

        res.status(201).json(newAppointment.rows[0]);

    } catch (err) {
        console.error("Fehler beim Erstellen des Termins:", err.message);
        res.status(500).json({ error: "Serverfehler beim Erstellen des Termins." });
    }
});

/*
-- Route zum Abrufen aller Termine
*/
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

    } catch (err) {
        console.error("Fehler beim Abrufen der Termine:", err.message);
        res.status(500).json({ error: "Serverfehler beim Abrufen der Termine." });
    }
});

/*
-- Route zum Aktualisieren eines Termins (wurde von PUT zu PATCH geändert)
*/
router.patch('/:id', async (req, res) => {
    const { id } = req.params;

    const validation = await validateJSON(req.body);
    if (!validation.valid) {
        return res.status(400).json({
            status: "error",
            message: "Ungültige Daten",
            errors: validation.errors,
        });
    }
    
    const { title, start_time, end_time, location, category_id, recurrence, description } = req.body;

    try {
        const updatedAppointment = await pool.query(
            `UPDATE appointments 
             SET title = $1, start_time = $2, end_time = $3, location = $4, category_id = $5, recurrence = $6, description = $7
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

/*
-- Route zum Löschen eines Termins
*/
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


/*##############################---Hilfsmethoden---##############################*/

async function validateJSON(data) {
    try {
        //Speichern aller aktuell verfügbaren Kategorien für Validierung
        const { rows } = await pool.query('SELECT id FROM category');
        const allowedCategorys = rows.map(r => r.id);

        // JSON-Schema für einen Termin
        const appointmentSchema = {
            type: "object",
            properties: {
                title: { type: "string", minLength: 1 },
                start_time: { type: "string", format: "date-time" }, // Validiert ISO 8601 Datum
                end_time: { type: "string", format: "date-time" },
                location: { type: "string" },
                category_id: { type: "number", enum: allowedCategorys }, 
                recurrence: { type: "string", enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'] },
                description: { type: "string" }
            },
            required: ["title", "start_time", "end_time", "category_id"],
            additionalProperties: false,
        }

        const validate = ajv.compile(appointmentSchema)
        const valid = validate(data)

         if (!valid) {
             return { 
                valid: false, 
                errors: validate.errors 
            };
         }

         return { valid: true };
    } catch (err) {
        console.error('Fehler bei validateJSON (appointment):', err.message);
        return { 
            valid: false, 
            errors: [{ message: 'Validator-Fehler im Server' }] 
        };
    }
}

module.exports = router;