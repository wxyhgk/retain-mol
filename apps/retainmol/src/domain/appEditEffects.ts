import type { MolClipboard } from '@retainmol/mol-viewer/core'
import { useEditorStore, useMoleculeStore } from '@/domain/viewerAdapter'

export interface CopySelectionEffects {
  readonly copySelection: () => MolClipboard | null
  readonly setClipboard: (clipboard: MolClipboard) => void
}

export interface PasteClipboardEffects {
  readonly getClipboard: () => MolClipboard | null
  readonly pasteAtoms: (clipboard: MolClipboard) => string[]
  readonly selectAtoms: (atomIds: readonly string[], mode: 'replace') => void
}

export interface ConnectSelectedAtomsEffects {
  readonly bondSelectedAtoms: () => { ok: boolean; reason?: string }
  readonly flashHint: (message: string) => void
}

export interface ObjectAtomPositionWriteEffects {
  readonly setObjectAtomPositions: (
    objectId: string,
    positions: ReadonlyMap<string, { x: number; y: number; z: number }>,
  ) => void
}

export function copySelectionToClipboard(effects: CopySelectionEffects): boolean {
  const clipboard = effects.copySelection()
  if (!clipboard) return false
  effects.setClipboard(clipboard)
  return true
}

export function pasteClipboard(effects: PasteClipboardEffects): boolean {
  const clipboard = effects.getClipboard()
  if (!clipboard) return false
  const newIds = effects.pasteAtoms(clipboard)
  effects.selectAtoms(newIds, 'replace')
  return true
}

export function connectSelectedAtomsEffect(effects: ConnectSelectedAtomsEffects): boolean {
  const result = effects.bondSelectedAtoms()
  if (!result.ok) {
    effects.flashHint(result.reason ?? '无法成键')
    return false
  }
  return true
}

export function writeObjectAtomPositions(
  objectId: string,
  positions: ReadonlyMap<string, { x: number; y: number; z: number }>,
  effects: ObjectAtomPositionWriteEffects,
): void {
  effects.setObjectAtomPositions(objectId, positions)
}

export function copySelectionToClipboardFromStores(): boolean {
  return copySelectionToClipboard({
    copySelection: () => useMoleculeStore.getState().copySelection(),
    setClipboard: clipboard => useEditorStore.getState().setClipboard(clipboard),
  })
}

export function pasteClipboardFromStores(): boolean {
  return pasteClipboard({
    getClipboard: () => useEditorStore.getState().clipboard,
    pasteAtoms: clipboard => useMoleculeStore.getState().pasteAtoms(clipboard),
    selectAtoms: (atomIds, mode) => useMoleculeStore.getState().selectAtoms(atomIds, mode),
  })
}

export function connectSelectedAtomsFromStores(): boolean {
  return connectSelectedAtomsEffect({
    bondSelectedAtoms: () => useMoleculeStore.getState().bondSelectedAtoms(),
    flashHint: message => useEditorStore.getState().flashHint(message),
  })
}

export function writeObjectAtomPositionsFromStore(
  objectId: string,
  positions: ReadonlyMap<string, { x: number; y: number; z: number }>,
): void {
  writeObjectAtomPositions(objectId, positions, {
    setObjectAtomPositions: (targetObjectId, nextPositions) =>
      useMoleculeStore.getState().setObjectAtomPositions(targetObjectId, nextPositions),
  })
}
