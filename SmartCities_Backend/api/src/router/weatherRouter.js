const express = require('express');
const cron = require('node-cron');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args)); // falls node<18

module.exports = (configValues, utils) => {
  const router = express.Router();
  let initial = true;

  // Cache-Objekt für { current, forecast }
  let cache = null;

  function normalizeIcon(url) {
    if (!url) return undefined;
    return url.startsWith('//') ? `https:${url}` : url;
  }

  function toMS(kph) {
    const n = typeof kph === 'number' ? kph : 0;
    return n / 3.6;
  }

  function formatLocalDateTime(dt) {
    // Erwartet "DD.MM.YYYY, HH:MM:SS" von toLocaleString()
    if (typeof dt !== 'string') return new Date().toISOString().slice(0, 16).replace('T', ' ');
    const [datePart, timePart] = dt.split(', ');
    const [day, month, year] = datePart.split('.');
    return `${year}-${month}-${day} ${timePart?.slice(0,5) ?? '00:00'}`;
  }

  // Aktuell-Werte abbilden (WeatherAPI current)
  function mapCurrent(entry) {
    const curr = entry.current || {};
    const loc = entry.location || {};
    return {
      temp: curr.temp_c,
      temp_feels_like: curr.feelslike_c,
      wind_speed: toMS(curr.wind_kph),
      wind_deg: curr.wind_degree,
      sky: curr.condition?.text,
      weather_icon: normalizeIcon(curr.condition?.icon),
      timestamp: loc.localtime ?? curr.last_updated ?? formatLocalDateTime(new Date().toLocaleString('de-DE'))
    };
  }

  // Tageszusammenfassung
  function mapDaySummary(fd) {
    const d = fd?.day || {};
    return {
      date: fd?.date,
      maxtemp_c: d.maxtemp_c,
      mintemp_c: d.mintemp_c,
      avgtemp_c: d.avgtemp_c,
      chance_of_rain: Number(d.daily_chance_of_rain ?? 0),
      sky: d.condition?.text,
      weather_icon: normalizeIcon(d.condition?.icon),
    };
  }

  // Stundenwerte minimal abbilden
  function mapHour(h) {
    return {
      time: h.time, // "YYYY-MM-DD HH:mm"
      temp_c: h.temp_c,
      wind_ms: toMS(h.wind_kph),
      wind_deg: h.wind_degree,
      chance_of_rain: Number(h.chance_of_rain ?? 0),
      sky: h.condition?.text,
      weather_icon: normalizeIcon(h.condition?.icon),
    };
  }

  function mapForecast(entry) {
    const list = entry?.forecast?.forecastday || [];
    return list.map(fd => ({
      date: fd.date,
      day: mapDaySummary(fd),
      hours: Array.isArray(fd.hour) ? fd.hour.map(mapHour) : []
    }));
  }

  async function fetchAndUpdateWeatherData(lat, lon, apiKey) {
    try {
      // q kann "lat,lon" oder Ortsname sein
      const q = (typeof lat === 'number' && typeof lon === 'number')
        ? `${lat},${lon}`
        : (configValues.city || 'Wedel');
      // Forecast 3 Tage, Luftqualität/Alerts aus
      const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=Wedel&days=3&aqi=no&alerts=no`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const raw = await response.json();

      cache = {
        current: mapCurrent(raw),
        forecast: mapForecast(raw),
      };

      console.log('[WeatherAPI] Forecast aktualisiert (3 Tage).');
    } catch (e) {
      console.error('[WeatherAPI] Fehler beim Abrufen:', e.message);
    }
  }

  router.get('/call', async (req, res) => {
    const apiKey = configValues?.apiKey;
    console.log(configValues)
    if (!apiKey) {//TODO
     return res.status(500).send({ error: 'WEATHER_API_KEY fehlt' });
    }

    console.log(apiKey)
    const lat = configValues?.latitude;
    const lon = configValues?.longitude;

    // Beim ersten Aufruf initial laden und Cron starten
    if (initial) {
      await fetchAndUpdateWeatherData(lat, lon, apiKey);
      // Jede volle Stunde neu abfragen
      cron.schedule('0 * * * *', () => {
        console.log('[WeatherAPI] Stündliche Aktualisierung...');
        fetchAndUpdateWeatherData(lat, lon, apiKey);
      });
      initial = false;
      console.log('[WeatherAPI] Initialer Aufruf – Forecast wird abgerufen.');
    }

    // Falls noch kein Cache (z. B. Fehler vorher), trotzdem versuchen
    if (!cache) {
      await fetchAndUpdateWeatherData(lat, lon, apiKey);
    }

    if (!cache) {
      return res.status(502).send({ error: 'Keine Wetterdaten verfügbar' });
    }

    res.send(cache);
  });

  return router;
};
