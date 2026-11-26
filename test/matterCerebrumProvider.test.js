const { expect } = require('chai')
const { CEREBRUM_REGISTRY_KEY, getCerebrumRegistry } = require('../nodes/utils/cerebrumIntegration')
const { createMatterCerebrumIntegration } = require('../nodes/utils/matterCerebrumProvider')

const attr = (name, value) => ({ name, value })
const structures = {
  1: {
    nodeId: '1',
    endpoints: [
      { endpointId: 1, clusters: [{ id: 6, name: 'OnOff', attributes: [attr('onOff', true)] }, { id: 8, name: 'LevelControl', attributes: [attr('currentLevel', 127)] }] },
      { endpointId: 2, clusters: [{ id: 6, name: 'OnOff', attributes: [attr('onOff', false)] }] }
    ]
  },
  2: {
    nodeId: '2',
    endpoints: [
      { endpointId: 1, clusters: [{ id: 1026, name: 'TemperatureMeasurement', attributes: [attr('measuredValue', 2150)] }, { id: 69, name: 'BooleanState', attributes: [attr('stateValue', false)] }] },
      { endpointId: 0, clusters: [{ id: 47, name: 'PowerSource', attributes: [attr('batPercentRemaining', 180)] }] }
    ]
  }
}

describe('Matter → Cerebrum integration', () => {
  let configNode
  let integration
  beforeEach(() => {
    delete globalThis[CEREBRUM_REGISTRY_KEY]
    configNode = {
      id: 'controller-1',
      name: 'Casa',
      linkStatus: 'connected',
      getCommissionedNodesDetails: () => [{ nodeId: '1', name: 'Shelly cucina', connectionState: 'connected' }, { nodeId: '2', name: 'Sensore porta', connectionState: 'connected' }, { nodeId: '3', name: 'Presa garage', connectionState: 'disconnected' }],
      getNodeStructure: nodeId => {
        if (!structures[nodeId]) throw new Error('not connected')
        return structures[nodeId]
      }
    }
    integration = createMatterCerebrumIntegration({ configNode })
  })
  afterEach(() => integration.dispose())

  it('registers a read-only provider and removes it on close', () => {
    const registry = getCerebrumRegistry()
    const provider = registry.providers.get('matter-ultimate:controller-1')
    expect(provider).to.include({ adapterId: 'matter', ownerNodeId: 'controller-1' })
    expect(provider.isReady()).to.equal(true)
    expect(provider).to.not.have.property('callService')
    integration.dispose()
    expect(registry.providers.has('matter-ultimate:controller-1')).to.equal(false)
  })

  it('lists device functions with converted values, including unreachable devices', async () => {
    const entities = await integration.provider.listEntities()
    const byId = Object.fromEntries(entities.map(entity => [entity.id, entity]))
    expect(byId['1/1/on_off']).to.include({ name: 'Shelly cucina switch 1', state: 'on' })
    expect(byId['1/2/on_off']).to.include({ name: 'Shelly cucina switch 2', state: 'off' })
    expect(byId['1/1/level']).to.include({ name: 'Shelly cucina level', state: 50, unit: '%' })
    expect(byId['2/1/temperature']).to.include({ state: 21.5, unit: '°C' })
    expect(byId['2/1/contact']).to.include({ state: 'open' })
    expect(byId['2/0/battery']).to.include({ state: 90 })
    expect(byId['3/connection']).to.include({ state: 'disconnected', kind: 'connectivity' })
    expect(await integration.provider.getEntity('2/1/temperature')).to.include({ state: 21.5 })
  })

  it('turns attribute changes, button presses and connection changes into Cerebrum events', () => {
    const events = []
    integration.provider.subscribe(event => events.push(event))
    integration.handleAttributeEvent({ nodeId: '1', endpointId: 2, clusterId: 6, attributeName: 'onOff', value: true })
    integration.handleAttributeEvent({ nodeId: '1', endpointId: 2, clusterId: 6, attributeName: 'onOff', value: true })
    integration.handleAttributeEvent({ nodeId: '1', endpointId: 1, clusterId: 6, attributeName: 'globalSceneControl', value: true })
    integration.handleClusterEvent({ nodeId: '1', endpointId: 3, clusterId: 59, eventName: 'initialPress' })
    integration.handleNodeState('3', 'connected')
    expect(events.map(event => [event.entityId, event.eventType, event.state])).to.deep.equal([
      ['1/2/on_off', 'state_changed', 'on'],
      ['1/3/button', 'button_event', 'initialPress'],
      ['3/connection', 'state_changed', 'connected']
    ])
    expect(events[0]).to.include({ adapterId: 'matter', providerId: 'matter-ultimate:controller-1', resourceName: 'Shelly cucina switch 2', deviceName: 'Shelly cucina' })
  })
})
