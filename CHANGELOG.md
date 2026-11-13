# Changelog

## 1.0.4

- Matter Bridge: new *Turn-on behavior* option "Ignore only 100% brightness sent immediately after On (Fix Alexa behaviour)". It filters the 100% level Alexa appends to a plain "turn on", while "set to 50%" on a light that is off still reaches the actuator. The existing options are unchanged ([#2](https://github.com/Supergiovane/node-red-contrib-matter-ultimate/issues/2)).
- Every editor notification can now be dismissed.

## 1.0.3

- Preserve the Matter Controller door-lock PIN as a protected Node-RED credential.

## 1.0.2

- Fixed old palette node names

## 1.0.0-beta.2

- First public beta. Matter Controller for real devices and Matter Bridge to expose devices from Node-RED.
- Works with Node-RED messages and offers native integration with KNX Ultimate.
- Guided migration from the old KNX Ultimate nodes, plus documentation and examples in six languages.
