import type { Molecule } from '../../../molecule'
import { getConnectedFragment } from '../../analysis/fragments'
import {
  selectionSetsEqual,
} from '../shared'

export type SelectionCommandResult = {
  readonly selectionChanged: boolean
  readonly selectedAtomIds: Set<string>
  readonly selectedBondIds: Set<string>
}

function selectionResult(
  previousAtomIds: ReadonlySet<string>,
  previousBondIds: ReadonlySet<string>,
  selectedAtomIds: Set<string>,
  selectedBondIds: Set<string>,
): SelectionCommandResult {
  return {
    selectionChanged:
      !selectionSetsEqual(previousAtomIds, selectedAtomIds) ||
      !selectionSetsEqual(previousBondIds, selectedBondIds),
    selectedAtomIds,
    selectedBondIds,
  }
}

export function runSelectAtomCommand(
  selectedAtomIds: ReadonlySet<string>,
  selectedBondIds: ReadonlySet<string>,
  atomId: string,
  multi = false,
): SelectionCommandResult {
  if (multi) {
    const next = new Set(selectedAtomIds)
    next.has(atomId) ? next.delete(atomId) : next.add(atomId)
    return selectionResult(selectedAtomIds, selectedBondIds, next, new Set(selectedBondIds))
  }
  return selectionResult(selectedAtomIds, selectedBondIds, new Set([atomId]), new Set())
}

export function runSelectAtomsCommand(
  selectedAtomIds: ReadonlySet<string>,
  selectedBondIds: ReadonlySet<string>,
  atomIds: Iterable<string>,
  mode: 'replace' | 'add' | 'subtract' = 'replace',
): SelectionCommandResult {
  const incoming = new Set<string>(atomIds)
  if (mode === 'replace') {
    return selectionResult(selectedAtomIds, selectedBondIds, incoming, new Set())
  }
  const next = new Set(selectedAtomIds)
  if (mode === 'add') incoming.forEach(id => next.add(id))
  else incoming.forEach(id => next.delete(id))
  return selectionResult(selectedAtomIds, selectedBondIds, next, new Set(selectedBondIds))
}

export function runSelectBondCommand(
  selectedAtomIds: ReadonlySet<string>,
  selectedBondIds: ReadonlySet<string>,
  bondId: string,
  multi = false,
): SelectionCommandResult {
  if (multi) {
    const next = new Set(selectedBondIds)
    next.has(bondId) ? next.delete(bondId) : next.add(bondId)
    return selectionResult(selectedAtomIds, selectedBondIds, new Set(selectedAtomIds), next)
  }
  return selectionResult(selectedAtomIds, selectedBondIds, new Set(), new Set([bondId]))
}

export function runSetSelectionCommand(
  selectedAtomIds: ReadonlySet<string>,
  selectedBondIds: ReadonlySet<string>,
  nextAtomIds: Iterable<string>,
  nextBondIds: Iterable<string>,
): SelectionCommandResult {
  return selectionResult(
    selectedAtomIds,
    selectedBondIds,
    new Set(nextAtomIds),
    new Set(nextBondIds),
  )
}

export function runClearSelectionCommand(
  selectedAtomIds: ReadonlySet<string>,
  selectedBondIds: ReadonlySet<string>,
): SelectionCommandResult {
  return selectionResult(selectedAtomIds, selectedBondIds, new Set(), new Set())
}

export function runPruneSelectionCommand(
  selectedAtomIds: ReadonlySet<string>,
  selectedBondIds: ReadonlySet<string>,
  validAtomIds: ReadonlySet<string>,
  validBondIds: ReadonlySet<string>,
): SelectionCommandResult {
  return selectionResult(
    selectedAtomIds,
    selectedBondIds,
    new Set([...selectedAtomIds].filter(id => validAtomIds.has(id))),
    new Set([...selectedBondIds].filter(id => validBondIds.has(id))),
  )
}

export function runRemoveAtomIdsFromSelectionCommand(
  selectedAtomIds: ReadonlySet<string>,
  selectedBondIds: ReadonlySet<string>,
  atomIds: Iterable<string>,
): SelectionCommandResult {
  const remove = new Set(atomIds)
  return selectionResult(
    selectedAtomIds,
    selectedBondIds,
    new Set([...selectedAtomIds].filter(id => !remove.has(id))),
    new Set(selectedBondIds),
  )
}

export interface SyncSelectionToMoleculeCommandInput {
  readonly selectedAtomIds: ReadonlySet<string>
  readonly selectedBondIds: ReadonlySet<string>
  readonly molecule: Molecule
  readonly removeAtomIds?: Iterable<string>
}

export function runSyncSelectionToMoleculeCommand(
  input: SyncSelectionToMoleculeCommandInput,
): SelectionCommandResult {
  const aliveAtomIds = new Set(input.molecule.atoms.map(atom => atom.id))
  const aliveBondIds = new Set(input.molecule.bonds.map(bond => bond.id))
  const removedAtomIds = new Set(input.removeAtomIds ?? [])
  return selectionResult(
    input.selectedAtomIds,
    input.selectedBondIds,
    new Set([...input.selectedAtomIds].filter(id => aliveAtomIds.has(id) && !removedAtomIds.has(id))),
    new Set([...input.selectedBondIds].filter(id => aliveBondIds.has(id))),
  )
}

export interface SelectConnectedFragmentCommandInput {
  readonly atomId: string
}

export type SelectConnectedFragmentCommandResult =
  | { readonly ok: true; readonly atomIds: ReadonlySet<string> }
  | { readonly ok: false; readonly reason: string }

export function runSelectConnectedFragmentCommand(
  molecule: Molecule,
  input: SelectConnectedFragmentCommandInput,
): SelectConnectedFragmentCommandResult {
  if (!molecule.atoms.some(atom => atom.id === input.atomId)) {
    return { ok: false, reason: '原子不存在' }
  }
  return {
    ok: true,
    atomIds: getConnectedFragment(molecule.atoms, molecule.bonds, input.atomId),
  }
}
