const assert = require('assert/strict')
const { EventEmitter } = require('events')
const { parseMappings, setupMappedEndpointProfile } = require('../nodes/utils/matterControllerProfiles/mappedEndpoint')
const input = (node, msg) => new Promise((resolve, reject) => node.emit('input', msg, undefined, error => error ? reject(error) : resolve()))

describe('Matter Topic profiles', () => {
  it('accepts topic names without DPTs and routes native thermostat values and feedback', async () => {
    const mappings = [
      { ga: 'room/setpoint', direction: 'command', clusterId: 513, targetKind: 'attribute', target: 'occupiedHeatingSetpoint', endpointId: 1 },
      { ga: 'room/temperature', direction: 'status', clusterId: 513, targetKind: 'attribute', target: 'localTemperature', endpointId: 1 }
    ]
    assert.deepEqual(parseMappings(mappings, true), mappings)
    assert.deepEqual(parseMappings(mappings), [])
    const writes = []; const outputs = []; const errors = []
    const node = new EventEmitter()
    Object.assign(node, {
      id: 'thermostat', matterNodeId: '55', matterEndpointId: 1, status () {}, error: error => errors.push(error), send: msg => outputs.push(msg),
      serverMatter: { addClient () {}, removeClient () {}, matterManager: { writeMatterQueueAdd: item => writes.push(item) } }
    })
    setupMappedEndpointProfile({ log: { error: error => errors.push(error) } }, node, { server: '', enableNodePINS: 'yes', matterMappings: mappings })
    await input(node, { topic: 'room/setpoint', payload: 21.5 })
    assert.equal(writes.length, 1)
    assert.equal(writes[0].name, 'occupiedHeatingSetpoint')
    assert.equal(writes[0].args, 2150)
    node.handleSendMatter({ nodeId: '55', endpointId: 1, clusterId: 513, attributeName: 'localTemperature', value: 2050 })
    assert(outputs.some(msg => msg.topic === 'room/temperature' && msg.payload === 20.5))
    assert.equal(writes.length, 1, 'feedback must not send a command back')
    assert.deepEqual(errors, [])
    await new Promise(resolve => node.emit('close', resolve))
  })

  it('uses status topics to update a bridged device and command topics for Matter output', async () => {
    let Constructor
    const updates = []; const outputs = []
    const bridge = {
      registerDevice () {}, unregisterDevice () {},
      setDeviceState: async (...args) => { updates.push(args); return true },
      getPairingInfo: () => ({ running: true, commissioned: true, fabrics: [{}] })
    }
    const RED = { log: { error () {} }, nodes: {
      registerType: (_type, ctor) => { Constructor = ctor },
      getNode: id => id === 'bridge' ? bridge : undefined,
      createNode (node) {
        const events = new EventEmitter()
        Object.assign(node, { id: 'virtual-light', on: events.on.bind(events), emit: events.emit.bind(events), status () {}, send: msg => outputs.push(msg) })
      }
    } }
    require('../nodes/matterUltimateBridge')(RED)
    const node = new Constructor({ server: '', serverMatterBridge: 'bridge', deviceType: 'onofflight', enableNodePINS: 'yes', gaOnOff: 'room/command', gaOnOffStatus: 'room/status' })
    try {
      await input(node, { topic: 'room/status', payload: true })
      assert.deepEqual(updates[0], ['virtual-light', 'onoff', true])
      node.handleMatterCommand({ fn: 'onoff', value: false })
      assert.equal(outputs[0].topic, 'room/command')
      assert.equal(outputs[0].payload, false)
      // Existing RAW payload takes precedence even if a matching topic is present.
      await input(node, { topic: 'room/status', payload: { function: 'onoff', value: false } })
      assert.deepEqual(updates[1], ['virtual-light', 'onoff', false])
    } finally { await new Promise(resolve => node.emit('close', resolve)) }
  })
})
