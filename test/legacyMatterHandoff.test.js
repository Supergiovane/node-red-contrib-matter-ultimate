const assert = require('assert/strict')
const { EventEmitter } = require('events')
const handoff = require('../nodes/utils/legacyMatterHandoff')

describe('Legacy Matter bridge handoff', () => {
  it('adopts the live engine under the original config id once, without closing it or changing pairing storage', () => {
    const engine = { bridgeStatus: 'running', close () { throw new Error('must not close') } }
    const RED = {
      events: new EventEmitter(),
      nodes: {
        eachNode: visit => [{ id: 'paired-config', type: 'matterbridge-config' }, { id: 'unrelated', type: 'other' }].forEach(visit),
        getNode: id => id === 'paired-config' ? { matterBridge: engine } : undefined
      }
    }
    handoff.install(RED)
    handoff.install(RED)
    assert.equal(RED.events.listenerCount('flows:stopping'), 1)
    RED.events.emit('flows:stopping')
    assert.equal(handoff.takeBridge(RED, 'other'), undefined)
    assert.equal(handoff.takeBridge(RED, 'paired-config'), engine)
    assert.equal(handoff.takeBridge(RED, 'paired-config'), undefined)
  })
})
