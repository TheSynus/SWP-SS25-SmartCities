const { readFileSync, writeFileSync } = require('fs');

function getJSONContent (pathToFile) {
    const options = {encoding: 'utf8'};
    const jsonData = JSON.parse(readFileSync(pathToFile, options));
    return jsonData;
}

function writeValueToJSON (pathToFile, varName, varValue) {
    //const data[varName] = varValue;
    //writeFileSync(pathToFile, data);

    let data = {};
    data = getJSONContent(pathToFile);

    data[varName] = varValue;
    writeFileSync(pathToFile, JSON.stringify(data, null, 2), 'utf8');
}

// Exportieren der Funktionen zum nutzen in anderen Dateien
module.exports = { getJSONContent, writeValueToJSON };