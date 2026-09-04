/**
 * 跨 store 引用完整性（唯一允许的 store 间联动，方向：moleculeStore 变化 → 清理 editor 状态）。
 *
 * editorStore 的 measurements / pendingAtomIds / bondingAtomId 持有 moleculeStore
 * 的 atomId，但两个 store 生命周期独立（editorStore 不进 undo）。原子被删除
 * （删原子、清空分子、删场景对象、undo/redo）后，这里级联剔除指向它们的引用，
 * 否则面板里残留僵尸测量、成键预览指向不存在的原子。
 *
 * 测量不销毁而是"停放"（orphanedMeasurements）：measurements 不进 undo 历史，
 * 若在原子被删时直接删除测量，「删原子 → Ctrl+Z」这对本应互逆的操作会让
 * 原子恢复而测量永久蒸发。停放的测量在其引用的原子全部有效时（典型即 undo
 * 恢复原子后）原样复活回 measurements。
 *
 * 用注册函数而非直接 import editorStore，保持模块依赖单向无环：
 * editorStore → integrity → moleculeStore。
 */

import type { MoleculeStoreApi } from './moleculeStore'
import type { Measurement } from '../lib/types'

interface EditorRefState {
  measurements: Measurement[]
  orphanedMeasurements: Measurement[]
  pendingAtomIds: string[]
  bondingAtomId: string | null
}

/** 停放上限：引用永远回不来的测量（如彻底删除的分子）最多滞留这么多条。 */
const MAX_ORPHANED_MEASUREMENTS = 100

export function registerEditorIntegrity(moleculeStore: MoleculeStoreApi, editor: {
  getState: () => EditorRefState
  setState: (patch: Partial<EditorRefState>) => void
}) {
  return moleculeStore.subscribe(
    s => s.objectsById,
    (objectsById) => {
      const valid = new Set<string>()
      for (const obj of Object.values(objectsById))
        for (const a of obj.molecule.atoms) valid.add(a.id)

      const es = editor.getState()
      const isAlive = (m: Measurement) => m.atomIds.every(id => valid.has(id))

      const kept = es.measurements.filter(isAlive)
      const newlyOrphaned = es.measurements.filter(m => !isAlive(m))
      const revived = es.orphanedMeasurements.filter(isAlive)
      const stillOrphaned = es.orphanedMeasurements.filter(m => !isAlive(m))

      const pendingAtomIds = es.pendingAtomIds.filter(id => valid.has(id))
      const bondingAtomId = es.bondingAtomId !== null && valid.has(es.bondingAtomId) ? es.bondingAtomId : null

      if (newlyOrphaned.length > 0 ||
          revived.length > 0 ||
          pendingAtomIds.length !== es.pendingAtomIds.length ||
          bondingAtomId !== es.bondingAtomId) {
        editor.setState({
          measurements: revived.length > 0 ? [...kept, ...revived] : kept,
          orphanedMeasurements: [...stillOrphaned, ...newlyOrphaned].slice(-MAX_ORPHANED_MEASUREMENTS),
          pendingAtomIds,
          bondingAtomId,
        })
      }
    },
  )
}
