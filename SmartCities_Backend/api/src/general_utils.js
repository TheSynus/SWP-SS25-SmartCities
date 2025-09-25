// Verschiedene Funktionen zum Verwenden in den Routen

// Bestimmung von Stadt zugehörig zu gegebener PLZ mithilfe von OpenPLZApi
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
        throw error; 
    }
}


// Exportieren der Funktionen zum nutzen in anderen Dateien
module.exports = { getCityToPLZ };