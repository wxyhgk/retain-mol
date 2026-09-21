import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { buildModuleGraph, checkEditingBoundaries, checkFoundations, checkPureEntries, readImports, runtimeCycles } from './module-graph.mjs'

function fixture(t, files, built = false) {
  const root = mkdtempSync(join(tmpdir(), 'mol-module-graph-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  for (const name of ['core', 'io', 'geometry', 'graph', 'headless']) {
    files[`public/${name}.${built ? 'js' : 'ts'}`] ??= 'export {}'
  }
  for (const [name, source] of Object.entries(files)) {
    const file = join(root, name)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, source)
  }
  return { root, graph: buildModuleGraph(root, { built }) }
}

test('syntax scan distinguishes erased types, value edges and import-like text', () => {
  const imports = readImports(`
    // import React from 'react'
    const text = "export * from 'three'"
    import type { A } from './a'
    import { type B } from './b'
    import { type C, value } from './c'
    export type { D } from './d'
    export { type E } from './e'
    export * from './f'
    type F = import('./g').F
    const lazy = import('./h')
    const unknown = import(variable)
    const common = require('./i')
    import legacy = require('./j')
  `)
  assert.deepEqual(imports.map(({ specifier, typeOnly }) => [specifier, typeOnly]), [
    ['./a', true], ['./b', true], ['./c', false], ['./d', true], ['./e', true],
    ['./f', false], ['./g', true], ['./h', false], [null, false], ['./i', false], ['./j', false],
  ])
})

test('pure entry rejects indirect CSS helpers through alias, index and re-export', t => {
  const { root, graph } = fixture(t, {
    'public/core.ts': "export * from '@/lib/model'",
    'lib/model/index.ts': "export { id } from './identity.ts'",
    'lib/model/identity.ts': "import { clsx } from 'clsx'; export const id = clsx('a')",
  })
  assert.match(checkPureEntries(graph, root).join('\n'), /core: lib\/model\/identity.ts:1.*clsx/)
  assert.match(checkFoundations(graph, root).join('\n'), /foundation module.*clsx/)
})

test('foundation forbids upward type imports while runtime checks ignore them', t => {
  const { root, graph } = fixture(t, {
    'public/core.ts': "export * from '../lib/model/types'",
    'lib/model/types.ts': "export type { State } from '../../store/state'",
    'store/state.ts': "import 'zustand'; export interface State {}",
  })
  assert.deepEqual(checkPureEntries(graph, root), [])
  assert.match(checkFoundations(graph, root).join('\n'), /including type imports/)
})

test('runtime cycle check distinguishes type backreferences and value cycles', t => {
  const { graph } = fixture(t, {
    'a.ts': "export { b } from './b'; import type { C } from './c'",
    'b.ts': "export { a } from './a'",
    'c.ts': "export * from './a'",
  })
  const cycles = runtimeCycles(graph)
  assert.equal(cycles.length, 1)
  assert.deepEqual(cycles[0].map(file => file.split('/').at(-1)).sort(), ['a.ts', 'b.ts'])
})

test('built entry rejects UI dependencies introduced by a shared chunk', t => {
  const { root, graph } = fixture(t, {
    'public/core.js': "export { parse } from '../shared.js'",
    'shared.js': "import 'react/jsx-runtime'; export const parse = x => x",
  }, true)
  assert.match(checkPureEntries(graph, root, { built: true }).join('\n'), /core: shared.js:1.*react\/jsx-runtime/)
})

test('literal dynamic imports are followed and unknown imports fail closed', t => {
  const { root, graph } = fixture(t, {
    'public/io.ts': "export const load = () => import('../lazy')",
    'lazy.ts': "import 'three'; export const other = () => import(name)",
  })
  const errors = checkPureEntries(graph, root).join('\n')
  assert.match(errors, /three/)
  assert.match(errors, /<non-literal import>/)
})

test('pure entries allow declared chemistry dependency and reject local styles', t => {
  const { root, graph } = fixture(t, {
    'public/core.ts': "export { Molecule } from 'openchemlib'",
    'public/geometry.ts': "import '../style.css'",
    'style.css': '.a { color: red }',
  })
  const errors = checkPureEntries(graph, root)
  assert.equal(errors.length, 1)
  assert.match(errors[0], /geometry: non-code runtime dependency style.css/)
})

test('new consumers cannot silently use compatibility barrels', t => {
  const { root, graph } = fixture(t, {
    'lib/types.ts': 'export interface Atom {}',
    'lib/query.ts': "import type { Atom } from './types'",
  })
  assert.match(checkFoundations(graph, root).join('\n'), /compatibility facade "lib\/types.ts"/)
})

test('headless entry rejects indirect store types as well as runtime imports', t => {
  const { root, graph } = fixture(t, {
    'public/headless.ts': "export type { Snapshot } from '../lib/modeling/context'",
    'lib/modeling/context.ts': "export type { Snapshot } from '../../store/state'",
    'store/state.ts': 'export interface Snapshot {}',
  })
  assert.deepEqual(checkPureEntries(graph, root), [])
  const errors = checkEditingBoundaries(graph, root).join('\n')
  assert.match(errors, /detached editing.*including type imports/)
  assert.match(errors, /headless: contract dependency on store\/state.ts/)
})

test('editing sessions cannot import their runtime adapter', t => {
  const { root, graph } = fixture(t, {
    'application/editing/sessions.ts': "import '../../runtime/editingSessions'",
    'runtime/editingSessions.ts': 'export {}',
  })
  assert.match(checkEditingBoundaries(graph, root).join('\n'), /detached editing.*runtime\/editingSessions/)
})

test('headless allows chemistry/schema dependencies but rejects runtime shared chunks', t => {
  const { root, graph } = fixture(t, {
    'public/headless.js': "import 'zod'; import 'openchemlib'; export * from '../shared.js'",
    'shared.js': "import 'zustand'",
  }, true)
  const errors = checkPureEntries(graph, root, { built: true })
  assert.equal(errors.length, 1)
  assert.match(errors[0], /headless: shared.js:1.*zustand/)
})
