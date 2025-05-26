const { readFileSync } = require('fs');

// Verschiedene Funktionen zum Verwenden in den Routen

async function getCityToPLZ(postalCode, page = 1, pageSize = 10) {
    const url = `https://openplzapi.org/de/Localities?postalCode=${postalCode}&page=${page}&pageSize=${pageSize}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json(); // JSON Daten zur Postleitzahl
        
        // Aus JSON Daten den Namen herausfiltern
        if (Array.isArray(data) && data.length > 0) {
            console.log("Found city: \"", data[0].municipality.name, "\" to postal code:\"", postalCode, "\"");
            return data[0].municipality.name; // Städtenamen zurückgeben
        } else {
            return null; // Falls nichts zurückkommt
        }
    } catch (error) {
        console.error('Error fetching localities:', error);
        throw error; // Fehler erneut werfen, um ihn in der 
    }
}

// Fileoperationen für das JSON File mit den Regionalschlüsslen
function getRegionalKey(cityName) {

    // Öffnen der JSON Datei mit der Zuordnung der Regionalschlüsseln zu Städten
    const pathToFile = './regional_keys.json';
    const options = {encoding: 'utf8'};
    const jsonData = JSON.parse(readFileSync(pathToFile, options));

    // Aus den Daten die gesuchte Stadt herausfiltern
    let cityCode = null;
    for (const entry of jsonData.daten) {
        if (entry[1] === cityName) {
            cityCode = entry[0];
            console.log("Found regional key: \"",cityCode, "\" to city: \"", cityName, "\"");
        }
    }
    return cityCode;
}

// Exportieren der Funktionen zum nutzen in anderen Dateien
module.exports = { getCityToPLZ, getRegionalKey };