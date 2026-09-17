---
layout: default
title: "Control Matter devices or expose your own"
lang: en
section: index
---

Use **Controller** to operate real Matter devices. Use **Bridge** to expose KNX devices or values from a Node-RED flow to a Matter app. These are different directions; choose the node that matches your task.

The nodes work directly with Node-RED messages: `msg.topic` identifies the function and `msg.payload` carries its value. KNX Ultimate is not required.

## Installation

This public beta is available to everyone. Run the command below in your Node-RED user directory (usually `~/.node-red`), then restart Node-RED. Requires Node.js 20.18.1 or newer and Node-RED 3.1.1 or newer. Install `node-red-contrib-knx-ultimate` only if you want the KNX integration.

```sh
npm install node-red-contrib-matter-ultimate@beta
```

## Using Node-RED messages

Enable the input/output pins and enter topic names in the command and state fields. Leave the KNX gateway empty; DPT fields are hidden because they are not needed. Use separate command and state topics. Matching is exact; wildcards are not supported.

## KNX mode

> **You can also use this package with KNX Ultimate.** The integration is native: install `node-red-contrib-knx-ultimate` and select its gateway to enable **KNX mode**. The same mapping fields then use group addresses and DPTs, with suggestions from the imported ETS project. Commands and feedback pass directly over the bus; no intermediate Function node is needed for these mappings.

| Setting | Node-RED messages | KNX mode |
| --- | --- | --- |
| KNX gateway | Leave empty | Select your existing gateway |
| Mapping fields | Exact topics, e.g. `living-room/on` | Group addresses, e.g. `1/1/1` |
| DPT | Hidden; not used | Choose the correct datapoint |
| Commands and feedback | Via `msg.topic` and `msg.payload` | Via the KNX bus |

When selecting a gateway, replace the saved topics with real group addresses and choose the correct DPTs. A selected gateway that is offline leaves the node in KNX mode. To return to Node-RED messages, clear the gateway and configure the topics again.

## Migrating existing flows

Back up the entire Node-RED user directory. Keep **KNX Ultimate 7** installed, add the new package and restart. Choose **Back up and convert**, review the flow and **Deploy** before upgrading KNX Ultimate to 8. IDs, connections and configuration references are preserved. The downloaded flow JSON does not contain protected credentials or Matter pairing storage.

Keep the same Node-RED user directory and do not delete `knxultimatestorage/matter`. It holds pairing identities and fabrics. Do not reset or re-pair devices just for migration. A flow JSON export alone does not back up these data.
