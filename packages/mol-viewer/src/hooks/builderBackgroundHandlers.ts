import type { Vector3Data } from '../lib/types'
import {
  applyBackgroundClickForIntent,
  applyBackgroundPlacement,
} from './builderBackgroundEffects'
import {
  readBuilderEditorEffects,
  readBuilderHandlerSnapshot,
  readBuilderSelectionEffects,
} from './builderHandlerContext'
import type { BuilderMoleculeStoreApi } from './builderPointerTypes'
import { useEditorStore, type EditorStoreApi } from '../store/editorStore'

export function handleBuilderBackgroundClick(
  store: BuilderMoleculeStoreApi,
  worldPos: Vector3Data,
  event: MouseEvent,
  viewDirLocal?: Vector3Data,
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
