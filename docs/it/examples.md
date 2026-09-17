---
layout: default
title: "Esempi"
lang: it
section: examples
---

## Importare un esempio

Scarica un JSON qui sotto, poi usa **Menu Node-RED → Importa → seleziona un file**. Leggi il nodo Comment, seleziona il tuo bridge/controller e il dispositivo, imposta il gateway KNX quando richiesto e fai Deploy. Gli esempi non contengono credenziali né Inject automatici. Premi Inject manualmente solo dopo la configurazione.

## Luce: comandi Node-RED

Accendi e regola una luce reale con i messaggi Node-RED. Guarda in Debug i topic di stato configurati.

<a class="download" download href="{{ "/examples/Matter%20Light%20-%20Topic%20Commands.json" | relative_url }}">Scarica JSON</a> [JSON]({{ "/examples/Matter%20Light%20-%20Topic%20Commands.json" | relative_url }})

`examples/Matter Light - Topic Commands.json`

## Bridge: stati e comandi nel flow

Invia lo stato di una luce virtuale con Inject e guarda i comandi ricevuti dall’app Matter.

<a class="download" download href="{{ "/examples/Matter%20Bridge%20-%20Topic%20State%20and%20Commands.json" | relative_url }}">Scarica JSON</a> [JSON]({{ "/examples/Matter%20Bridge%20-%20Topic%20State%20and%20Commands.json" | relative_url }})

`examples/Matter Bridge - Topic State and Commands.json`

## Luce: KNX nativo

Collega una luce reale direttamente agli indirizzi KNX di comando e feedback. Seleziona il gateway esistente.

<a class="download" download href="{{ "/examples/Matter%20Light%20-%20Native%20KNX.json" | relative_url }}">Scarica JSON</a> [JSON]({{ "/examples/Matter%20Light%20-%20Native%20KNX.json" | relative_url }})

`examples/Matter Light - Native KNX.json`

## Bridge: KNX nativo

Esponi una luce KNX a Matter usando indirizzi distinti per comandi e stati.

<a class="download" download href="{{ "/examples/Matter%20Bridge%20-%20Native%20KNX.json" | relative_url }}">Scarica JSON</a> [JSON]({{ "/examples/Matter%20Bridge%20-%20Native%20KNX.json" | relative_url }})

`examples/Matter Bridge - Native KNX.json`

## Altri esempi

La cartella examples contiene anche flow specifici per dispositivo. Leggi i nodi Comment prima del Deploy.

[Matter Controller - Semantic Flow Input.json]({{ "/examples/Matter%20Controller%20-%20Semantic%20Flow%20Input.json" | relative_url }})
