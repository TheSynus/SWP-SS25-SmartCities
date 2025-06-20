# Backend API Schnittstelle

Hier werden alle APIs für die Kommunikation zum Web-Server, 
sowie zur Datenbank als auch nach außen Implementiert.

Es gibt noch ne .env die nicht in git hochgeladen werden sollte.
Eine Vorlage dieser mit allen Variablen ist in .env.example.

## config.json
In der config.json werden Variablen für den Server während des Betriebs gelesen, geschrieben und persistent gespeichert, wie zum Beispiel die Postleitzahl.
Die config.json sollte initial vor der Konfiguration des Server so aussehen, damit die Werte gesetzt werden können: 
```
    {
        "plz":-1,
        "cityName":"",
        "regionalKey":-1
        "latitude": -1,
        "longitude": -1
    } 
```    

## APIs

### /setup/...
Routen zum initialen Setzen von für den Serverbetrieb benötigten Variablenwerten
* **/setup/plz:** POST-Request zum initialen Setzen der Postleitzahl auf die Postleitzahl der Gemeinde.\
Aufbau des JSON-Request-Bodies: `{ "plz" : "12345" }`, plz-Wert muss aus 5 Ziffern bestehen
* **/setup/regionalkey:** POST-Request zum initialen Setzen des Regionalschlüssels auf den Regionalschlüssel der Gemeinde.\
Aufbau des JSON-Request-Bodies: `{ "regionalKey": "010560050050" }`, regionalKey-Wert muss aus 12 Ziffern bestehen
* **/setup/geo-coords:** POST-Request zum initialen Setzen von Geokoordinaten der Gemeinde.\
Aufbau des JSON-Request-Bodies: `{ "lat": 53.58, "lon": 9.70 }`, Abtrennung der Koordinaten mit einem Punkt.\
Erhalt der Geokoortinaten z.B. einfach durch Google-Maps möglich.

### /nina/...
Routen zum Abfragen von NINA-Warndaten für den Kreis der Gemeinde über den Regionalschlüssel
* **/nina/call:** GET-Request zum Abfragen aktueller Warndaten.\
Aufbau des JSON-Response-Bodies: 
``` 
[
    {
        "url": "warnung.bund.de Link der Warnmeldung mit MeldungsID",
        "type": "Typ der Warndmeldung",
        "headline": "Titel der Warnmeldung",
        "severity": "Schwere der Warnmeldung"
    },
    ...
]
```
* **/nina/test:** GET-Request zum Abfragen von statisch gesetzten Testdaten im gleichen Format wie **/nina/call**.\
Aufbau des JSON-Response-Bodies:
```
[
  {
    "url": "https://warnung.bund.de/meldungen/mow.DE-NW-BN-SE030-20201014-30-000",
    "type": "ALERT",
    "headline": "Coronavirus; Informationen des Bundesministeriums für  Gesundheit",
    "severity": "Minor"
  },
  {
    "url": "https://warnung.bund.de/meldungen/mow.DE-NW-BN-SE030-20201014-30-000",
    "type": "ALERT",
    "headline": "Coronavirus; Informationen des Bundesministeriums für  Gesundheit",
    "severity": "Minor"
  }
]
```

### /weather/...
Routen zum Abfragen des aktuellen Wetters
* **/weather/call** GET-Request zum Abfragen des aktuellen Wetters und der stündlichen Prognose für die nächsten 24 Stunden.\
Aufbau des JSON-Response-Bodies:
```
  [
    {
      "temp": Temperatur in Grad Celsius,
      "temp_feels_like": Gefühlte Temperatur in Grad Celsius,
      "wind_speed": Windgeschwindigkeit in m/s,
      "wind_deg": Windrichtung in Grad,
      "sky": aktuelle Wetterlage (Clouds, Rain, Snow, ...),
      "weather_icon": Code für das OpenWeather-Icon zum Wetter: https://openweathermap.org/weather-conditions#How-to-get-icon-URL,
      "timestamp": Zeitpunkt für die Wettervorhersage
    },
    {
      "temp": 294.15,
      "temp_feels_like": 293.77,
      "wind_speed": 2.78,
      "wind_deg": 315,
      "sky": "Clouds",
      "weather_icon": "02d",
      "timestamp": "2025-06-20 18:00:00"
    },
    ...
  ]
```
