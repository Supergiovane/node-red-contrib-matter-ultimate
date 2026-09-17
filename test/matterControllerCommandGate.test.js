const { expect } = require('chai')
const { EventEmitter } = require('events')
const fs = require('fs')
const path = require('path')
const { setupMatterControllerCommandGate } = require('../nodes/utils/matterControllerCommandGate')
const { setupMappedEndpointProfile } = require('../nodes/utils/matterControllerProfiles/mappedEndpoint')
const { CLUSTER } = require('../nodes/utils/matterKnxConverter')

describe('Matter Controller unavailable-device command gate', () => {
  it('latches the error and clears it explicitly or after reconnection', () => {
    const statuses = []
    const node = { status: (status) => statuses.push(status) }
    setupMatterControllerCommandGate(node)

    node.blockMatterCommands('Matter device unavailable')

    expect(node.isMatterCommandBlocked()).to.equal(true)
    expect(statuses.at(-1)).to.deep.equal({
      fill: 'red',
      shape: 'ring',
      text: 'Matter device unavailable'
    })

    expect(node.clearMatterCommandBlock('connected')).to.equal(true)
    expect(node.isMatterCommandBlocked()).to.equal(false)
    expect(statuses.at(-1)).to.deep.equal({
      fill: 'green',
      shape: 'ring',
      text: 'Matter device reconnected'
    })
  })

  it('ignores KNX commands and status repainting while latched, then resumes', () => {
    const statuses = []
    const matterWrites = []
    const node = new EventEmitter()
    Object.assign(node, {
      id: 'latched-mapped-node',
      matterNodeId: '55',
      matterEndpointId: 2,
      status: (status) => statuses.push(status),
      send: () => {},
      serverKNX: { addClient: () => {}, removeClient: () => {} },
      serverMatter: {
        addClient: () => {},
        removeClient: () => {},
        matterManager: {
          writeMatterQueueAdd: (item) => matterWrites.push(item),
          getCachedAttribute: () => undefined
        }
      }
    })
    setupMatterControllerCommandGate(node)
    setupMappedEndpointProfile({ log: { error: () => {} } }, node, {
      matterMappings: JSON.stringify([{
        direction: 'command',
        ga: '1/2/1',
        dpt: '1.001',
        endpointId: 2,
        clusterId: CLUSTER.ON_OFF,
        targetKind: 'command',
        target: 'on'
      }]),
      enableNodePINS: 'no'
    })
    const message = { knx: { destination: '1/2/1', event: 'GroupValue_Write', rawValue: Buffer.from([1]) } }

    node.blockMatterCommands('Matter device unavailable')
    const latchedStatus = statuses.at(-1)
    node.setNodeStatus({ fill: 'green', shape: 'dot', text: 'KNX telegram' })
    node.handleSend(message)

    expect(matterWrites).to.have.length(0)
    expect(statuses.at(-1)).to.deep.equal(latchedStatus)

    node.clearMatterCommandBlock('connected')
    node.handleSend(message)
    expect(matterWrites).to.have.length(1)
  })

  it('wires editor acknowledgement and automatic connected-state recovery', () => {
    const root = path.join(__dirname, '..', 'nodes')
    const editor = fs.readFileSync(path.join(root, 'matterUltimateController.html'), 'utf8')
    const runtime = fs.readFileSync(path.join(root, 'matterUltimateController.js'), 'utf8')
    const config = fs.readFileSync(path.join(root, 'matter-ultimate-config.js'), 'utf8')

    expect(editor).to.include('matterUltimate/KNXUltimateMatterControllerEnable')
    expect(runtime).to.include("clearMatterCommandBlock('editor')")
    expect(config).to.include("_oClient.clearMatterCommandBlock?.('connected')")
    expect(config).to.include("_oClient.blockMatterCommands?.('Matter device unavailable')")
  })
})
