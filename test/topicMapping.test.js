const assert = require('assert/strict')
const { EventEmitter } = require('events')
const cloneDeep = require('lodash/cloneDeep')
const mapping = require('../nodes/utils/topicMapping')
const hue = require('../package.json').name.includes('-hue-')

function fixture (extra = {}) {
  let Constructor
  const commands = []
  const outputs = []
  const errors = []
  const bridge = {
    linkStatus: 'connected', addClient () {}, removeClient () {},
    hueManager: { writeHueQueueAdd: (...args) => commands.push(args), deleteHueQueue () {} },
    matterManager: { writeMatterQueueAdd: command => commands.push(command) },
    getAllLightsBelongingToTheGroup: async () => []
  }
  const RED = {
    nodes: {
      registerType: (_type, ctor) => { Constructor = ctor },
      getNode: id => id === 'bridge' ? bridge : undefined,
      createNode (node) {
        const events = new EventEmitter()
        node.id = 'topic-light'
        node.on = events.on.bind(events)
        node.emit = events.emit.bind(events)
        node.context = () => ({ get () {}, set () {} })
        node.status = () => {}
        node.send = msg => outputs.push(msg)
        node.error = error => errors.push(error)
      }
    },
    util: { cloneMessage: cloneDeep },
    log: { error: error => errors.push(error), warn () {}, debug () {}, info () {} },
    httpAdmin: { post () {} }, auth: { needsPermission: () => (_req, _res, next) => next() }
  }
  require(hue ? '../nodes/hueUltimateController' : '../nodes/matterUltimateController')(RED)
  const config = {
    server: '', serverHue: 'bridge', serverMatter: 'bridge', hueControllerType: 'light',
    hueDevice: 'light-1#light', matterNodeId: '123', matterEndpointId: 1,
    GALightSwitch: 'room/on', GALightBrightness: 'room/brightness', GALightKelvin: 'room/kelvin',
    GALightBrightnessState: 'room/brightness/state', enableNodePINS: 'yes',
    specifySwitchOnBrightness: 'no', enableDayNightLighting: 'no', ...extra
  }
  const node = new Constructor(config)
  node.currentHUEDevice = { id: 'light-1', type: 'light', on: { on: true }, dimming: { brightness: 30 }, color_temperature: { mirek: 250 } }
  return { node, commands, outputs, errors, config }
}
const input = (node, msg) => new Promise((resolve, reject) => node.emit('input', msg, undefined, error => error ? reject(error) : resolve()))

describe('Gateway-selected KNX / Topic mapping', () => {
  it('uses only the saved gateway selection, including when that gateway is unavailable', () => {
    for (const server of [undefined, '', 'none', '_ADD_', '__none__']) assert(mapping.isTopicMode({ server }))
    assert(!mapping.isTopicMode({ server: 'selected-but-offline' }))
  })
  it('delivers a cloned native payload without DPT resolution, including after a queue clone', () => {
    const original = { topic: 'room/color', payload: { red: 1, green: 2, blue: 3 } }
    let value
    const noKnx = new Proxy({}, { get () { throw new Error('KNX engine must not be used') } })
    const node = { handleSend: msg => { value = mapping.readValue(cloneDeep(msg), noKnx, ''); msg.payload.red = 9 } }
    assert(mapping.routeInput(node, { GAColor: 'room/color' }, cloneDeep(original)))
    assert.deepEqual(value, original.payload)
  })
  it('keeps unmatched topics and selected-gateway input on the original RAW path', () => {
    const node = { handleSend () { throw new Error('must not dispatch') } }
    assert.equal(mapping.routeInput(node, { GALightSwitch: 'room/on' }, { topic: 'other', payload: true }), false)
    assert.equal(mapping.routeInput(node, { server: 'gateway', GALightSwitch: 'room/on' }, { topic: 'room/on', payload: true }), false)
  })
  it('decodes real bus telegrams through the unchanged DPT path', () => {
    const raw = Buffer.from([1]); let actual
    const dptlib = { resolve: dpt => dpt, fromBuffer: (buffer, dpt) => { actual = [buffer, dpt]; return true } }
    assert.equal(mapping.readValue({ knx: { rawValue: raw } }, dptlib, '1.001'), true)
    assert.deepEqual(actual, [raw, '1.001'])
  })
  it('controls a real light runtime from topic/payload without a gateway or configured DPTs', async () => {
    const f = fixture()
    await input(f.node, { topic: 'room/brightness', payload: 60 })
    assert(f.commands.length > 0)
    if (hue) assert.deepEqual(f.commands[0][1], { dimming: { brightness: 60 }, on: { on: true } })
    else assert(f.commands.some(command => command.name === 'moveToLevelWithOnOff'))
    assert.deepEqual(f.errors, [])
    await new Promise(resolve => f.node.emit('close', resolve))
  })
  it('keeps the existing RAW light input working', async () => {
    const f = fixture()
    await input(f.node, { topic: 'room/on', payload: true, on: { on: false } })
    assert(f.commands.length > 0)
    if (hue) assert.deepEqual(f.commands[0][1], { topic: 'room/on', payload: true, on: { on: false } })
    else assert(f.commands.some(command => command.name === 'off'))
    await new Promise(resolve => f.node.emit('close', resolve))
  })
  it('publishes light states on the configured topic without a bus connection', async () => {
    const f = fixture()
    f.node.updateKNXBrightnessState(42)
    assert.deepEqual(f.outputs, [{ topic: 'room/brightness/state', payload: 42 }])
    assert.deepEqual(f.commands, [])
    await new Promise(resolve => f.node.emit('close', resolve))
  })
  it('does not emit mapped topic states when a KNX gateway is selected', () => {
    const node = { send () { throw new Error('must not publish') } }
    assert.equal(mapping.publishState(node, { server: 'gateway' }, '1/1/1', true), false)
  })
})
