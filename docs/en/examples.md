---
layout: default
title: "Examples"
lang: en
section: examples
---

## Import an example

Download a JSON file below, then use **Node-RED menu → Import → select a file**. Read the Comment node, select your own bridge/controller and device, configure the KNX gateway when required, then Deploy. Examples contain no credentials and no automatic Injects. Click Inject manually only after setup.

## Light: Node-RED commands

Switch and dim a real light with Node-RED messages. Inspect the configured state topics in Debug.

<a class="download" download href="{{ "/examples/Matter%20Light%20-%20Topic%20Commands.json" | relative_url }}">Download JSON</a> [JSON]({{ "/examples/Matter%20Light%20-%20Topic%20Commands.json" | relative_url }})

`examples/Matter Light - Topic Commands.json`

## Bridge: states and commands in the flow

Report a virtual light’s state from Inject; inspect commands arriving from the Matter app.

<a class="download" download href="{{ "/examples/Matter%20Bridge%20-%20Topic%20State%20and%20Commands.json" | relative_url }}">Download JSON</a> [JSON]({{ "/examples/Matter%20Bridge%20-%20Topic%20State%20and%20Commands.json" | relative_url }})

`examples/Matter Bridge - Topic State and Commands.json`

## Light: native KNX

Connect a real light directly to KNX command and feedback addresses. Select your existing gateway.

<a class="download" download href="{{ "/examples/Matter%20Light%20-%20Native%20KNX.json" | relative_url }}">Download JSON</a> [JSON]({{ "/examples/Matter%20Light%20-%20Native%20KNX.json" | relative_url }})

`examples/Matter Light - Native KNX.json`

## Bridge: native KNX

Expose a KNX light to Matter using separate command and status addresses.

<a class="download" download href="{{ "/examples/Matter%20Bridge%20-%20Native%20KNX.json" | relative_url }}">Download JSON</a> [JSON]({{ "/examples/Matter%20Bridge%20-%20Native%20KNX.json" | relative_url }})

`examples/Matter Bridge - Native KNX.json`

## More examples

The examples folder also contains device-specific flows. Open their Comment nodes before deploying.

[Matter Controller - Semantic Flow Input.json]({{ "/examples/Matter%20Controller%20-%20Semantic%20Flow%20Input.json" | relative_url }})
