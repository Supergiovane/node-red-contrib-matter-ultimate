---
layout: default
title: "Nodos"
lang: es
section: nodes
---

Los nombres del editor pueden variar según el idioma. Aquí se explica la función de cada nodo.

## Configuración Matter Controller

Crea la configuración desde el nodo Controller, guarda y pulsa Deploy. Ábrela de nuevo y empareja un dispositivo con su código Matter o QR. Selecciona después dispositivo y endpoint en el Controller. Varios nodos pueden compartir la configuración.

## Matter Controller

Selecciona un dispositivo emparejado y su endpoint. El editor muestra las funciones disponibles: encendido, brillo, persianas, termostato o sensores. Activa los pines e introduce los topics para comandos y estados.

Para una luz, asigna el topic de brillo y envía `msg.topic = "living-room/brightness"` con `msg.payload = 60`. El topic de estado publica la respuesta del dispositivo. Para otros tipos usa las funciones que ofrece el editor.

## Configuración Matter Bridge

Crea una configuración bridge, guarda y pulsa Deploy. Ábrela de nuevo para ver el QR/código de emparejamiento y añade el bridge a la app Matter. Los nodos de dispositivo que comparten esta configuración aparecen como dispositivos del bridge.

## Dispositivo Matter Bridge

Selecciona la configuración bridge y el tipo de dispositivo y activa los pines. Los mensajes entrantes en los **topics de estado** actualizan el dispositivo virtual; los comandos de la app Matter salen por los **topics de comando**. En **Modo KNX**, los comandos de la app se escriben en las direcciones de grupo de comando y las direcciones de estado KNX actualizan la app.

Ejemplo: `msg.topic = "living-room/light/status"`, `msg.payload = true` indica que la lámpara está encendida. Un comando de la app sale por `msg.topic = "living-room/light/command"` con payload booleano. Conéctalo a la lógica del dispositivo real y devuelve el estado confirmado.

## Mensajes y valores

On/Off usa `true` / `false`, el brillo un número de 0 a 100 y la temperatura de color Kelvin. Los estados del Controller usan el topic configurado y `msg.payload`. También pueden aparecer eventos RAW: filtra por `msg.topic` para recibir solo los estados asignados.

## Modo KNX

**También puedes usar este paquete con KNX Ultimate.** La integración es nativa: instala `node-red-contrib-knx-ultimate` y selecciona su gateway para activar el **Modo KNX**. Los mismos campos usan entonces direcciones de grupo y DPT, con sugerencias del proyecto ETS importado. Comandos y estados pasan directamente por el bus; no hacen falta nodos Function intermedios para estas asignaciones.

[Ejemplos]({{ "/es/examples.html" | relative_url }})
