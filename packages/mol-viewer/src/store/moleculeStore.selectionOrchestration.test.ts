import { beforeEach, describe, expect, it } from 'vitest'
import { newAtom, newBond, type Molecule } from '../lib/molecule'
import { useMoleculeStore } from './moleculeStore'

const store = () => useMoleculeStore.getState()
const temporal = () => useMoleculeStore.temporal.getState()
const activeMolecule = () => {
  const state = store()
  return state.objectsById[state.activeObjectId!].molecule
}

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

function setMolecule(molecule: Molecule) {
  store().setMolecule(molecule)
  temporal().clear()
}

describe('store selection edit orchestration', () => {
  it('adds a plain selected-atom bond without changing selectionVersion', () => {
    const c1 = newAtom('C')
    const c2 = newAtom('C', 1.54)
    setMolecule({ atoms: [c1, c2], bonds: [] })
    store().selectAtoms([c1.id, c2.id])
    const version = store().selectionVersion

    expect(store().bondSelectedAtoms()).toEqual({ ok: true })

    expect(activeMolecule().bonds).toHaveLength(1)
    expect(store().selectedAtomIds).toEqual(new Set([c1.id, c2.id]))
    expect(store().selectionVersion).toBe(version)
  })

  it('removes stale atom and bond selection when an H slot makes way', () => {
    const c1 = newAtom('C')
    const h = newAtom('H', 1.09)
    const c2 = newAtom('C', 2.5)
    const ch = newBond(c1.id, h.id)
    setMolecule({ atoms: [c1, h, c2], bonds: [ch] })
    store().selectAtoms([h.id, c2.id])
    store().selectBond(ch.id, true)
    const version = store().selectionVersion

    expect(store().bondSelectedAtoms()).toEqual({ ok: true })

    expect(activeMolecule().atoms.some(atom => atom.id === h.id)).toBe(false)
    expect(store().selectedAtomIds).toEqual(new Set())
    expect(store().selectedBondIds).toEqual(new Set())
    expect(store().selectionVersion).toBe(version + 1)
  })

  it('keeps failed bonding as a strict state and history no-op', () => {
    const c = newAtom('C')
    setMolecule({ atoms: [c], bonds: [] })
    store().selectAtom(c.id)
    const molecule = activeMolecule()
    const selection = store().selectedAtomIds

    expect(store().bondSelectedAtoms()).toEqual({
      ok: false,
      reason: '请先选中恰好两个原子',
    })
    expect(activeMolecule()).toBe(molecule)
    expect(store().selectedAtomIds).toBe(selection)
    expect(temporal().pastStates).toHaveLength(0)
  })

  it('clears molecule and selection in one store commit and one undo entry', () => {
    const c1 = newAtom('C')
    const c2 = newAtom('C', 1.54)
    const bond = newBond(c1.id, c2.id)
    setMolecule({ atoms: [c1, c2], bonds: [bond] })
    store().selectAtom(c1.id)
    store().selectBond(bond.id, true)
    const version = store().selectionVersion

    store().clearMolecule()

    expect(activeMolecule().atoms).toHaveLength(0)
    expect(store().selectedAtomIds).toEqual(new Set())
    expect(store().selectedBondIds).toEqual(new Set())
    expect(store().selectionVersion).toBe(version + 1)
    expect(temporal().pastStates).toHaveLength(1)
  })
})
