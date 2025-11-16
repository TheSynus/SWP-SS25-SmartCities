const express = require('express');

module.exports = (configValues, utils) => {
  const router = express.Router()
  const { getJSONContent } = utils;

  // Abfrage der NINA-Warndaten zur Stadt auf Kreisebene
  router.get('/call', async (req, res) => {
    const regionalKey = configValues.regionalKey;
    
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
  
  // Test-Route für Nina-Endpunkt 
  // stellt statische Warndaten bereit, falls aktuell keine echten Warnungen vorliegen
  router.get('/test', async(req, res) => {
    // Lädt Testdaten aus nina_test.json
    //let warnData = getJSONContent("./test/nina_test.json");
    let warndData = getJSONContent("../../../testData/nina_test.json");
    
    //Formatieren & zurückgeben
    warnData = warnData.map(m => {
          return {
            url:"https://warnung.bund.de/meldungen/" + m.id,
            type:m.payload.type,
            headline:m.payload?.data?.headline,
            severity:m.payload?.data?.severity
          }
    });
    
    res.send(warnData);
  });

  
  return router;
}