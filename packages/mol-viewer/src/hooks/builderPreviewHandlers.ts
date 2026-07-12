import * as THREE from 'three'
import type { GrowGuideSpec } from '../lib/types'
import {
  getGrowGuideForIntent,
  getGrowPreviewForIntent,
} from './builderPreviewEffects'
import { readBuilderHandlerSnapshot } from './builderHandlerContext'
import type { MoleculeStoreApi } from './builderPointerTypes'
import { useEditorStore, type EditorStoreApi } from '../store/editorStore'

export function getBuilderGrowPreview(
  store: MoleculeStoreApi,
  sourceId: string,
  cursorLocal: THREE.Vector3,
  freeDirection: boolean,
  editorStore: EditorStoreApi = useEditorStore,
): { pos: THREE.Vector3; radius: number; color: number } | null {
  const { intent, molecule } = readBuilderHandlerSnapshot(store, editorStore)
  return getGrowPreviewForIntent(intent, molecule, {
    sourceId,
    cursorLocal,
    freeDirection,
  })
}

export function getBuilderGrowGuide(
  store: MoleculeStoreApi,
  sourceId: string,
  editorStore: EditorStoreApi = useEditorStore,
): GrowGuideSpec {
  const { intent, molecule } = readBuilderHandlerSnapshot(store, editorStore)
  return getGrowGuideForIntent(intent, molecule, sourceId)
}
