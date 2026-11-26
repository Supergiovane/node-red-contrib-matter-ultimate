'use strict'

// Publishes the devices paired with a Matter controller to Cerebrum Ultimate
// (read-only): current states for chat, history, JavaScript routines and MCP.

const { registerCerebrumIntegration } = require('./cerebrumIntegration')

const numberOrNull = value => value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? null : Number(value)
const scaled = (divisor, decimals = 1) => value => {
  const number = numberOrNull(value)
  return number === null ? null : Number((number / divisor).toFixed(decimals))
}
const DOOR_LOCK_STATES = Object.freeze({ 0: 'not_fully_locked', 1: 'locked', 2: 'unlocked', 3: 'unlatched' })

// Cluster id -> the attribute that represents the state Cerebrum shows.
const MATTER_STATE_CLUSTERS = Object.freeze({
  6: { key: 'on_off', kind: 'switch', capability: 'on_off', attribute: 'onOff', read: value => value === null || value === undefined ? null : (value ? 'on' : 'off') },
  8: { key: 'level', kind: 'level', capability: 'level', unit: '%', attribute: 'currentLevel', read: value => numberOrNull(value) === null ? null : Math.round(Number(value) / 254 * 100) },
  69: { key: 'contact', kind: 'contact', capability: 'open_close', attribute: 'stateValue', read: value => value === null || value === undefined ? null : (value ? 'closed' : 'open') },
  1030: { key: 'occupancy', kind: 'motion', capability: 'occupancy', attribute: 'occupancy', read: value => value && typeof value === 'object' ? value.occupied === true : numberOrNull(value) === null ? null : (Number(value) & 1) === 1 },
  1026: { key: 'temperature', kind: 'temperature', capability: 'measurement', unit: '°C', attribute: 'measuredValue', read: scaled(100) },
  1029: { key: 'humidity', kind: 'humidity', capability: 'measurement', unit: '%', attribute: 'measuredValue', read: scaled(100) },
  1024: { key: 'illuminance', kind: 'illuminance', capability: 'measurement', unit: 'lx', attribute: 'measuredValue', read: value => numberOrNull(value) === null ? null : Math.round(Math.pow(10, (Number(value) - 1) / 10000)) },
  258: { key: 'cover', kind: 'cover', capability: 'position', unit: '%', attribute: 'currentPositionLiftPercent100ths', read: scaled(100, 0) },
  257: { key: 'lock', kind: 'lock', capability: 'lock', attribute: 'lockState', read: value => numberOrNull(value) === null ? null : (DOOR_LOCK_STATES[Number(value)] || String(value)) },
  513: { key: 'thermostat', kind: 'thermostat', capability: 'measurement', unit: '°C', attribute: 'localTemperature', read: scaled(100) },
  47: { key: 'battery', kind: 'battery', capability: 'measurement', unit: '%', attribute: 'batPercentRemaining', read: value => numberOrNull(value) === null ? null : Math.round(Number(value) / 2) },
  144: { key: 'power', kind: 'power', capability: 'measurement', unit: 'W', attribute: 'activePower', read: scaled(1000) },
  145: { key: 'energy', kind: 'energy', capability: 'measurement', unit: 'kWh', attribute: 'cumulativeEnergyImported', read: value => scaled(1000000, 3)(value && typeof value === 'object' ? value.energy : value) }
})
const MATTER_SWITCH_CLUSTER_ID = 59

const attributeValue = (cluster, name) => {
  const attribute = (cluster.attributes || []).find(candidate => candidate && candidate.name === name)
  return attribute ? attribute.value : undefined
}

const entityId = (nodeId, endpointId, key) => `${nodeId}/${endpointId}/${key}`

// structure: result of getNodeStructure(); device: one getCommissionedNodesDetails() row.
const buildMatterCerebrumEntities = (device, structure) => {
  const endpoints = structure && Array.isArray(structure.endpoints) ? structure.endpoints : []
  const found = []
  endpoints.forEach(endpoint => {
    ;(endpoint.clusters || []).forEach(cluster => {
      const definition = MATTER_STATE_CLUSTERS[Number(cluster.id)]
      if (!definition) return
      found.push({ endpoint, cluster, definition })
    })
  })
  // Multi-channel devices repeat a cluster on several endpoints.
  const countByKey = found.reduce((counts, item) => ({ ...counts, [item.definition.key]: (counts[item.definition.key] || 0) + 1 }), {})
  const entities = found.map(({ endpoint, cluster, definition }) => {
    const value = definition.read(attributeValue(cluster, definition.attribute))
    const suffix = countByKey[definition.key] > 1 ? ` ${endpoint.endpointId}` : ''
    const entity = {
      id: entityId(device.nodeId, endpoint.endpointId, definition.key),
      nodeId: device.nodeId,
      endpointId: endpoint.endpointId,
      name: `${device.name} ${definition.kind}${suffix}`,
      device: device.name,
      kind: definition.kind,
      capability: definition.capability,
      state: value === undefined ? null : value,
      connection: device.connectionState
    }
    if (definition.unit) entity.unit = definition.unit
    if (definition.key === 'thermostat') {
      const setpoint = scaled(100)(attributeValue(cluster, 'occupiedHeatingSetpoint'))
      if (setpoint !== null) entity.heatingSetpoint = setpoint
    }
    return entity
  })
  entities.push({
    id: `${device.nodeId}/connection`,
    nodeId: device.nodeId,
    name: `${device.name} connection`,
    device: device.name,
    kind: 'connectivity',
    capability: 'status',
    state: device.connectionState || 'disconnected'
  })
  return entities
}

