// weather.route.js
const express = require('express');
const cron = require('node-cron');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args)); // falls node<18

module.exports = (configValues, utils) => {
  const router = express.Router();
  let initial = true;

  // Cache der letzten erfolgreichen Antwort
  let cache = null;
  let lastError = null;

  // ---- Helpers --------------------------------------------------------------

  function normalizeIcon(url) {
    if (!url) return undefined;
    return url.startsWith('//') ? `https:${url}` : url;
  }

  function toMS(kph) {
    const n = typeof kph === 'number' ? kph : 0;
    return n / 3.6;
  }

  function degToCompass(deg) {
    if (typeof deg !== 'number' || isNaN(deg)) return undefined;
    const dirs = [
      'N','NNE','NE','ENE','E','ESE','SE','SSE',
      'S','SSW','SW','WSW','W','WNW','NW','NNW'
    ];
    const idx = Math.round(((deg % 360) / 22.5)) % 16;
    return dirs[idx];
  }

  function formatUnixToLocal(unixSec, tzOffsetSec) {
    const d = new Date((unixSec + (tzOffsetSec || 0)) * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    const Y = d.getUTCFullYear();
    const M = pad(d.getUTCMonth() + 1);
    const D = pad(d.getUTCDate());
    const h = pad(d.getUTCHours());
    const m = pad(d.getUTCMinutes());
    return `${Y}-${M}-${D} ${h}:${m}`;
  }

  function dateKeyFromUnix(unixSec, tzOffsetSec) {
    const d = new Date((unixSec + (tzOffsetSec || 0)) * 1000);
    // YYYY-MM-DD (lokal)
    return d.toISOString().slice(0, 10);
  }

  function owmIconUrl(iconCode) {
    if (!iconCode) return undefined;
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  // Mapping für "current"
  function mapCurrent(raw) {
    // raw: { current, location, timezone_offset }
    const curr = raw.current || {};
    const loc = raw.location || {};
    return {
      temp: curr.temp,
      temp_feels_like: curr.feels_like,

      // Wind (km/h UND m/s + Böen)
      wind_speed_ms: curr.wind_speed,                                 // m/s
      wind_speed: curr.wind_speed,                                    // alias
      wind_kph: typeof curr.wind_speed === 'number' ? curr.wind_speed * 3.6 : undefined,
      gust_kph: typeof curr.wind_gust === 'number' ? curr.wind_gust * 3.6 : undefined,
      gust_ms: curr.wind_gust,
      wind_deg: curr.wind_deg,
      wind_dir: degToCompass(curr.wind_deg),

      sky: curr.weather?.[0]?.description,
      weather_icon: normalizeIcon(owmIconUrl(curr.weather?.[0]?.icon)),

      // lokal formatierte Stringzeit
      timestamp: loc.localtime,
    };
  }

  // Tages-High/Low aus heutigem Tag (aus 3h-forecast berechnet)
  function mapTodayHiLo(raw) {
    const tzOffset = raw?.timezone_offset || 0;
    const todayKey = dateKeyFromUnix((raw?.current?.dt) || Math.floor(Date.now() / 1000), tzOffset);

    const hourly = Array.isArray(raw?.hourly) ? raw.hourly : [];
    const todays = hourly.filter(h => dateKeyFromUnix(h.dt, tzOffset) === todayKey);

    if (todays.length === 0) {
      return { high_c: undefined, low_c: undefined };
    }
    let hi = -Infinity;
    let lo = Infinity;
    for (const h of todays) {
      if (typeof h.temp === 'number') {
        if (h.temp > hi) hi = h.temp;
        if (h.temp < lo) lo = h.temp;
      }
    }
    return {
      high_c: Number.isFinite(hi) ? hi : undefined,
      low_c: Number.isFinite(lo) ? lo : undefined,
    };
  }

  // Kompakte Stunden-Mapping (beibehaltener Output)
  function mapHour(h) {
    return {
      time: h.time, // "YYYY-MM-DD HH:mm"
      temp_c: h.temp_c,
      sky: h.condition?.text,
      weather_icon: normalizeIcon(h.condition?.icon),
    };
  }

  // ---- Forecast Builder -----------------------------------------------------
  // Nächste 12 Stunden ab nächster voller Stunde (aus 3h-forecast; ggf. linear aufgefüllt)
  function buildNext12Hours(raw) {
    const tzOffset = raw?.timezone_offset || 0;

    const nowStr = formatUnixToLocal(
      raw?.current?.dt || Math.floor(Date.now() / 1000),
      tzOffset
    );
    const now = new Date(nowStr.replace(' ', 'T'));

    const nextHour = new Date(now);
    nextHour.setMinutes(0, 0, 0);
    nextHour.setHours(nextHour.getHours() + 1);

    // hourly hier ist aus forecast (3h-Schritte) vorverarbeitet
    const hourly = Array.isArray(raw?.hourly) ? raw.hourly : [];
    if (hourly.length === 0) return [];

    // Forecast-Einträge in lokale Zeit
    const prepared = hourly.map((h) => {
      const tStr = formatUnixToLocal(h.dt, tzOffset);
      return {
        time: tStr,
        temp_c: h.temp, // bereits °C
        condition: {
          text: h.weather?.[0]?.description,
          icon: owmIconUrl(h.weather?.[0]?.icon),
        },
        _ts: new Date(tStr.replace(' ', 'T')).getTime(),
      };
    });

    // Startindex: erste Vorhersage >= nächste volle Stunde
    const startIdx = prepared.findIndex((h) => h._ts >= nextHour.getTime());
    const start = startIdx >= 0 ? startIdx : 0;

    // Wir geben genau 12 Einträge aus. Die OWM 3h-API liefert alle 3 Stunden;
    // damit hätten wir nur 4 Punkte. Um die 12h-Liste zu füllen, duplizieren wir
    // die 3h-Punkte in 1h-Schritte durch Vorwärtshalten (step-wise hold).
    const slice3h = prepared.slice(start, start + 8); // max. 8*3h = 24h Puffer
    const out = [];

    let cursor = new Date(nextHour);
    for (let i = 0; i < 12; i++) {
      const ts = cursor.getTime();
      // passender 3h-Datensatz: der letzte Punkt mit _ts <= cursor
      let pick = slice3h[0];
      for (const p of slice3h) {
        if (p._ts <= ts) pick = p;
        else break;
      }
      const hourItem = {
        time: formatUnixToLocal(Math.floor(ts / 1000) - tzOffset, tzOffset), // zurück in "YYYY-MM-DD HH:mm"
        temp_c: pick?.temp_c,
        condition: pick?.condition,
      };
      out.push(mapHour(hourItem));
      cursor.setHours(cursor.getHours() + 1);
    }

    return out;
  }

  // ---- Fetcher (nur freie Endpunkte) ---------------------------------------
  async function fetchJsonOrThrow(url, label) {
    const r = await fetch(url);
    const text = await r.text();
    if (!r.ok) {
      throw new Error(`${label} HTTP ${r.status} ${r.statusText} – ${text}`);
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`${label} JSON parse error – ${e.message}: ${text.slice(0, 180)}`);
    }
  }

  async function fetchAndUpdateWeatherData(lat, lon, apiKey) {
    try {
      lastError = null;

      // Koordinaten robust aus config übernehmen (Strings -> Number)
      let useLat = lat != null ? Number(lat) : undefined;
      let useLon = lon != null ? Number(lon) : undefined;
      if (Number.isNaN(useLat)) useLat = undefined;
      if (Number.isNaN(useLon)) useLon = undefined;

      let locMeta = {};
      if (typeof useLat !== 'number' || typeof useLon !== 'number') {
        const qCity = (configValues && configValues.city) || undefined;
        if (!qCity) {
          throw new Error('Weder Koordinaten (latitude/longitude) noch city in configValues gesetzt.');
        }
        const geoUrl =
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(qCity)}` +
          `&limit=1&appid=${apiKey}`;
        const geo = await fetchJsonOrThrow(geoUrl, 'Geocoding');
        if (!Array.isArray(geo) || geo.length === 0) {
          throw new Error(`Geocoding lieferte keine Treffer für "${qCity}".`);
        }
        useLat = geo[0].lat;
        useLon = geo[0].lon;
        locMeta = { name: geo[0].name, region: geo[0].state, country: geo[0].country };
        console.log(`[OWM] Geocode für "${qCity}": ${useLat},${useLon}`);
      }

      // 1) Current Weather (free)
      const urlCurrent =
        `https://api.openweathermap.org/data/2.5/weather?lat=${useLat}&lon=${useLon}` +
        `&units=metric&appid=${apiKey}`;
      const current = await fetchJsonOrThrow(urlCurrent, 'Current');

      // 2) 5 day / 3 hour forecast (free)
      const urlForecast =
        `https://api.openweathermap.org/data/2.5/forecast?lat=${useLat}&lon=${useLon}` +
        `&units=metric&appid=${apiKey}`;
      const forecast = await fetchJsonOrThrow(urlForecast, 'Forecast');

      // timezone_offset: /weather liefert shift in Sekunden
      const tzOffset = typeof current.timezone === 'number' ? current.timezone : 0;
      const localtime = typeof current.dt === 'number'
        ? formatUnixToLocal(current.dt, tzOffset)
        : undefined;

      // Normalisieren auf unsere Mapper-Struktur
      const normalized = {
        location: {
          name: locMeta?.name || (configValues && configValues.city) || current?.name,
          region: locMeta?.region,
          country: locMeta?.country,
          lat: useLat,
          lon: useLon,
          tz_id: undefined, // OWM free liefert keinen TZ-Namen; nur Offset
          localtime,
        },
        timezone_offset: tzOffset,

        current: {
          dt: current.dt,
          temp: current.main?.temp,
          feels_like: current.main?.feels_like,
          wind_speed: current.wind?.speed,     // m/s
          wind_gust: current.wind?.gust,       // m/s (kann fehlen)
          wind_deg: current.wind?.deg,
          weather: current.weather,            // [{description, icon, ...}]
        },

        // Aus 3h-forecast bauen wir ein "hourly"-Array mit {dt,temp,weather}
        hourly: Array.isArray(forecast?.list)
          ? forecast.list.map((it) => ({
              dt: it.dt,                            // unix sec
              temp: it.main?.temp,                  // °C
              weather: it.weather,                  // [{...}]
            }))
          : [],

        // daily nicht vorhanden im Free-Plan → high/low wird aus hourly berechnet
        daily: [],
      };

      cache = {
        location: normalized.location,
        current: mapCurrent(normalized),
        today: mapTodayHiLo(normalized),
        next12: buildNext12Hours(normalized),
      };
      console.log('[OWM] Daten aktualisiert (free endpoints): current + next12h.');
    } catch (e) {
      lastError = e;
      console.error('[OWM] Fehler beim Abrufen (free):', e.message);
      // cache NICHT überschreiben, damit evtl. alte Daten weiter ausgeliefert werden
    }
  }

  // ---- Route ---------------------------------------------------------------
  router.get('/call', async (req, res) => {
    const apiKey =
      (configValues && configValues.apiKey) ||
      process.env.WEATHER_API_KEY ||               // erlaubt weiterhin diesen Namen
      process.env.OPENWEATHER_API_KEY ||
      process.env.OPENWEATHERMAP_API_KEY;

    if (!apiKey) {
      return res.status(500).send({ error: 'WEATHER_API_KEY/OPENWEATHER_API_KEY fehlt' });
    }

    const lat = configValues && configValues.latitude;
    const lon = configValues && configValues.longitude;

    if (initial) {
      console.log('[OWM] Initialer Aufruf – Daten werden abgerufen (free).');
      await fetchAndUpdateWeatherData(lat, lon, apiKey);
      // stündlich aktualisieren
      cron.schedule('0 * * * *', () => {
        console.log('[OWM] Stündliche Aktualisierung (free)…');
        fetchAndUpdateWeatherData(lat, lon, apiKey);
      });
      initial = false;
    }

    if (!cache) {
      await fetchAndUpdateWeatherData(lat, lon, apiKey);
    }

    if (!cache) {
      const payload = { error: 'Keine Wetterdaten verfügbar' };
      if (lastError) payload.details = String(lastError.message || lastError);
      return res.status(502).send(payload);
    }

    return res.send(cache);
  });

  return router;
};
