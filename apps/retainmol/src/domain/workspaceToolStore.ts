import { create } from 'zustand'
import type { Tool } from '@retainmol/mol-viewer/core'

export const WORKSPACE_TOOLS = ['select', 'draw', 'template', 'move', 'measure'] as const

export type WorkspaceTool = (typeof WORKSPACE_TOOLS)[number]
export type WorkspacePanel = Extract<WorkspaceTool, 'draw' | 'template'>

export type DrawOperation =
  | { readonly kind: 'replace'; readonly element: string }
  | { readonly kind: 'add-hydrogen' }
  | {
      readonly kind: 'fragment'
      readonly fragmentId: string
      readonly element?: string
    }

export interface WorkspaceToolEffects {
  readonly setActiveTool: (tool: Tool) => void
  readonly setActiveElement: (symbol: string) => void
  readonly setAtomClickMode: (mode: 'grow' | 'replace') => void
  readonly setActiveFragment: (id: string | null) => void
  readonly armBrush: () => void
  readonly disarmBrush: () => void
}

export interface WorkspaceToolState {
  readonly activePanel: WorkspacePanel | null
  readonly lastDrawOperation: DrawOperation
}

const INITIAL_WORKSPACE_TOOL_STATE: WorkspaceToolState = {
  activePanel: 'draw',
  lastDrawOperation: { kind: 'fragment', fragmentId: 'c-sp3', element: 'C' },
}

export const useWorkspaceToolStore = create<WorkspaceToolState>(() => ({
  ...INITIAL_WORKSPACE_TOOL_STATE,
}))

export function workspacePanelFor(tool: WorkspaceTool): WorkspacePanel | null {
  return tool === 'draw' || tool === 'template' ? tool : null
}

export const selectWorkspacePanel = (state: WorkspaceToolState) =>
  state.activePanel

export function deriveWorkspaceTool(
  coreTool: Tool,
  brushArmed: boolean,
  activePanel: WorkspacePanel | null,
): WorkspaceTool {
  if (activePanel) return activePanel
  if (coreTool === 'move-object') return 'move'
  if (coreTool === 'measure') return 'measure'
  return brushArmed ? 'draw' : 'select'
}

function applyDrawOperation(operation: DrawOperation, effects: WorkspaceToolEffects) {
  if (operation.kind === 'replace') {
    effects.setAtomClickMode('replace')
    effects.setActiveFragment(null)
    effects.setActiveElement(operation.element)
  } else if (operation.kind === 'add-hydrogen') {
    effects.setAtomClickMode('grow')
    effects.setActiveFragment(null)
    effects.setActiveElement('H')
  } else {
    effects.setAtomClickMode('grow')
    if (operation.element) effects.setActiveElement(operation.element)
    effects.setActiveFragment(operation.fragmentId)
  }
  effects.setActiveTool('select')
  effects.armBrush()
}

export function activateWorkspaceTool(
  tool: WorkspaceTool,
  effects: WorkspaceToolEffects,
) {
  if (tool === 'draw') {
    applyDrawOperation(useWorkspaceToolStore.getState().lastDrawOperation, effects)
  } else if (tool === 'move') {
    effects.setActiveTool('move-object')
    effects.disarmBrush()
  } else if (tool === 'measure') {
    effects.setActiveTool('measure')
    effects.disarmBrush()
  } else {
    effects.setActiveTool('select')
    effects.disarmBrush()
  }

  useWorkspaceToolStore.setState({
    activePanel: workspacePanelFor(tool),
  })
}

export function activateDrawOperation(
  operation: DrawOperation,
  effects: WorkspaceToolEffects,
) {
  useWorkspaceToolStore.setState({
    activePanel: 'draw',
    lastDrawOperation: operation,
  })
  applyDrawOperation(operation, effects)
}

export function activateTemplateFragment(
  fragmentId: string,
  element: string | undefined,
  effects: WorkspaceToolEffects,
) {
  effects.setAtomClickMode('grow')
  if (element) effects.setActiveElement(element)
  effects.setActiveFragment(fragmentId)
  effects.setActiveTool('select')
  effects.armBrush()
  useWorkspaceToolStore.setState({ activePanel: 'template' })
}

export function closeWorkspacePanel(effects: WorkspaceToolEffects) {
  activateWorkspaceTool('select', effects)
}

export function resetWorkspaceToolState() {
  useWorkspaceToolStore.setState({ ...INITIAL_WORKSPACE_TOOL_STATE })
}
