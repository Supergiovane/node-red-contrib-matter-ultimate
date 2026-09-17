const { expect } = require('chai')
const assert = require('assert')

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

describe('Matter controller per-device command queues', () => {
  let classMatter

  before(async () => {
    ({ classMatter } = await import('../nodes/utils/matterEngine.mjs'))
  })

  const createManager = (options = {}) => {
    const manager = new classMatter('', 'queue-test', 'test', {
      error: () => {},
      warn: () => {},
      info: () => {}
    }, {
      startQueue: false,
      commandTimeoutMs: 30,
      queuePollMs: 5,
      ...options
    })
    manager.matterConnectionStatus = 'connected'
    manager._findClusterClient = (node) => node.cluster
    return manager
  }

  const commandItem = (nodeId, args) => ({
    nodeId,
    endpointId: 1,
    clusterId: 6,
    kind: 'command',
    name: 'on',
    args
  })

  it('rejects a command for a node that is no longer commissioned', async () => {
    const manager = createManager()
    const errors = []
    manager.on('commandError', (event) => errors.push(event))
    // Reproduce a partially removed device: an old PairedNode object still exists,
    // but the authoritative commissioned-node list no longer contains its Node ID.
    manager.pairedNodes.set('removed', {})
    manager.controller = { getCommissionedNodes: () => [] }

    await assert.rejects(
      manager.writeMatterQueueAdd(commandItem('removed', undefined)),
      /no longer commissioned/
    )

    expect(manager.commandQueue).to.have.length(0)
    expect(errors).to.have.length(1)
    expect(errors[0]).to.include({ code: 'MATTER_NODE_NOT_COMMISSIONED' })
    expect(errors[0].item.nodeId).to.equal('removed')
  })

  it('does not let an unreachable device block another device sharing the controller', async () => {
    const manager = createManager()
    const calls = []
    const errors = []
    manager.on('commandError', (event) => errors.push(event))
    manager.pairedNodes.set('offline', {
      cluster: {
        name: 'OnOff',
        attributes: {},
        commands: { on: () => new Promise(() => {}) }
      }
    })
    manager.pairedNodes.set('live', {
      cluster: {
        name: 'OnOff',
        attributes: {},
        commands: { on: async () => calls.push('live') }
      }
    })

    await manager.writeMatterQueueAdd(commandItem('offline', undefined))
    await manager.writeMatterQueueAdd(commandItem('live', undefined))
    manager._dispatchQueueItems()

    await wait(10)
    expect(calls).to.deep.equal(['live'])
    expect(manager.commandQueue).to.have.length(0)

    await wait(30)
    expect(errors.some((event) => event.code === 'MATTER_COMMAND_TIMEOUT' && event.item.nodeId === 'offline')).to.equal(true)
  })

  it('keeps commands ordered and non-overlapping inside one device lane', async () => {
    const manager = createManager({ commandTimeoutMs: 100 })
    const calls = []
    let releaseFirst
    manager.pairedNodes.set('live', {
      cluster: {
        name: 'OnOff',
        attributes: {},
        commands: {
          on: async ({ sequence }) => {
            calls.push(`start:${sequence}`)
            if (sequence === 1) await new Promise((resolve) => { releaseFirst = resolve })
            calls.push(`end:${sequence}`)
          }
        }
      }
    })

    await manager.writeMatterQueueAdd(commandItem('live', { sequence: 1 }))
    await manager.writeMatterQueueAdd(commandItem('live', { sequence: 2 }))
    manager._dispatchQueueItems()
    manager._dispatchQueueItems()

    await wait(5)
    expect(calls).to.deep.equal(['start:1'])
    expect(manager.commandQueue).to.have.length(1)

    releaseFirst()
    await wait(5)
    manager._dispatchQueueItems()
    await wait(5)

    expect(calls).to.deep.equal(['start:1', 'end:1', 'start:2', 'end:2'])
  })
})
