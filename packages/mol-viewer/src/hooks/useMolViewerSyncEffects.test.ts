import { describe, expect, it } from 'vitest'
import type { Molecule } from '../lib/molecule'
import {
  commitControlledMoleculeProp,
  commitControlledMoleculePropToStore,
  commitControlledSelectedAtomsProp,
  commitControlledSelectedAtomsPropToStore,
} from './useMolViewerSyncEffects'

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
})
