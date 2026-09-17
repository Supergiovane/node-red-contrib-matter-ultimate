'use strict'

const { normalizeAuthFromAccessTokenQuery } = require('./utils/httpAdminAccessToken')
const { initializeKnx } = require('./utils/optionalKnx')
const registered = new WeakSet()

module.exports = function (RED) {
  initializeKnx(RED)
  require('./utils/legacyMatterHandoff').install(RED)
  RED.plugins.registerPlugin('matterUltimateAdmin', {
    type: 'matter-ultimate-admin',
    onadd () {
      if (registered.has(RED)) return
      registered.add(RED)
      registerRoutes(RED)
    }
  })
}

function registerRoutes (RED) {
  const node = { sysLogger: RED.log }
  RED.httpAdmin.post('/matterUltimate/KNXUltimateLocateMatterDevice', async (req, res) => {
        const respondError = (status, message) => {
          res.status(status).json({ error: message })
        }
        try {
          const rawServerId = req.body?.serverId
          const serverId = typeof rawServerId === 'string' ? rawServerId.trim() : (rawServerId ? String(rawServerId).trim() : '')
          if (!serverId) {
            respondError(400, 'Hue bridge not specified')
            return
          }
          const hueServer = RED.nodes.getNode(serverId)
          if (!hueServer) {
            respondError(404, 'Hue bridge not found')
            return
          }
          if (!hueServer.hueManager || !hueServer.hueManager.hueApiV2 || typeof hueServer.hueManager.hueApiV2.put !== 'function') {
            respondError(503, 'Hue bridge not ready')
            return
          }
          if (hueServer.linkStatus !== 'connected') {
            respondError(503, 'Hue bridge is not connected')
            return
          }
          const rawDeviceId = req.body?.deviceId
          const deviceId = typeof rawDeviceId === 'string' ? rawDeviceId.trim() : (rawDeviceId ? String(rawDeviceId).trim() : '')
          if (!deviceId) {
            respondError(400, 'Hue device not specified')
            return
          }
          const rawDeviceType = req.body?.deviceType
          const deviceType = typeof rawDeviceType === 'string' ? rawDeviceType.trim().toLowerCase() : (rawDeviceType ? String(rawDeviceType).trim().toLowerCase() : '')
          let resourceSnapshot = null
          if (typeof hueServer.getHueResourceSnapshot === 'function') {
            try {
              resourceSnapshot = await hueServer.getHueResourceSnapshot(deviceId, { forceRefresh: false })
            } catch (error) {
              resourceSnapshot = null
            }
          }
          const resolvedType = (resourceSnapshot?.type || deviceType || 'light').toLowerCase()
          const targets = []
          const addTarget = (id, type) => {
            if (!id || !type) return
            const trimmedId = typeof id === 'string' ? id.trim() : String(id).trim()
            const trimmedType = typeof type === 'string' ? type.trim().toLowerCase() : String(type).trim().toLowerCase()
            if (trimmedId === '' || trimmedType === '') return
            targets.push({ id: trimmedId, type: trimmedType })
          }
  
          if (resolvedType === 'grouped_light') {
            let lights = []
            if (typeof hueServer.getAllLightsBelongingToTheGroup === 'function') {
              try {
                lights = await hueServer.getAllLightsBelongingToTheGroup(deviceId)
              } catch (error) {
                lights = []
              }
            }
            if (Array.isArray(lights) && lights.length > 0) {
              lights.forEach((lightResource) => {
                const ownerId = lightResource?.owner?.rid
                if (ownerId) {
                  addTarget(ownerId, 'device')
                } else if (lightResource?.id) {
                  addTarget(lightResource.id, 'light')
                }
              })
            }
            if (targets.length === 0 && typeof hueServer.getFirstLightInGroup === 'function') {
              const firstLight = hueServer.getFirstLightInGroup(deviceId)
              const ownerId = firstLight?.owner?.rid
              if (ownerId) {
                addTarget(ownerId, 'device')
              } else if (firstLight?.id) {
                addTarget(firstLight.id, 'light')
              }
            }
          } else if (resolvedType === 'device') {
            addTarget(deviceId, 'device')
          } else {
            const ownerId = resourceSnapshot?.owner?.rid
            if (ownerId) {
              addTarget(ownerId, 'device')
            } else {
              addTarget(deviceId, resolvedType || 'light')
            }
          }
  
          const uniqueTargets = []
          const seenTargets = new Set()
          targets.forEach((target) => {
            const key = `${target.type}:${target.id}`
            if (!seenTargets.has(key)) {
              seenTargets.add(key)
              uniqueTargets.push(target)
            }
          })
  
          if (uniqueTargets.length === 0) {
            respondError(404, 'Hue device resource unavailable')
            return
          }
  
          const sessionKey = `identify:${deviceId}`
          const maxDurationMs = 600000
          const intervalMs = 1000
          const rawAction = (req.body?.action || '').toString().trim().toLowerCase()
          const explicitAction = rawAction === 'start' || rawAction === 'stop' ? rawAction : 'toggle'
  
          const stopIdentifySession = () => {
            if (typeof hueServer.isHueIdentifySessionActive === 'function' && hueServer.isHueIdentifySessionActive(sessionKey)) {
              if (typeof hueServer.stopHueIdentifySession === 'function') {
                hueServer.stopHueIdentifySession(sessionKey, 'manual')
              }
              return true
            }
            return false
          }
  
          if (explicitAction === 'stop') {
            const wasActive = stopIdentifySession()
            res.json({ status: 'stopped', wasActive })
            return
          }
  
          if (explicitAction !== 'start') {
            if (stopIdentifySession()) {
              res.json({ status: 'stopped', wasActive: true })
              return
            }
          }
  
          if (explicitAction === 'start' && typeof hueServer.isHueIdentifySessionActive === 'function' && hueServer.isHueIdentifySessionActive(sessionKey)) {
            res.json({ status: 'started', alreadyActive: true, expiresInMs: maxDurationMs })
            return
          }
  
          if (typeof hueServer.startHueIdentifySession === 'function') {
            const started = await hueServer.startHueIdentifySession({
              sessionKey,
              targets: uniqueTargets,
              intervalMs,
              maxDurationMs
            })
            if (!started) {
              respondError(500, 'Unable to start locate session')
              return
            }
            res.json({ status: 'started', expiresInMs: maxDurationMs })
            return
          }
          const identifyPayload = { identify: { action: 'identify' } }
          for (const target of uniqueTargets) {
            await hueServer.hueManager.hueApiV2.put(`/resource/${target.type}/${target.id}`, identifyPayload)
          }
          res.json({ status: 'started', expiresInMs: 0 })
        } catch (error) {
          try { RED.log.error(`KNXUltimate LocateHueDevice error: ${error.message}`) } catch (err) { }
          res.status(500).json({ error: error.message })
        }
      })
  
  RED.httpAdmin.get('/matterUltimate/KNXUltimateMatterGetNodes', RED.auth.needsPermission('matter-ultimate-config.read'), (req, res) => {
        try {
          const matterServer = RED.nodes.getNode(req.query.serverId)
          if (matterServer === null || matterServer === undefined) {
            res.json({ error: 'PLEASE DEPLOY FIRST: then try again.' })
            return
          }
          res.json({ devices: matterServer.getCommissionedNodesDetails() })
        } catch (error) {
          RED.log.error(`Err matterUltimate/KNXUltimateMatterGetNodes: ${error.message}`)
          res.json({ error: error.message })
        }
      })
  
  RED.httpAdmin.get('/matterUltimate/KNXUltimateMatterGetStructure', RED.auth.needsPermission('matter-ultimate-config.read'), (req, res) => {
        try {
          const matterServer = RED.nodes.getNode(req.query.serverId)
          if (matterServer === null || matterServer === undefined) {
            res.json({ error: 'PLEASE DEPLOY FIRST: then try again.' })
            return
          }
          res.json(matterServer.getNodeStructure(req.query.nodeId))
        } catch (error) {
          RED.log.error(`Err matterUltimate/KNXUltimateMatterGetStructure: ${error.message}`)
          res.json({ error: error.message })
        }
      })
  
  RED.httpAdmin.get('/matterUltimate/KNXUltimateMatterPairProgress', RED.auth.needsPermission('matter-ultimate-config.read'), (req, res) => {
        try {
          const matterServer = RED.nodes.getNode(req.query.serverId)
          if (matterServer === null || matterServer === undefined) {
            res.json({ active: false, percent: 0, error: 'PLEASE DEPLOY FIRST: then try again.' })
            return
          }
          res.json(matterServer.getCommissioningProgress(req.query.operationId))
        } catch (error) {
          RED.log.error(`Err matterUltimate/KNXUltimateMatterPairProgress: ${error.message}`)
          res.json({ active: false, percent: 0, error: error.message })
        }
      })
  
  RED.httpAdmin.get('/matterUltimate/KNXUltimateMatterPair', RED.auth.needsPermission('matter-ultimate-config.write'), async (req, res) => {
        let matterServer
        const requestedOperationId = String(req.query.operationId || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80)
        // Keep direct callers of the pre-progress endpoint backward compatible. The editor
        // supplies its own id so it can poll; legacy callers receive a server-only id.
        const operationId = requestedOperationId || `server-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
        try {
          matterServer = RED.nodes.getNode(req.query.serverId)
          if (matterServer === null || matterServer === undefined) {
            res.json({ error: 'PLEASE DEPLOY FIRST: then try again.' })
            return
          }
          if (!matterServer.beginCommissioningProgress(operationId)) {
            res.json({ error: 'Another Matter commissioning operation is already in progress.' })
            return
          }
          const nodeId = await matterServer.commission(req.query.code, {
            targetHost: req.query.targetHost,
            onProgress: (progress) => matterServer.reportCommissioningProgress(operationId, progress)
          })
          const requestedName = String(req.query.name || '').trim()
          let renameError = null
          if (requestedName !== '') {
            matterServer.reportCommissioningProgress(operationId, {
              phase: 'naming',
              percent: 99,
              message: 'Applying the requested device name…'
            })
            try {
              await matterServer.renameCommissionedNode(nodeId, requestedName)
            } catch (error) {
              renameError = error.message
              RED.log.warn(`Warn matterUltimate/KNXUltimateMatterPair rename node ${nodeId}: ${error.message}`)
            }
          }
          let device = null
          try {
            device = matterServer.getCommissionedNodesDetails().find((item) => String(item.nodeId) === String(nodeId)) || null
          } catch (error) { /* empty */ }
          matterServer.endCommissioningProgress(operationId, {
            phase: 'complete',
            percent: 100,
            message: 'Matter commissioning completed successfully.'
          })
          res.json({ nodeId, name: device?.name, productName: device?.productName, vendorName: device?.vendorName, renameError })
        } catch (error) {
          try {
            matterServer?.endCommissioningProgress(operationId, {
              phase: 'error',
              message: `Commissioning failed: ${error.message}`
            })
          } catch (progressError) { /* empty */ }
          const targetHost = req.query.targetHost ? ` targetHost=${req.query.targetHost}` : ''
          RED.log.error(`Err matterUltimate/KNXUltimateMatterPair:${targetHost} ${error.stack || error.message}`)
          res.json({ error: error.message })
        }
      })
  
  RED.httpAdmin.get('/matterUltimate/KNXUltimateMatterRename', RED.auth.needsPermission('matter-ultimate-config.write'), async (req, res) => {
        try {
          const matterServer = RED.nodes.getNode(req.query.serverId)
          if (matterServer === null || matterServer === undefined) {
            res.json({ error: 'PLEASE DEPLOY FIRST: then try again.' })
            return
          }
          const nodeId = String(req.query.nodeId || '').trim()
          const name = String(req.query.name || '').trim()
          if (nodeId === '' || name === '') {
            res.json({ error: 'Missing nodeId or name.' })
            return
          }
          await matterServer.renameCommissionedNode(nodeId, name)
          res.json({ status: 'ok', nodeId, name })
        } catch (error) {
          RED.log.error(`Err matterUltimate/KNXUltimateMatterRename: ${error.stack || error.message}`)
          res.json({ error: error.message })
        }
      })
  
  RED.httpAdmin.get('/matterUltimate/KNXUltimateMatterUnpair', RED.auth.needsPermission('matter-ultimate-config.write'), async (req, res) => {
        try {
          const matterServer = RED.nodes.getNode(req.query.serverId)
          if (matterServer === null || matterServer === undefined) {
            res.json({ error: 'PLEASE DEPLOY FIRST: then try again.' })
            return
          }
          await matterServer.removeCommissionedNode(req.query.nodeId)
          res.json({ status: 'ok' })
        } catch (error) {
          RED.log.error(`Err matterUltimate/KNXUltimateMatterUnpair: ${error.message}`)
          res.json({ error: error.message })
        }
      })
  
  const exportMatterStorage = async (req, res, idKey) => {
        try {
          const configNode = RED.nodes.getNode(req.query[idKey])
          if (!configNode || typeof configNode.exportMatterStorage !== 'function') throw new Error('PLEASE DEPLOY FIRST: then try again.')
          const backup = await configNode.exportMatterStorage()
          const stamp = new Date().toISOString().replace(/[:.]/g, '-')
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.setHeader('Content-Disposition', `attachment; filename="knx-ultimate-matter-${backup.kind}-${stamp}.json"`)
          res.send(JSON.stringify(backup, null, 2))
        } catch (error) {
          RED.log.error(`Err Matter storage export: ${error.message}`)
          if (!res.headersSent) res.status(500).json({ error: error.message })
        }
      }
  
  const importMatterStorage = async (req, res, idKey) => {
        try {
          const configNode = RED.nodes.getNode(req.query[idKey])
          if (!configNode || typeof configNode.importMatterStorage !== 'function') throw new Error('PLEASE DEPLOY FIRST: then try again.')
          await configNode.importMatterStorage(req.body)
          res.json({ status: 'ok' })
        } catch (error) {
          RED.log.error(`Err Matter storage import: ${error.message}`)
          res.status(400).json({ error: error.message })
        }
      }
  
  RED.httpAdmin.get('/matterUltimate/KNXUltimateMatterStorageExport', normalizeAuthFromAccessTokenQuery, RED.auth.needsPermission('matter-ultimate-config.read'), (req, res) => exportMatterStorage(req, res, 'serverId'))
  
  RED.httpAdmin.post('/matterUltimate/KNXUltimateMatterStorageImport', RED.auth.needsPermission('matter-ultimate-config.write'), (req, res) => importMatterStorage(req, res, 'serverId'))
  
  RED.httpAdmin.get('/matterUltimate/KNXUltimateMatterBridgeInfo', RED.auth.needsPermission('matter-ultimate-bridge-config.read'), (req, res) => {
        try {
          const bridgeConfig = RED.nodes.getNode(req.query.configId)
          if (bridgeConfig === null || bridgeConfig === undefined || typeof bridgeConfig.getPairingInfo !== 'function') {
            res.json({ error: 'PLEASE DEPLOY FIRST: then try again.' })
            return
          }
          res.json(bridgeConfig.getPairingInfo())
        } catch (error) {
          RED.log.error(`Err matterUltimate/KNXUltimateMatterBridgeInfo: ${error.message}`)
          res.json({ error: error.message })
        }
      })
  
  RED.httpAdmin.get('/matterUltimate/KNXUltimateMatterBridgeReset', RED.auth.needsPermission('matter-ultimate-bridge-config.write'), async (req, res) => {
        try {
          const bridgeConfig = RED.nodes.getNode(req.query.configId)
          if (bridgeConfig === null || bridgeConfig === undefined || typeof bridgeConfig.factoryResetBridge !== 'function') {
            res.json({ error: 'PLEASE DEPLOY FIRST: then try again.' })
            return
          }
          await bridgeConfig.factoryResetBridge()
          res.json({ status: 'ok' })
        } catch (error) {
          RED.log.error(`Err matterUltimate/KNXUltimateMatterBridgeReset: ${error.message}`)
          res.json({ error: error.message })
        }
      })
  
  RED.httpAdmin.get('/matterUltimate/KNXUltimateMatterBridgeStorageExport', normalizeAuthFromAccessTokenQuery, RED.auth.needsPermission('matter-ultimate-bridge-config.read'), (req, res) => exportMatterStorage(req, res, 'configId'))
  
  RED.httpAdmin.post('/matterUltimate/KNXUltimateMatterBridgeStorageImport', RED.auth.needsPermission('matter-ultimate-bridge-config.write'), (req, res) => importMatterStorage(req, res, 'configId'))
}
