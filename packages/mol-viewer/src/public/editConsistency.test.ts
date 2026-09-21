import { describe, expect, it } from 'vitest'
import { createViewerRuntime, getViewerRuntimeServices } from '../runtime/ViewerRuntime'
import { getViewerApi, type ViewerEditApi } from './runtime'
import { commitEditPlan, getModelingContext } from './modeling'
import { replayEditPlan, type Molecule, type ModelingCommand } from './headless'

const tetrahedron: Molecule = {
  atoms: [
    { id: 'c', symbol: 'C', isotope: 13, label: 'center', x: 0, y: 0, z: 0, chirality: 'S' },
    { id: 'f', symbol: 'F', x: 1, y: 1, z: 1 },
    { id: 'cl', symbol: 'Cl', x: -1, y: -1, z: 1 },
    { id: 'br', symbol: 'Br', x: -1, y: 1, z: -1 },
    { id: 'h', symbol: 'H', isotope: 2, x: 1, y: -1, z: -1 },
  ],
  bonds: ['f', 'cl', 'br', 'h'].map(id => ({ id: `c-${id}`, atomId1: 'c', atomId2: id, order: 1 })),
}

const cases: { name: string; command: ModelingCommand; edit: (edit: ViewerEditApi) => void }[] = [
  { name: 'ligand priority change', command: { commandId: 'replace', kind: 'atom.replace', atomId: 'cl', symbol: 'I' },
    edit: api => api.replaceAtom('cl', 'I') },
  { name: 'loss of stereocenter', command: { commandId: 'replace', kind: 'atom.replace', atomId: 'cl', symbol: 'F' },
    edit: api => api.replaceAtom('cl', 'F') },
  { name: 'coordinate edit', command: { commandId: 'move', kind: 'atom.move', atomId: 'f', position: { x: -1, y: -1, z: -1 } },
    edit: api => api.moveAtom('f', -1, -1, -1) },
  { name: 'bond length edit', command: { commandId: 'length', kind: 'geometry.setBondLength', atomId1: 'c', atomId2: 'f', length: 1.4 },
    edit: api => { api.setBondLength('c', 'f', 1.4) } },
  { name: 'bond removal', command: { commandId: 'remove', kind: 'bond.remove', bondId: 'c-cl' },
    edit: api => api.removeBond('c-cl') },
]

describe('headless and viewer edit consistency', () => {
  it.each(cases)('$name preserves surviving IDs and properties through undo/redo', ({ command, edit }) => {
    const directRuntime = createViewerRuntime()
    const planRuntime = createViewerRuntime()
    try {
      const directStore = getViewerRuntimeServices(directRuntime).moleculeStore
      const planStore = getViewerRuntimeServices(planRuntime).moleculeStore
      for (const store of [directStore, planStore]) {
        store.getState().setMolecule(structuredClone(tetrahedron))
        store.temporal.getState().clear()
      }
      const target = getModelingContext(planRuntime).objects[0]!
      const plan = { schemaVersion: 1 as const, planId: 'parity', source: 'human' as const,
        targetObjectId: target.objectId, commands: [command] }
      const headless = replayEditPlan(target.molecule, plan, { objectId: target.objectId })
      if (!headless.ok) throw new Error('expected valid edit')
      edit(getViewerApi(directRuntime).edit)
      expect(commitEditPlan(plan, planRuntime)).toMatchObject({ ok: true, committed: true })
      const current = () => getModelingContext(directRuntime).objects[0]!.molecule
      expect(current()).toEqual(headless.molecule)
      expect(getModelingContext(planRuntime).objects[0]!.molecule).toEqual(headless.molecule)
      expect(current().atoms.map(atom => atom.id)).toEqual(target.molecule.atoms.map(atom => atom.id))
      expect(current().atoms[0]).toMatchObject({ id: 'c', isotope: 13, label: 'center' })
      expect(current().atoms.find(atom => atom.id === 'h')?.isotope).toBe(2)
      expect(current().bonds.every(bond => target.molecule.bonds.some(original => original.id === bond.id))).toBe(true)
      for (const store of [directStore, planStore]) {
        expect(store.temporal.getState().pastStates).toHaveLength(1)
        store.temporal.getState().undo()
        expect(store.getState().objectsById[store.getState().activeObjectId!]!.molecule).toEqual(target.molecule)
        store.temporal.getState().redo()
        expect(store.getState().objectsById[store.getState().activeObjectId!]!.molecule).toEqual(headless.molecule)
      }
    } finally { directRuntime.dispose(); planRuntime.dispose() }
  })

  it('retains selected surviving bonds during partial inference, then treats repeated inference/geometry as no-ops', () => {
    const runtime = createViewerRuntime()
    try {
      const store = getViewerRuntimeServices(runtime).moleculeStore
      store.getState().setMolecule({
        atoms: [{ id: 'c', symbol: 'C', x: 0, y: 0, z: 0 },
          { id: 'o', symbol: 'O', x: 1.43, y: 0, z: 0 }, { id: 'h', symbol: 'H', x: -1.09, y: 0, z: 0 }],
        bonds: [{ id: 'co', atomId1: 'c', atomId2: 'o', order: 1 }],
      })
      store.getState().selectBond('co')
      store.temporal.getState().clear()
      store.getState().autoInferBonds()
      expect(store.getState().selectedBondIds.has('co')).toBe(true)
      expect(store.temporal.getState().pastStates).toHaveLength(1)
      const before = store.getState().objectsById
      store.getState().autoInferBonds()
      store.getState().setBondLength('c', 'o', 1.43)
      expect(store.getState().objectsById).toBe(before)
      expect(store.temporal.getState().pastStates).toHaveLength(1)
      store.temporal.getState().undo()
      expect(getModelingContext(runtime).objects[0]!.molecule.bonds.map(bond => bond.id)).toEqual(['co'])
      store.temporal.getState().redo()
      expect(getModelingContext(runtime).objects[0]!.molecule.bonds).toHaveLength(2)
    } finally { runtime.dispose() }
  })
})
