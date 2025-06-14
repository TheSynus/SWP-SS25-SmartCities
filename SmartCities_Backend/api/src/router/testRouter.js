import express from 'express'
const router = express.Router()

app.get('/test', async (req, res) => {
  try {
    result = "test"
    res.json(result.rows);
    console.log("Good")
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Serverfehler');
  }
});

export default router