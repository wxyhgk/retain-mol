import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '@/domain/viewer/editorState'
import {
  deriveWorkspaceTool,
  selectWorkspacePanel,
  useWorkspaceToolStore,
  type WorkspaceTool,
} from '@/domain/workspaceToolStore'
import {
  activateAppWorkspaceTool,
  closeAppWorkspacePanel,
  createWorkspaceToolEffects,
} from '@/domain/workspaceToolController'
import {
  beginCoordinationSitePick,
  selectAtomBuildMode,
  selectHydrogenGrowMode,
} from '../application/buildModeCommands'
import { createBuildPaletteFragmentActions } from '../application/createBuildPaletteFragmentActions'
import { useBuildPaletteBondController } from './useBuildPaletteBondController'

export function useBuildPaletteController() {
  const editor = useEditorStore(useShallow(state => ({
    activeTool: state.activeTool,
    activeElement: state.activeElement,
    atomClickMode: state.atomClickMode,
    activeFragmentId: state.activeFragmentId,
    brushArmed: state.brushArmed,
    setActiveTool: state.setActiveTool,
    setActiveElement: state.setActiveElement,
    setAtomClickMode: state.setAtomClickMode,
    setActiveFragment: state.setActiveFragment,
    armBrush: state.armBrush,
    disarmBrush: state.disarmBrush,
    flashHint: state.flashHint,
  })))
  const panel = useWorkspaceToolStore(selectWorkspacePanel)
  const workspaceTool = deriveWorkspaceTool(panel, editor.activeTool)
  const bond = useBuildPaletteBondController()
  const [paletteElement, setPaletteElement] = useState(editor.activeElement)

  const effects = createWorkspaceToolEffects(editor)
  const activateTool = (tool: WorkspaceTool) => activateAppWorkspaceTool(tool)
  const inspectElement = (symbol: string) => {
    setPaletteElement(symbol)
    selectAtomBuildMode(symbol, effects)
  }
  const fragmentActions = createBuildPaletteFragmentActions({
    effects,
    flashHint: editor.flashHint,
  })

  return {
    workspaceTool,
    panel,
    activeElement: editor.activeElement,
    atomClickMode: editor.atomClickMode,
    paletteElement,
    activeFragmentId: editor.activeFragmentId,
    brushArmed: editor.brushArmed,
    selectedAtomCount: bond.selectedAtomCount,
    selectedBond: bond.selectedBond,
    activateTool,
    closePanel: closeAppWorkspacePanel,
    inspectElement,
    pickAtom: (symbol: string) => selectAtomBuildMode(symbol, effects),
    pickHydrogenGrow: () => selectHydrogenGrowMode(effects),
    pickDrawFragment: fragmentActions.pickDrawFragment,
    beginAttachmentSitePick: () => beginCoordinationSitePick(effects),
    pickAttachmentSite: fragmentActions.pickAttachmentSite,
    pickTemplateFragment: fragmentActions.pickTemplateFragment,
    pickTemplate: fragmentActions.pickTemplate,
    pickRuntimeTemplateSite: fragmentActions.pickRuntimeTemplateSite,
    connectSelectedAtoms: bond.connectSelectedAtoms,
    setSelectedBondOrder: bond.setSelectedBondOrder,
    deleteSelectedBond: bond.deleteSelectedBond,
  }
}

export type BuildPaletteController = ReturnType<typeof useBuildPaletteController>
