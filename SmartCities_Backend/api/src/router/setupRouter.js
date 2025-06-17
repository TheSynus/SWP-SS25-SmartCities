const express = require('express');

// Erstellt eine factoryFunction, die bei Aufruf einen Router erstellt, der angegebene Argumente annimmt
// Dadurch lassen sich Variablen und Funktionen übergeben
module.exports = (configValues, utils) => {
  const router = express.Router()
  const { getCityToPLZ, getRegionalKey, writeValueToJSON } = utils;

  // Route zum initialen Annehmen der Postleitzahl und automatischen Ermitteln der Stadt
  // Request Body: JSON Objekt mit "plz"-Field, also z.B.: { "plz" : "12345" }
  router.post('/plz', async (req, res) => {
    
    if (configValues.plz !== -1) {
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
    configValues.plz = newPlz;
    writeValueToJSON("./config.json", "plz", configValues.plz);

    res.send('The postal code set successfully');
    console.log('Postal code was set to: ' + configValues.plz);

    configValues.city = await getCityToPLZ(configValues.plz);
    writeValueToJSON("./config.json", "cityName", configValues.city);

    //regionalKey = getRegionalKey(city);
    //writeValueToJSON("./config.json", "regionalKey", regionalKey);
  });

  // Route zum initialen Annehmen des Regionalschlüssels
  // Request Body: JSON Objekt mit "regionalKey"-Field, also z.B.: { "regionalKey" : "012345678912" }
  router.post('/regionalKey', async (req, res) => {
    // Fehler, wenn der Regionalschlüssel bereits gesetzt wurde
    if (configValues.regionalKey !== -1) {
      console.error('USER-ERROR: tried to set regional key, regional key was already set.');
      return res.status(400).send('The regional key was already set');
    }

    const { regionalKey : newRegionalKey } = req.body;
    // Fehler, wenn kein Regionalschlüssel mitgeschickt wurde
    if (!newRegionalKey) {
      console.error('USER-ERROR: tried to set regional key, no regional key provided');
      return res.status(400).send('A regional key is required');
    }

    // Überprüfen, ob Regionalschlüssel dem richtigen Format entspricht - 12 Zahlen
    const isValidKey = /^\d{12}$/.test(newRegionalKey);
    if (!isValidKey) {
      console.error('USER-ERROR: tried to set regional key, provided regional key not in valid format');
      return res.status(400).send('The regional key is not in a valid format. It must be exactly 12 digits long and only contain numbers.');
    }

    // Wenn keine Fehler auftreten, wird der Regionalschlüssel gesetzt
    configValues.regionalKey = newRegionalKey;
    writeValueToJSON("./config.json", "regionalKey", configValues.regionalKey);

    res.status(200).send('The regional key set successfully');
    console.log('Regional key was set to: ' + configValues.regionalKey);
  });

  //module.exports = router;
  return router;

}