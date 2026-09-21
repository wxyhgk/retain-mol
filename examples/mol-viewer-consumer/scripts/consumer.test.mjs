import assert from 'node:assert/strict'
import { readFileSync, realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { Resources } from 'openchemlib'
import { generate3D, parseMol, exportMol, markForceFieldReady, parseMoleculeJson, exportMoleculeJson } from '@retainmol/mol-viewer/io'
import { getAtomChiralityState, getMolecularFormula, parseMolecule, findElementConfig } from '@retainmol/mol-viewer/core'
import { useMoleculeStore, selectActiveMoleculeOrEmpty } from '@retainmol/mol-viewer/state'
import { createViewerRuntime, getViewerApi } from '@retainmol/mol-viewer/runtime'
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

test('installed public APIs retain isotope, label and charge through JSON, editing and MOL', () => {
  const molecule = parseMolecule({ name: 'labelled isotope', atoms: [
    { id: 'n', symbol: 'N', isotope: 15, charge: 1, label: 'site', x: 0, y: 1, z: -2 },
  ], bonds: [] })
  assert.deepEqual(parseMoleculeJson(exportMoleculeJson(molecule)), molecule)
  assert.equal(findElementConfig('Xx'), undefined)
  const runtime = createViewerRuntime()
  try {
    const api = getViewerApi(runtime)
    api.setMolecule(molecule)
    api.history.clear()
    api.edit.moveAtom('n', 1, 2, 3)
    assert.equal(api.getSnapshot().molecule.atoms[0].isotope, 15)
    api.history.undo()
    assert.deepEqual(api.getSnapshot().molecule, molecule)
    const roundtrip = parseMol(exportMol(api.getSnapshot().molecule))
    const { id: _id, ...actual } = roundtrip.atoms[0]
    const { id: _originalId, ...expected } = molecule.atoms[0]
    assert.deepEqual(actual, expected)
  } finally { runtime.dispose() }
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

test('two public instance APIs edit, notify, undo and serialize independently', async () => {
  const leftRuntime = createViewerRuntime()
  const rightRuntime = createViewerRuntime()
  try {
    const left = getViewerApi(leftRuntime)
    const right = getViewerApi(rightRuntime)
    const generated = generate3D(parseMol(fixture))
    assert.equal(generated.ok, true, generated.reason)
    for (const api of [left, right]) {
      api.setMolecule(generated.molecule)
      api.history.clear()
    }
    const defaultBefore = read()
    const rightBefore = right.getSnapshot()
    const originalLengths = lengths(generated.molecule)
    let leftEvents = 0
    let rightEvents = 0
    const stopLeft = left.subscribe(() => { leftEvents++ })
    right.subscribe(() => { rightEvents++ })
    const leftCenter = center(left.getSnapshot().molecule).id
    left.selection.set([leftCenter])
    assert.equal(left.edit.setChirality(leftCenter, 'R').ok, true)
    await Promise.resolve()
    assert.equal(leftEvents, 1)
    assert.equal(rightEvents, 0)
    assert.equal(right.getSnapshot(), rightBefore)
    assert.equal(read(), defaultBefore)
    assert.equal(left.getSnapshot().history.undoCount, 1)
    nearLengths(lengths(left.getSnapshot().molecule), originalLengths, 1e-10)
    left.history.undo()
    assert.deepEqual(left.getSnapshot().molecule, generated.molecule)
    left.history.redo()
    assert.equal(getAtomChiralityState(left.getSnapshot().molecule, leftCenter).specified, 'R')
    assert.equal(right.edit.setChirality(center(rightBefore.molecule).id, 'S').ok, true)
    const reloaded = parseMol(exportMol(right.getSnapshot().molecule))
    assert.deepEqual(getAtomChiralityState(reloaded, center(reloaded).id), { specified: 'S', computed: 'S' })
    assert.equal(getAtomChiralityState(left.getSnapshot().molecule, leftCenter).specified, 'R')
    assert.deepEqual(right.getSnapshot().selectedAtomIds, [])
    nearLengths(lengths(reloaded), originalLengths, 0.0002)
    await Promise.resolve()
    stopLeft()
    const count = leftEvents
    left.history.clear()
    await Promise.resolve()
    assert.equal(leftEvents, count)
    leftRuntime.dispose()
    assert.throws(() => left.getSnapshot(), /disposed/)
    assert.equal(right.getSnapshot().molecule.atoms.length, generated.molecule.atoms.length)
  } finally {
    leftRuntime.dispose()
    rightRuntime.dispose()
  }
})

for (const [name, formula, atomCount] of [
  ['fused', 'C10H8', 18], ['spiro', 'C11H20', 31], ['chain101', 'C33H68', 101],
]) {
  test(`${name}: import, conformer, instance editing and MOL round trip`, () => {
    const runtime = createViewerRuntime()
    try {
      const api = getViewerApi(runtime)
      const input = readFileSync(new URL(`../public/${name}.mol`, import.meta.url), 'utf8')
      const generated = generate3D(parseMol(input))
      assert.equal(generated.ok, true, generated.reason)
      api.setMolecule(generated.molecule)
      api.history.clear()
      const original = api.getSnapshot().molecule
      assert.equal(original.atoms.length, atomCount)
      assert.equal(getMolecularFormula(original.atoms), formula)
      assert.ok(original.atoms.every(atom => [atom.x, atom.y, atom.z].every(Number.isFinite)))
      const hydrogen = original.atoms.find(atom => atom.symbol === 'H')
      api.edit.replaceAtom(hydrogen.id, 'Cl')
      const edited = api.getSnapshot().molecule
      assert.equal(edited.atoms.find(atom => atom.id === hydrogen.id).symbol, 'Cl')
      assert.equal(api.getSnapshot().history.undoCount, 1)
      api.history.undo()
      assert.deepEqual(api.getSnapshot().molecule, original)
      api.history.redo()
      const reloaded = parseMol(exportMol(api.getSnapshot().molecule))
      assert.equal(getMolecularFormula(reloaded.atoms), getMolecularFormula(edited.atoms))
      assert.equal(reloaded.bonds.length, edited.bonds.length)
    } finally { runtime.dispose() }
  })
}
