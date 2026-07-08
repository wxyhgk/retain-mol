/**
 * RotateGizmo — 薄 React 壳。
 * 职责：监听选中状态 → 创建 RotateGizmoController → 注册到 Ticker → 清理。
 * Three.js 逻辑全部在 RotateGizmoController.ts 中。
 * store 依赖全部在此文件，RotateGizmoController 本身无 store 依赖。
 */
import { useEffect } from 'react'
import { useMoleculeStore, selectActiveMoleculeOrEmpty } from '../../store/moleculeStore'
import { useEditorStore } from '../../store/editorStore'
import { MolRenderer } from '../../lib/molRenderer'
import { ticker, Phase } from '../../lib/animation'
import { RotateGizmoController } from '../../lib/molRenderer/RotateGizmoController'
import type { GizmoCallbacks } from '../../lib/molRenderer/RotateGizmoController'
import { toolCan } from '../../config/toolCapabilities.config'

interface Props {
  renderer: MolRenderer | null
  readOnly?: boolean
}

export default function RotateGizmo({ renderer, readOnly = false }: Props) {
  const selectedAtomIds = useMoleculeStore(s => s.selectedAtomIds)
  const selectedBondIds = useMoleculeStore(s => s.selectedBondIds)
  const activeTool = useEditorStore(s => s.activeTool)

  useEffect(() => {
    if (readOnly) return
    if (!renderer || !toolCan(activeTool, 'canEdit')) return

    const cb: GizmoCallbacks = {
      getMolecule: () => selectActiveMoleculeOrEmpty(useMoleculeStore.getState()),
      setAtomPositions: (positions) => useMoleculeStore.getState().setAtomPositions(positions),
      beginTransaction: () => useMoleculeStore.getState().beginTransaction(),
      endTransaction:   () => useMoleculeStore.getState().endTransaction(),
    }

    const ctrl = new RotateGizmoController(renderer, selectedAtomIds, selectedBondIds, cb)
    if (!ctrl.isValid) return

    const unsubTicker = ticker.subscribe('rotate-gizmo', Phase.Gizmo, () => ctrl.update())
    ticker.invalidate()

    return () => {
      unsubTicker()
      ctrl.dispose()
    }
  }, [renderer, selectedAtomIds, selectedBondIds, activeTool, readOnly])

  return null
}
