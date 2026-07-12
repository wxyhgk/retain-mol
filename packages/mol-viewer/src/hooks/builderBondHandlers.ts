import * as THREE from 'three'
import {
  ensureEditableAtomObject,
  ensureEditableBondObject,
} from './builderActivationEffects'
import {
  applyBondDragEndCommand,
  applyBondClickForIntent,
  shouldAttemptBondDragForIntent,
  shouldHandleBondClickForIntent,
  shouldStartBondDragForIntent,
} from './builderBondEffects'
import {
  readBuilderEditSnapshot,
  readBuilderHandlerSnapshot,
  readBuilderObjectActivationEffects,
  readBuilderSelectionEffects,
} from './builderHandlerContext'
import type { MoleculeStoreApi } from './builderPointerTypes'
import { useEditorStore, type EditorStoreApi } from '../store/editorStore'

export function handleBuilderBondClick(
  store: MoleculeStoreApi,
  bondId: string,
  event: MouseEvent,
  editorStore: EditorStoreApi = useEditorStore,
): void {
  const { intent } = readBuilderHandlerSnapshot(store, editorStore)
  if (!shouldHandleBondClickForIntent(intent, {
    shiftKey: event.shiftKey,
    altKey: event.altKey,
  })) return

  const activeMolecule = readBuilderEditSnapshot(store, editorStore).molecule
  if (!ensureEditableBondObject(bondId, activeMolecule, readBuilderObjectActivationEffects(store))) return

  const { molecule, editEffects } = readBuilderEditSnapshot(store, editorStore)
  const selectionEffects = readBuilderSelectionEffects(store)
  applyBondClickForIntent(intent, molecule, {
    bondId,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
  }, {
    selectBond: multi => selectionEffects.selectBond(bondId, multi),
    editEffects,
  })
}

export function handleBuilderBondDragStart(
  store: MoleculeStoreApi,
  sourceId: string,
  editorStore: EditorStoreApi = useEditorStore,
): boolean {
  const { intent, selectedAtomIds } = readBuilderHandlerSnapshot(store, editorStore)
  const input = { sourceId, selectedAtomIds }
  if (!shouldAttemptBondDragForIntent(intent, input)) return false

  if (!ensureEditableAtomObject(sourceId, readBuilderObjectActivationEffects(store))) return false

  return shouldStartBondDragForIntent(intent, readBuilderEditSnapshot(store, editorStore).molecule, input)
}

export function handleBuilderBondDragEnd(
  store: MoleculeStoreApi,
  sourceId: string,
  targetId: string | null,
  dropLocal: THREE.Vector3 | null,
  editorStore: EditorStoreApi = useEditorStore,
): void {
  const { intent, molecule, editEffects } = readBuilderHandlerSnapshot(store, editorStore)
  applyBondDragEndCommand(intent, molecule, {
    sourceId,
    targetId,
    dropLocal,
  }, editEffects)
}