const createMatterCerebrumIntegration = ({ configNode, packageName = 'node-red-contrib-matter-ultimate' } = {}) => {
  const devices = () => {
    try { return configNode.getCommissionedNodesDetails() || [] } catch (error) { return [] }
  }
  const deviceById = nodeId => devices().find(device => String(device.nodeId) === String(nodeId))

  const entities = () => devices().flatMap(device => {
    let structure = null
    try { structure = configNode.getNodeStructure(device.nodeId) } catch (error) { structure = null }
    return buildMatterCerebrumEntities(device, structure)
  })

  const integration = registerCerebrumIntegration({
    adapter: {
      id: 'matter',
      title: 'Matter',
      packageName,
      kind: 'home-automation',
      capabilities: ['switches', 'lights', 'covers', 'locks', 'thermostats', 'sensors', 'energy'],
      access: 'observe',
      operations: [
        { id: 'list-entities', description: 'Matter devices paired with this controller and their current state: on/off, level (%), contact (open/closed), occupancy, temperature (°C), humidity (%), illuminance (lux), blind position (%), lock state, thermostat temperature and setpoint, battery (%), power (W), energy (kWh) and connection.' },
        { id: 'read-entity', description: 'Current state of one Matter device function by its exact id (nodeId/endpointId/function).' }
      ]
    },
    provider: {
      id: `matter-ultimate:${configNode.id}`,
      title: `Matter controller ${configNode.name || ''}`.trim(),
      ownerNodeId: configNode.id,
      isReady: () => configNode.linkStatus === 'connected',
      listEntities: async () => entities(),
      getEntity: async id => entities().find(entity => entity.id === String(id || '')) || null
    },
    minIntervalMs: 60 * 1000
  })

  const emitEntity = (entity, extra = {}) => integration.emit({
    entityId: entity.id,
    eventType: 'state_changed',
    state: entity.state,
    resourceName: entity.name,
    resourceType: 'matter',
    deviceName: entity.device,
    kind: entity.kind,
    capability: entity.capability,
    unit: entity.unit,
    ...extra
  })

  // Attribute change from the controller engine.
  const handleAttributeEvent = event => {
    if (!event || !integration.hasSubscribers()) return
    const definition = MATTER_STATE_CLUSTERS[Number(event.clusterId)]
    if (!definition || event.attributeName !== definition.attribute) return
    const device = deviceById(event.nodeId) || { nodeId: String(event.nodeId), name: `Matter ${event.nodeId}` }
    const id = entityId(device.nodeId, event.endpointId, definition.key)
    let structure = null
    try { structure = configNode.getNodeStructure(device.nodeId) } catch (error) { structure = null }
    // Same name as in listEntities (multi-channel devices carry the endpoint).
    const known = buildMatterCerebrumEntities(device, structure).find(entity => entity.id === id)
    emitEntity({
      ...(known || { id, name: `${device.name} ${definition.kind}`, device: device.name, kind: definition.kind, capability: definition.capability, unit: definition.unit }),
      state: definition.read(event.value)
    })
  }

  // Generic Switch cluster events (button presses).
  const handleClusterEvent = event => {
    if (!event || Number(event.clusterId) !== MATTER_SWITCH_CLUSTER_ID || !integration.hasSubscribers()) return
    const device = deviceById(event.nodeId) || { nodeId: String(event.nodeId), name: `Matter ${event.nodeId}` }
    integration.emit({
      entityId: entityId(device.nodeId, event.endpointId, 'button'),
      eventType: 'button_event',
      state: event.eventName,
      resourceName: `${device.name} button`,
      resourceType: 'matter',
      deviceName: device.name,
      kind: 'button',
      capability: 'event'
    })
  }

  const handleNodeState = (nodeId, state) => {
    if (!integration.hasSubscribers()) return
    const device = deviceById(nodeId) || { nodeId: String(nodeId), name: `Matter ${nodeId}` }
    emitEntity({ id: `${device.nodeId}/connection`, name: `${device.name} connection`, device: device.name, kind: 'connectivity', capability: 'status', state })
  }

  return { handleAttributeEvent, handleClusterEvent, handleNodeState, entities, dispose: integration.dispose, provider: integration.provider }
}

module.exports = { MATTER_STATE_CLUSTERS, buildMatterCerebrumEntities, createMatterCerebrumIntegration }
