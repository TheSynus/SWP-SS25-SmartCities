const express = require('express');
const pool = require('../db.js');
const Ajv = require('ajv'); 

const router = express.Router();
const ajv = new Ajv(); 


/*
-- Route zum Erstellen einer Kategorie
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

    const { title, color } = req.body;

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

/*
-- Route zum Abrufen aller Kategorien
*/
router.get('/', async (req, res) => {
    try {
        const allCategories = await pool.query("SELECT * FROM category ORDER BY title ASC");
        res.status(200).json(allCategories.rows);
    } catch (err) {
        console.error("Fehler beim Abrufen der Kategorien:", err.message);
        res.status(500).json({ error: "Serverfehler beim Abrufen der Kategorien." });
    }
});


/*
-- Route zum Aktualisieren einer Kategorie 
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
    
    const { title, color } = req.body;

    try {
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

/*
-- Route zum Löschen einer Kategorie
*/
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

/*##############################---Hilfsmethoden---##############################*/

async function validateJSON(data) {
    try {
        // JSON-Schema für eine Kategorie
        const categorySchema = {
            type: "object",
            properties: {
                title: { type: "string", minLength: 1 },
                color: { 
                    type: "string", 
                    pattern: "^#[0-9a-fA-F]{6}$" // Stellt sicher, dass es ein Hex-Code ist
                },
            },
            required: ["title"], // Nur Titel ist erforderlich, Farbe hat einen DEFAULT
            additionalProperties: false,
        }

        const validate = ajv.compile(categorySchema)
        const valid = validate(data)

         if (!valid) {
             return { 
                valid: false, 
                errors: validate.errors 
            };
         }

         return { valid: true };
    } catch (err) {
        console.error('Fehler bei validateJSON (category):', err.message);
        return { 
            valid: false, 
            errors: [{ message: 'Validator-Fehler im Server' }] 
        };
    }
}


module.exports = router;