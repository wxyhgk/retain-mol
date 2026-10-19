import { useEditorStore, type EditorStoreApi } from '../store/editorStore'
import {
  resolveBuilderIntent,
  type BuilderIntent,
} from '../lib/builder/commands/interaction'

export function readBuilderIntent(editorStore: EditorStoreApi = useEditorStore): BuilderIntent {
  const {
    activeTool,
    activeElement,
    activeFragmentId,
    atomClickMode,
    brushArmed,
    sketchPlane,
  } = editorStore.getState()
  return resolveBuilderIntent({
    activeTool,
    activeElement,
    activeFragmentId,
    atomClickMode,
    brushArmed,
    sketchPlane,
  })
}
