import type { GrowGuideSpec, Vector3Data } from '../lib/types'
import {
  getGrowGuideForIntent,
  getGrowPreviewForIntent,
} from './builderPreviewEffects'
import { readBuilderHandlerSnapshot } from './builderHandlerContext'
import type { BuilderMoleculeStoreApi } from './builderPointerTypes'
import { useEditorStore, type EditorStoreApi } from '../store/editorStore'

export function getBuilderGrowPreview(
  store: BuilderMoleculeStoreApi,
  sourceId: string,
  cursorLocal: Vector3Data,
  freeDirection: boolean,
  editorStore: EditorStoreApi = useEditorStore,
): ReturnType<typeof getGrowPreviewForIntent> {
  const { intent, molecule } = readBuilderHandlerSnapshot(store, editorStore)
  return getGrowPreviewForIntent(intent, molecule, {
    sourceId,
    cursorLocal,
    freeDirection,
  })
}

export function getBuilderGrowGuide(
  store: BuilderMoleculeStoreApi,
  sourceId: string,
  editorStore: EditorStoreApi = useEditorStore,
): GrowGuideSpec {
  const { intent, molecule } = readBuilderHandlerSnapshot(store, editorStore)
  return getGrowGuideForIntent(intent, molecule, sourceId)
}
