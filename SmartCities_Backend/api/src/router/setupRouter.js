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

    const { regionalKey } = req.body;
    // Fehler, wenn kein Regionalschlüssel mitgeschickt wurde
    if (!regionalKey) {
      console.error('USER-ERROR: tried to set regional key, no regional key provided');
      return res.status(400).send('A regional key is required');
    }

    // Überprüfen, ob Regionalschlüssel dem richtigen Format entspricht - 12 Zahlen
    const isValidKey = /^\d{12}$/.test(regionalKey);
    if (!isValidKey) {
      console.error('USER-ERROR: tried to set regional key, provided regional key not in valid format');
      return res.status(400).send('The regional key is not in a valid format. It must be exactly 12 digits long and only contain numbers.');
    }

    // Wenn keine Fehler auftreten, wird der Regionalschlüssel gesetzt
    configValues.regionalKey = regionalKey;
    writeValueToJSON("./config.json", "regionalKey", configValues.regionalKey);

    res.status(200).send('The regional key set successfully');
    console.log('Regional key was set to: ' + configValues.regionalKey);
  });

  // Route zum initialen Annehmen des Regionalschlüssels
  // Request Body: JSON Objekt mit "lat"-Field & "lon"-Field, also z.B.: { "lat" : 10.12, "lat" : 12.34 }
  router.post('/geo-coords', async (req, res) => {
    // Fehler, wenn der Regionalschlüssel bereits gesetzt wurde
    console.log(configValues.latitude + " " + configValues.longitude)
    if (configValues.latitude !== -1 || configValues.longitude !== -1) {
      console.error('USER-ERROR: latitude or longitude was already set');
      return res.status(400).send('The latitude or longitude was already set');
    }

    const { lat, lon } = req.body;
    // Fehler, wenn kein Regionalschlüssel mitgeschickt wurde
    if (!lat || !lon) {
      console.error('USER-ERROR: tried to set latitude and longitude');
      return res.status(400).send('A latitude and longitude are required');
    }
    
    if(typeof lat !== 'number' || typeof lon !== 'number') {
      console.error('USER-ERROR: latitude or longitude wasnt a number');
      return res.status(400).send('latitude and or longitude wasnt a number');
    }

    // // Überprüfen, ob die Geo-Koordinaten Zahlen dem richtigen Format entsprechen - mindestens eine Stelle vor Punkt, zwei Stellen nach dem Punkt
    // const latString = parseFloat(lat);
    // const lonString = parseFloat(lon);
    // console.log(latString, lonString)
    // const areValidNums = /^\d+\.\d{2,}$/.test(latString) && /^\d+\.\d{2,}$/.test(lonString);
    // if (!areValidNums) {
    //  console.error('USER-ERROR: tried to set latitude or longitude, provided latitude or longitude not in valid format');
    //  return res.status(400).send('The latitude or longitude is not in a valid format. They must be floats with at least one number before the decimal point and two after the decimal point.');
    // }

    // Wenn keine Fehler auftreten, werden die Geo-Koordinaten gesetzt
    configValues.latitude = lat;
    configValues.longitude = lon
    writeValueToJSON("./config.json", "latitude", configValues.latitude);
    writeValueToJSON("./config.json", "longitude", configValues.longitude);

    res.status(200).send('The geo coordinates were set successfully');
    console.log('Coordinates were set to: ', 'latitude: ', configValues.latitude, 'longitude: ', configValues.longitude);
  });

  //module.exports = router;
  return router;

}