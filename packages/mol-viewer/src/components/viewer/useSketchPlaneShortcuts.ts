import { useEffect, type RefObject } from 'react'
import { toolCan } from '../../config/toolCapabilities.config'
import { fitPlane } from '../../lib/builder/geometry/plane'
import type { MolRenderer } from '../../lib/molRenderer'
import { useViewerRuntime } from '../../runtime/ViewerRuntime'
import { selectActiveMoleculeOrEmpty } from '../../store/moleculeStore'

/** Owns the keyboard-only sketch-plane workflow so MolViewer stays declarative. */
export function useSketchPlaneShortcuts(
  rendererRef: RefObject<MolRenderer | null>,
  readOnly: boolean,
) {
  const { editorStore, moleculeStore } = useViewerRuntime()

  useEffect(() => {
    if (readOnly) return
    let lastP = 0

    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const editor = editorStore.getState()
      const { sketchPlane, setSketchPlane, flashHint } = editor

      if (event.key === 'Escape' && sketchPlane) {
        setSketchPlane(null)
        flashHint('已退出平面模式')
        return
      }

      if (event.key === 'Escape') {
        if (toolCan(editor.activeTool, 'canEdit') && editor.brushArmed && editor.pendingAtomIds.length === 0) {
          editor.disarmBrush()
          flashHint('选择模式 · 点元素/片段恢复构建')
        }
        return
      }

      if (event.key !== 'p' && event.key !== 'P') return
      const now = Date.now()
      if (now - lastP > 400) {
        lastP = now
        return
      }
      lastP = 0

      if (sketchPlane) {
        setSketchPlane(null)
        flashHint('已退出平面模式')
        return
      }

      const moleculeState = moleculeStore.getState()
      const molecule = selectActiveMoleculeOrEmpty(moleculeState)
      const selected = molecule.atoms.filter(atom => moleculeState.selectedAtomIds.has(atom.id))
      const basis = selected.length >= 3 ? selected : molecule.atoms
      const fitted = basis.length >= 3 ? fitPlane(basis) : null
      const plane = fitted
        ? {
            origin: fitted.origin as [number, number, number],
            normal: fitted.normal as [number, number, number],
          }
        : rendererRef.current?.getViewPlaneLocal() ?? null
      if (!plane) return

      setSketchPlane(plane)
      flashHint(
        fitted
          ? selected.length >= 3
            ? '平面模式 · 按选中原子拟合 · pp/Esc 退出'
            : '平面模式 · 按分子拟合 · pp/Esc 退出'
          : '平面模式 · 当前视角平面 · pp/Esc 退出',
      )
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [readOnly, editorStore, moleculeStore, rendererRef])
}
