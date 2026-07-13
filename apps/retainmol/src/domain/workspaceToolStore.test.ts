import { beforeEach, describe, expect, it } from 'vitest'
import type { Tool } from '@retainmol/mol-viewer/core'
import {
  activateDrawOperation,
  activateTemplateFragment,
  activateWorkspaceTool,
  closeWorkspacePanel,
  deriveWorkspaceTool,
  resetWorkspaceToolState,
  selectWorkspacePanel,
  useWorkspaceToolStore,
  type WorkspaceToolEffects,
} from './workspaceToolStore'

function createHarness() {
  const state: {
    coreTool: Tool
    element: string
    mode: 'grow' | 'replace'
    fragmentId: string | null
    brushArmed: boolean
  } = {
    coreTool: 'select',
    element: 'C',
    mode: 'grow',
    fragmentId: 'c-sp3',
    brushArmed: true,
  }
  const effects: WorkspaceToolEffects = {
    setActiveTool: coreTool => { state.coreTool = coreTool },
    setActiveElement: element => { state.element = element },
    setAtomClickMode: mode => { state.mode = mode },
    setActiveFragment: fragmentId => { state.fragmentId = fragmentId },
    armBrush: () => { state.brushArmed = true },
    disarmBrush: () => { state.brushArmed = false },
  }
  return { state, effects }
}

describe('workspaceToolStore', () => {
  beforeEach(resetWorkspaceToolState)

  it('maps all five workspace tools to the three core tools and brush state', () => {
    const expected = {
      select: { coreTool: 'select', brushArmed: false, panel: null },
      draw: { coreTool: 'select', brushArmed: true, panel: 'draw' },
      template: { coreTool: 'select', brushArmed: false, panel: 'template' },
      move: { coreTool: 'move-object', brushArmed: false, panel: null },
      measure: { coreTool: 'measure', brushArmed: false, panel: null },
    } as const

    for (const [tool, result] of Object.entries(expected)) {
      const { state, effects } = createHarness()
      activateWorkspaceTool(tool as keyof typeof expected, effects)
      const workspace = useWorkspaceToolStore.getState()
      expect({
        coreTool: state.coreTool,
        brushArmed: state.brushArmed,
        panel: selectWorkspacePanel(workspace),
        workspaceTool: deriveWorkspaceTool(workspace.activePanel, state.coreTool),
      }).toEqual({ ...result, workspaceTool: tool })
    }
  })

  it('closes a context panel by returning to unarmed select', () => {
    const { state, effects } = createHarness()
    activateWorkspaceTool('template', effects)
    closeWorkspacePanel(effects)

    expect(useWorkspaceToolStore.getState().activePanel).toBeNull()
    expect(selectWorkspacePanel(useWorkspaceToolStore.getState())).toBeNull()
    expect(state).toMatchObject({ coreTool: 'select', brushArmed: false })
  })

  it('restores the last draw operation after using a template brush', () => {
    const { state, effects } = createHarness()
    activateDrawOperation({ kind: 'replace', element: 'N' }, effects)
    activateWorkspaceTool('template', effects)
    activateTemplateFragment('benzene', 'C', effects)

    expect(state).toMatchObject({ element: 'C', fragmentId: 'benzene', brushArmed: true })
    expect(useWorkspaceToolStore.getState().lastDrawOperation).toEqual({
      kind: 'replace',
      element: 'N',
    })

    activateWorkspaceTool('draw', effects)

    expect(useWorkspaceToolStore.getState().activePanel).toBe('draw')
    expect(state).toMatchObject({
      coreTool: 'select',
      element: 'N',
      mode: 'replace',
      fragmentId: null,
      brushArmed: true,
    })
  })
})
