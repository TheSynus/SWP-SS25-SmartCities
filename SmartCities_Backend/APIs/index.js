const express = require('express');
const pool = require('./db');
require('dotenv').config();

// Importieren der anderen Funktionen zur Verwendung innerhalb der Routen
const { getCityToPLZ, getRegionalKey } = require('./general_utils.js');

const app = express();
const port = process.env.PORT;

app.use(express.json());

// Variablen:
let plz = null; //TODO: momentan nur Variable zu Testzwecken, DB oder per dotenv-modul?
let city = null;
let regionalKey = null;

// So würden die Routen aussehen
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

// Route zum initialen Annehmen der Postleitzahl und automatischen Ermitteln der Stadt und des Regionalschlüssels
// Request Body: JSON Objekt mit "plz"-Field, also z.B.: { "plz" : "12345" }

app.post('/setup/plz', async (req, res) => {

  if (plz !== null) {
    console.error('USER-ERROR: tried to set postal code, postal code was already set.');
    return res.status(400).send('The postal code was already set');
  }

  const { plz: newPlz } = req.body;
  // Fehler, wenn keine Postleitzahl mitgeschickt wurde
  if (!newPlz) {
    console.error('USER-ERROR: tried to set postal code, no postal code provided.');
    return res.status(400).send('A postal code is required');
  }

  // Überprüfen, ob die geschickte Postleitzahl dem richtigen Format entspricht
  const isValidPLZ = /^\d{5}$/.test(newPlz);
  if (!isValidPLZ) {
    console.error('USER-ERROR: tried to set postal code, provided postal code not in valid format.');
    return res.status(400).send('The postal code is not in a valid format. It must be exactly 5 digits long and only contain numbers.');
  }

  // Wenn keine Fehler auftreten, wird die neue Postleitzahl gesetzt
  plz = newPlz;
  //TODO: persistentes speichern!

  res.send('The postal code set successfully');
  console.log('Postal code was set to: ' + plz);

  city = await getCityToPLZ(plz);
  regionalKey = getRegionalKey(city);
});


// Abfrage der NINA-Warndaten zur Stadt auf Kreisebene
// ---- WIP ----
// Warnungen werden schon abgerufen, allerdings noch keine vernünftige Verarbeitung
app.get('/call/nina', async (req, res) => {
  if (regionalKey !== null) {
    // Regionalschlüssel der Stadt ins richtige Format bringen
    regionalKeyTrimmed = regionalKey.slice(0, 5) + '0000000';

    try {
      // Abfrage der NINA-Warndaten
      const response = await fetch(`https://nina.api.proxy.bund.dev/api31/dashboard/${regionalKeyTrimmed}.json`);

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // JSON-Daten der Antwort parsen - ist Jacascript Array/Object
      const warnData = await response.json(); 

      // Über verschiedene Warnungen iterieren, um an IDs etc zu kommen, um Daten aufzubereiten

      // Die Daten aufgeräumt als Antwort zurückgeben //TODO:
      //res.json(data);#
      res.send(warnData);
    } catch (error) {
      console.error('SERVER-FEHLER: Fehler beim Abrufen der NINA-Warndaten:', error);
      res.status(502).send('Fehler beim Abrufen der Warndaten erhalten');
    }
  } else {
    console.error('SERVER-FEHLER: Es liegt noch kein Regionalschlüssel vor');
    res.status(500).send('Interner Serverfehler: Ein zur Abfrage benötigter Regionalschlüssel ist nicht vorhanden')
  }
});



app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});