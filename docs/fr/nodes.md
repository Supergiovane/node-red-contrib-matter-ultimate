---
layout: default
title: "Nœuds"
lang: fr
section: nodes
---

Les noms dans l’éditeur peuvent varier selon la langue. Voici le rôle de chaque nœud.

## Configuration Matter Controller

Créez la configuration depuis le nœud Controller, enregistrez et faites Deploy. Rouvrez-la et associez un appareil avec son code Matter ou QR. Sélectionnez ensuite l’appareil et son endpoint dans le Controller. Plusieurs nœuds peuvent partager cette configuration.

## Matter Controller

Sélectionnez un appareil associé et son endpoint. L’éditeur affiche les fonctions disponibles : marche/arrêt, luminosité, volets, thermostat ou capteurs. Activez les ports et saisissez les topics des commandes et des états.

Pour une lumière, affectez le topic de commande puis envoyez `msg.topic = "living-room/brightness"` avec `msg.payload = 60`. Le topic d’état transmet le retour de l’appareil. Pour les autres types, utilisez les fonctions proposées par l’éditeur.

## Configuration Matter Bridge

Créez une configuration bridge, enregistrez et faites Deploy. Rouvrez-la pour afficher le QR/code d’appairage et ajoutez le bridge dans l’app Matter. Les nœuds appareil partageant cette configuration deviennent des appareils du bridge.

## Appareil Matter Bridge

Sélectionnez la configuration bridge et le type d’appareil, puis activez les ports. Les entrées sur les **topics d’état** actualisent l’appareil virtuel ; les commandes de l’app Matter sortent sur les **topics de commande**. En **Mode KNX**, les commandes de l’app sont écrites sur les adresses de groupe de commande et les adresses d’état KNX actualisent l’app.

Exemple : `msg.topic = "living-room/light/status"`, `msg.payload = true` signale une lampe allumée. Une commande de l’app sort sur `msg.topic = "living-room/light/command"` avec un payload booléen. Reliez-la à votre appareil réel et renvoyez son état confirmé.

## Messages et valeurs

On/Off utilise `true` / `false`, la luminosité un nombre de 0 à 100 et la température de couleur des Kelvin. Les états du Controller utilisent le topic configuré et `msg.payload`. Des événements RAW peuvent aussi apparaître : filtrez sur `msg.topic` pour ne garder que les états mappés.

## Mode KNX

**Vous pouvez aussi utiliser ce package avec KNX Ultimate.** L’intégration est native : installez `node-red-contrib-knx-ultimate` et sélectionnez sa passerelle pour activer le **Mode KNX**. Les mêmes champs utilisent alors des adresses de groupe et des DPT, avec des suggestions du projet ETS importé. Commandes et états passent directement par le bus ; aucun nœud Function intermédiaire n’est nécessaire pour ces correspondances.

[Exemples]({{ "/fr/examples.html" | relative_url }})
