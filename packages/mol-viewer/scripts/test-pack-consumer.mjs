import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'

const packageDir = resolve(import.meta.dirname, '..')
const workspaceDir = resolve(packageDir, '../..')
const consumerDir = mkdtempSync(join(tmpdir(), 'retainmol-pack-consumer-'))

function run(command, args, cwd = consumerDir) {
  execFileSync(command, args, { cwd, stdio: 'inherit' })
}

try {
  const packOutput = execFileSync(
    'npm',
    ['pack', '--json', '--pack-destination', consumerDir],
    { cwd: packageDir, encoding: 'utf8' },
  )
  const [{ filename }] = JSON.parse(packOutput)
  const tarball = join(consumerDir, filename)

  writeFileSync(join(consumerDir, 'package.json'), JSON.stringify({
    name: 'retainmol-pack-consumer',
    private: true,
    type: 'module',
    dependencies: {
      '@retainmol/mol-viewer': `file:${tarball}`,
      react: '^19.2.5',
      'react-dom': '^19.2.5',
      three: '^0.184.0'
    },
    devDependencies: {
      '@types/react': '^19.2.14',
      '@types/react-dom': '^19.2.3',
      '@types/three': '^0.184.0'
    }
  }, null, 2))
  run('npm', ['install', '--ignore-scripts', '--no-package-lock', '--no-audit', '--no-fund'])

  // Separate processes prevent the complete viewer consumer from preloading a forbidden dependency.
  writeFileSync(join(consumerDir, 'pure-import-guard.mjs'), `
const blocked = ['react', 'react-dom', 'three', 'zustand', 'zundo', 'clsx', 'tailwind-merge']
export function resolve(specifier, context, nextResolve) {
  if (blocked.some(dep => specifier === dep || specifier.startsWith(dep + '/'))) {
    throw new Error('Pure entry loaded ' + specifier + ' from ' + context.parentURL)
  }
  return nextResolve(specifier, context)
}
`)
  writeFileSync(join(consumerDir, 'pure-consumer.mjs'), `
import assert from 'node:assert/strict'
import * as nodeModule from 'node:module'
import { resolve } from './pure-import-guard.mjs'

if (nodeModule.registerHooks) nodeModule.registerHooks({ resolve })
else nodeModule.register('./pure-import-guard.mjs', import.meta.url)

const name = process.argv[2]
const api = await import('@retainmol/mol-viewer/' + name)
const molecule = { atoms: [{ id: 'a', symbol: 'C', x: 0, y: 0, z: 0 }], bonds: [] }
if (name === 'core') {
  assert.deepEqual(api.parseMolecule(molecule), molecule)
  assert.equal(api.newAtom('N', 1, 2, 3).symbol, 'N')
} else if (name === 'io') {
  assert.deepEqual(api.parseMoleculeJson(api.exportMoleculeJson(molecule)), molecule)
} else if (name === 'geometry') {
  assert.equal(api.calcDistance({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 }), 5)
} else if (name === 'graph') {
  assert.deepEqual(api.splitConnectedComponents(molecule), [molecule])
} else throw new Error('Unknown pure entry ' + name)
console.log('Packed pure entry passed: ' + name)
`)
  for (const entry of ['core', 'io', 'geometry', 'graph']) run('node', ['pure-consumer.mjs', entry])

  writeFileSync(join(consumerDir, 'consumer.mjs'), `
import { newAtom } from '@retainmol/mol-viewer/core'
import { listFragments } from '@retainmol/mol-viewer/fragments'
import { listThemes } from '@retainmol/mol-viewer/styles'
import { listMaterialFactories } from '@retainmol/mol-viewer/three'
import { listMoleculeTemplates } from '@retainmol/mol-viewer/templates'
import { calcDistance } from '@retainmol/mol-viewer/geometry'
import { splitConnectedComponents } from '@retainmol/mol-viewer/graph'
import { createViewerRuntime } from '@retainmol/mol-viewer/runtime'
import { createObjectPositionWriteEditSession } from '@retainmol/mol-viewer/editing'
import { createHeadlessModelingContext, parseEditPlan, replayEditPlan } from '@retainmol/mol-viewer/modeling'
import { useMoleculeStore } from '@retainmol/mol-viewer/state'

if (newAtom('C', 0, 0, 0).symbol !== 'C') throw new Error('core runtime import failed')
if (listFragments().length === 0) throw new Error('fragment runtime import failed')
if (listThemes().length === 0) throw new Error('style runtime import failed')
if (listMaterialFactories().length === 0) throw new Error('three extension runtime import failed')
if (listMoleculeTemplates().length === 0) throw new Error('template runtime import failed')
if (calcDistance({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 }) !== 5) throw new Error('geometry runtime import failed')
const disconnected = { atoms: [newAtom('C', 0, 0, 0), newAtom('H', 10, 0, 0)], bonds: [] }
if (splitConnectedComponents(disconnected).length !== 2) throw new Error('graph runtime import failed')
if (!createViewerRuntime()) throw new Error('runtime entry import failed')
if (typeof createObjectPositionWriteEditSession !== 'function') throw new Error('editing entry import failed')
if (typeof parseEditPlan !== 'function') throw new Error('modeling entry import failed')
const headlessMolecule = { atoms: [newAtom('C', 0, 0, 0)], bonds: [] }
if (createHeadlessModelingContext(headlessMolecule).objects.length !== 1) throw new Error('headless modeling context failed')
if (typeof replayEditPlan !== 'function') throw new Error('headless modeling replay failed')
if (typeof useMoleculeStore !== 'function') throw new Error('state entry import failed')
`)

  writeFileSync(join(consumerDir, 'consumer.ts'), `
import type { Molecule } from '@retainmol/mol-viewer/core'
import type { PublicFragmentDef } from '@retainmol/mol-viewer/fragments'
import type { StylePresetMetadata } from '@retainmol/mol-viewer/styles'
import type { MoleculeTemplateDef } from '@retainmol/mol-viewer/templates'
import type { ViewerRuntime } from '@retainmol/mol-viewer/runtime'
import type { RendererPort } from '@retainmol/mol-viewer/viewer'
import type { ObjectPositionWriteEditSession } from '@retainmol/mol-viewer/editing'
import type { EditPlan, HeadlessModelingOptions, ModelingConstraints } from '@retainmol/mol-viewer/modeling'

declare const molecule: Molecule
declare const fragment: PublicFragmentDef
declare const style: StylePresetMetadata
declare const template: MoleculeTemplateDef
declare const runtime: ViewerRuntime
declare const renderer: RendererPort
declare const editSession: ObjectPositionWriteEditSession
declare const editPlan: EditPlan
declare const modelingConstraints: ModelingConstraints
declare const headlessOptions: HeadlessModelingOptions
void [molecule, fragment, style, template, runtime, renderer, editSession, editPlan, modelingConstraints, headlessOptions]
`)

  run('node', ['consumer.mjs'])
  run(resolve(workspaceDir, 'node_modules/.bin/tsc'), [
    '--noEmit',
    '--strict',
    '--target', 'ES2023',
    '--module', 'NodeNext',
    '--moduleResolution', 'NodeNext',
    'consumer.ts',
  ])

  const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'))
  console.log(`Packed consumer passed for ${manifest.name}@${manifest.version}.`)
} finally {
  rmSync(consumerDir, { recursive: true, force: true })
}
