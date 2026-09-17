(function (root, factory) {
  const api = factory()
  if (typeof module === 'object' && module.exports) module.exports = api
  if (root) root.UltimatePackageMigration = api
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict'

  function collect (RED, options) {
    const found = new Map()
    const visit = node => {
      if (node && Object.prototype.hasOwnProperty.call(options.types, node.type)) found.set(node.id, node)
    }
    RED.nodes.eachNode(visit)
    RED.nodes.eachConfig(visit)
    return Array.from(found.values())
  }

  function prepare (RED, options) {
    const nodes = collect(RED, options)
    return nodes.map(node => {
      const type = options.types[node.type]
      const definition = RED.nodes.getType(type)
      if (!definition) throw new Error('Node type is not loaded: ' + type)
      if (!node._def || node.type === 'unknown' || node._def.category === 'unknown') {
        throw new Error('Install KNX Ultimate to load the legacy node before migrating: ' + node.id)
      }
      if (RED.workspaces && RED.workspaces.isLocked && RED.workspaces.isLocked(node.z)) {
        throw new Error('Unlock the flow before migrating: ' + node.z)
      }
      let values = { type, _def: definition, _: definition._ || RED._ }
      if (options.profiles && options.profiles.isLegacyHueNode(node)) {
        const patch = options.profiles.createLocalMigrationPatches([node])[0]
        values = Object.assign(values, { hueControllerType: patch.hueControllerType, inputs: patch.inputs, outputs: patch.outputs })
      }
      return { node, values }
    })
  }

  function apply (RED, options) {
    const prepared = prepare(RED, options)
    if (!prepared.length) return 0
    if (!RED.history || typeof RED.history.push !== 'function') throw new Error('Node-RED undo is unavailable')
    const previousDirty = RED.nodes.dirty()
    // A failed backup must leave the entire editor untouched.
    options.backup.download(RED, { kind: options.kind, environment: options.environment })
    const events = []
    try {
      prepared.forEach(({ node, values }) => {
        const changes = {}
        Object.keys(values).forEach(key => { changes[key] = node[key] })
        events.push({ t: 'edit', node, changes, changed: node.changed, dirty: previousDirty })
        Object.assign(node, values, { changed: true, dirty: true })
        if (RED.editor && RED.editor.validateNode) RED.editor.validateNode(node)
      })
      RED.history.push({ t: 'multi', events })
    } catch (error) {
      events.reverse().forEach(event => {
        Object.assign(event.node, event.changes, { changed: event.changed, dirty: true })
      })
      RED.nodes.dirty(previousDirty)
      RED.view.redraw(true)
      throw error
    }
    RED.nodes.dirty(true)
    prepared.forEach(({ node }) => { if (RED.events) RED.events.emit('nodes:change', node) })
    RED.view.redraw(true)
    return prepared.length
  }

  function install (RED, options) {
    const environment = options.environment || globalThis
    options.environment = environment
    const italian = String(RED.settings.lang || environment.navigator?.language || '').toLowerCase().startsWith('it')
    let timer
    let notice
    let lastSignature = ''
    let disposed = false
    function prompt (force) {
      if (disposed) return
      const nodes = collect(RED, options)
      if (!nodes.length) { if (notice) notice.close(); notice = null; return }
      // Wait until both packages have finished registering their editor types.
      if (nodes.some(node => !RED.nodes.getType(options.types[node.type]))) return
      const signature = nodes.map(node => node.id + ':' + node.type).sort().join('|')
      if (!force && signature === lastSignature) return
      if (notice) notice.close()
      lastSignature = signature
      const message = italian
        ? `${options.title}: trovati ${nodes.length} nodi o configurazioni legacy. Vuoi convertirli? Prima verrà scaricato un backup dei flow. La conversione resta nell’editor fino al Deploy ed è annullabile.`
        : `${options.title}: found ${nodes.length} legacy nodes or configurations. Convert them? A flow backup will download first. Changes stay in the editor until Deploy and can be undone.`
      notice = RED.notify(message, {
        type: 'warning', fixed: true,
        buttons: [{ text: italian ? 'Più tardi' : 'Later', click: () => { notice.close(); notice = null } }, {
          text: italian ? 'Backup e conversione' : 'Back up and convert',
          click: () => {
            try {
              const count = apply(RED, options)
              if (notice) notice.close()
              notice = null
              RED.notify(italian ? `${count} nodi convertiti. Controlla i flow e premi Deploy quando sei pronto.` : `${count} nodes converted. Review the flows and Deploy when ready.`, { type: 'success', fixed: true })
            } catch (error) { RED.notify(error.message, { type: 'error', fixed: true }) }
          }
        }]
      })
    }
    const schedule = () => {
      environment.clearTimeout(timer)
      timer = environment.setTimeout(() => prompt(false), 500)
    }
    const events = ['flows:loaded', 'nodes:add', 'nodes:remove']
    events.forEach(event => RED.events.on(event, schedule))
    const action = options.kind + 'Ultimate:migrate-legacy-nodes'
    if (RED.actions) RED.actions.add(action, () => prompt(true))
    schedule()
    return {
      prompt: () => prompt(true),
      dispose () {
        disposed = true
        environment.clearTimeout(timer)
        events.forEach(event => RED.events.off(event, schedule))
        if (notice) notice.close()
        if (RED.actions && RED.actions.remove) RED.actions.remove(action)
      }
    }
  }
  return { collect, prepare, apply, install }
}))
