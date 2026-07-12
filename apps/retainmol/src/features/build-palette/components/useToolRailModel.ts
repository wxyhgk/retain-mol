import { useCallback } from 'react'
import { useEditorStore } from '@/domain/viewer/editorState'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import { useUiThemeStore } from '@/domain/uiThemeStore'
import type { ToolRailController } from './ToolRail'
import { activateToolRailItem, type RailItemCommand } from './toolRailCommands'

const HELP_HINT = '快捷键：S 选择 · D 绘制 · M 测量 · Delete 删除'

export function useToolRailModel(controller: ToolRailController, onToggleInspector: () => void) {
  const removeSelected = useMoleculeStore(state => state.removeSelected)
  const selectionCount = useMoleculeStore(state => state.selectedAtomIds.size + state.selectedBondIds.size)
  const flashHint = useEditorStore(state => state.flashHint)
  const uiTheme = useUiThemeStore(state => state.theme)
  const toggleTheme = useUiThemeStore(state => state.toggleTheme)

  const activate = useCallback((item: RailItemCommand) => {
    activateToolRailItem(item, {
      activeElement: controller.activeElement,
      selectionCount,
      activateTool: controller.activateTool,
      inspectElement: controller.inspectElement,
      removeSelected,
      flashHint,
      toggleInspector: onToggleInspector,
    })
  }, [controller, flashHint, onToggleInspector, removeSelected, selectionCount])

  const showHelp = useCallback(() => flashHint(HELP_HINT), [flashHint])

  return {
    activate,
    onToggleInspector,
    showHelp,
    toggleTheme,
    uiTheme,
  }
}
