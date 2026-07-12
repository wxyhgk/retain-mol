import { useState } from 'react'
import { getFragment } from '@retainmol/mol-viewer/fragments'
import { useEditorStore } from '@/domain/viewer/editorState'
import { selectActiveMolecule, useMoleculeStore } from '@/domain/viewer/moleculeState'
import {
  activateWorkspaceTool as setWorkspaceTool,
  closeWorkspacePanel,
  useWorkspaceToolStore,
  deriveWorkspaceTool,
  type WorkspaceTool,
  type WorkspaceToolEffects,
} from '@/domain/workspaceToolStore'
import { connectSelectedAtoms } from '@/domain/moleculeEditCommands'
import { placeMoleculeInViewer } from '@/features/molecule-placement'
import {
  selectAtomBuildMode,
  selectFragmentBuildMode,
  selectHydrogenGrowMode,
  selectTemplateFragmentBuildMode,
} from '../application/buildModeCommands'
import { activateRuntimeTemplateBrush, type RuntimeTemplateSite } from '../application/runtimeTemplateBrush'
import { createCanvasMoleculeFromTemplate, type CanvasTemplateSummary } from '../domain/buildCatalog'

type BondOrder = 1 | 2 | 3

export function useBuildPaletteController() {
  const editor = useEditorStore()
  const activePanel = useWorkspaceToolStore(state => state.activePanel)
  const selectedAtomIds = useMoleculeStore(state => state.selectedAtomIds)
  const selectedBondIds = useMoleculeStore(state => state.selectedBondIds)
  const molecule = useMoleculeStore(selectActiveMolecule)
  const removeBond = useMoleculeStore(state => state.removeBond)
  const setBondOrder = useMoleculeStore(state => state.setBondOrder)
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
  const selectedBondId = selectedBondIds.size === 1
    ? selectedBondIds.values().next().value
    : undefined
  const selectedBond = selectedBondId
    ? molecule?.bonds.find(bond => bond.id === selectedBondId)
    : undefined
  const selectedBondAtoms = selectedBond
    ? [
        molecule?.atoms.find(atom => atom.id === selectedBond.atomId1)?.symbol ?? '?',
        molecule?.atoms.find(atom => atom.id === selectedBond.atomId2)?.symbol ?? '?',
      ]
    : null

  const activateTool = (tool: WorkspaceTool) => setWorkspaceTool(tool, effects)
  const inspectElement = (symbol: string) => {
    setPaletteElement(symbol)
    selectAtomBuildMode(symbol, effects)
  }
  const pickDrawFragment = (id: string) => {
    const fragment = getFragment(id)
    selectFragmentBuildMode(id, fragment?.atoms[fragment.attachIndex]?.symbol, effects)
  }
  const pickTemplateFragment = (id: string) => {
    const fragment = getFragment(id)
    selectTemplateFragmentBuildMode(id, fragment?.atoms[fragment.attachIndex]?.symbol, effects)
  }
  const pickTemplate = (id: string) => {
    const nextMolecule = createCanvasMoleculeFromTemplate(id)
    if (nextMolecule) void placeMoleculeInViewer(nextMolecule, { mode: 'replace' })
  }
  const pickRuntimeTemplateSite = (
    template: CanvasTemplateSummary,
    site: RuntimeTemplateSite,
    flipped: boolean,
  ) => {
    if (!template.molecule) return false
    try {
      const fragment = activateRuntimeTemplateBrush({
        templateId: template.id,
        templateName: template.name,
        molecule: template.molecule,
        site,
        flipped,
      })
      selectTemplateFragmentBuildMode(
        fragment.id,
        fragment.atoms[fragment.attachIndex]?.symbol,
        effects,
      )
      return true
    } catch (error) {
      editor.flashHint(error instanceof Error ? error.message : '无法使用所选模板位点')
      return false
    }
  }

  const setSelectedBondOrder = (order: BondOrder) => {
    if (selectedBondId) setBondOrder(selectedBondId, order)
  }

  return {
    workspaceTool,
    panel,
    activeElement: editor.activeElement,
    atomClickMode: editor.atomClickMode,
    paletteElement,
    activeFragmentId: editor.activeFragmentId,
    brushArmed: editor.brushArmed,
    selectedAtomCount: selectedAtomIds.size,
    selectedBond: selectedBond && selectedBondAtoms
      ? {
          id: selectedBond.id,
          order: selectedBond.order,
          atomSymbols: selectedBondAtoms,
        }
      : null,
    activateTool,
    closePanel: () => closeWorkspacePanel(effects),
    inspectElement,
    pickAtom: (symbol: string) => selectAtomBuildMode(symbol, effects),
    pickHydrogenGrow: () => selectHydrogenGrowMode(effects),
    pickDrawFragment,
    pickTemplateFragment,
    pickTemplate,
    pickRuntimeTemplateSite,
    connectSelectedAtoms,
    setSelectedBondOrder,
    deleteSelectedBond: () => {
      if (selectedBondId) removeBond(selectedBondId)
    },
  }
}

export type BuildPaletteController = ReturnType<typeof useBuildPaletteController>
