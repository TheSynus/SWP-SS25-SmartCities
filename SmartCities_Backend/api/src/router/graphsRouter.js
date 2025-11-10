const express = require('express');
const pool = require('../db.js');
const Ajv = require('ajv');

const router = express.Router();
const ajv = new Ajv();

/*
Routen zum validieren und Speichern von neuen Graphen inkl. Daten
*/
router.post("/uploadJson", async (req, res) => {
    const validation = await validateJSON(req.body, 'upload');

    //Bei fehlgeschlagener Validierung
    if (!validation.valid) {
        return res.status(400).json({
            status: "error",
            message: "Ungültige Daten",
            errors: validation.errors,
        })
    }

    const { title, type, points } = req.body

    try {
        // Erstellen des neuen Graphen
        const newGraph = await pool.query(
            "INSERT INTO graphs (title, type) VALUES ($1, $2) RETURNING *",
            [title || "Unnamed Graph", type]
        )
        const graphId = newGraph.rows[0].id

        // Einfügen der Datenpunkte zum neuen Graphen
        const insertValues = points
            .map((_, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`)
            .join(",")
        const params = [graphId, ...points.flatMap(dp => [dp.x_comp, dp.y_comp])]

        await pool.query(
            `INSERT INTO graphs_data (graph_id, x_comp, y_comp) VALUES ${insertValues}`,
            params
        )

        res.status(201).json({
            status: "success",
            graph: newGraph.rows[0],
            points: points,
        })
    } catch (err) {
        console.error("Fehler beim UploadJson:", err.message)
        res.status(500).json({ error: "Serverfehler beim Speichern des Graphen" })
    }
})

/*
Routen zum erhalten aller verfügbaren Graphen
*/
router.get('/', async (req, res) => {
    try {
        const allGraphs = await pool.query("SELECT * FROM graphs ORDER BY title ASC");
        res.status(200).json(allGraphs.rows);
    } catch (err) {
        console.error("Fehler beim Abrufen der Graphen:", err.message);
        res.status(500).json({ error: "Serverfehler beim Abrufen der Graphen." });
    }
});

/*
Routen zum erhalten eines Graphen inkl. Daten
*/
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const graphRes = await pool.query("SELECT * FROM graphs WHERE id = $1", [id]);
        if (graphRes.rows.length === 0) {
            return res.status(404).json({ error: "Graph nicht gefunden." });
        }
        const graph = graphRes.rows[0];

        const dataPointsRes = await pool.query(
            "SELECT * FROM graphs_data WHERE graph_id = $1 ORDER BY id ASC",
            [id]
        );

        const result = {
            ...graph,
            data_points: dataPointsRes.rows
        };

        res.status(200).json(result);
    } catch (err) {
        console.error("Fehler beim Abrufen des Graphen:", err.message);
        res.status(500).json({ error: "Serverfehler beim Abrufen des Graphen." });
    }
});

/*
Route zum Aktualisieren eines Graphen (Metadaten)
*/
router.patch('/:id', async (req, res) => {
  const { id } = req.params;

  const validation = await validateJSON(req.body, 'metadata');

  //Bei fehlgeschlagener Validierung
  if (!validation.valid) {
    return res.status(400).json({
      status: 'error',
      message: 'Ungültige Daten',
      errors: validation.errors,
    });
  }

  const { title, type } = req.body;

  try {
    const result = await pool.query(
      'UPDATE graphs SET title = $1, type = $2 WHERE id = $3 RETURNING *',
      [title, type, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Graph nicht gefunden' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Graphen:', err.message);
    res
      .status(500)
      .json({ error: 'Serverfehler beim Aktualisieren des Graphen' });
  }
});


/*
Routen zum löschen eines Graphen inkl. Daten
*/
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
                   
        const result = await pool.query('DELETE FROM graphs WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Graph nicht gefunden." });
        } else {
            res.status(204).send(); 
        }
    } catch (err) {
        console.error("Fehler beim Löschen des Graphen:", err.message);
        res.status(500).json({ error: "Serverfehler beim Löschen des Graphen." });
    }
});

/*
Route zum Hinzufügen von Datenpunkten
*/
router.post('/:id/data', async (req, res) => {
    const { id: graph_id } = req.params;
    const { x_comp, y_comp } = req.body;

    if (!x_comp || y_comp === undefined) {
        return res.status(400).json({ error: "x_comp und y_comp sind Pflichtfelder." });
    }

    try {
        const newDataPoint = await pool.query(
            "INSERT INTO graphs_data (graph_id, x_comp, y_comp) VALUES ($1, $2, $3) RETURNING *",
            [graph_id, x_comp, y_comp]
        );
        res.status(201).json(newDataPoint.rows[0]);
    } catch (err) {
        console.error("Fehler beim Hinzufügen des Datenpunktes:", err.message);
        if (err.code === '23503') {
            return res.status(404).json({ error: "Graph mit dieser ID nicht gefunden." });
        }
        res.status(500).json({ error: "Serverfehler beim Hinzufügen des Datenpunktes." });
    }
});


/*##############################---Hilfsmethoden---##############################*/

async function validateJSON(data, mode = 'metadata') {
    try {
        // JSON-Schema für den Upload (inkl. Datenpunkte)
        const graphUploadSchema = {
            type: "object",
            properties: {
                title: { type: "string" },
                type: { type: "string", enum: ["line", "bar", "pie", "column"] },
                points: {
                    type: "array",
                    minItems: 1,
                    maxItems: 10000,
                    items: {
                        type: "object",
                        properties: {
                            x_comp: { type: "string" },
                            y_comp: { type: "string" },
                        },
                        required: ["x_comp", "y_comp"],
                        additionalProperties: false,
                    },
                },
            },
            required: ["type", "points"],
            additionalProperties: false,
        }

        // JSON-Schema nur für Graph-Metadaten (Titel, Typ)
        const graphMetadataSchema = {
            type: 'object',
            properties: {
                title: { type: 'string', minLength: 1 },
                type: { type: 'string', enum: ['line', 'bar', 'pie', 'column'] },
            },
            required: ['title', 'type'],
            additionalProperties: false,
        };

        // Wähle das Schema basierend auf dem Modus
        const schema = (mode === 'upload') ? graphUploadSchema : graphMetadataSchema;

        // AJV Kompilieren und Validieren
        const validate = ajv.compile(schema)
        const valid = validate(data)

         if (!valid) {
             return { 
                valid: false, 
                errors: validate.errors 
            };
         }

         return { valid: true };
    } catch (err) {
        console.error('Fehler bei validateJSON (graphs):', err.message);
        return { 
            valid: false, 
            errors: [{ message: 'Validator-Fehler im Server' }] 
        };
    }
}

module.exports = router;