import { describe, expect, it } from 'vitest'
import type { Atom, Bond, Molecule } from '../lib/molecule'
import { createMoleculeStore } from './moleculeStore'
import {
  commitSelectedBondFragmentFusion,
  previewSelectedBondFragmentFusion,
} from './fragmentFusionStore'

const atom = (id: string): Atom => ({ id, symbol: 'C', x: 0, y: 0, z: 0 })
const bond = (id: string, atomId1: string, atomId2: string): Bond => ({
  id,
  atomId1,
  atomId2,
  order: 1,
})

const host = (): Molecule => ({
  atoms: [atom('h1'), atom('h2'), atom('h3'), atom('h4')],
  bonds: [bond('ha', 'h1', 'h2'), bond('hb', 'h3', 'h4')],
})

const sevenMemberedRing = (): Molecule => ({
  atoms: Array.from({ length: 7 }, (_, index) => atom(`r${index + 1}`)),
  bonds: Array.from({ length: 7 }, (_, index) =>
    bond(`rb${index + 1}`, `r${index + 1}`, `r${((index + 1) % 7) + 1}`)),
})

describe('selected-bond fragment fusion with the real molecule store', () => {
  it('commits one checkpoint, clears selection, and supports undo/redo', () => {
    const store = createMoleculeStore()
    const state = store.getState()
    state.setMolecule(host())
    state.setSelection([], ['ha', 'hb'])
    store.temporal.getState().clear()

    const preview = previewSelectedBondFragmentFusion(store, {
      fragment: sevenMemberedRing(),
      fragmentBondIds: ['rb1', 'rb4'],
    })
    expect(preview.ok).toBe(true)
    if (!preview.ok) return
    expect(preview.candidates.length).toBeGreaterThan(0)
    const candidate = preview.candidates[0]
    if (!candidate) return

    expect(commitSelectedBondFragmentFusion(store, preview, candidate.key).ok).toBe(true)
    const committed = store.getState()
    const committedMolecule = committed.objectsById[committed.activeObjectId!]?.molecule
    expect(committedMolecule?.atoms).toHaveLength(7)
    expect(committedMolecule?.bonds).toHaveLength(7)
    expect(committed.selectedBondIds.size).toBe(0)
    expect(store.temporal.getState().pastStates).toHaveLength(1)

    store.temporal.getState().undo()
    const undone = store.getState()
    expect(undone.objectsById[undone.activeObjectId!]?.molecule.atoms).toHaveLength(4)
    expect(undone.objectsById[undone.activeObjectId!]?.molecule.bonds).toHaveLength(2)

    store.temporal.getState().redo()
    const redone = store.getState()
    expect(redone.objectsById[redone.activeObjectId!]?.molecule.atoms).toHaveLength(7)
    expect(redone.objectsById[redone.activeObjectId!]?.molecule.bonds).toHaveLength(7)
  })

  it('rejects commit when bond selection changes after preview', () => {
    const store = createMoleculeStore()
    const state = store.getState()
    state.setMolecule(host())
    state.setSelection([], ['ha', 'hb'])
    store.temporal.getState().clear()
    const preview = previewSelectedBondFragmentFusion(store, {
      fragment: sevenMemberedRing(),
      fragmentBondIds: ['rb1', 'rb4'],
    })
    if (!preview.ok || !preview.candidates[0]) return

    store.getState().clearSelection()
    expect(commitSelectedBondFragmentFusion(
      store,
      preview,
      preview.candidates[0].key,
    )).toMatchObject({ ok: false, code: 'selection-changed' })
    expect(store.temporal.getState().pastStates).toHaveLength(0)
  })
})
