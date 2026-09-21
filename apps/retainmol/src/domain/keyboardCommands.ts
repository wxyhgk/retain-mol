import { useEditorStore } from '@/domain/viewer/editorState'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import { activateAppWorkspaceTool } from './workspaceToolController'
import { isWorkspaceShortcutBlocked } from './shortcutScope'
import { isMoleculeHistoryTracking } from './viewer/history'
export { isTextEditingTarget } from './shortcutScope'

export function handleEditorShortcut(
  e: KeyboardEvent,
  handlers: {
    undo: () => void
    redo: () => void
  }
) {
  if (isWorkspaceShortcutBlocked(e) || !isMoleculeHistoryTracking()) return false

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

  const editor = useEditorStore.getState()
  const molecule = useMoleculeStore.getState()
  const plainShortcut = !e.metaKey && !e.ctrlKey && !e.altKey

  if (plainShortcut && e.key.toLowerCase() === 's') {
    e.preventDefault()
    activateAppWorkspaceTool('select')
    return true
  }

  if (plainShortcut && e.key.toLowerCase() === 'd') {
    e.preventDefault()
    activateAppWorkspaceTool('draw')
    return true
  }

  if (plainShortcut && e.key.toLowerCase() === 'v') {
    e.preventDefault()
    activateAppWorkspaceTool('move')
    return true
  }

  if (plainShortcut && e.key.toLowerCase() === 'm') {
    e.preventDefault()
    activateAppWorkspaceTool('measure')
    return true
  }

  if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
    if (typeof Element !== 'undefined' && e.target instanceof Element && e.target.closest('button, a, [role="button"]')) return false
    if (editor.activeTool === 'measure') {
      e.preventDefault()
      editor.commitPendingMeasure()
      return true
    }
  }

  if (e.key === 'Escape') {
    e.preventDefault()
    if (editor.sketchPlane) {
      editor.setSketchPlane(null)
      editor.flashHint('已退出平面模式')
      return true
    }
    if (editor.activeTool === 'measure' && editor.pendingAtomIds.length > 0) {
      editor.cancelPendingMeasure()
      return true
    }
    activateAppWorkspaceTool('select')
    return true
  }

  if (plainShortcut && (e.key === 'Delete' || e.key === 'Backspace')) {
    e.preventDefault()
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
