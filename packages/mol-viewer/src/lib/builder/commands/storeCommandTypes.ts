import type { Molecule } from '../../molecule'
import type { MolClipboard } from '../../types'
import type { EditCommandResultWithMeta } from './commandResult'

export interface CommandSelectionState {
  readonly selectedAtomIds: ReadonlySet<string>
  readonly selectedBondIds: ReadonlySet<string>
}

export interface EditCommandWithSelectionResult {
  readonly ok: true
  readonly changed: boolean
  readonly molecule: Molecule
  readonly selectedAtomIds: Set<string>
  readonly selectedBondIds: Set<string>
  readonly selectionChanged?: boolean
}

export function editWithSelection(
  molecule: Molecule,
  selection: CommandSelectionState,
  options: {
    readonly changed: boolean
    readonly selectionChanged?: boolean
  },
): EditCommandWithSelectionResult {
  return {
    ok: true,
    changed: options.changed,
    molecule,
    selectedAtomIds: new Set(selection.selectedAtomIds),
    selectedBondIds: new Set(selection.selectedBondIds),
    selectionChanged: options.selectionChanged,
  }
}

export function editWithSelectionSets(
  molecule: Molecule,
  selectedAtomIds: Iterable<string>,
  selectedBondIds: Iterable<string>,
  options: {
    readonly changed: boolean
    readonly selectionChanged?: boolean
  },
): EditCommandWithSelectionResult {
  return {
    ok: true,
    changed: options.changed,
    molecule,
    selectedAtomIds: new Set(selectedAtomIds),
    selectedBondIds: new Set(selectedBondIds),
    selectionChanged: options.selectionChanged,
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
