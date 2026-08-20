/**
 * RotateGizmo — 薄 React 壳。
 * 职责：监听选中状态 → 创建 RotateGizmoController → 注册到 Ticker → 清理。
 * Three.js 逻辑全部在 RotateGizmoController.ts 中。
 * store 依赖全部在此文件，RotateGizmoController 本身无 store 依赖。
 */
import { useCallback, useId } from 'react'
import type { ThreeRendererPort } from '../../lib/molRenderer'
import { RotateGizmoController } from '../../viewer/gizmo/controllers/RotateGizmoController'
import { toolCan } from '../../config/toolCapabilities.config'
import { createObjectTransformEditSession } from '../../hooks/editSessionFactory'
import { createRotateGizmoCallbacks } from './rotateGizmoEffects'
import { useViewerRuntimeServices } from '../../runtime/ViewerRuntime'
import { useGizmoRegistry, type GizmoScheduler } from '../../viewer/gizmo/useGizmoRegistry'

interface Props {
  renderer: ThreeRendererPort | null
  enabled: boolean
  readOnly: boolean
}

export default function RotateGizmo({ renderer, enabled, readOnly }: Props) {
  const { moleculeStore, editorStore } = useViewerRuntimeServices()
  const selectedAtomIds = moleculeStore(s => s.selectedAtomIds)
  const selectedBondIds = moleculeStore(s => s.selectedBondIds)
  const activeTool = editorStore(s => s.activeTool)
  const subscriptionId = useId()
  const isEnabled = enabled && !readOnly && toolCan(activeTool, 'canEdit')

  const create = useCallback((scheduler: GizmoScheduler) => {
    const transaction = createObjectTransformEditSession(moleculeStore)
    const cb = createRotateGizmoCallbacks(moleculeStore.getState, transaction)
    const schedulerReason = `gizmo-drag:${subscriptionId}`
    const wrapped: GizmoScheduler = {
      invalidate: () => scheduler.invalidate(),
      startContinuous: () => scheduler.startContinuous(schedulerReason),
      stopContinuous: () => scheduler.stopContinuous(schedulerReason),
    }
    return new RotateGizmoController(renderer!, selectedAtomIds, selectedBondIds, cb, wrapped)
  }, [renderer, selectedAtomIds, selectedBondIds, moleculeStore, subscriptionId])

  useGizmoRegistry(renderer, isEnabled, create, 'rotate-gizmo')

  return null
}
