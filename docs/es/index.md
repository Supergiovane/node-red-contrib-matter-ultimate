---
layout: default
title: "Controla dispositivos Matter o expón los tuyos"
lang: es
section: index
---

Usa **Controller** para controlar dispositivos Matter reales. Usa **Bridge** para exponer dispositivos KNX o valores de Node-RED a una app Matter. Elige el nodo según la dirección que necesitas.

Los nodos funcionan directamente con mensajes Node-RED: `msg.topic` identifica la función y `msg.payload` contiene su valor. KNX Ultimate no es necesario.

## Instalación

Esta beta pública está disponible para todos. Ejecuta el siguiente comando en la carpeta de usuario de Node-RED (normalmente `~/.node-red`) y reinicia Node-RED. Requiere Node.js 20.18.1 o posterior y Node-RED 3.1.1 o posterior. Instala `node-red-contrib-knx-ultimate` solo si necesitas la integración KNX.

```sh
npm install node-red-contrib-matter-ultimate@beta
```

## Uso con mensajes Node-RED

Activa los pines de entrada/salida e introduce nombres de topics en los campos de comando y estado. Deja vacío el gateway KNX; los campos DPT se ocultan porque no son necesarios. Usa topics distintos para comandos y estados. La coincidencia debe ser exacta; no se admiten comodines.

## Modo KNX

> **También puedes usar este paquete con KNX Ultimate.** La integración es nativa: instala `node-red-contrib-knx-ultimate` y selecciona su gateway para activar el **Modo KNX**. Los mismos campos usan entonces direcciones de grupo y DPT, con sugerencias del proyecto ETS importado. Comandos y estados pasan directamente por el bus; no hacen falta nodos Function intermedios para estas asignaciones.

| Ajuste | Mensajes Node-RED | Modo KNX |
| --- | --- | --- |
| Gateway KNX | Déjalo vacío | Selecciona el gateway existente |
| Campos de asignación | Topics exactos, p. ej. `living-room/on` | Direcciones de grupo, p. ej. `1/1/1` |
| DPT | Ocultos; no se utilizan | Selecciona el tipo de dato correcto |
| Comandos y estados | Mediante `msg.topic` y `msg.payload` | Por el bus KNX |

Al seleccionar un gateway, sustituye los topics guardados por direcciones de grupo reales y elige los DPT correctos. Si el gateway seleccionado está desconectado, el nodo permanece en Modo KNX. Para volver a los mensajes Node-RED, quita la selección del gateway y configura de nuevo los topics.

## Migrar flows existentes

Haz una copia de toda la carpeta de usuario de Node-RED. Mantén **KNX Ultimate 7**, añade el paquete nuevo y reinicia. Elige **Back up and convert**, revisa el flow y pulsa **Deploy** antes de actualizar KNX Ultimate a la versión 8. Se conservan identificadores, conexiones y referencias de configuración. El JSON descargado no contiene credenciales protegidas ni datos de emparejamiento Matter.

Mantén la misma carpeta de usuario de Node-RED y no borres `knxultimatestorage/matter`: contiene identidades de emparejamiento y fabrics. No restablezcas ni vuelvas a emparejar dispositivos solo por migrar. El JSON de los flows no respalda esos datos.
