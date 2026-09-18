---
layout: default
title: "Matter-Geräte steuern oder eigene Geräte bereitstellen"
lang: de
section: index
---

Mit **Controller** steuerst du reale Matter-Geräte. Mit **Bridge** stellst du KNX-Geräte oder Werte aus Node-RED einer Matter-App bereit. Wähle den Node entsprechend dieser Richtung.

Die Nodes arbeiten direkt mit Node-RED-Nachrichten: `msg.topic` bezeichnet die Funktion, `msg.payload` enthält den Wert. KNX Ultimate wird dafür nicht benötigt.

## Installation

Installiere das Paket über **Palette verwalten → Installieren** und starte Node-RED neu. Alternativ kannst du den folgenden Befehl im Node-RED-Benutzerverzeichnis ausführen (normalerweise `~/.node-red`). Erforderlich sind Node.js ab 20.18.1 und Node-RED ab 3.1.1. Installiere `node-red-contrib-knx-ultimate` nur für die KNX-Integration.

```sh
npm install node-red-contrib-matter-ultimate
```

## Node-RED-Nachrichten verwenden

Aktiviere die Ein-/Ausgänge und trage Topic-Namen in die Befehls- und Statusfelder ein. Lass das KNX-Gateway leer; DPT-Felder bleiben ausgeblendet, da sie nicht benötigt werden. Verwende unterschiedliche Topics für Befehle und Status. Die Namen müssen exakt übereinstimmen; Platzhalter werden nicht unterstützt.

## KNX-Modus

> **Du kannst das Paket auch mit KNX Ultimate verwenden.** Die Integration ist nativ: Installiere `node-red-contrib-knx-ultimate` und wähle dessen Gateway, um den **KNX-Modus** zu aktivieren. Dieselben Zuordnungsfelder verwenden dann Gruppenadressen und DPTs mit Vorschlägen aus dem importierten ETS-Projekt. Befehle und Status werden direkt über den Bus übertragen; dafür sind keine zusätzlichen Function-Nodes nötig.

| Einstellung | Node-RED-Nachrichten | KNX-Modus |
| --- | --- | --- |
| KNX-Gateway | Leer lassen | Vorhandenes Gateway auswählen |
| Zuordnungsfelder | Exakte Topics, z. B. `living-room/on` | Gruppenadressen, z. B. `1/1/1` |
| DPT | Ausgeblendet; nicht verwendet | Passenden Datenpunkttyp auswählen |
| Befehle und Status | Über `msg.topic` und `msg.payload` | Über den KNX-Bus |

Ersetze beim Auswählen eines Gateways die gespeicherten Topics durch echte Gruppenadressen und wähle die passenden DPTs. Ist das ausgewählte Gateway offline, bleibt der Node im KNX-Modus. Entferne die Gateway-Auswahl und konfiguriere die Topics erneut, um wieder Node-RED-Nachrichten zu verwenden.

## Vorhandene Flows migrieren

Sichere das vollständige Node-RED-Benutzerverzeichnis. Lass **KNX Ultimate 7** installiert, füge das neue Paket hinzu und starte neu. Wähle **Back up and convert**, prüfe den Flow und führe **Deploy** aus, bevor du KNX Ultimate auf Version 8 aktualisierst. IDs, Verbindungen und Konfigurationsverweise bleiben erhalten. Der JSON-Export enthält keine geschützten Zugangsdaten oder Matter-Kopplungsdaten.

Behalte dasselbe Node-RED-Benutzerverzeichnis und lösche `knxultimatestorage/matter` nicht: Dort liegen Kopplungsidentitäten und Fabrics. Setze Geräte nicht nur wegen der Migration zurück. Ein Flow-JSON-Export sichert diese Daten nicht.
