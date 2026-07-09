import type { Molecule } from '../../molecule'
import { getConnectedFragment } from '../analysis/fragments'
import type { EditCommandResult } from './commandResult'
import {
  editWithSelection,
  editWithSelectionSets,
  type CommandSelectionState,
  type EditCommandWithSelectionResult,
} from './storeCommandTypes'
import { resolveBondSelectedAtomsDecision } from './selectionBondDecision'
import { runClearMoleculeCommand } from './moleculeStoreCommands'
import { runAddBondCommand, runBondViaHydrogenCommand } from './bondTopologyCommands'
import { isSlotH } from '../queries'

export type SelectionCommandResult = {
  readonly changed: true
  readonly selectedAtomIds: Set<string>
  readonly selectedBondIds: Set<string>
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
    return { changed: true, selectedAtomIds: next, selectedBondIds: new Set(selectedBondIds) }
  }
  return { changed: true, selectedAtomIds: new Set([atomId]), selectedBondIds: new Set() }
}

export function runSelectAtomsCommand(
  selectedAtomIds: ReadonlySet<string>,
  selectedBondIds: ReadonlySet<string>,
  atomIds: Iterable<string>,
  mode: 'replace' | 'add' | 'subtract' = 'replace',
): SelectionCommandResult {
  const incoming = new Set<string>(atomIds)
  if (mode === 'replace') {
    return { changed: true, selectedAtomIds: incoming, selectedBondIds: new Set() }
  }
  const next = new Set(selectedAtomIds)
  if (mode === 'add') incoming.forEach(id => next.add(id))
  else incoming.forEach(id => next.delete(id))
  return { changed: true, selectedAtomIds: next, selectedBondIds: new Set(selectedBondIds) }
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
    return { changed: true, selectedAtomIds: new Set(selectedAtomIds), selectedBondIds: next }
  }
  return { changed: true, selectedAtomIds: new Set(), selectedBondIds: new Set([bondId]) }
}

export function runClearSelectionCommand(): SelectionCommandResult {
  return { changed: true, selectedAtomIds: new Set(), selectedBondIds: new Set() }
}

export function runPruneSelectionCommand(
  selectedAtomIds: ReadonlySet<string>,
  selectedBondIds: ReadonlySet<string>,
  validAtomIds: ReadonlySet<string>,
  validBondIds: ReadonlySet<string>,
): SelectionCommandResult {
  return {
    changed: true,
    selectedAtomIds: new Set([...selectedAtomIds].filter(id => validAtomIds.has(id))),
    selectedBondIds: new Set([...selectedBondIds].filter(id => validBondIds.has(id))),
  }
}

export function runRemoveAtomIdsFromSelectionCommand(
  selectedAtomIds: ReadonlySet<string>,
  selectedBondIds: ReadonlySet<string>,
  atomIds: Iterable<string>,
): SelectionCommandResult {
  const remove = new Set(atomIds)
  return {
    changed: true,
    selectedAtomIds: new Set([...selectedAtomIds].filter(id => !remove.has(id))),
    selectedBondIds: new Set(selectedBondIds),
  }
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
  const pruned = runPruneSelectionCommand(
    input.selectedAtomIds,
    input.selectedBondIds,
    aliveAtomIds,
    aliveBondIds,
  )
  return input.removeAtomIds
    ? runRemoveAtomIdsFromSelectionCommand(pruned.selectedAtomIds, pruned.selectedBondIds, input.removeAtomIds)
    : pruned
}

export interface BondSelectedAtomsCommandInput {
  readonly atomIds: readonly string[]
}

export function runBondSelectedAtomsCommand(
  molecule: Molecule,
  input: BondSelectedAtomsCommandInput,
): EditCommandResult {
  const decision = resolveBondSelectedAtomsDecision(molecule, input)
  switch (decision.kind) {
    case 'error':
      return { ok: false, reason: decision.reason }
    case 'bondViaHydrogen':
      return runBondViaHydrogenCommand(molecule, decision.sourceHId, decision.targetId)
    case 'addBond': {
      const result = runAddBondCommand(molecule, { atomId1: decision.atomId1, atomId2: decision.atomId2 })
      return result.ok === false && result.reason === '两原子之间已存在键'
        ? { ok: false, reason: '已经存在键' }
        : result
    }
  }
}

export interface BondViaHydrogenWithSelectionCommandInput {
  readonly sourceHId: string
  readonly targetId: string
}

export function runBondViaHydrogenWithSelectionCommand(
  molecule: Molecule,
  input: BondViaHydrogenWithSelectionCommandInput,
  selection: CommandSelectionState,
): EditCommandWithSelectionResult | { readonly ok: false; readonly reason: string } {
  const result = runBondViaHydrogenCommand(molecule, input.sourceHId, input.targetId)
  if (result.ok === false) return { ok: false, reason: result.reason }
  if (!result.changed) {
    return editWithSelection(molecule, selection, { changed: false })
  }
  const finalSelection = runSyncSelectionToMoleculeCommand({
    selectedAtomIds: selection.selectedAtomIds,
    selectedBondIds: selection.selectedBondIds,
    molecule: result.molecule,
    removeAtomIds: [input.sourceHId, input.targetId],
  })
  return editWithSelectionSets(result.molecule, finalSelection.selectedAtomIds, finalSelection.selectedBondIds, {
    changed: true,
    selectionChanged: true,
  })
}

export function runBondSelectedAtomsWithSelectionCommand(
  molecule: Molecule,
  selection: CommandSelectionState,
): EditCommandWithSelectionResult | { readonly ok: false; readonly reason: string } {
  const atomIds = [...selection.selectedAtomIds]
  const result = runBondSelectedAtomsCommand(molecule, { atomIds })
  if (result.ok === false) return { ok: false, reason: result.reason }
  if (!result.changed) {
    return editWithSelection(molecule, selection, { changed: false })
  }

  const selectedHSlotIds = atomIds.filter(id => isSlotH(molecule, id))
  const shouldDropOriginalSelection = selectedHSlotIds.length > 0
  const finalSelection = runSyncSelectionToMoleculeCommand({
    selectedAtomIds: selection.selectedAtomIds,
    selectedBondIds: selection.selectedBondIds,
    molecule: result.molecule,
    removeAtomIds: shouldDropOriginalSelection ? atomIds : undefined,
  })
  return editWithSelectionSets(result.molecule, finalSelection.selectedAtomIds, finalSelection.selectedBondIds, {
    changed: true,
    selectionChanged: shouldDropOriginalSelection,
  })
}

export function runClearMoleculeWithSelectionCommand(): EditCommandWithSelectionResult {
  const molecule = runClearMoleculeCommand().molecule
  const selection = runClearSelectionCommand()
  return editWithSelectionSets(molecule, selection.selectedAtomIds, selection.selectedBondIds, {
    changed: true,
    selectionChanged: true,
  })
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
