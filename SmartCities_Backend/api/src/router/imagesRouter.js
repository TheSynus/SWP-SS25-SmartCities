const express = require('express');
//const multer = require('multer');
const pool = require('../db.js');

const router = express.Router();
//const upload = multer(); 

router.get('/post_image', async (req, res) => {
  try {
    result = "test"
    res.json(result.rows);
    console.log("Good")
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Serverfehler');
  }
});

module.exports = router;