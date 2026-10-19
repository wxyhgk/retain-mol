import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'

const packageDir = resolve(import.meta.dirname, '..')
const workspaceDir = resolve(packageDir, '../..')
const consumerDir = mkdtempSync(join(tmpdir(), 'retainmol-core-pack-consumer-'))

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
    name: 'retainmol-core-pack-consumer',
    private: true,
    type: 'module',
    dependencies: {
      '@retainmol/core': `file:${tarball}`,
    },
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
  writeFileSync(join(consumerDir, 'register-guard.mjs'), `
import * as nodeModule from 'node:module'
import { resolve } from './pure-import-guard.mjs'
if (nodeModule.registerHooks) nodeModule.registerHooks({ resolve })
else nodeModule.register('./pure-import-guard.mjs', import.meta.url)
`)
  writeFileSync(join(consumerDir, 'pure-consumer.mjs'), `
import assert from 'node:assert/strict'
import * as nodeModule from 'node:module'
import { resolve } from './pure-import-guard.mjs'

if (nodeModule.registerHooks) nodeModule.registerHooks({ resolve })
else nodeModule.register('./pure-import-guard.mjs', import.meta.url)

const name = process.argv[2]
const api = await import(name === 'core' ? '@retainmol/core' : '@retainmol/core/' + name)
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
} else if (name === 'headless') {
  const empty = { atoms: [], bonds: [] }
  const objectId = api.HEADLESS_MODELING_OBJECT_ID
  const built = api.replayEditPlan(empty, {
    schemaVersion: 1, planId: 'node-build', source: 'human', targetObjectId: objectId,
    commands: [
      { commandId: 'add-c', kind: 'atom.add', atomId: 'c', symbol: 'C', position: { x: 0, y: 0, z: 0 } },
      { commandId: 'add-o', kind: 'atom.add', atomId: 'o', symbol: 'O', position: { x: 1.4, y: 0, z: 0 } },
      { commandId: 'add-co', kind: 'bond.add', bondId: 'co', atomId1: 'c', atomId2: 'o', order: 1 },
    ],
  })
  assert.equal(built.ok, true)
  assert.equal(built.molecule.atoms.length, 2)
  assert.equal(built.molecule.bonds.length, 1)
  assert.deepEqual(empty, { atoms: [], bonds: [] })
  const revision = api.createHeadlessModelingContext(built.molecule).objects[0].revision
  const edit = {
    schemaVersion: 1, planId: 'node-edit', source: 'human', targetObjectId: objectId,
    expectedRevision: revision,
    commands: [{ commandId: 'replace-o', kind: 'atom.replace', atomId: 'o', symbol: 'N' }],
  }
  assert.equal(api.parseEditPlan(edit).ok, true)
  const changed = api.replayEditPlan(built.molecule, edit)
  assert.equal(changed.ok, true)
  assert.equal(changed.molecule.atoms.find(atom => atom.id === 'o').symbol, 'N')
  assert.equal(built.molecule.atoms.find(atom => atom.id === 'o').symbol, 'O')
  const stale = api.replayEditPlan(changed.molecule, edit)
  assert.equal(stale.ok, false)
  assert.ok(stale.issues.some(issue => issue.code === 'stale-context'))
  const roundTrip = api.replayEditPlan(built.molecule, {
    schemaVersion: 1, planId: 'node-noop', source: 'human', targetObjectId: objectId,
    commands: [
      { commandId: 'away', kind: 'atom.move', atomId: 'c', position: { x: 2, y: 0, z: 0 } },
      { commandId: 'back', kind: 'atom.move', atomId: 'c', position: { x: 0, y: 0, z: 0 } },
    ],
  })
  assert.equal(roundTrip.ok, true)
  assert.equal(roundTrip.changed, false)
  assert.equal(roundTrip.nextRevision, revision)
  assert.deepEqual(roundTrip.molecule, built.molecule)
} else throw new Error('Unknown pure entry ' + name)
console.log('Packed pure entry passed: ' + name)
`)
  for (const entry of ['core', 'io', 'geometry', 'graph', 'headless']) run('node', ['pure-consumer.mjs', entry])

  writeFileSync(join(consumerDir, 'consumer.mjs'), `
import { newAtom } from '@retainmol/core'
import { listFragments } from '@retainmol/core/fragments'
import { listMoleculeTemplates } from '@retainmol/core/templates'
import { editFailed } from '@retainmol/core/internal/lib/builder/commands/shared/index'

if (listFragments().length === 0) throw new Error('fragment runtime import failed')
if (listMoleculeTemplates().length === 0) throw new Error('template runtime import failed')
if (newAtom('C', 0, 0, 0).symbol !== 'C') throw new Error('core runtime import failed')
if (editFailed('x').ok !== false) throw new Error('internal subpath import failed')
`)
  writeFileSync(join(consumerDir, 'consumer.ts'), `
import type { EditCommandResult, Molecule } from '@retainmol/core'
import type { PublicFragmentDef } from '@retainmol/core/fragments'
import type { MoleculeTemplateDef } from '@retainmol/core/templates'
import type { AlignBondPairInput } from '@retainmol/core/geometry'
import { replayEditPlan } from '@retainmol/core/headless'
import type { EditPlan, HeadlessModelingOptions } from '@retainmol/core/headless'
import { editFailed } from '@retainmol/core/internal/lib/builder/commands/shared/index'

declare const molecule: Molecule
declare const fragment: PublicFragmentDef
declare const template: MoleculeTemplateDef
declare const alignInput: AlignBondPairInput
declare const plan: EditPlan
declare const options: HeadlessModelingOptions
const failed: EditCommandResult = editFailed('typed')
void [molecule, fragment, template, alignInput, failed, replayEditPlan(molecule, plan, options)]
`)

  // Whole-package guard: the full module graph, not only the entries, must load without UI dependencies.
  run('node', ['--import', './register-guard.mjs', 'consumer.mjs'])

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
