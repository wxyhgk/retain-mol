import type { Vector3Data } from '../lib/model/types'
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
  readEditableMoleculeContainingAtom,
  readBuilderHandlerSnapshot,
  readBuilderObjectActivationEffects,
  readBuilderSelectionEffects,
} from './builderHandlerContext'
import type { BuilderMoleculeStoreApi } from './builderPointerTypes'
import { useEditorStore, type EditorStoreApi } from '../store/editorStore'

export function handleBuilderBondClick(
  store: BuilderMoleculeStoreApi,
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
  store: BuilderMoleculeStoreApi,
  sourceId: string,
  editorStore: EditorStoreApi = useEditorStore,
): boolean {
  if (!canHandleBuilderBondDrag(store, sourceId, editorStore)) return false
  if (!ensureEditableAtomObject(sourceId, readBuilderObjectActivationEffects(store))) return false

  const { intent, selectedAtomIds } = readBuilderHandlerSnapshot(store, editorStore)
  return shouldStartBondDragForIntent(
    intent,
    readBuilderEditSnapshot(store, editorStore).molecule,
    { sourceId, selectedAtomIds },
  )
}

/** Pure pointer-down eligibility check. It must never activate a scene object. */
export function canHandleBuilderBondDrag(
  store: BuilderMoleculeStoreApi,
  sourceId: string,
  editorStore: EditorStoreApi = useEditorStore,
): boolean {
  const { intent, selectedAtomIds } = readBuilderHandlerSnapshot(store, editorStore)
  const input = { sourceId, selectedAtomIds }
  if (!shouldAttemptBondDragForIntent(intent, input)) return false
  const molecule = readEditableMoleculeContainingAtom(store, sourceId)
  return molecule !== null && shouldStartBondDragForIntent(intent, molecule, input)
}

export function handleBuilderBondDragEnd(
  store: BuilderMoleculeStoreApi,
  sourceId: string,
  targetId: string | null,
  dropLocal: Vector3Data | null,
  editorStore: EditorStoreApi = useEditorStore,
): void {
  const { intent, molecule, editEffects } = readBuilderHandlerSnapshot(store, editorStore)
  applyBondDragEndCommand(intent, molecule, {
    sourceId,
    targetId,
    dropLocal,
  }, editEffects)
}
