const express = require('express');
const dotenv = require('dotenv');
const pool = require('./db.js');
const { getCityToPLZ, getRegionalKey } = require('./general_utils.js');
const { getJSONContent, writeValueToJSON } = require('./json_utils.js');
const testRouter = require('./router/testRouter.js');


dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

require('dotenv').config();

// Variablen:
let plz = null; 
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
  
  if (plz !== -1) {
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
  writeValueToJSON("./config.json", "plz", plz);

  res.send('The postal code set successfully');
  console.log('Postal code was set to: ' + plz);

  city = await getCityToPLZ(plz);
  writeValueToJSON("./config.json", "cityName", city);

  regionalKey = getRegionalKey(city);
  writeValueToJSON("./config.json", "regionalKey", regionalKey);
});

// Abfrage der NINA-Warndaten zur Stadt auf Kreisebene
app.get('/call/nina', async (req, res) => {
  if (regionalKey !== -1) {
    // Regionalschlüssel der Stadt ins richtige Format bringen
    regionalKeyTrimmed = regionalKey.slice(0, 5) + '0000000';

    try {
      // Abfrage der NINA-Warndaten
      const response = await fetch(`https://nina.api.proxy.bund.dev/api31/dashboard/${regionalKeyTrimmed}.json`);

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // JSON-Daten der Antwort parsen - ist Jacascript Array/Object
      let warnData = await response.json();
      
      //FÜR TESTAUFRUF EINFACH WIEDER EINKOMMENTIEREN, gibt zwei Test-Meldungen auf einmal aus
      //warnData = getJSONContent("./test/nina_test.json");

      // Über verschiedene Warnungen iterieren, um an IDs etc zu kommen, um Daten aufzubereiten
      warnData = warnData.map(m => {
        return {
          url:"https://warnung.bund.de/meldungen/" + m.id,
          type:m.payload.type,
          headline:m.payload?.data?.headline,
          severity:m.payload?.data?.severity
        }
      })

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

app.use('/test/', testRouter)

app.listen(port, '0.0.0.0', () => {
  console.log("----------- Serverstart -----------")
  console.log(`Server läuft auf http://0.0.0.0:${port}`);
  
  //Initialisieren der Serverconfigwerte aus der JSON
  console.log("Initialisieren der Servervariablen:")
  const configJsonContent = getJSONContent("./config.json");
  plz = configJsonContent.plz;
  console.log("Postal code from Config:", plz);
  city = configJsonContent.cityName;
  console.log("City name from Config:", city);
  regionalKey = configJsonContent.regionalKey;
  console.log("Regional key from Config:", regionalKey);
  console.log("-----------------------------------")
});

