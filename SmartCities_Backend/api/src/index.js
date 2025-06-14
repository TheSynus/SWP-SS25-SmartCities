const express = require('express');
const dotenv = require('dotenv');
const pool = require('./db.js');
const { getCityToPLZ, getRegionalKey } = require('./general_utils.js');
const { getJSONContent, writeValueToJSON } = require('./json_utils.js');
const testRouter = require('./router/testRouter.js');
const setupRouter = require('./router/setupRouter.js');
const ninaRouter = require('./router/ninaRouter.js');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

require('dotenv').config();

// Variablen:
let plz = null; 
let city = null;
let regionalKey = null;

app.use('/test/', testRouter)
app.use('/setup/', setupRouter)
app.use('/nina/', ninaRouter)

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

