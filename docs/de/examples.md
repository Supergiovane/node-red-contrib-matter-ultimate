---
layout: default
title: "Beispiele"
lang: de
section: examples
---

## Beispiel importieren

Lade eine JSON-Datei herunter und wähle **Node-RED-Menü → Importieren → Datei auswählen**. Lies den Comment-Node, wähle deine Bridge bzw. deinen Controller und das Gerät, konfiguriere bei Bedarf das KNX-Gateway und führe Deploy aus. Die Beispiele enthalten keine Zugangsdaten und keine automatischen Injects. Löse Inject erst nach der Einrichtung manuell aus.

## Leuchte: Node-RED-Befehle

Schalte und dimme eine reale Leuchte mit Node-RED-Nachrichten. Prüfe ihre Status-Topics im Debug-Fenster.

<a class="download" download href="{{ "/examples/Matter%20Light%20-%20Topic%20Commands.json" | relative_url }}">JSON herunterladen</a> [JSON]({{ "/examples/Matter%20Light%20-%20Topic%20Commands.json" | relative_url }})

`examples/Matter Light - Topic Commands.json`

## Bridge: Status und Befehle im Flow

Melde den Status einer virtuellen Leuchte per Inject und prüfe Befehle aus der Matter-App.

<a class="download" download href="{{ "/examples/Matter%20Bridge%20-%20Topic%20State%20and%20Commands.json" | relative_url }}">JSON herunterladen</a> [JSON]({{ "/examples/Matter%20Bridge%20-%20Topic%20State%20and%20Commands.json" | relative_url }})

`examples/Matter Bridge - Topic State and Commands.json`

## Leuchte: natives KNX

Verbinde eine reale Leuchte direkt mit KNX-Befehls- und Statusadressen. Wähle dein bestehendes Gateway.

<a class="download" download href="{{ "/examples/Matter%20Light%20-%20Native%20KNX.json" | relative_url }}">JSON herunterladen</a> [JSON]({{ "/examples/Matter%20Light%20-%20Native%20KNX.json" | relative_url }})

`examples/Matter Light - Native KNX.json`

## Bridge: natives KNX

Stelle eine KNX-Leuchte über Matter bereit; verwende getrennte Befehls- und Statusadressen.

<a class="download" download href="{{ "/examples/Matter%20Bridge%20-%20Native%20KNX.json" | relative_url }}">JSON herunterladen</a> [JSON]({{ "/examples/Matter%20Bridge%20-%20Native%20KNX.json" | relative_url }})

`examples/Matter Bridge - Native KNX.json`

## Weitere Beispiele

Der examples-Ordner enthält weitere gerätespezifische Flows. Lies die Comment-Nodes vor dem Deploy.

[Matter Controller - Semantic Flow Input.json]({{ "/examples/Matter%20Controller%20-%20Semantic%20Flow%20Input.json" | relative_url }})
