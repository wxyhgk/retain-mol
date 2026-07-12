import * as THREE from 'three'
import {
  applyBackgroundClickForIntent,
  applyBackgroundPlacement,
} from './builderBackgroundEffects'
import {
  readBuilderEditorEffects,
  readBuilderHandlerSnapshot,
  readBuilderSelectionEffects,
} from './builderHandlerContext'
import type { MoleculeStoreApi } from './builderPointerTypes'
import { useEditorStore, type EditorStoreApi } from '../store/editorStore'

export function handleBuilderBackgroundClick(
  store: MoleculeStoreApi,
  worldPos: THREE.Vector3,
  event: MouseEvent,
  viewDirLocal?: THREE.Vector3,
  editorStore: EditorStoreApi = useEditorStore,
): void {
  const { intent, molecule, editEffects } = readBuilderHandlerSnapshot(store, editorStore)
  const editorEffects = readBuilderEditorEffects(editorStore)
  const selectionEffects = readBuilderSelectionEffects(store)
  const clickInput = {
    shiftKey: event.shiftKey,
    altKey: event.altKey,
  }
  const route = applyBackgroundClickForIntent(intent, clickInput, {
    commitPendingMeasure: editorEffects.commitPendingMeasure,
    clearSelection: selectionEffects.clearSelection,
  })

  if (route.kind === 'place') {
    applyBackgroundPlacement(intent, molecule, worldPos, viewDirLocal, editEffects)
    return
  }
}
