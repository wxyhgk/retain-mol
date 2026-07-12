import type { Molecule } from '../lib/molecule'
import type { MoleculeState } from '../store/slices/types'

export interface ControlledMoleculeSyncEffects {
  readonly setMolecule: (molecule: Molecule) => void
}

export interface ControlledSelectionSyncEffects {
  readonly selectAtoms: (atomIds: Iterable<string>, mode: 'replace') => void
  readonly getSelectionVersion: () => number
}

export interface ControlledSyncGuard {
  current: boolean
}

export function runControlledStoreCommit<T>(
  guard: ControlledSyncGuard,
  commit: () => T,
): T {
  guard.current = true
  try {
    return commit()
  } finally {
    guard.current = false
  }
}

export function shouldNotifyControlledStoreChange(guard: ControlledSyncGuard): boolean {
  return !guard.current
}

export function commitControlledMoleculeProp(
  molecule: Molecule | undefined,
  lastPropMolecule: Molecule | undefined,
  effects: ControlledMoleculeSyncEffects,
): Molecule | undefined {
  if (molecule === undefined || molecule === lastPropMolecule) return lastPropMolecule
  effects.setMolecule(molecule)
  return molecule
}

export function commitControlledSelectedAtomsProp(
  selectedAtomIds: ReadonlySet<string> | undefined,
  effects: ControlledSelectionSyncEffects,
): number | null {
  if (selectedAtomIds === undefined) return null
  effects.selectAtoms(selectedAtomIds, 'replace')
  return effects.getSelectionVersion()
}

export function commitControlledMoleculePropToStore(
  molecule: Molecule | undefined,
  lastPropMolecule: Molecule | undefined,
  getState: () => Pick<MoleculeState, 'setMolecule'>,
): Molecule | undefined {
  return commitControlledMoleculeProp(
    molecule,
    lastPropMolecule,
    { setMolecule: next => getState().setMolecule(next) },
  )
}

export function commitControlledSelectedAtomsPropToStore(
  selectedAtomIds: ReadonlySet<string> | undefined,
  getState: () => Pick<MoleculeState, 'selectAtoms' | 'selectionVersion'>,
): number | null {
  return commitControlledSelectedAtomsProp(
    selectedAtomIds,
    {
      selectAtoms: (atomIds, mode) => getState().selectAtoms(atomIds, mode),
      getSelectionVersion: () => getState().selectionVersion,
    },
  )
}
