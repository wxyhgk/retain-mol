import { useEditorStore, useMoleculeStore } from '@/domain/viewerAdapter'
import { connectSelectedAtoms } from './moleculeEditCommands'

export function isTextEditingTarget(target: EventTarget | null) {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
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

  if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
    e.preventDefault()
    handlers.undo()
    return true
  }

  if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
    e.preventDefault()
    handlers.redo()
    return true
  }

  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    handlers.openSearch()
    return true
  }

  const editor = useEditorStore.getState()
  const molecule = useMoleculeStore.getState()

  if (e.key === 's' || e.key === 'S') {
    editor.setActiveTool('select')
    editor.disarmBrush()
    return true
  }

  if (e.key === 'v' || e.key === 'V') {
    editor.setActiveTool('move-object')
    return true
  }

  if (e.key === 'm' || e.key === 'M') {
    editor.setActiveTool('measure')
    return true
  }

  if (e.key === 'b' || e.key === 'B') {
    if (molecule.selectedAtomIds.size === 2) {
      connectSelectedAtoms()
    } else {
      editor.setActiveTool('select')
      editor.armBrush()
    }
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
      return true
    }
  }

  if (e.key === 'Delete' || e.key === 'Backspace') {
    molecule.removeSelected()
    return true
  }

  if ((e.key === 'h' || e.key === 'H') && !e.metaKey && !e.ctrlKey) {
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
