/**
 * RotateGizmo — 薄 React 壳。
 * 职责：监听选中状态 → 创建 RotateGizmoController → 注册到 Ticker → 清理。
 * Three.js 逻辑全部在 RotateGizmoController.ts 中。
 * store 依赖全部在此文件，RotateGizmoController 本身无 store 依赖。
 */
import { useEffect, useId } from 'react'
import { MolRenderer } from '../../lib/molRenderer'
import { Phase } from '../../lib/animation'
import { RotateGizmoController } from '../../lib/molRenderer/RotateGizmoController'
import { toolCan } from '../../config/toolCapabilities.config'
import { createObjectTransformEditSession } from '../../hooks/editSessionFactory'
import { createRotateGizmoCallbacks } from './rotateGizmoEffects'
import { useViewerRuntime } from '../../runtime/ViewerRuntime'

interface Props {
  renderer: MolRenderer | null
  readOnly?: boolean
}

export default function RotateGizmo({ renderer, readOnly = false }: Props) {
  const { moleculeStore, editorStore, ticker } = useViewerRuntime()
  const selectedAtomIds = moleculeStore(s => s.selectedAtomIds)
  const selectedBondIds = moleculeStore(s => s.selectedBondIds)
  const activeTool = editorStore(s => s.activeTool)
  const subscriptionId = useId()

  useEffect(() => {
    if (readOnly) return
    if (!renderer || !toolCan(activeTool, 'canEdit')) return

    const transaction = createObjectTransformEditSession(moleculeStore)
    const cb = createRotateGizmoCallbacks(moleculeStore.getState, transaction)

    const schedulerReason = `gizmo-drag:${subscriptionId}`
    const ctrl = new RotateGizmoController(renderer, selectedAtomIds, selectedBondIds, cb, {
      invalidate: () => ticker.invalidate(),
      startContinuous: () => ticker.startContinuous(schedulerReason),
      stopContinuous: () => ticker.stopContinuous(schedulerReason),
    })
    if (!ctrl.isValid) return

    const unsubTicker = ticker.subscribe(`rotate-gizmo:${subscriptionId}`, Phase.Gizmo, () => ctrl.update())
    ticker.invalidate()

    return () => {
      unsubTicker()
      ctrl.dispose()
    }
  }, [renderer, selectedAtomIds, selectedBondIds, activeTool, readOnly, moleculeStore, ticker, subscriptionId])

  return null
}
