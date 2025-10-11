# Graphs Router:
Zum Testen der Graphen-Routen über Curl

## Daten Speichern

**Valide Daten:**
```Bash
curl.exe -X POST "http://localhost:3000/graphs/uploadJson" -H "Content-Type: application/json" -d "@testData/body.json"
```

**Invalide Daten:**
```Bash
curl.exe -X POST "http://localhost:3000/graphs/uploadJson" -H "Content-Type: application/json" -d "@body.json"
```

## Daten laden

Alle verfügbaren Graphen abrufen:
```Bash
curl.exe -s http://localhost:3000/graphs | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

Eine Graphen per ID inkl. Zeilen und Spalten erhalten:
```Bash
curl.exe -s http://localhost:3000/graphs/1 | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

## Daten löschen

```Bash
curl.exe -X DELETE http://localhost:3000/graphs/1
```

# Card Router:

Zum Testen der Card-Routen über Curl

**Valide Wind Kachel:**

## Daten Speichern
```Bash
curl.exe -X POST "http://localhost:3000/cards" -H "Content-Type: application/json" -d "@testData/validWindCard.json"
```

## Daten laden

Alle verfügbaren Cards abrufen:
```Bash
curl.exe -X GET "http://localhost:3000/cards" | ConvertFrom-Json | ConvertTo-Json
```

## Daten löschen

Eine Kachel (kein Graph) löschen
```Bash
curl.exe -X DELETE http://localhost:3000/cards/1
```

# Marker Router

## Daten Speichern
```Bash
curl.exe -X POST "http://localhost:3000/marker/uploadJson" -H "Content-Type: application/json" -d "@testData/validMarker.json"
```

## Daten laden

Alle verfügbaren Cards abrufen:
```Bash
curl.exe -X GET "http://localhost:3000/marker" | ConvertFrom-Json | ConvertTo-Json
```

Einen bestimmen Marker abrufen:
```bash
curl.exe -X GET "http://localhost:3000/marker/1" | ConvertFrom-Json | ConvertTo-Json
```

## Daten löschen

Eine Kachel (kein Graph) löschen
```Bash
curl.exe -X DELETE "http://localhost:3000/marker/1"
```