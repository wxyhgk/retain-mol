import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useEditorStore } from '@/domain/viewer/editorState'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import {
  activateWorkspaceTool,
  deriveWorkspaceTool,
  resetWorkspaceToolState,
  selectWorkspacePanel,
  useWorkspaceToolStore,
} from './workspaceToolStore'
import { handleEditorShortcut } from './keyboardCommands'

const handlers = {
  undo: vi.fn(),
  redo: vi.fn(),
}

function keyboardEvent(key: string, modifiers: Partial<KeyboardEvent> = {}) {
  return {
    key,
    target: null,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    preventDefault: vi.fn(),
    ...modifiers,
  } as unknown as KeyboardEvent
}

function editorEffects() {
  const editor = useEditorStore.getState()
  return {
    setActiveTool: editor.setActiveTool,
    setActiveElement: editor.setActiveElement,
    setAtomClickMode: editor.setAtomClickMode,
    setActiveFragment: editor.setActiveFragment,
    armBrush: editor.armBrush,
    disarmBrush: editor.disarmBrush,
  }
}

describe('handleEditorShortcut workspace tools', () => {
  afterEach(() => vi.unstubAllGlobals())

  beforeEach(() => {
    vi.clearAllMocks()
    resetWorkspaceToolState()
    useEditorStore.setState({
      activeTool: 'select',
      activeElement: 'C',
      atomClickMode: 'grow',
      activeFragmentId: 'c-sp3',
      brushArmed: true,
      pendingAtomIds: [],
    })
    useMoleculeStore.setState({
      selectedAtomIds: new Set(),
      selectedBondIds: new Set(),
    })
  })

  it.each([
    ['s', 'select', 'select', false, null],
    ['d', 'draw', 'select', true, 'draw'],
    ['v', 'move', 'move-object', false, null],
    ['m', 'measure', 'measure', false, null],
  ] as const)('keeps %s synchronized with workspace and core state', (
    key,
    workspaceTool,
    coreTool,
    brushArmed,
    panel,
  ) => {
    expect(handleEditorShortcut(keyboardEvent(key), handlers)).toBe(true)

    const workspace = useWorkspaceToolStore.getState()
    const editor = useEditorStore.getState()
    expect(deriveWorkspaceTool(workspace.activePanel, editor.activeTool)).toBe(workspaceTool)
    expect(selectWorkspacePanel(workspace)).toBe(panel)
    expect(useEditorStore.getState()).toMatchObject({ activeTool: coreTool, brushArmed })
  })

  it('leaves Cmd+K to the command palette', () => {
    expect(handleEditorShortcut(keyboardEvent('k', { metaKey: true }), handlers)).toBe(false)
    expect(handlers.undo).not.toHaveBeenCalled()
    expect(handlers.redo).not.toHaveBeenCalled()
  })

  it.each(['Delete', 'Escape', 'd', 'z'])('does not run %s behind a modal', key => {
    vi.stubGlobal('document', { querySelector: () => ({ role: 'dialog' }) })
    const editor = useEditorStore.getState()
    const tool = useWorkspaceToolStore.getState()
    expect(handleEditorShortcut(keyboardEvent(key, { metaKey: key === 'z' }), handlers)).toBe(false)
    expect(useEditorStore.getState()).toBe(editor)
    expect(useWorkspaceToolStore.getState()).toBe(tool)
    expect(handlers.undo).not.toHaveBeenCalled()
  })

  it.each(['defaultPrevented', 'isComposing'] as const)('ignores events marked %s', property => {
    expect(handleEditorShortcut(keyboardEvent('Escape', { [property]: true }), handlers)).toBe(false)
    expect(useEditorStore.getState().brushArmed).toBe(true)
  })

  it('does not change history or tools while an edit transaction owns them', () => {
    useMoleculeStore.temporal.getState().pause()
    try {
      expect(handleEditorShortcut(keyboardEvent('z', { metaKey: true }), handlers)).toBe(false)
      expect(handleEditorShortcut(keyboardEvent('s'), handlers)).toBe(false)
      expect(handlers.undo).not.toHaveBeenCalled()
      expect(useEditorStore.getState().brushArmed).toBe(true)
    } finally {
      useMoleculeStore.temporal.getState().resume()
    }
  })

  it('does not assign an editor action to B', () => {
    activateWorkspaceTool('move', editorEffects())
    useMoleculeStore.setState({ selectedAtomIds: new Set(['a1', 'a2']) })

    expect(handleEditorShortcut(keyboardEvent('B'), handlers)).toBe(false)

    expect(useWorkspaceToolStore.getState().activePanel).toBeNull()
    expect(useEditorStore.getState().activeTool).toBe('move-object')
  })

  it('uses Escape to cancel the pending measurement before leaving the measure tool', () => {
    activateWorkspaceTool('measure', editorEffects())
    useEditorStore.setState({ pendingAtomIds: ['a1'] })

    expect(handleEditorShortcut(keyboardEvent('Escape'), handlers)).toBe(true)
    expect(useEditorStore.getState()).toMatchObject({
      activeTool: 'measure', brushArmed: false, pendingAtomIds: [],
    })

    expect(handleEditorShortcut(keyboardEvent('Escape'), handlers)).toBe(true)
    expect(useWorkspaceToolStore.getState().activePanel).toBeNull()
    expect(useEditorStore.getState()).toMatchObject({
      activeTool: 'select', brushArmed: false, pendingAtomIds: [],
    })
  })
})
