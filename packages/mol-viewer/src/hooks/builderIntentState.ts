import { useEditorStore } from '../store/editorStore'
import {
  resolveBuilderIntent,
  type BuilderIntent,
} from '../lib/builder/commands/builderIntent'

export function readBuilderIntent(): BuilderIntent {
  const {
    activeTool,
    activeElement,
    activeFragmentId,
    atomClickMode,
    brushArmed,
    sketchPlane,
  } = useEditorStore.getState()
  return resolveBuilderIntent({
    activeTool,
    activeElement,
    activeFragmentId,
    atomClickMode,
    brushArmed,
    sketchPlane,
  })
}
