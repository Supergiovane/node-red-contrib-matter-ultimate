---
layout: default
title: "Nodi"
lang: it
section: nodes
---

I nomi nell’editor possono cambiare secondo la lingua. Qui descriviamo il ruolo di ciascun nodo.

## Configurazione Matter Controller

Crea la configurazione dal nodo Controller, salva e fai Deploy. Riaprila e abbina un dispositivo con il suo codice Matter o QR. Seleziona poi il dispositivo abbinato e l’endpoint nel nodo Controller. Più nodi possono condividere la configurazione.

## Matter Controller

Seleziona un dispositivo abbinato e il suo endpoint. L’editor mostra i controlli supportati: accensione, luminosità, tapparelle, termostato o sensori. Abilita i pin e inserisci i topic per comandi e stati.

Per una luce, invia `msg.topic = "living-room/brightness"` con `msg.payload = 60` dopo aver assegnato quel topic di comando. Il topic di stato pubblica il feedback del dispositivo. Per gli altri tipi usa le funzioni proposte dall’editor.

## Configurazione Matter Bridge

Crea una configurazione bridge, salva e fai Deploy. Riaprila per visualizzare QR/codice di abbinamento e aggiungi il bridge nell’app Matter. I nodi dispositivo che condividono questa configurazione appaiono come dispositivi del bridge.

## Dispositivo Matter Bridge

Seleziona la configurazione bridge e il tipo di dispositivo, poi abilita i pin. I messaggi in ingresso sui **topic di stato** aggiornano il dispositivo virtuale; i comandi dell’app Matter escono sui **topic di comando**. In **Modalità KNX**, i comandi dell’app vengono scritti sugli indirizzi di gruppo di comando e gli indirizzi di stato KNX aggiornano l’app.

Esempio: invia `msg.topic = "living-room/light/status"`, `msg.payload = true` per comunicare che una lampada è accesa. Un comando dell’app esce come `msg.topic = "living-room/light/command"` con payload booleano. Collegalo alla logica del dispositivo reale e restituisci lo stato confermato.

## Messaggi e valori

Per On/Off usa i booleani `true` / `false`; per la luminosità un numero da 0 a 100. La temperatura colore usa Kelvin. Le mappature di stato del Controller pubblicano il topic configurato e il valore in `msg.payload`. Possono comparire anche eventi RAW: filtra per `msg.topic` per ricevere soltanto gli stati mappati.

## Modalità KNX

**Puoi usare il package anche con KNX Ultimate.** L’integrazione è nativa: installa `node-red-contrib-knx-ultimate` e seleziona il suo gateway per attivare la **Modalità KNX**. Gli stessi campi di mappatura usano quindi indirizzi di gruppo e DPT, con suggerimenti dal progetto ETS importato. Comandi e stati passano direttamente sul bus; per queste mappature non servono nodi Function intermedi.

[Esempi]({{ "/it/examples.html" | relative_url }})
