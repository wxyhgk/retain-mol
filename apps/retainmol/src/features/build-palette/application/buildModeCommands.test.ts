import { beforeEach, describe, expect, it } from 'vitest'
import type { Tool } from '@retainmol/mol-viewer/core'
import { resetWorkspaceToolState, useWorkspaceToolStore } from '@/domain/workspaceToolStore'
import {
  activateBuildMode,
  activateNonBuildTool,
  activateSelectMode,
  selectAtomBuildMode,
  selectFragmentBuildMode,
  selectHydrogenGrowMode,
  type BuildModeEffects,
} from './buildModeCommands'

function createHarness() {
  const state: {
    tool: Tool
    element: string
    mode: 'grow' | 'replace'
    fragment: string | null
    armed: boolean
  } = { tool: 'measure', element: 'C', mode: 'grow', fragment: 'benzene', armed: false }
  const effects: BuildModeEffects = {
    setActiveTool: tool => { state.tool = tool },
    setActiveElement: element => { state.element = element; state.fragment = null; state.armed = true },
    setAtomClickMode: mode => { state.mode = mode },
    setActiveFragment: fragment => { state.fragment = fragment; state.armed = fragment !== null },
    armBrush: () => { state.armed = true },
    disarmBrush: () => { state.armed = false },
  }
  return { state, effects }
}

describe('build mode commands', () => {
  beforeEach(resetWorkspaceToolState)

  it('selects an atom as the exclusive armed replace brush', () => {
    const { state, effects } = createHarness()
    selectAtomBuildMode('N', effects)
    expect(state).toEqual({ tool: 'select', element: 'N', mode: 'replace', fragment: null, armed: true })
    expect(useWorkspaceToolStore.getState().activePanel).toBe('draw')
  })

  it('selects a fragment as the armed brush and preserves its attach element', () => {
    const { state, effects } = createHarness()
    state.mode = 'replace'
    selectFragmentBuildMode('c-sp2', 'C', effects)
    expect(state).toMatchObject({ tool: 'select', element: 'C', mode: 'grow', fragment: 'c-sp2', armed: true })
    expect(useWorkspaceToolStore.getState().lastDrawOperation).toEqual({
      kind: 'fragment',
      fragmentId: 'c-sp2',
      element: 'C',
    })
  })

  it('selects H grow mode without a fragment', () => {
    const { state, effects } = createHarness()
    state.mode = 'replace'
    selectHydrogenGrowMode(effects)
    expect(state).toEqual({ tool: 'select', element: 'H', mode: 'grow', fragment: null, armed: true })
  })

  it('keeps build/select/non-build tool states mutually exclusive', () => {
    const { state, effects } = createHarness()
    activateBuildMode(effects)
    expect(state).toMatchObject({ tool: 'select', fragment: 'c-sp3', armed: true })
    activateSelectMode(effects)
    expect(state).toMatchObject({ tool: 'select', armed: false, fragment: 'c-sp3' })
    activateBuildMode(effects)
    expect(state).toMatchObject({ tool: 'select', armed: true, fragment: 'c-sp3' })
    activateNonBuildTool('move-object', effects)
    expect(state).toMatchObject({ tool: 'move-object', armed: false })
    activateNonBuildTool('measure', effects)
    expect(state).toMatchObject({ tool: 'measure', armed: false })
  })
})
