import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useEditorStore } from '@/domain/viewer/editorState'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import {
  activateWorkspaceTool,
  deriveWorkspaceTool,
  resetWorkspaceToolState,
  selectWorkspacePanel,
  useWorkspaceToolStore,
} from './workspaceToolStore'
import { connectSelectedAtoms } from './moleculeEditCommands'
import { handleEditorShortcut } from './keyboardCommands'

vi.mock('./moleculeEditCommands', () => ({
  connectSelectedAtoms: vi.fn(),
}))

const handlers = {
  undo: vi.fn(),
  redo: vi.fn(),
  openSearch: vi.fn(),
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
    ['v', 'move', 'move-object', false, null],
    ['m', 'measure', 'measure', false, null],
    ['b', 'bond', 'select', false, 'bond'],
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
    expect(deriveWorkspaceTool(editor.activeTool, editor.brushArmed, workspace.activePanel)).toBe(workspaceTool)
    expect(selectWorkspacePanel(workspace)).toBe(panel)
    expect(useEditorStore.getState()).toMatchObject({ activeTool: coreTool, brushArmed })
  })

  it('connects two selected atoms on B without changing the current tool', () => {
    activateWorkspaceTool('move', editorEffects())
    useMoleculeStore.setState({ selectedAtomIds: new Set(['a1', 'a2']) })

    expect(handleEditorShortcut(keyboardEvent('B'), handlers)).toBe(true)

    expect(connectSelectedAtoms).toHaveBeenCalledOnce()
    expect(useWorkspaceToolStore.getState().activePanel).toBeNull()
    expect(useEditorStore.getState().activeTool).toBe('move-object')
  })

  it('uses Escape to cancel pending measurement and close the context panel', () => {
    activateWorkspaceTool('template', editorEffects())
    useEditorStore.setState({
      activeTool: 'measure',
      brushArmed: true,
      pendingAtomIds: ['a1'],
    })

    expect(handleEditorShortcut(keyboardEvent('Escape'), handlers)).toBe(true)

    const workspace = useWorkspaceToolStore.getState()
    expect(workspace.activePanel).toBeNull()
    expect(selectWorkspacePanel(workspace)).toBeNull()
    expect(useEditorStore.getState()).toMatchObject({
      activeTool: 'select',
      brushArmed: false,
      pendingAtomIds: [],
    })
  })
})
