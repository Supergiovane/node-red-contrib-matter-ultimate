const assert = require('assert/strict')
const fs = require('fs')
const path = require('path')
const migration = require('../resources/ultimatePackageMigration')
const types = require('../resources/legacyTypeMap.json')
const pkg = require('../package.json')
const hue = pkg.name.includes('-hue-')
const profiles = hue ? require('../resources/hueControllerMigration') : null
const kind = hue ? 'hue' : 'matter'

function harness () {
  const fixtures = Object.keys(types).map((type, i) => ({
    id: 'node-' + i, type, _def: { category: type.endsWith('config') ? 'config' : 'deprecated' },
    name: 'Original', z: 'tab', x: 100, y: 200, wires: [['target']], inputs: 0, outputs: 1,
    server: 'knx-gateway', serverHue: 'node-0', serverMatter: 'node-0',
    credentials: { username: 'local-test', has_password: true }, hueDevice: 'light-id#light'
  }))
  let dirty = false
  const events = []
  const calls = []
  const definitions = Object.fromEntries(Object.values(types).map(type => [type, { category: type.endsWith('config') ? 'config' : kind }]))
  const RED = {
    nodes: {
      eachNode: fn => fixtures.filter(n => n._def.category !== 'config').forEach(fn),
      eachConfig: fn => fixtures.filter(n => n._def.category === 'config').forEach(fn),
      getType: type => definitions[type],
      dirty: value => value === undefined ? dirty : (dirty = value)
    },
    history: { push: event => events.push(event) },
    editor: { validateNode: () => calls.push('validate') },
    events: { emit: () => {} },
    view: { redraw: () => {} },
    workspaces: { isLocked: () => false }
  }
  const options = { types, kind, profiles, backup: { download: () => calls.push('backup') } }
  return { RED, options, fixtures, definitions, calls, events }
}

describe('Standalone package migration', () => {
  it('ships distinct registered types and all public runtime/editor entry points', () => {
    for (const [type, file] of Object.entries(pkg['node-red'].nodes)) {
      assert(!Object.hasOwn(types, type), type + ' collides with a legacy node')
      assert(fs.existsSync(path.join(__dirname, '..', file)))
      assert(fs.existsSync(path.join(__dirname, '..', file.replace(/\.js$/, '.html'))))
    }
    for (const target of Object.values(types)) assert(Object.hasOwn(pkg['node-red'].nodes, target))
    assert.equal(pkg.peerDependenciesMeta['node-red-contrib-knx-ultimate'].optional, true)
  })
  it('backs up before converting every supported node and shared config, preserving identity and credentials', () => {
    const h = harness()
    const before = h.fixtures.map(node => ({ ...node }))
    assert.equal(migration.apply(h.RED, h.options), before.length)
    assert.equal(h.calls[0], 'backup')
    h.fixtures.forEach((node, i) => {
      assert.equal(node.type, types[before[i].type])
      for (const key of ['id', 'name', 'z', 'x', 'y', 'wires', 'server', 'serverHue', 'serverMatter', 'credentials', 'inputs', 'outputs']) {
        assert.equal(node[key], before[i][key], key)
      }
      if (profiles && profiles.isLegacyHueNode(before[i])) assert(node.hueControllerType)
    })
    assert.equal(h.events.length, 1)
    assert.equal(h.RED.nodes.dirty(), true)
    // Node-RED's multi-edit history restores the original type and definition.
    h.events[0].events.forEach(event => Object.assign(event.node, event.changes))
    h.fixtures.forEach((node, i) => {
      assert.equal(node.type, before[i].type)
      assert.equal(node._def, before[i]._def)
    })
  })
  it('does not change nodes if the backup fails', () => {
    const h = harness()
    const original = h.fixtures.map(node => node.type)
    h.options.backup.download = () => { throw new Error('download failed') }
    assert.throws(() => migration.apply(h.RED, h.options), /download failed/)
    assert.deepEqual(h.fixtures.map(n => n.type), original)
    assert.equal(h.events.length, 0)
    assert.equal(h.RED.nodes.dirty(), false)
  })
  it('rejects locked flows or missing target types before downloading or mutating', () => {
    for (const scenario of ['locked', 'missing']) {
      const h = harness()
      if (scenario === 'locked') h.RED.workspaces.isLocked = () => true
      else delete h.definitions[Object.values(types)[0]]
      assert.throws(() => migration.apply(h.RED, h.options))
      assert.equal(h.calls.length, 0)
      assert.equal(h.events.length, 0)
    }
  })
  it('rolls back the current node as well as previous nodes if validation fails', () => {
    const h = harness()
    const before = h.fixtures.map(node => ({ ...node }))
    let count = 0
    h.RED.editor.validateNode = () => { if (++count === 2) throw new Error('validation failed') }
    assert.throws(() => migration.apply(h.RED, h.options), /validation failed/)
    h.fixtures.forEach((node, i) => {
      assert.equal(node.type, before[i].type)
      assert.equal(node._def, before[i]._def)
    })
    assert.equal(h.RED.nodes.dirty(), false)
    assert.equal(h.events.length, 0)
  })
  it('ignores unrelated or already migrated nodes', () => {
    const h = harness()
    migration.apply(h.RED, h.options)
    assert.equal(migration.collect(h.RED, h.options).length, 0)
    assert.equal(migration.apply(h.RED, h.options), 0)
    assert.equal(h.calls.filter(call => call === 'backup').length, 1)
  })
  it('only converts after the explicit button click and supports postponing', () => {
    const h = harness()
    const pending = []
    const notices = []
    const handlers = new Map()
    h.RED.settings = { lang: 'it' }
    h.RED.events = { on: (name, fn) => handlers.set(name, fn), off: name => handlers.delete(name), emit: () => {} }
    h.RED.notify = (text, options) => { notices.push({ text, options }); return { close () {} } }
    h.options.environment = { setTimeout: fn => { pending.push(fn); return pending.length }, clearTimeout () {} }
    h.options.title = kind
    const instance = migration.install(h.RED, h.options)
    pending.shift()()
    assert.equal(h.calls.length, 0)
    assert.equal(notices.length, 1)
    notices[0].options.buttons[0].click()
    assert.equal(h.calls.length, 0)
    instance.prompt()
    notices[1].options.buttons[1].click()
    assert.equal(h.calls[0], 'backup')
    assert.equal(h.events.length, 1)
    instance.dispose()
    assert.equal(handlers.size, 0)
  })
})
