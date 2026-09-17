---
layout: default
title: "Ejemplos"
lang: es
section: examples
---

## Importar un ejemplo

Descarga un JSON y usa **Menú Node-RED → Importar → seleccionar archivo**. Lee el nodo Comment, selecciona tu bridge/controlador y dispositivo, configura el gateway KNX si corresponde y pulsa Deploy. Los ejemplos no incluyen credenciales ni Inject automáticos. Pulsa Inject manualmente después de configurar.

## Luz: comandos Node-RED

Enciende y regula una luz real con mensajes Node-RED. Observa sus topics de estado en Debug.

<a class="download" download href="{{ "/examples/Matter%20Light%20-%20Topic%20Commands.json" | relative_url }}">Descargar JSON</a> [JSON]({{ "/examples/Matter%20Light%20-%20Topic%20Commands.json" | relative_url }})

`examples/Matter Light - Topic Commands.json`

## Bridge: estados y comandos en el flow

Informa del estado de una luz virtual con Inject y observa los comandos de la app Matter.

<a class="download" download href="{{ "/examples/Matter%20Bridge%20-%20Topic%20State%20and%20Commands.json" | relative_url }}">Descargar JSON</a> [JSON]({{ "/examples/Matter%20Bridge%20-%20Topic%20State%20and%20Commands.json" | relative_url }})

`examples/Matter Bridge - Topic State and Commands.json`

## Luz: KNX nativo

Conecta una luz real directamente a las direcciones KNX de comando y estado. Selecciona tu gateway existente.

<a class="download" download href="{{ "/examples/Matter%20Light%20-%20Native%20KNX.json" | relative_url }}">Descargar JSON</a> [JSON]({{ "/examples/Matter%20Light%20-%20Native%20KNX.json" | relative_url }})

`examples/Matter Light - Native KNX.json`

## Bridge: KNX nativo

Expón una luz KNX a Matter con direcciones distintas para comandos y estados.

<a class="download" download href="{{ "/examples/Matter%20Bridge%20-%20Native%20KNX.json" | relative_url }}">Descargar JSON</a> [JSON]({{ "/examples/Matter%20Bridge%20-%20Native%20KNX.json" | relative_url }})

`examples/Matter Bridge - Native KNX.json`

## Más ejemplos

La carpeta examples también contiene flows por dispositivo. Lee sus nodos Comment antes de Deploy.

[Matter Controller - Semantic Flow Input.json]({{ "/examples/Matter%20Controller%20-%20Semantic%20Flow%20Input.json" | relative_url }})
