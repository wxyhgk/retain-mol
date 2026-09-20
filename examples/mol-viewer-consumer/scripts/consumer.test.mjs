import assert from 'node:assert/strict'
import { readFileSync, realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { Resources } from 'openchemlib'
import { generate3D, parseMol, exportMol, markForceFieldReady } from '@retainmol/mol-viewer/io'
import { getAtomChiralityState, getMolecularFormula } from '@retainmol/mol-viewer/core'
import { useMoleculeStore, selectActiveMoleculeOrEmpty } from '@retainmol/mol-viewer/state'
import { createViewerRuntime } from '@retainmol/mol-viewer/runtime'
import { getModelingContext } from '@retainmol/mol-viewer/modeling'

Resources.registerFromNodejs()
markForceFieldReady()
const fixture = readFileSync(new URL('../public/fixture.mol', import.meta.url), 'utf8')
const read = () => selectActiveMoleculeOrEmpty(useMoleculeStore.getState())
const center = molecule => molecule.atoms.find(atom => getAtomChiralityState(molecule, atom.id).computed)
function load() {
  const result = generate3D(parseMol(fixture))
  assert.equal(result.ok, true, result.reason)
  useMoleculeStore.getState().setMolecule(result.molecule)
  useMoleculeStore.temporal.getState().clear()
  return read()
}
function lengths(molecule) {
  return molecule.bonds.map(bond => {
    const a = molecule.atoms.find(atom => atom.id === bond.atomId1)
    const b = molecule.atoms.find(atom => atom.id === bond.atomId2)
    return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
  })
}
function nearLengths(actual, expected, tolerance) {
  assert.equal(actual.length, expected.length)
  actual.forEach((length, index) => assert.ok(Math.abs(length - expected[index]) < tolerance,
    `bond ${index}: ${length} vs ${expected[index]}`))
}

test('consumer resolves a real installed package, with no workspace symlink', () => {
  const entry = fileURLToPath(import.meta.resolve('@retainmol/mol-viewer/core'))
  assert.equal(realpathSync(entry), entry)
  assert.ok(entry.includes('/node_modules/@retainmol/mol-viewer/dist/'))
})

test('import → 3D → R/S → undo/redo → MOL reload preserves stereochemistry and every bond length', () => {
  const original = load()
  const originalLengths = lengths(original)
  assert.equal(getAtomChiralityState(original, center(original).id).specified, null)
  for (const target of ['R', 'S', 'R']) {
    const before = read()
    const result = useMoleculeStore.getState().setChirality(center(before).id, target)
    assert.equal(result.ok, true, result.reason)
    const edited = read()
    assert.deepEqual(getAtomChiralityState(edited, center(edited).id), { specified: target, computed: target })
    nearLengths(lengths(edited), originalLengths, 1e-10)
    useMoleculeStore.temporal.getState().undo()
    assert.deepEqual(read(), before)
    useMoleculeStore.temporal.getState().redo()
    assert.deepEqual(read(), edited)
    const reloaded = parseMol(exportMol(edited))
    assert.deepEqual(getAtomChiralityState(reloaded, center(reloaded).id), { specified: target, computed: target })
    nearLengths(lengths(reloaded), originalLengths, 0.0002)
  }
  const beforeClear = read()
  assert.equal(useMoleculeStore.getState().setChirality(center(beforeClear).id, 'none').ok, true)
  assert.deepEqual(getAtomChiralityState(read(), center(read()).id), { specified: null, computed: 'R' })
  nearLengths(lengths(read()), originalLengths, 1e-10)
})

test('public atom replacement changes composition and supports undo/redo and MOL reload', () => {
  const original = load()
  const hydrogen = original.atoms.find(atom => atom.symbol === 'H')
  assert.ok(hydrogen)
  useMoleculeStore.getState().replaceAtom(hydrogen.id, 'Cl')
  const edited = read()
  assert.equal(edited.atoms.find(atom => atom.id === hydrogen.id).symbol, 'Cl')
  assert.notEqual(getMolecularFormula(edited.atoms), getMolecularFormula(original.atoms))
  useMoleculeStore.temporal.getState().undo()
  assert.deepEqual(read(), original)
  useMoleculeStore.temporal.getState().redo()
  assert.deepEqual(read(), edited)
  assert.equal(getMolecularFormula(parseMol(exportMol(edited)).atoms), getMolecularFormula(edited.atoms))
})

test('isolated runtime is unaffected by default-store edits and dispose is idempotent', () => {
  const isolated = createViewerRuntime()
  const initial = getModelingContext(isolated)
  load()
  assert.deepEqual(getModelingContext(isolated), initial)
  isolated.dispose()
  isolated.dispose()
  assert.throws(() => getModelingContext(isolated), /disposed/)
  assert.ok(read().atoms.length > 0)
})
