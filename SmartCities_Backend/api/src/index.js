const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const { getCityToPLZ } = require('./general_utils.js');
const { getJSONContent, writeValueToJSON } = require('./json_utils.js');

//Importierne der Setup-Route
const setupRouter = require('./router/setupRouter.js');

//Importieren der externen Routen
const ninaRouter = require('./router/ninaRouter.js');

//Importieren der Datenbank-Routen
const weatherRouter = require('./router/weatherRouter.js');
const categoryRouter = require('./router/categoryRouter.js');
const appointmentRouter = require('./router/appointmentRouter.js');
const cardsRouter = require('./router/cardsRouter.js');
const graphsRouter = require('./router/graphsRouter.js');
const markerRouter = require('./router/markerRouter.js');

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

//Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
}));


require('dotenv').config();

//Speichern der ursprünglichen Variablen in Objekt, um durchreichen, verändern & zurückgeben für Router zu ermöglichen
const configValues = {
  plz: null,
  city: null,
  regionalKey: null,
  latitude: null,
  longitude: null,
  apiKey: null,
};

//Datenbank-Routen registrieren
app.use('/categorys', categoryRouter);
app.use('/appointments', appointmentRouter);
app.use('/cards', cardsRouter);
app.use('/graphs', graphsRouter);
app.use('/marker', markerRouter);

//Router mit gemeinsam genutzten Config-Werten registrieren
app.use('/setup/', setupRouter(configValues, { getCityToPLZ, writeValueToJSON }));
app.use('/nina/', ninaRouter(configValues, { getJSONContent }));
app.use('/weather/', weatherRouter(configValues, {}));

//Serverstart & Initialisieren der globalen Konfigurationswerte
app.listen(port, '0.0.0.0', () => {
  console.log('DB_USER:', process.env.DB_USER, 'DB_PASSWORD:', process.env.DB_PASSWORD);

  console.log("----------- Serverstart -----------")
  console.log(`Server läuft auf http://0.0.0.0:${port}`);
  
  //Initialisieren der Serverconfigwerte aus der JSON
  console.log("Initialisieren der Servervariablen:")
  const configJsonContent = getJSONContent("./config.json");

  //Konfigurationswerte in das gemeinsame Objekt schreiben
  configValues.plz = configJsonContent.plz;
  console.log("Postal code from Config:", configValues.plz);
  configValues.city = configJsonContent.cityName;
  console.log("City name from Config:", configValues.city);
  configValues.regionalKey = configJsonContent.regionalKey;
  console.log("Regional key from Config:", configValues.regionalKey);
  configValues.latitude = configJsonContent.latitude;
  console.log("Latitude from Config:", configValues.latitude);
  configValues.longitude = configJsonContent.longitude;
  console.log("Longitude from Config:", configValues.longitude);
  configValues.apiKey = configJsonContent.apiKey;
  console.log("Api Key from Config:", '********');
  console.log("-----------------------------------")
});