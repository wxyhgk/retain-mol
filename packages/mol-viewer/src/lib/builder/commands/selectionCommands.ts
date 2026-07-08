import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '../../../store/moleculeStore'
import { canBond } from '../editing/bondOps'
import { findBond } from '../graph'
import { isSlotH } from '../queries'

/**
 * 对当前选中的恰好两个原子执行成键操作。
 * 这是 UI 快捷键、属性面板和后续命令面板共享的入口，避免把 store 细节塞进 hook。
 */
export function bondSelectedAtoms(): { ok: boolean; reason?: string } {
  const st = useMoleculeStore.getState()
  const molecule = selectActiveMoleculeOrEmpty(st)
  const ids = [...st.selectedAtomIds]
  if (ids.length !== 2) return { ok: false, reason: '请先选中恰好两个原子' }

  const [a1, a2] = ids.map(id => molecule.atoms.find(a => a.id === id)!)
  if (!a1 || !a2) return { ok: false, reason: '原子不存在' }

  // 任一端是槽位 H：让 H 让位成键（与拖拽手势一致）
  if (isSlotH(molecule, a1.id)) return st.bondViaHydrogen(a1.id, a2.id)
  if (isSlotH(molecule, a2.id)) return st.bondViaHydrogen(a2.id, a1.id)

  if (findBond(molecule.bonds, a1.id, a2.id)) {
    return { ok: false, reason: '已经存在键' }
  }
  const check = canBond(a1, a2, molecule.bonds)
  if (!check.ok) return check

  st.addBond(a1.id, a2.id)
  return { ok: true }
}
