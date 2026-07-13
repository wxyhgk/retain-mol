import { beforeEach, describe, expect, it } from 'vitest'
import { useEditorStore } from './viewer/editorState'
import { resetWorkspaceToolState, useWorkspaceToolStore } from './workspaceToolStore'
import { activateAppWorkspaceTool, closeAppWorkspacePanel } from './workspaceToolController'

describe('workspaceToolController', () => {
  beforeEach(() => {
    resetWorkspaceToolState()
    const editor = useEditorStore.getState()
    editor.setActiveTool('select')
    editor.disarmBrush()
  })

  it('changes the viewer tool and app panel through one entry point', () => {
    activateAppWorkspaceTool('measure')

    expect(useEditorStore.getState().activeTool).toBe('measure')
    expect(useEditorStore.getState().brushArmed).toBe(false)
    expect(useWorkspaceToolStore.getState().activePanel).toBeNull()
  })

  it('restores draw state and closes it consistently', () => {
    activateAppWorkspaceTool('draw')
    expect(useEditorStore.getState().brushArmed).toBe(true)
    expect(useWorkspaceToolStore.getState().activePanel).toBe('draw')

    closeAppWorkspacePanel()
    expect(useEditorStore.getState().brushArmed).toBe(false)
    expect(useWorkspaceToolStore.getState().activePanel).toBeNull()
  })

  it('clears a stale context panel when another workspace enters select mode', () => {
    activateAppWorkspaceTool('template')
    expect(useWorkspaceToolStore.getState().activePanel).toBe('template')

    activateAppWorkspaceTool('select')

    expect(useWorkspaceToolStore.getState().activePanel).toBeNull()
    expect(useEditorStore.getState()).toMatchObject({
      activeTool: 'select',
      brushArmed: false,
    })
  })
})
