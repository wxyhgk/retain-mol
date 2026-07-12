import { useEditorStore } from '@/domain/viewer/editorState'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import { activateWorkspaceTool, type WorkspaceToolEffects } from './workspaceToolStore'

export function isTextEditingTarget(target: EventTarget | null) {
  const isInput = typeof HTMLInputElement !== 'undefined' && target instanceof HTMLInputElement
  const isTextArea = typeof HTMLTextAreaElement !== 'undefined' && target instanceof HTMLTextAreaElement
  const isEditable = typeof HTMLElement !== 'undefined'
    && target instanceof HTMLElement
    && target.isContentEditable
  return isInput || isTextArea || isEditable
}

export function handleEditorShortcut(
  e: KeyboardEvent,
  handlers: {
    undo: () => void
    redo: () => void
    openSearch: () => void
  }
) {
  if (isTextEditingTarget(e.target)) return false

  if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
    e.preventDefault()
    handlers.redo()
    return true
  }

  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
    e.preventDefault()
    handlers.redo()
    return true
  }

  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault()
    handlers.undo()
    return true
  }

  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    handlers.openSearch()
    return true
  }

  const editor = useEditorStore.getState()
  const molecule = useMoleculeStore.getState()
  const effects: WorkspaceToolEffects = {
    setActiveTool: editor.setActiveTool,
    setActiveElement: editor.setActiveElement,
    setAtomClickMode: editor.setAtomClickMode,
    setActiveFragment: editor.setActiveFragment,
    armBrush: editor.armBrush,
    disarmBrush: editor.disarmBrush,
  }
  const plainShortcut = !e.metaKey && !e.ctrlKey && !e.altKey

  if (plainShortcut && e.key.toLowerCase() === 's') {
    activateWorkspaceTool('select', effects)
    return true
  }

  if (plainShortcut && e.key.toLowerCase() === 'd') {
    activateWorkspaceTool('draw', effects)
    return true
  }

  if (plainShortcut && e.key.toLowerCase() === 'v') {
    activateWorkspaceTool('move', effects)
    return true
  }

  if (plainShortcut && e.key.toLowerCase() === 'm') {
    activateWorkspaceTool('measure', effects)
    return true
  }

  if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
    if (editor.activeTool === 'measure') {
      editor.commitPendingMeasure()
      return true
    }
  }

  if (e.key === 'Escape') {
    if (editor.activeTool === 'measure' && editor.pendingAtomIds.length > 0) {
      editor.cancelPendingMeasure()
    }
    activateWorkspaceTool('select', effects)
    return true
  }

  if (e.key === 'Delete' || e.key === 'Backspace') {
    molecule.removeSelected()
    return true
  }

  if (plainShortcut && e.key.toLowerCase() === 'h') {
    if (molecule.selectedAtomIds.size === 0) return false
    e.preventDefault()
    const availability = molecule.canAddOneHydrogens([...molecule.selectedAtomIds])
    if (!availability.ok) {
      editor.flashHint(availability.reason ?? '无法加 H')
      return true
    }
    molecule.addOneHydrogens(availability.allowedAtomIds)
    return true
  }

  return false
}
