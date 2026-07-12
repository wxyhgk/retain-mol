import type { BuildPaletteController } from '../model/useBuildPaletteController'
import { ToolRailView } from './ToolRailView'
import { useToolRailModel } from './useToolRailModel'

export type ToolRailController = Pick<BuildPaletteController, 'workspaceTool' | 'activeElement' | 'activateTool' | 'inspectElement'>

export function ToolRail({ controller, onToggleInspector }: { controller: ToolRailController; onToggleInspector: () => void }) {
  const model = useToolRailModel(controller, onToggleInspector)

  return <ToolRailView workspaceTool={controller.workspaceTool} {...model} />
}
