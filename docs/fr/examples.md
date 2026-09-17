---
layout: default
title: "Exemples"
lang: fr
section: examples
---

## Importer un exemple

Téléchargez un JSON ci-dessous, puis utilisez **Menu Node-RED → Importer → sélectionner un fichier**. Lisez le nœud Comment, sélectionnez votre bridge/contrôleur et votre appareil, configurez la passerelle KNX si nécessaire, puis faites Deploy. Les exemples ne contiennent ni identifiants ni Inject automatique. Déclenchez les Inject manuellement après la configuration.

## Lumière : commandes Node-RED

Allumez et réglez une lumière avec les messages Node-RED. Observez ses topics d’état dans Debug.

<a class="download" download href="{{ "/examples/Matter%20Light%20-%20Topic%20Commands.json" | relative_url }}">Télécharger le JSON</a> [JSON]({{ "/examples/Matter%20Light%20-%20Topic%20Commands.json" | relative_url }})

`examples/Matter Light - Topic Commands.json`

## Bridge : états et commandes dans le flow

Signalez l’état d’une lumière virtuelle par Inject et observez les commandes de l’app Matter.

<a class="download" download href="{{ "/examples/Matter%20Bridge%20-%20Topic%20State%20and%20Commands.json" | relative_url }}">Télécharger le JSON</a> [JSON]({{ "/examples/Matter%20Bridge%20-%20Topic%20State%20and%20Commands.json" | relative_url }})

`examples/Matter Bridge - Topic State and Commands.json`

## Lumière : KNX natif

Reliez une lumière réelle aux adresses KNX de commande et retour. Choisissez votre passerelle existante.

<a class="download" download href="{{ "/examples/Matter%20Light%20-%20Native%20KNX.json" | relative_url }}">Télécharger le JSON</a> [JSON]({{ "/examples/Matter%20Light%20-%20Native%20KNX.json" | relative_url }})

`examples/Matter Light - Native KNX.json`

## Bridge : KNX natif

Exposez une lumière KNX à Matter avec des adresses distinctes pour commandes et états.

<a class="download" download href="{{ "/examples/Matter%20Bridge%20-%20Native%20KNX.json" | relative_url }}">Télécharger le JSON</a> [JSON]({{ "/examples/Matter%20Bridge%20-%20Native%20KNX.json" | relative_url }})

`examples/Matter Bridge - Native KNX.json`

## Autres exemples

Le dossier examples contient aussi des flows par appareil. Lisez leurs nœuds Comment avant le Deploy.

[Matter Controller - Semantic Flow Input.json]({{ "/examples/Matter%20Controller%20-%20Semantic%20Flow%20Input.json" | relative_url }})
