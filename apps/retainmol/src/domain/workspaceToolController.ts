import { useEditorStore } from './viewer/editorState'
import {
  activateWorkspaceTool,
  closeWorkspacePanel,
  type WorkspaceTool,
  type WorkspaceToolEffects,
} from './workspaceToolStore'

type EditorToolActions = Pick<
  ReturnType<typeof useEditorStore.getState>,
  | 'setActiveTool'
  | 'setActiveElement'
  | 'setAtomClickMode'
  | 'setActiveFragment'
  | 'armBrush'
  | 'disarmBrush'
>

export function createWorkspaceToolEffects(actions: EditorToolActions): WorkspaceToolEffects {
  return {
    setActiveTool: actions.setActiveTool,
    setActiveElement: actions.setActiveElement,
    setAtomClickMode: actions.setAtomClickMode,
    setActiveFragment: actions.setActiveFragment,
    armBrush: actions.armBrush,
    disarmBrush: actions.disarmBrush,
  }
}

export function getWorkspaceToolEffects(): WorkspaceToolEffects {
  return createWorkspaceToolEffects(useEditorStore.getState())
}

export function activateAppWorkspaceTool(tool: WorkspaceTool) {
  activateWorkspaceTool(tool, getWorkspaceToolEffects())
}

export function closeAppWorkspacePanel() {
  closeWorkspacePanel(getWorkspaceToolEffects())
}
