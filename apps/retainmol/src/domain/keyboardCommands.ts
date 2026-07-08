import { bondSelectedAtoms, useEditorStore, useMoleculeStore } from '@/domain/viewerAdapter'

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
      const result = bondSelectedAtoms()
      if (!result.ok) editor.flashHint(result.reason ?? '无法成键')
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
    molecule.beginTransaction()
    molecule.selectedAtomIds.forEach(id => molecule.addOneHydrogen(id))
    molecule.endTransaction()
    return true
  }

  return false
}
