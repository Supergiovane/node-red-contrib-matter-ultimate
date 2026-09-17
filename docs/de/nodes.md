---
layout: default
title: "Nodes"
lang: de
section: nodes
---

Die Namen im Editor können je nach Sprache abweichen. Hier wird die Aufgabe jedes Nodes beschrieben.

## Matter-Controller-Konfiguration

Erstelle die Konfiguration im Controller-Node, speichere und führe Deploy aus. Öffne sie erneut und kopple ein Gerät mit seinem Matter-Code oder QR-Code. Wähle anschließend Gerät und Endpunkt im Controller. Mehrere Nodes können dieselbe Konfiguration verwenden.

## Matter Controller

Wähle ein gekoppeltes Gerät und einen Endpunkt. Der Editor zeigt unterstützte Funktionen wie Schalten, Helligkeit, Jalousien, Thermostat oder Sensoren. Aktiviere die Ports und trage Topics für Befehle und Status ein.

Für eine Leuchte ordnest du den Helligkeitsbefehl zu und sendest `msg.topic = "living-room/brightness"` mit `msg.payload = 60`. Das Status-Topic liefert die Rückmeldung. Bei anderen Gerätetypen verwendest du die vom Editor angebotenen Funktionen.

## Matter-Bridge-Konfiguration

Erstelle eine Bridge-Konfiguration, speichere und führe Deploy aus. Öffne sie erneut, um den QR-/Kopplungscode anzuzeigen, und füge die Bridge in deiner Matter-App hinzu. Alle zugehörigen Geräte-Nodes erscheinen als Geräte dieser Bridge.

## Matter-Bridge-Gerät

Wähle Bridge-Konfiguration und Gerätetyp und aktiviere die Ports. Eingaben auf **Status-Topics** aktualisieren das virtuelle Gerät; Befehle der Matter-App erscheinen am Ausgang auf **Befehls-Topics**. Im **KNX-Modus** werden App-Befehle auf Befehls-Gruppenadressen geschrieben; KNX-Statusadressen aktualisieren die App.

Beispiel: `msg.topic = "living-room/light/status"`, `msg.payload = true` meldet eine eingeschaltete Leuchte. App-Befehle erscheinen als `msg.topic = "living-room/light/command"` mit booleschem Payload. Verbinde den Ausgang mit der realen Gerätesteuerung und melde den bestätigten Status zurück.

## Nachrichten und Werte

Ein/Aus verwendet `true` / `false`, Helligkeit eine Zahl von 0 bis 100 und Farbtemperatur Kelvin. Statusmeldungen des Controllers enthalten das konfigurierte Topic und den Wert in `msg.payload`. Es können zusätzlich RAW-Ereignisse erscheinen; filtere nach `msg.topic`, wenn du nur zugeordnete Statusmeldungen brauchst.

## KNX-Modus

**Du kannst das Paket auch mit KNX Ultimate verwenden.** Die Integration ist nativ: Installiere `node-red-contrib-knx-ultimate` und wähle dessen Gateway, um den **KNX-Modus** zu aktivieren. Dieselben Zuordnungsfelder verwenden dann Gruppenadressen und DPTs mit Vorschlägen aus dem importierten ETS-Projekt. Befehle und Status werden direkt über den Bus übertragen; dafür sind keine zusätzlichen Function-Nodes nötig.

[Beispiele]({{ "/de/examples.html" | relative_url }})
