/**
 * 跨 store 引用完整性（唯一允许的 store 间联动，方向：moleculeStore 变化 → 清理 editor 状态）。
 *
 * editorStore 的 measurements / pendingAtomIds / bondingAtomId 持有 moleculeStore
 * 的 atomId，但两个 store 生命周期独立（editorStore 不进 undo）。原子被删除
 * （删原子、清空分子、删场景对象、undo/redo）后，这里级联剔除指向它们的引用，
 * 否则面板里残留僵尸测量、成键预览指向不存在的原子。
 *
 * 用注册函数而非直接 import editorStore，保持模块依赖单向无环：
 * editorStore → integrity → moleculeStore。
 */

import { useMoleculeStore } from './moleculeStore'
import type { Measurement } from '../lib/types'

interface EditorRefState {
  measurements: Measurement[]
  pendingAtomIds: string[]
  bondingAtomId: string | null
}

export function registerEditorIntegrity(editor: {
  getState: () => EditorRefState
  setState: (patch: Partial<EditorRefState>) => void
}) {
  useMoleculeStore.subscribe(
    s => s.objectsById,
    (objectsById) => {
      const valid = new Set<string>()
      for (const obj of Object.values(objectsById))
        for (const a of obj.molecule.atoms) valid.add(a.id)

      const es = editor.getState()
      const measurements = es.measurements.filter(m => m.atomIds.every(id => valid.has(id)))
      const pendingAtomIds = es.pendingAtomIds.filter(id => valid.has(id))
      const bondingAtomId = es.bondingAtomId !== null && valid.has(es.bondingAtomId) ? es.bondingAtomId : null

      if (measurements.length !== es.measurements.length ||
          pendingAtomIds.length !== es.pendingAtomIds.length ||
          bondingAtomId !== es.bondingAtomId) {
        editor.setState({ measurements, pendingAtomIds, bondingAtomId })
      }
    },
  )
}
