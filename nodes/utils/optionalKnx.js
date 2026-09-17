'use strict'

const path = require('path')
const { createRequire } = require('module')
let userRequire
let cachedDptlib

function initializeKnx (RED) {
  if (RED.settings && RED.settings.userDir) {
    userRequire = createRequire(path.join(RED.settings.userDir, 'package.json'))
  }
}

function loadDptlib () {
  if (cachedDptlib) return cachedDptlib
  for (const resolver of [userRequire, require].filter(Boolean)) {
    try {
      const packagePath = resolver.resolve('node-red-contrib-knx-ultimate/package.json')
      const candidate = createRequire(packagePath)('knxultimate').dptlib
      if (candidate) { cachedDptlib = candidate; return candidate }
    } catch (error) { /* KNX Ultimate is an optional, separately installed integration. */ }
    try {
      const candidate = resolver('knxultimate').dptlib
      if (candidate) { cachedDptlib = candidate; return candidate }
    } catch (error) { /* The engine may be absent when running without KNX. */ }
  }
  return null
}

const dptlib = new Proxy({}, {
  get (_target, property) {
    const library = loadDptlib()
    if (library) return typeof library[property] === 'function' ? library[property].bind(library) : library[property]
    if (property === 'dpts') return {}
    return () => { throw new Error('KNX integration requires node-red-contrib-knx-ultimate and a configured KNX gateway') }
  }
})

module.exports = { dptlib, initializeKnx, isKnxAvailable: () => Boolean(loadDptlib()) }
