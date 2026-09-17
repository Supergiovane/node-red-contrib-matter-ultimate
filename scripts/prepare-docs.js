#!/usr/bin/env node
'use strict'
const fs = require('fs')
const path = require('path')
const root = path.resolve(__dirname, '..')
const source = path.join(root, 'examples')
const destination = path.join(root, 'docs', 'examples')
fs.mkdirSync(destination, { recursive: true })
for (const file of fs.readdirSync(destination)) {
  if (file.endsWith('.json')) fs.unlinkSync(path.join(destination, file))
}
let count = 0
for (const file of fs.readdirSync(source).filter(file => file.endsWith('.json'))) {
  const data = fs.readFileSync(path.join(source, file))
  if (!Array.isArray(JSON.parse(data))) throw new Error('Expected a Node-RED flow array: ' + file)
  fs.writeFileSync(path.join(destination, file), data)
  count++
}
console.log(`Prepared ${count} downloadable examples from examples/`)
