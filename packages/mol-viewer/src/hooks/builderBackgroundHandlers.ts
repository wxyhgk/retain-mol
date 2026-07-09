import * as THREE from 'three'
import { applyBackgroundClickForIntent, applyBackgroundDoubleClickPlacement } from './builderBackgroundEffects'
import {
  readBuilderEditorEffects,
  readBuilderHandlerSnapshot,
  readBuilderSelectionEffects,
} from './builderHandlerContext'
import type { MoleculeStoreApi } from './builderPointerTypes'

export function handleBuilderBackgroundClick(
  store: MoleculeStoreApi,
  event: MouseEvent,
): void {
  const { intent } = readBuilderHandlerSnapshot(store)
  const editorEffects = readBuilderEditorEffects()
  const selectionEffects = readBuilderSelectionEffects(store)
  applyBackgroundClickForIntent(intent, {
    shiftKey: event.shiftKey,
    altKey: event.altKey,
  }, {
    commitPendingMeasure: editorEffects.commitPendingMeasure,
    clearSelection: selectionEffects.clearSelection,
  })
}

export function handleBuilderBackgroundDoubleClick(
  store: MoleculeStoreApi,
  worldPos: THREE.Vector3,
  viewDirLocal?: THREE.Vector3,
): void {
  const { intent, molecule, editEffects } = readBuilderHandlerSnapshot(store)
  applyBackgroundDoubleClickPlacement(intent, molecule, worldPos, viewDirLocal, editEffects)
}
