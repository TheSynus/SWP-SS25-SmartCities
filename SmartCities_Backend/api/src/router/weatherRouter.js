const express = require('express');
const cron = require('node-cron');

module.exports = (configValues, utils) => {
    const router = express.Router();
    let initial = true;

    let tempWeather = [{}]; // 24 Wetterteile, der erste ist aktuell

    function formatDate(date) {
        // Splitte Datum und Zeit
        const [datePart, timePart] = date.split(", ");

        // Splitte Tag, Monat, Jahr
        const [day, month, year] = datePart.split(".");

        // Baue neues Datum im Format YYYY-MM-DD zusammen
        const formattedDate = `${year}-${month}-${day}`;

        // Kombiniere mit der Zeit
        return `${formattedDate} ${timePart}`;
    }

    function extractRelaventData(entry) {
        return {
            temp: entry.main.temp - 273.15,
            temp_feels_like: entry.main.feels_like - 273.15,
            wind_speed: entry.wind.speed,
            wind_deg: entry.wind.deg,
            sky: entry.weather[0].main,
            weather_icon: entry.weather[0].icon,
            timestamp: entry.dt_txt ?? formatDate(new Date().toLocaleString())
        }
    }


    async function fetchAndUpdateWeatherData(lat, lon, apiKey) {
        try {

            const responseCurrent = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`);

            if (!responseCurrent) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const responseForecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`);

            if (!responseForecast) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            //Daten pro Listeneintrag:
            // - tatsächliche Temperatur
            // - gefühlte Temperatur
            // - Windgeschwindigkeit
            // - Windrichtung
            // - "Himmel" (bewölkt / klar / ...) ("main")
            // - Icon https://openweathermap.org/weather-conditions#How-to-get-icon-URL

            const currentWeather = await responseCurrent.json();
            const forecast = await responseForecast.json();
            const forecastList = forecast.list;
        
            const curr_time = new Date().toLocaleString();
            
            // Zeug für 3fache Verwendung der Forecastwerte - kann raus, wenn stündliche Forecats vorhanden sind und nicht mehr nur alle 3
            // Nimmt die ersten 12 Einträge der Originalen Liste (sonst ist Liste viel zu lang), wiederholt diesen jeweils 3 mal
            const trimmedForecastList = forecastList.slice(0, 12).flatMap(item => [item, item, item]);
            
            

            const weather = [
                extractRelaventData(currentWeather),
                //...forecastList.slice(0,23).map(extractRelaventData) // Zeile für einfache Verwendung der Daten
                ...trimmedForecastList.slice(0,23).map(extractRelaventData) // Zeile für dreifache Verwendung der Daten
            ]
            
            tempWeather = weather;
            console.log("Aktuelle Wetterdaten von OpenWeather abgefragt.")
        } catch (e) {
            console.log(e)
        }
    }

    
    // Abfrage der Wetterdaten
    router.get('/call', async (req, res) => {
        const apiKey = process.env.WEATHER_API_KEY;
        const lat = configValues.latitude;
        const lon = configValues.longitude;
        
        //Bei ersten Aufruf nach Serverstart: erstmalig Wetterdaten abfragen, Zwischenspeichern und Cronjonb für automatisierte Abfrage starten
        if (initial) {
            await fetchAndUpdateWeatherData(lat, lon, apiKey);
            // Jede volle Stunde ausführen (Minute 0 jeder Stunde)
            cron.schedule('0 * * * *', () => {
                console.log('Stündliche Abfrage der OpenWeatherAPI erfolgt...');
                fetchAndUpdateWeatherData(lat, lon, apiKey);
            });
            initial = false;
            console.log("Initialer Aufruf der Wetter-Route - Werte werden abgerufen.")
        } 

        res.send(tempWeather);
    });

    return router;
}