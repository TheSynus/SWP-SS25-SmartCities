const express = require('express');
const router = express.Router()

// Abfrage der NINA-Warndaten zur Stadt auf Kreisebene
router.get('/call/nina', async (req, res) => {
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

module.exports = router;