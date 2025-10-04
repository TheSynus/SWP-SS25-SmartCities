const { readFileSync, writeFileSync } = require('fs');

// Auslesen einer JSON-Datei
function getJSONContent (pathToFile) {
    const options = {encoding: 'utf8'};
    const jsonData = JSON.parse(readFileSync(pathToFile, options));
    return jsonData;
}

// Schreiben einer Variable mit Wert in eine übergebene JSON-Datei
function writeValueToJSON (pathToFile, varName, varValue) {

    let data = {};
    data = getJSONContent(pathToFile);

    data[varName] = varValue;
    writeFileSync(pathToFile, JSON.stringify(data, null, 2), 'utf8');
}

// Exportieren der Funktionen zum nutzen in anderen Dateien
module.exports = { getJSONContent, writeValueToJSON };