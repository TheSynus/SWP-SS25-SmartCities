const express = require('express');
const pool = require('../db.js');

const router = express.Router();


router.post('/', async (req, res) => {
    const { title, type } = req.body;
    if (!title || !type) {
        return res.status(400).json({ error: "Titel und Typ sind Pflichtfelder." });
    }

    try {
        const newGraph = await pool.query(
            "INSERT INTO graphs (title, type) VALUES ($1, $2) RETURNING *",
            [title, type]
        );
        res.status(201).json(newGraph.rows[0]);
    } catch (err) {
        console.error("Fehler beim Erstellen des Graphen:", err.message);
        res.status(500).json({ error: "Serverfehler beim Erstellen des Graphen." });
    }
});

router.get('/', async (req, res) => {
    try {
        const allGraphs = await pool.query("SELECT * FROM graphs ORDER BY title ASC");
        res.status(200).json(allGraphs.rows);
        console.log('graphsRouter Test');
    } catch (err) {
        console.error("Fehler beim Abrufen der Graphen:", err.message);
        res.status(500).json({ error: "Serverfehler beim Abrufen der Graphen." });
    }
});


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


router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteOp = await pool.query("DELETE FROM graphs WHERE id = $1 RETURNING *", [id]);

        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ error: "Graph nicht gefunden." });
        }

        res.status(204).send();
    } catch (err) {
        console.error("Fehler beim Löschen des Graphen:", err.message);
        res.status(500).json({ error: "Serverfehler beim Löschen des Graphen." });
    }
});

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

module.exports = router;