'use strict'

const decodedInput = Symbol('topic payload')
const emptyGateways = new Set(['', 'none', '_add_', '__none__'])
const isTopicMode = config => emptyGateways.has(String(config.server || '').trim().toLowerCase())

// The same command handlers serve KNX telegrams and already-decoded flow values.
// Topic mode never resolves a DPT or requires the KNX engine.
function readValue (msg, dptlib, dpt) {
  return msg[decodedInput] ? msg.payload : dptlib.fromBuffer(msg.knx.rawValue, dptlib.resolve(dpt))
}

function routeInput (node, config, msg, done, topics) {
  if (!isTopicMode(config) || typeof msg.topic !== 'string' || msg.topic === '') return false
  // Explicit protocol commands keep their existing RAW path, even with a topic.
  if (['on', 'dimming', 'color', 'color_temperature', 'gradient', 'effects', 'recall', 'clusterId', 'function'].some(key => Object.prototype.hasOwnProperty.call(msg, key))) return false
  if (msg.payload && typeof msg.payload === 'object' && (msg.payload.function || msg.payload.fn)) return false
  const destinations = topics || Object.keys(config).filter(key => /^ga/i.test(key)).map(key => config[key])
  if (!destinations.includes(msg.topic)) return false
  try {
    if (!Object.prototype.hasOwnProperty.call(msg, 'payload')) throw new Error('A mapped topic requires msg.payload')
    // This envelope stays internal: no telegram is encoded or sent to KNX.
    node.handleSend({ ...msg, [decodedInput]: true, knx: { destination: msg.topic, event: 'GroupValue_Write' } })
    if (done) done()
  } catch (error) {
    if (done) done(error); else node.error(error, msg)
  }
  return true
}

function publishState (node, config, topic, payload) {
  if (!isTopicMode(config) || !topic || payload === undefined || config.enableNodePINS === 'no' || config.enableNodePINS === false) return false
  node.send({ topic, payload })
  return true
}

module.exports = { isTopicMode, readValue, routeInput, publishState }
