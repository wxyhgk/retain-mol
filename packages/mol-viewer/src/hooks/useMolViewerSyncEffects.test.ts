import { describe, expect, it } from 'vitest'
import type { Molecule } from '../lib/molecule'
import {
  commitControlledMoleculeProp,
  commitControlledMoleculePropToStore,
  commitControlledSelectedAtomsProp,
  commitControlledSelectedAtomsPropToStore,
  commitControlledSelectionProps,
  runControlledStoreCommit,
  shouldNotifyControlledStoreChange,
} from './useMolViewerSyncEffects'
import { selectActiveMolecule, useMoleculeStore } from '../store/moleculeStore'

describe('useMolViewerSync effects', () => {
  it('commits a new controlled molecule prop once', () => {
    const molecule: Molecule = { atoms: [], bonds: [], name: 'Prop Molecule' }
    const calls: string[] = []

    const committed = commitControlledMoleculeProp(
      molecule,
      undefined,
      { setMolecule: next => calls.push(next.name ?? 'untitled') },
    )
    const skipped = commitControlledMoleculeProp(
      molecule,
      committed,
      { setMolecule: next => calls.push(next.name ?? 'untitled') },
    )

    expect(committed).toBe(molecule)
    expect(skipped).toBe(molecule)
    expect(calls).toEqual(['Prop Molecule'])
  })

  it('skips missing controlled molecule props', () => {
    const current: Molecule = { atoms: [], bonds: [], name: 'Current' }
    const calls: string[] = []

    const committed = commitControlledMoleculeProp(
      undefined,
      current,
      { setMolecule: next => calls.push(next.name ?? 'untitled') },
    )

    expect(committed).toBe(current)
    expect(calls).toEqual([])
  })

  it('commits controlled atom selection and returns the post-commit version', () => {
    const selected = new Set(['a1', 'a2'])
    const calls: string[] = []

    const version = commitControlledSelectedAtomsProp(
      selected,
      {
        selectAtoms: (atomIds, mode) => calls.push(`${mode}:${Array.from(atomIds).join(',')}`),
        getSelectionVersion: () => 7,
      },
    )

    expect(version).toBe(7)
    expect(calls).toEqual(['replace:a1,a2'])
  })

  it('commits controlled molecule props through a store getter', () => {
    const molecule: Molecule = { atoms: [], bonds: [], name: 'Store Molecule' }
    const calls: string[] = []

    const committed = commitControlledMoleculePropToStore(
      molecule,
      undefined,
      () => ({
        setMolecule: next => calls.push(next.name ?? 'untitled'),
      }),
    )

    expect(committed).toBe(molecule)
    expect(calls).toEqual(['Store Molecule'])
  })

  it('commits controlled atom selection through a store getter', () => {
    const selected = new Set(['a1'])
    const calls: string[] = []

    const version = commitControlledSelectedAtomsPropToStore(
      selected,
      () => ({
        selectAtoms: (atomIds, mode) => calls.push(`${mode}:${Array.from(atomIds).join(',')}`),
        selectionVersion: 11,
      }),
    )

    expect(version).toBe(11)
    expect(calls).toEqual(['replace:a1'])
  })

  it('skips missing controlled atom selection props', () => {
    const version = commitControlledSelectedAtomsProp(
      undefined,
      {
        selectAtoms: () => { throw new Error('should not select atoms') },
        getSelectionVersion: () => 1,
      },
    )

    expect(version).toBeNull()
  })

  it('controls bond selection without overwriting uncontrolled atom selection', () => {
    const calls: Array<{ atoms: string[]; bonds: string[] }> = []
    const version = commitControlledSelectionProps(
      undefined,
      new Set(['bond-1', 'bond-2']),
      {
        setSelection: (atomIds, bondIds) => calls.push({
          atoms: [...atomIds],
          bonds: [...bondIds],
        }),
        getSelectedAtomIds: () => new Set(['atom-1']),
        getSelectedBondIds: () => new Set(),
        getSelectionVersion: () => 12,
      },
    )

    expect(version).toBe(12)
    expect(calls).toEqual([{ atoms: ['atom-1'], bonds: ['bond-1', 'bond-2'] }])
  })

  it('suppresses controlled commits but not later user edits on real subscriptions', () => {
    const state = useMoleculeStore.getState()
    const objectId = state.activeObjectId!
    state.setObjectVisible(objectId, true)
    state.setObjectLocked(objectId, false)
    state.setMolecule({
      atoms: [{ id: 'sync-a1', symbol: 'C', x: 0, y: 0, z: 0 }],
      bonds: [],
      name: 'Baseline',
    })
    state.clearSelection()

    const moleculeGuard = { current: false }
    const selectionGuard = { current: false }
    const moleculeCalls: string[] = []
    const selectionCalls: number[] = []
    const unsubscribeMolecule = useMoleculeStore.subscribe(
      current => selectActiveMolecule(current),
      molecule => {
        if (shouldNotifyControlledStoreChange(moleculeGuard) && molecule) {
          moleculeCalls.push(molecule.name ?? '')
        }
      },
    )
    const unsubscribeSelection = useMoleculeStore.subscribe(
      current => current.selectionVersion,
      version => {
        if (shouldNotifyControlledStoreChange(selectionGuard)) selectionCalls.push(version)
      },
    )

    try {
      const controlledMolecule: Molecule = {
        atoms: [{ id: 'sync-a1', symbol: 'C', x: 0, y: 0, z: 0 }],
        bonds: [],
        name: 'Controlled',
      }
      runControlledStoreCommit(moleculeGuard, () =>
        commitControlledMoleculePropToStore(
          controlledMolecule,
          undefined,
          useMoleculeStore.getState,
        ),
      )
      runControlledStoreCommit(selectionGuard, () =>
        commitControlledSelectedAtomsPropToStore(
          new Set(['sync-a1']),
          useMoleculeStore.getState,
        ),
      )

      expect(moleculeCalls).toEqual([])
      expect(selectionCalls).toEqual([])

      const newAtomId = useMoleculeStore.getState().addAtom('N', 2, 0, 0)
      useMoleculeStore.getState().selectAtom(newAtomId)

      expect(moleculeCalls).toEqual(['Controlled'])
      expect(selectionCalls).toHaveLength(1)
    } finally {
      unsubscribeMolecule()
      unsubscribeSelection()
    }
  })

  it('clears a controlled commit guard when the commit throws', () => {
    const guard = { current: false }
    expect(() => runControlledStoreCommit(guard, () => {
      throw new Error('commit failed')
    })).toThrow('commit failed')
    expect(guard.current).toBe(false)
  })
})
