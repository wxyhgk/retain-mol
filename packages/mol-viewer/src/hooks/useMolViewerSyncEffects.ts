import type { Molecule } from '../lib/molecule'
import type { MoleculeState } from '../store/slices/types'

export interface ControlledMoleculeSyncEffects {
  readonly setMolecule: (molecule: Molecule) => void
}

export interface ControlledSelectionSyncEffects {
  readonly selectAtoms: (atomIds: Iterable<string>, mode: 'replace') => void
  readonly getSelectionVersion: () => number
}

export interface ControlledSelectionPairSyncEffects {
  readonly setSelection: (atomIds: Iterable<string>, bondIds: Iterable<string>) => void
  readonly getSelectedAtomIds: () => ReadonlySet<string>
  readonly getSelectedBondIds: () => ReadonlySet<string>
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

export function commitControlledSelectionProps(
  selectedAtomIds: ReadonlySet<string> | undefined,
  selectedBondIds: ReadonlySet<string> | undefined,
  effects: ControlledSelectionPairSyncEffects,
): number | null {
  if (selectedAtomIds === undefined && selectedBondIds === undefined) return null
  effects.setSelection(
    selectedAtomIds ?? effects.getSelectedAtomIds(),
    selectedBondIds ?? effects.getSelectedBondIds(),
  )
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

export function commitControlledSelectionPropsToStore(
  selectedAtomIds: ReadonlySet<string> | undefined,
  selectedBondIds: ReadonlySet<string> | undefined,
  getState: () => Pick<
    MoleculeState,
    'setSelection' | 'selectedAtomIds' | 'selectedBondIds' | 'selectionVersion'
  >,
): number | null {
  return commitControlledSelectionProps(
    selectedAtomIds,
    selectedBondIds,
    {
      setSelection: (atomIds, bondIds) => getState().setSelection(atomIds, bondIds),
      getSelectedAtomIds: () => getState().selectedAtomIds,
      getSelectedBondIds: () => getState().selectedBondIds,
      getSelectionVersion: () => getState().selectionVersion,
    },
  )
}
