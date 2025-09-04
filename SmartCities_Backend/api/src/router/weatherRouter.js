// weather.route.js
const express = require('express');
const cron = require('node-cron');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args)); // falls node<18

module.exports = (configValues, utils) => {
  const router = express.Router();
  let initial = true;

  // Cache der letzten erfolgreichen Antwort
  let cache = null;

  // ---- Helpers --------------------------------------------------------------

  function normalizeIcon(url) {
    if (!url) return undefined;
    return url.startsWith('//') ? `https:${url}` : url;
  }

  function toMS(kph) {
    const n = typeof kph === 'number' ? kph : 0;
    return n / 3.6;
  }

  // Mapping für "current"
  function mapCurrent(raw) {
    const curr = raw.current || {};
    const loc = raw.location || {};
    return {
      temp: curr.temp_c,
      temp_feels_like: curr.feelslike_c,

      // Wind (jetzt mit km/h UND m/s + Böen)
      wind_speed_ms: toMS(curr.wind_kph),           // m/s (neu: klarer benannt)
      wind_speed: toMS(curr.wind_kph),              // alias für Rückwärtskompat.
      wind_kph: curr.wind_kph,                      // km/h
      gust_kph: curr.gust_kph,                      // Böen km/h
      gust_ms: toMS(curr.gust_kph),                 // Böen m/s
      wind_deg: curr.wind_degree,                   // 0..360 (aus welcher Richtung)
      wind_dir: curr.wind_dir,                      // Text wie "SSW"

      sky: curr.condition?.text,
      weather_icon: normalizeIcon(curr.condition?.icon),
      timestamp: loc.localtime ?? curr.last_updated,
    };
  }

  // Tages-High/Low aus forecastday[0]
  function mapTodayHiLo(raw) {
    const d = raw?.forecast?.forecastday?.[0]?.day;
    return d
      ? { high_c: d.maxtemp_c, low_c: d.mintemp_c }
      : { high_c: undefined, low_c: undefined };
  }

  // Kompakte Stunden-Mapping
  function mapHour(h) {
    return {
      time: h.time, // "YYYY-MM-DD HH:mm"
      temp_c: h.temp_c,
      sky: h.condition?.text,
      weather_icon: normalizeIcon(h.condition?.icon),
    };
  }

  // ---- Forecast Builder -----------------------------------------------------
  // Nächste 12 Stunden ab nächster voller Stunde (ggf. in Tag 2 rein)
  function buildNext12Hours(raw) {
    const loc = raw.location;
    const localStr = loc?.localtime; // "YYYY-MM-DD HH:mm"
    const now = localStr ? new Date(localStr.replace(' ', 'T')) : new Date();

    const nextHour = new Date(now);
    nextHour.setMinutes(0, 0, 0);
    nextHour.setHours(nextHour.getHours() + 1);

    const days = raw?.forecast?.forecastday || [];
    if (days.length === 0) return [];

    const h0 = Array.isArray(days[0].hour) ? days[0].hour : [];
    const h1 = Array.isArray(days[1]?.hour) ? days[1].hour : [];
    const all = [...h0, ...h1];

    const idx = all.findIndex((h) => {
      const t = new Date(h.time.replace(' ', 'T'));
      return t.getTime() >= nextHour.getTime();
    });

    const start = idx >= 0 ? idx : 0;
    const slice = all.slice(start, start + 12).map(mapHour);
    return slice;
  }

  // ---- Fetcher --------------------------------------------------------------
  async function fetchAndUpdateWeatherData(lat, lon, apiKey) {
    try {
      const q =
        typeof lat === 'number' && typeof lon === 'number'
          ? `${lat},${lon}`
          : configValues?.city || 'Wedel';

      // 2 Tage Forecast, damit die nächsten 12h sauber abgedeckt sind
      const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(
        q
      )}&days=2&aqi=no&alerts=no`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const raw = await response.json();

      cache = {
        location: {
          name: raw?.location?.name,
          region: raw?.location?.region,
          country: raw?.location?.country,
          lat: raw?.location?.lat,
          lon: raw?.location?.lon,
          tz_id: raw?.location?.tz_id,
          localtime: raw?.location?.localtime,
        },
        current: mapCurrent(raw),
        today: mapTodayHiLo(raw),
        next12: buildNext12Hours(raw),
      };
      console.log('[WeatherAPI] Daten aktualisiert: current + next12h.');
    } catch (e) {
      console.error('[WeatherAPI] Fehler beim Abrufen:', e.message);
    }
  }

  // ---- Route ---------------------------------------------------------------
  router.get('/call', async (req, res) => {
    const apiKey = configValues?.apiKey || process.env.WEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).send({ error: 'WEATHER_API_KEY fehlt' });
    }

    const lat = configValues?.latitude;
    const lon = configValues?.longitude;

    if (initial) {
      await fetchAndUpdateWeatherData(lat, lon, apiKey);
      cron.schedule('0 * * * *', () => {
        console.log('[WeatherAPI] Stündliche Aktualisierung…');
        fetchAndUpdateWeatherData(lat, lon, apiKey);
      });
      initial = false;
      console.log('[WeatherAPI] Initialer Aufruf – Daten werden abgerufen.');
    }

    if (!cache) {
      await fetchAndUpdateWeatherData(lat, lon, apiKey);
    }

    if (!cache) {
      return res.status(502).send({ error: 'Keine Wetterdaten verfügbar' });
    }

    return res.send(cache);
  });

  return router;
};
