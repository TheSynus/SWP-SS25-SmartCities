const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const pool = require('./db.js');
const { getCityToPLZ, getRegionalKey } = require('./general_utils.js');
const { getJSONContent, writeValueToJSON } = require('./json_utils.js');
const testRouter = require('./router/testRouter.js');
const setupRouter = require('./router/setupRouter.js');
const ninaRouter = require('./router/ninaRouter.js');
const imagesRouter = require('./router/imagesRouter.js');
const eventsRouter = require('./router/eventsRouter.js');
const weatherRouter = require('./router/weatherRouter.js');
const categoryRouter = require('./router/categoryRouter.js');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:8000',
}));

// Kann das hier raus?
require('dotenv').config();

app.use('/test/', testRouter)
app.use('/images/', imagesRouter)
app.use('/events/', eventsRouter)
app.use('/category', categoryRouter);

// Variablen:
//let plz = null; 
//let city = null;
//let regionalKey = null;

// Speichern der ursprünglichen Variablen in Objekt, um durchreichen, verändern & zurückgeben für Router zu ermöglichen
const configValues = {
  plz: null,
  city: null,
  regionalKey: null,
  latitude: null,
  longitude: null,
};

app.use('/test/', testRouter);
app.use('/setup/', setupRouter(configValues, { getCityToPLZ, getRegionalKey, writeValueToJSON }));
app.use('/nina/', ninaRouter(configValues, { getJSONContent }));
app.use('/weather/', weatherRouter(configValues, {}));

app.listen(port, '0.0.0.0', () => {
  console.log("----------- Serverstart -----------")
  console.log(`Server läuft auf http://0.0.0.0:${port}`);
  
  //Initialisieren der Serverconfigwerte aus der JSON
  console.log("Initialisieren der Servervariablen:")
  const configJsonContent = getJSONContent("./config.json");
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
  console.log("-----------------------------------")
});