const express = require('express');
const pool = require('../db.js');
const Ajv = require('ajv'); 
const router = express.Router();
const ajv = new Ajv(); 

/*##############################---Routen---##############################*/

/*
-- Route zum Erstellen einer Karte
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
    
    const { title, type, position, graph_id } = req.body;

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

/*
-- Route zum Abrufen aller Karten
*/
router.get('/', async (req, res) => {
    try {
        const allCards = await pool.query("SELECT * FROM card ORDER BY position ASC");
        res.status(200).json(allCards.rows);

    } catch (err) {
        console.error("Fehler beim Abrufen der Karten:", err.message);
        res.status(500).json({ error: "Serverfehler beim Abrufen der Karten." });
    }
});

/*
-- Route zum Aktualisieren einer Karte (wurde von PUT zu PATCH geändert)
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

    const { title, position, type, graph_id } = req.body;

    try {
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

/*
-- Route zum Löschen einer Karte
*/
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


/*##############################---Hilfsmethoden---##############################*/

async function validateJSON(data) {
    try {
        const { rows } = await pool.query('SELECT id FROM graphs');
        const allowedGraphIds = rows.map(r => r.id);

        // JSON-Schema für eine Karte
        const cardSchema = {
            type: "object",
            properties: {
                title: { type: "string", minLength: 1 },
                position: { type: "integer", minimum: 0 },
                type: { 
                    type: "string", 
                    enum: ['weather', 'nina', 'wind', 'line', 'bar', 'column', 'pie', 'calender']
                },
                graph_id: {
                    "anyOf": [
                        { "type": "number", "enum": allowedGraphIds },
                        { "type": "null" }
                    ]
                }
            },
            required: ["title", "position", "type"],
            additionalProperties: false,
        }

        const validate = ajv.compile(cardSchema)
        const valid = validate(data)

         if (!valid) {
             return { 
                valid: false, 
                errors: validate.errors 
            };
         }

         return { valid: true };
    } catch (err) {
        console.error('Fehler bei validateJSON (card):', err.message);
        return { 
            valid: false, 
            errors: [{ message: 'Validator-Fehler im Server' }] 
        };
    }
}

module.exports = router;