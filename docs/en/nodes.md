---
layout: default
title: "Nodes"
lang: en
section: nodes
---

Node names in the editor may depend on your language. The names below identify their role.

## Matter Controller configuration

Create the configuration from the Controller node, save and Deploy. Reopen it and pair a device using its Matter setup code or QR code. Then select the paired device and endpoint in the Controller node. Several nodes can share one configuration.

## Matter Controller

Select a paired device and endpoint. The editor shows supported controls such as on/off, brightness, covers, thermostats or sensors. Enable the pins and enter the topics for commands and feedback.

For a light, send `msg.topic = "living-room/brightness"` with `msg.payload = 60` after assigning that command topic. The state topic publishes feedback from the device. For other device types, use the functions offered by their editor.

## Matter Bridge configuration

Create a bridge configuration, save and Deploy. Reopen it to display the pairing QR/manual code, then add the bridge in your Matter app. Device nodes sharing this configuration appear as devices of that bridge.

## Matter Bridge device

Select the bridge configuration and a device type, then enable the pins. Input messages on **status topics** update the virtual device; commands from the Matter app leave the output on **command topics**. In **KNX mode**, app commands are written to command group addresses and KNX status addresses update the app.

Example: send `msg.topic = "living-room/light/status"`, `msg.payload = true` to report that a lamp is on. An app command appears as `msg.topic = "living-room/light/command"` with a boolean payload. Connect it to your actual device logic and return the confirmed state.

## Messages and values

On/off uses boolean `true` / `false`; brightness uses a number from 0 to 100. Color temperature uses Kelvin. Controller state mappings publish the configured topic with the value in `msg.payload`. RAW events may also appear: filter by `msg.topic` when you only want mapped states.

## KNX mode

**You can also use this package with KNX Ultimate.** The integration is native: install `node-red-contrib-knx-ultimate` and select its gateway to enable **KNX mode**. The same mapping fields then use group addresses and DPTs, with suggestions from the imported ETS project. Commands and feedback pass directly over the bus; no intermediate Function node is needed for these mappings.

[Examples]({{ "/en/examples.html" | relative_url }})
