import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '@/domain/viewer/editorState'
import {
  activateWorkspaceTool as setWorkspaceTool,
  closeWorkspacePanel,
  useWorkspaceToolStore,
  deriveWorkspaceTool,
  type WorkspaceTool,
  type WorkspaceToolEffects,
} from '@/domain/workspaceToolStore'
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
  const activePanel = useWorkspaceToolStore(state => state.activePanel)
  const bond = useBuildPaletteBondController()
  const [paletteElement, setPaletteElement] = useState(editor.activeElement)

  const effects: WorkspaceToolEffects = {
    setActiveTool: editor.setActiveTool,
    setActiveElement: editor.setActiveElement,
    setAtomClickMode: editor.setAtomClickMode,
    setActiveFragment: editor.setActiveFragment,
    armBrush: editor.armBrush,
    disarmBrush: editor.disarmBrush,
  }
  const workspaceTool = deriveWorkspaceTool(editor.activeTool, editor.brushArmed, activePanel)
  const panel = activePanel
  const activateTool = (tool: WorkspaceTool) => setWorkspaceTool(tool, effects)
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
    closePanel: () => closeWorkspacePanel(effects),
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
