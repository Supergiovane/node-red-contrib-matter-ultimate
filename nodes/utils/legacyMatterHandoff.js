'use strict'

// The legacy bridge deliberately survives Deploy. Capture its engine before
// Node-RED calls close(false), then adopt that same engine for the same config ID.
// The saved instance ID/storage path are also unchanged, preserving commissioning.
const states = new WeakMap()
function install (RED) {
  if (states.has(RED)) return
  const bridges = new Map()
  states.set(RED, bridges)
  RED.events.on('flows:stopping', () => {
    bridges.clear()
    RED.nodes.eachNode(config => {
      if (config.type !== 'matterbridge-config') return
      const runtime = RED.nodes.getNode(config.id)
      if (runtime && runtime.matterBridge) bridges.set(config.id, runtime.matterBridge)
    })
  })
}
function takeBridge (RED, id) {
  const bridges = states.get(RED)
  if (!bridges) return undefined
  const engine = bridges.get(id)
  bridges.delete(id)
  return engine
}
module.exports = { install, takeBridge }
