import type { WorkspaceTool } from '@/domain/workspaceToolStore'

export type RailItemCommand = {
  id: string
  workspaceTool?: WorkspaceTool
}

export type ToolRailCommandDependencies = {
  activeElement: string
  selectionCount: number
  activateTool: (tool: WorkspaceTool) => void
  inspectElement: (symbol: string) => void
  removeSelected: () => void
  flashHint: (message: string) => void
  toggleInspector: () => void
}

export function activateToolRailItem(item: RailItemCommand, dependencies: ToolRailCommandDependencies) {
  if (item.workspaceTool) {
    dependencies.activateTool(item.workspaceTool)
    return
  }
  if (item.id === 'erase') {
    if (dependencies.selectionCount > 0) dependencies.removeSelected()
    else dependencies.flashHint('先选择需要删除的原子或键')
    return
  }
  if (item.id === 'atom') {
    dependencies.inspectElement(dependencies.activeElement)
    dependencies.activateTool('draw')
    return
  }
  if (item.id === 'charge') {
    dependencies.activateTool('select')
    dependencies.toggleInspector()
    dependencies.flashHint('选择原子后，在 Inspector 中修改形式电荷')
    return
  }
  dependencies.flashHint(item.id === 'text' ? '文本工具为后续工作区占位' : '更多工具为后续工作区占位')
}
