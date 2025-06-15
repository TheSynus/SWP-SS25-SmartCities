Das ist unsere Backend Schnittstelle.

Hier werden alle APIs für die Kommunikation zum Web-Server, 
sowie zur Datenbank als auch nach außen Implementiert.

Es gibt noch ne .env die nicht in git hochgeladen werden sollte.
Eine Vorlage dieser mit allen Variablen ist in .env.example.

Außerdem werden in der config.json Variablen für den Server während des Betriebs gelesen und persistent gespeichert, wie zum Beispiel die Postleitzahl.
Die config.json sollte initial vor der Konfiguration des Server so aussehen: 
    {
        "plz":-1,
        "cityName":"",
        "regionalKey":-1
    } 