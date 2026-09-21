import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { computeMoleculeRevision } from '@retainmol/mol-viewer/headless'
import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '@/domain/viewer/moleculeState'
import { useMoleculeHistoryTracking } from '@/domain/viewer/history'
import { selectAppBusyMessage, useAppTaskStore } from '@/store/appTaskStore'

export function useInspectorContext() {
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)
  const { object, selectedAtomIds, selectedBondIds } = useMoleculeStore(useShallow(state => ({
    object: state.activeObjectId ? state.objectsById[state.activeObjectId] : undefined,
    selectedAtomIds: state.selectedAtomIds, selectedBondIds: state.selectedBondIds,
  })))
  const tracking = useMoleculeHistoryTracking()
  const task = useAppTaskStore(state => state.tasks.length > 0 ? selectAppBusyMessage(state) || '正在处理任务，请稍后重试' : null)
  const revision = useMemo(() => computeMoleculeRevision(molecule), [molecule])
  const busyReason = task ?? (!tracking ? '正在编辑，请结束当前操作后重试' : null)
  const editReason = busyReason ?? (!object ? '未选择分子' : !object.visible ? '分子已隐藏' : object.locked ? '分子已锁定' : null)
  return { molecule, object, revision, selectedAtomIds, selectedBondIds, busyReason, editReason }
}
