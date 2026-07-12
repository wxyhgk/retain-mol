import type { Molecule } from '../../../molecule'
import type { MolClipboard } from '../../../types'
import type { EditCommandResultWithMeta } from './commandResult'

export interface CommandSelectionState {
  readonly selectedAtomIds: ReadonlySet<string>
  readonly selectedBondIds: ReadonlySet<string>
}

export interface EditCommandWithSelectionResult {
  readonly ok: true
  readonly moleculeChanged: boolean
  readonly selectionChanged: boolean
  readonly molecule: Molecule
  readonly selectedAtomIds: Set<string>
  readonly selectedBondIds: Set<string>
}

export function selectionSetsEqual(
  left: ReadonlySet<string>,
  right: ReadonlySet<string>,
): boolean {
  return left.size === right.size && [...left].every(id => right.has(id))
}

export function editWithSelection(
  molecule: Molecule,
  selection: CommandSelectionState,
  options: {
    readonly moleculeChanged: boolean
  },
): EditCommandWithSelectionResult {
  return {
    ok: true,
    moleculeChanged: options.moleculeChanged,
    selectionChanged: false,
    molecule,
    selectedAtomIds: new Set(selection.selectedAtomIds),
    selectedBondIds: new Set(selection.selectedBondIds),
  }
}

export function editWithSelectionSets(
  molecule: Molecule,
  selectedAtomIds: Iterable<string>,
  selectedBondIds: Iterable<string>,
  previousSelection: CommandSelectionState,
  options: {
    readonly moleculeChanged: boolean
  },
): EditCommandWithSelectionResult {
  const nextAtomIds = new Set(selectedAtomIds)
  const nextBondIds = new Set(selectedBondIds)
  return {
    ok: true,
    moleculeChanged: options.moleculeChanged,
    selectionChanged:
      !selectionSetsEqual(previousSelection.selectedAtomIds, nextAtomIds) ||
      !selectionSetsEqual(previousSelection.selectedBondIds, nextBondIds),
    molecule,
    selectedAtomIds: nextAtomIds,
    selectedBondIds: nextBondIds,
  }
}

export interface ClipboardCommandResult {
  readonly clipboard: MolClipboard | null
}

export type PasteAtomsCommandResult =
  | ({ ok: true; changed: true; molecule: Molecule } & { newAtomIds: string[] })
  | ({ ok: true; changed: false } & { newAtomIds: string[] })

export type GeomCommandResult =
  | { ok: true; changed: true; molecule: Molecule }
  | { ok: true; changed: false }
  | { ok: false; reason: string }

export type AddAtomCommandResult =
  Extract<EditCommandResultWithMeta<{ atomId: string }>, { ok: true; changed: true }>

export type CleanupGeometryCommandResult =
  | { ok: true; changed: true; molecule: Molecule }
  | { ok: false; reason: string }

export type MoleculeChangedCommandResult = { ok: true; changed: true; molecule: Molecule }
