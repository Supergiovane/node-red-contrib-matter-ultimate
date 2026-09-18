---
layout: default
title: "Commander des appareils Matter ou exposer les vôtres"
lang: fr
section: index
---

Utilisez **Controller** pour commander des appareils Matter réels. Utilisez **Bridge** pour exposer des appareils KNX ou des valeurs Node-RED à une app Matter. Choisissez selon le sens de communication souhaité.

Les nœuds fonctionnent directement avec les messages Node-RED : `msg.topic` identifie la fonction et `msg.payload` contient sa valeur. KNX Ultimate n’est pas nécessaire.

## Installation

Installez le package via **Gérer la palette → Installer**, puis redémarrez Node-RED. Vous pouvez aussi exécuter la commande suivante dans le dossier utilisateur de Node-RED (généralement `~/.node-red`). Node.js 20.18.1 minimum et Node-RED 3.1.1 minimum sont requis. Installez `node-red-contrib-knx-ultimate` seulement pour l’intégration KNX.

```sh
npm install node-red-contrib-matter-ultimate
```

## Utiliser les messages Node-RED

Activez les entrées/sorties et saisissez les noms des topics dans les champs de commande et d’état. Laissez la passerelle KNX vide ; les champs DPT sont masqués car ils ne sont pas nécessaires. Utilisez des topics distincts pour les commandes et les états. La correspondance doit être exacte, sans caractères génériques.

## Mode KNX

> **Vous pouvez aussi utiliser ce package avec KNX Ultimate.** L’intégration est native : installez `node-red-contrib-knx-ultimate` et sélectionnez sa passerelle pour activer le **Mode KNX**. Les mêmes champs utilisent alors des adresses de groupe et des DPT, avec des suggestions du projet ETS importé. Commandes et états passent directement par le bus ; aucun nœud Function intermédiaire n’est nécessaire pour ces correspondances.

| Réglage | Messages Node-RED | Mode KNX |
| --- | --- | --- |
| Passerelle KNX | Laisser vide | Sélectionner la passerelle existante |
| Champs de correspondance | Topics exacts, ex. `living-room/on` | Adresses de groupe, ex. `1/1/1` |
| DPT | Masqués ; non utilisés | Choisir le bon type de point de données |
| Commandes et états | Avec `msg.topic` et `msg.payload` | Par le bus KNX |

En sélectionnant une passerelle, remplacez les topics enregistrés par de vraies adresses de groupe et choisissez les DPT appropriés. Une passerelle sélectionnée mais hors ligne laisse le nœud en Mode KNX. Pour revenir aux messages Node-RED, retirez la passerelle et configurez à nouveau les topics.

## Migrer les flows existants

Sauvegardez tout le dossier utilisateur Node-RED. Gardez **KNX Ultimate 7**, ajoutez le nouveau package et redémarrez. Choisissez **Back up and convert**, vérifiez le flow et faites **Deploy** avant de passer KNX Ultimate à la version 8. Les identifiants, connexions et références de configuration sont conservés. Le JSON téléchargé ne contient ni identifiants protégés ni données d’appairage Matter.

Gardez le même dossier utilisateur Node-RED et ne supprimez pas `knxultimatestorage/matter` : il contient les identités d’appairage et fabrics. Ne réinitialisez pas les appareils uniquement pour migrer. L’export JSON des flows ne sauvegarde pas ces données.
