import { describe, expect, it, vi } from 'vitest'
import {
  readBuilderEditSnapshot,
  readEditableMoleculeContainingAtom,
  readBuilderObjectActivationEffects,
  readBuilderSelectionEffects,
} from './builderHandlerContext'
import type { BuilderMoleculeStoreApi } from './builderPointerTypes'
import { useEditorStore } from '../store/editorStore'

function makeStore(state: Record<string, unknown>): BuilderMoleculeStoreApi {
  return {
    getState: () => state,
  } as unknown as BuilderMoleculeStoreApi
}

describe('builder handler context', () => {
  it('reads edit snapshot from the current molecule store state', () => {
    const molecule = {
      atoms: [{ id: 'a1', symbol: 'C', x: 0, y: 0, z: 0 }],
      bonds: [],
      name: 'snapshot',
    }
    const selectedAtomIds = new Set(['a1'])
    const calls: string[] = []
    const snapshot = readBuilderEditSnapshot(makeStore({
      activeObjectId: 'obj-1',
      objectsById: {
        'obj-1': {
          id: 'obj-1',
          name: 'snapshot',
          molecule,
          visible: true,
          locked: false,
        },
      },
      selectedAtomIds,
      setMolecule: () => calls.push('setMolecule'),
    }))

    expect(snapshot.molecule).toBe(molecule)
    expect(snapshot.selectedAtomIds).toBe(selectedAtomIds)

    snapshot.editEffects.setMolecule(molecule)
    snapshot.editEffects.flashHint('from-test')

    expect(calls).toEqual(['setMolecule'])
    expect(useEditorStore.getState().hint?.text).toBe('from-test')
  })

  it('maps selection effects to the molecule store actions', () => {
    const calls: string[] = []
    const effects = readBuilderSelectionEffects(makeStore({
      selectAtom: (atomId: string, append: boolean) => calls.push(`atom:${atomId}:${append}`),
      selectAtoms: (atomIds: Iterable<string>, mode: string) => calls.push(`atoms:${[...atomIds].join(',')}:${mode}`),
      selectBond: (bondId: string, multi: boolean) => calls.push(`bond:${bondId}:${multi}`),
      clearSelection: () => calls.push('clear'),
    }))

    effects.selectAtom('a1', true)
    effects.selectAtomsReplace(new Set(['a1', 'a2']))
    effects.selectBond('b1', false)
    effects.clearSelection()

    expect(calls).toEqual([
      'atom:a1:true',
      'atoms:a1,a2:replace',
      'bond:b1:false',
      'clear',
    ])
  })

  it('maps object activation effects to the molecule store actions', () => {
    const calls: string[] = []
    const effects = readBuilderObjectActivationEffects(makeStore({
      activateObjectContainingAtom: (atomId: string) => {
        calls.push(`atom:${atomId}`)
        return true
      },
      activateObjectContainingBond: (bondId: string) => {
        calls.push(`bond:${bondId}`)
        return false
      },
    }))

    expect(effects.activateObjectContainingAtom('a1')).toBe(true)
    expect(effects.activateObjectContainingBond('b1')).toBe(false)
    expect(calls).toEqual(['atom:a1', 'bond:b1'])
  })

  it('queries an editable atom host without activating it', () => {
    const editable = {
      atoms: [{ id: 'editable-atom', symbol: 'C', x: 0, y: 0, z: 0 }],
      bonds: [],
      name: 'editable',
    }
    const locked = {
      atoms: [{ id: 'locked-atom', symbol: 'C', x: 0, y: 0, z: 0 }],
      bonds: [],
      name: 'locked',
    }
    const activate = vi.fn()
    const store = makeStore({
      objectOrder: ['locked', 'editable'],
      objectsById: {
        locked: { id: 'locked', molecule: locked, visible: true, locked: true },
        editable: { id: 'editable', molecule: editable, visible: true, locked: false },
      },
      activateObjectContainingAtom: activate,
    })

    expect(readEditableMoleculeContainingAtom(store, 'editable-atom')).toBe(editable)
    expect(readEditableMoleculeContainingAtom(store, 'locked-atom')).toBeNull()
    expect(readEditableMoleculeContainingAtom(store, 'missing')).toBeNull()
    expect(activate).not.toHaveBeenCalled()
  })
})
