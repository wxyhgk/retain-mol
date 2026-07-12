import type { Tool } from '@retainmol/mol-viewer/core'
import {
  activateDrawOperation,
  activateTemplateFragment,
  activateWorkspaceTool,
  type WorkspaceToolEffects,
} from '@/domain/workspaceToolStore'

export type BuildModeEffects = WorkspaceToolEffects

export function selectAtomBuildMode(
  symbol: string,
  effects: BuildModeEffects,
) {
  activateDrawOperation({ kind: 'replace', element: symbol }, effects)
}

export function selectHydrogenGrowMode(effects: BuildModeEffects) {
  activateDrawOperation({ kind: 'add-hydrogen' }, effects)
}

export function selectFragmentBuildMode(
  fragmentId: string,
  element: string | undefined,
  effects: BuildModeEffects,
) {
  activateDrawOperation({ kind: 'fragment', fragmentId, element }, effects)
}

export function selectTemplateFragmentBuildMode(
  fragmentId: string,
  element: string | undefined,
  effects: BuildModeEffects,
) {
  activateTemplateFragment(fragmentId, element, effects)
}

export function activateBuildMode(effects: BuildModeEffects) {
  activateWorkspaceTool('draw', effects)
}

export function activateSelectMode(effects: BuildModeEffects) {
  activateWorkspaceTool('select', effects)
}

export function activateNonBuildTool(tool: Exclude<Tool, 'select'>, effects: BuildModeEffects) {
  activateWorkspaceTool(tool === 'move-object' ? 'move' : 'measure', effects)
}
