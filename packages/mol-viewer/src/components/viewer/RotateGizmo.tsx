/**
 * RotateGizmo — 薄 React 壳。
 * 职责：监听选中状态 → 创建 RotateGizmoController → 注册到 Ticker → 清理。
 * Three.js 逻辑全部在 RotateGizmoController.ts 中。
 */
import { useEffect } from 'react'
import { useMoleculeStore } from '../../store/moleculeStore'
import { useEditorStore } from '../../store/editorStore'
import { MolRenderer } from '../../lib/molRenderer'
import { ticker, Phase } from '../../lib/animation'
import { RotateGizmoController } from '../../lib/molRenderer/RotateGizmoController'

interface Props {
  renderer: MolRenderer | null
}

export default function RotateGizmo({ renderer }: Props) {
  const selectedAtomIds = useMoleculeStore(s => s.selectedAtomIds)
  const selectedBondIds = useMoleculeStore(s => s.selectedBondIds)
  const activeTool = useEditorStore(s => s.activeTool)

  useEffect(() => {
    if (!renderer || activeTool !== 'select') return

    const ctrl = new RotateGizmoController(renderer, selectedAtomIds, selectedBondIds)
    if (!ctrl.isValid) return

    // 接入共享 Ticker（Phase.Gizmo 在 Render 之前执行）
    const unsubTicker = ticker.subscribe('rotate-gizmo', Phase.Gizmo, () => ctrl.update())
    ticker.invalidate()

    return () => {
      unsubTicker()
      ctrl.dispose()
    }
  }, [renderer, selectedAtomIds, selectedBondIds, activeTool])

  return null
}
