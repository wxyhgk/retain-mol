import { beforeEach, describe, expect, it } from 'vitest'
import { useEditorStore } from './viewer/editorState'
import { resetWorkspaceToolState, useWorkspaceToolStore } from './workspaceToolStore'
import { setInspectorOpen, useInspectorStore } from './inspectorStore'
import { activateAppWorkspaceTool, closeAppWorkspacePanel } from './workspaceToolController'

describe('workspaceToolController', () => {
  beforeEach(() => {
    resetWorkspaceToolState()
    useInspectorStore.setState({ dockOpen: false, compactOpen: false, tab: 'scene' })
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

  it('collapses and reopens the inspector without changing the brush or tool', () => {
    activateAppWorkspaceTool('draw')
    const editor = useEditorStore.getState()
    const tool = useWorkspaceToolStore.getState()
    expect(useInspectorStore.getState()).toMatchObject({ dockOpen: true, tab: 'draw' })

    useInspectorStore.setState({ tab: 'display' })
    setInspectorOpen(false, false)
    setInspectorOpen(true, false)
    expect(useEditorStore.getState()).toBe(editor)
    expect(useWorkspaceToolStore.getState()).toBe(tool)
    expect(useInspectorStore.getState().tab).toBe('display')
  })

  it('does not open a compact modal when activating the draw tool', () => {
    activateAppWorkspaceTool('draw')
    expect(useInspectorStore.getState().compactOpen).toBe(false)
    setInspectorOpen(true, true)
    setInspectorOpen(false, true)
    expect(useEditorStore.getState().brushArmed).toBe(true)
    expect(useWorkspaceToolStore.getState().activePanel).toBe('draw')
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
