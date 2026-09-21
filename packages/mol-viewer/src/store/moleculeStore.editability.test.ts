import { beforeEach, describe, expect, it } from 'vitest'
import { useMoleculeStore } from './moleculeStore'
import type { Molecule } from '../lib/molecule'

const store = () => useMoleculeStore.getState()
const temporal = () => useMoleculeStore.temporal.getState()
const activeObject = () => store().objectsById[store().activeObjectId!]
const activeMolecule = () => activeObject().molecule

beforeEach(() => {
  temporal().resume()
  const ids = [...store().objectOrder]
  for (const id of ids.slice(1)) store().removeSceneObject(id)
  if (ids[0]) {
    store().setObjectVisible(ids[0], true)
    store().setObjectLocked(ids[0], false)
    store().setActiveObject(ids[0])
  }
  store().clearMolecule()
  store().clearSelection()
  temporal().clear()
})

function seedEditableMolecule(): { atomA: string; atomB: string; bondId: string } {
  const atomA = store().addAtom('C', 0, 0, 0)
  const atomB = store().addAtom('C', 1.5, 0, 0)
  store().addBond(atomA, atomB)
  return { atomA, atomB, bondId: activeMolecule().bonds[0].id }
}

function restrictActiveObject(mode: 'locked' | 'hidden') {
  const id = store().activeObjectId!
  if (mode === 'locked') store().setObjectLocked(id, true)
  else store().setObjectVisible(id, false)
}

describe('moleculeStore object editability', () => {
  it.each(['locked', 'hidden'] as const)(
    'blocks public molecule edits when the active object is %s',
    (mode) => {
      const { atomA, atomB, bondId } = seedEditableMolecule()
      store().selectAtom(atomA)
      restrictActiveObject(mode)
      temporal().clear()
      const beforeMolecule = activeMolecule()
      const beforeSelection = store().selectedAtomIds
      const beforeSelectionVersion = store().selectionVersion
      const beforePositionVersion = store().atomPositionVersion

      store().setMolecule({ atoms: [], bonds: [], name: 'blocked' })
      expect(store().addAtom('N', 3, 0, 0)).toBe('')
      store().moveAtom(atomA, 5, 0, 0)
      store().replaceAtom(atomA, 'N')
      store().cycleBondOrder(bondId)
      store().removeAtom(atomA)
      store().clearMolecule()
      store().removeSelected()
      expect(store().setBondLength(atomA, atomB, 2)).toMatchObject({ ok: false })

      expect(activeMolecule()).toBe(beforeMolecule)
      expect(store().selectedAtomIds).toBe(beforeSelection)
      expect(store().selectionVersion).toBe(beforeSelectionVersion)
      expect(store().atomPositionVersion).toBe(beforePositionVersion)
      expect(temporal().pastStates).toHaveLength(0)
      expect(store().canAddOneHydrogen(atomA).ok).toBe(false)
    },
  )

  it.each(['locked', 'hidden'] as const)(
    'blocks object-id coordinate writes when the target object is %s',
    (mode) => {
      const { atomA } = seedEditableMolecule()
      const objectId = store().activeObjectId!
      restrictActiveObject(mode)
      temporal().clear()
      const beforeMolecule = activeMolecule()
      const positionVersion = store().atomPositionVersion

      store().setObjectAtomPositions(objectId, new Map([
        [atomA, { x: 8, y: 0, z: 0 }],
      ]))

      expect(activeMolecule()).toBe(beforeMolecule)
      expect(store().atomPositionVersion).toBe(positionVersion)
      expect(temporal().pastStates).toHaveLength(0)
    },
  )

  it('keeps unlock and show actions available, then restores editing', () => {
    seedEditableMolecule()
    const objectId = store().activeObjectId!

    store().setObjectLocked(objectId, true)
    expect(store().addAtom('N', 3, 0, 0)).toBe('')
    store().setObjectLocked(objectId, false)
    expect(store().addAtom('N', 3, 0, 0)).not.toBe('')

    store().setObjectVisible(objectId, false)
    expect(store().addAtom('O', 4, 0, 0)).toBe('')
    store().setObjectVisible(objectId, true)
    expect(store().addAtom('O', 4, 0, 0)).not.toBe('')
  })

  it('blocks splitting a locked or hidden object', () => {
    const disconnected: Molecule = {
      name: 'Disconnected',
      atoms: [
        { id: 'a1', symbol: 'C', x: 0, y: 0, z: 0 },
        { id: 'a2', symbol: 'O', x: 4, y: 0, z: 0 },
      ],
      bonds: [],
    }
    store().setMolecule(disconnected)
    const objectId = store().activeObjectId!

    store().setObjectLocked(objectId, true)
    store().splitSceneObject(objectId)
    expect(store().objectOrder).toEqual([objectId])

    store().setObjectLocked(objectId, false)
    store().setObjectVisible(objectId, false)
    store().splitSceneObject(objectId)
    expect(store().objectOrder).toEqual([objectId])

    store().setObjectVisible(objectId, true)
    store().splitSceneObject(objectId)
    expect(store().objectOrder).toHaveLength(2)
    expect(store().objectsById[objectId]).toBeUndefined()
  })
})


describe('selected-only hydrogen removal', () => {
  const seed = () => {
    store().setMolecule({ name: 'Two CH fragments', atoms: [
      { id: 'c1', symbol: 'C', x: 0, y: 0, z: 0 },
      { id: 'h1', symbol: 'H', x: 1, y: 0, z: 0 },
      { id: 'c2', symbol: 'C', x: 4, y: 0, z: 0 },
      { id: 'h2', symbol: 'H', x: 5, y: 0, z: 0 },
    ], bonds: [
      { id: 'b1', atomId1: 'c1', atomId2: 'h1', order: 1 },
      { id: 'b2', atomId1: 'c2', atomId2: 'h2', order: 1 },
    ] })
    temporal().clear()
  }

  it.each([{ ids: [] }, { ids: ['expired-id'] }])('does not widen an empty or expired selection $ids', ({ ids }) => {
    seed()
    store().selectAtoms(ids)
    const before = activeMolecule()
    store().removeHydrogens({ onlySelected: true })
    expect(activeMolecule()).toBe(before)
    expect(temporal().pastStates).toHaveLength(0)
  })

  it('rejects stale targets alongside valid targets without partial edits', () => {
    seed()
    useMoleculeStore.setState({ selectedAtomIds: new Set(['c1', 'expired-id']) })
    temporal().clear()
    const before = activeMolecule()
    store().removeHydrogens({ onlySelected: true })
    expect(activeMolecule()).toBe(before)
    expect(temporal().pastStates).toHaveLength(0)
  })

  it('removes only selected parents hydrogen, records one undo, and keeps whole-molecule mode explicit', () => {
    seed()
    store().selectAtoms(['c1'])
    const before = activeMolecule()
    store().removeHydrogens({ onlySelected: true })
    expect(activeMolecule().atoms.map(atom => atom.id)).toEqual(['c1', 'c2', 'h2'])
    expect(temporal().pastStates).toHaveLength(1)
    temporal().undo()
    expect(activeMolecule()).toEqual(before)
    store().clearSelection()
    store().removeHydrogens()
    expect(activeMolecule().atoms.map(atom => atom.id)).toEqual(['c1', 'c2'])
  })
})
