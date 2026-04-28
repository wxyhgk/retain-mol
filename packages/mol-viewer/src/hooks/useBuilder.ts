/**
 * useBuilder — 分子建模交互 hook
 * 连接 BuilderEngine（纯逻辑）和 Zustand store（状态）
 */

import { useCallback, useRef } from 'react'
import * as THREE from 'three'
import { useMoleculeStore, selectActiveMoleculeOrEmpty } from '@/store/moleculeStore'
import { calcAddAtomOnExisting, canBond } from '@/lib/builder/BuilderEngine'
import { getElementConfig } from '@/config/elements.config'

export interface BuilderHandlers {
  onAtomClick: (atomId: string, event: MouseEvent) => void
  onAtomDoubleClick: (atomId: string, event: MouseEvent) => void
  onBondClick: (bondId: string, event: MouseEvent) => void
  onBackgroundClick: (worldPos: THREE.Vector3, event: MouseEvent) => void
  onAtomDragStart: (id: string) => void
  onAtomDrag: (id: string, x: number, y: number, z: number) => void
  onAtomDragEnd: (id: string) => void
}

/** 把 canBond 的失败原因转成用户友好的中文提示 */
function bondFailReason(reason?: string): string {
  if (!reason) return '无法成键'
  return reason
}

export function useBuilder(): BuilderHandlers {
  const store = useMoleculeStore

  const onAtomClick = useCallback((atomId: string, event: MouseEvent) => {
    const {
      activeTool, bondingAtomId, activeElement,
      addAtom, addBond, removeAtom,
      selectAtom, clearSelection, setBondingAtom,
    } = store.getState()
    const molecule = selectActiveMoleculeOrEmpty(store.getState())

    switch (activeTool) {

      case 'delete': {
        removeAtom(atomId)
        break
      }

      // ── 成键工具：点击第一个原子记录，点击第二个原子成键 ──
      case 'add-bond': {
        if (!bondingAtomId) {
          setBondingAtom(atomId)
          selectAtom(atomId)
        } else if (bondingAtomId === atomId) {
          setBondingAtom(null)
          clearSelection()
        } else {
          const atom1 = molecule.atoms.find(a => a.id === bondingAtomId)
          const atom2 = molecule.atoms.find(a => a.id === atomId)
          if (atom1 && atom2) {
            const check = canBond(atom1, atom2, molecule.bonds)
            if (check.ok) {
              addBond(bondingAtomId, atomId)
            } else {
              // 显示简单的浏览器提示（后续可换成 toast）
              alert(bondFailReason(check.reason))
            }
          }
          setBondingAtom(null)
          clearSelection()
        }
        break
      }

      // ── 添加原子工具：点击已有原子按 VSEPR 挂新原子 ──
      case 'add-atom': {
        const centerAtom = molecule.atoms.find(a => a.id === atomId)
        if (!centerAtom) break
        const maxBonds = getElementConfig(centerAtom.symbol).maxBonds
        const currentBonds = molecule.bonds.filter(
          b => b.atomId1 === atomId || b.atomId2 === atomId
        ).length
        if (currentBonds >= maxBonds) {
          alert(`${centerAtom.symbol} 已达最大键数 (${maxBonds})`)
          break
        }
        const result = calcAddAtomOnExisting(
          centerAtom, molecule.bonds, molecule.atoms, activeElement
        )
        const newId = addAtom(activeElement, ...result.position)
        addBond(atomId, newId)
        break
      }

      // ── 测量工具：点击原子加入 pending，凑满自动提交 ──
      case 'measure': {
        store.getState().addMeasureAtom(atomId)
        break
      }

      // ── 选择工具：单击选中，Shift 多选 ──
      default: {
        selectAtom(atomId, event.shiftKey)
        break
      }
    }
  }, [store])

  const onBondClick = useCallback((bondId: string, event: MouseEvent) => {
    const { activeTool, removeBond, cycleBondOrder, selectBond } = store.getState()
    switch (activeTool) {
      case 'delete':
        removeBond(bondId)
        break
      case 'select':
        if (event.shiftKey) {
          cycleBondOrder(bondId)
        } else {
          selectBond(bondId, event.altKey)
        }
        break
    }
  }, [store])

  const onBackgroundClick = useCallback((worldPos: THREE.Vector3, event: MouseEvent) => {
    const { activeTool, activeElement, bondingAtomId, addAtom, clearSelection, setBondingAtom, commitPendingMeasure } = store.getState()
    switch (activeTool) {
      case 'add-atom':
        addAtom(activeElement, worldPos.x, worldPos.y, worldPos.z)
        break
      case 'add-bond':
        if (bondingAtomId) { setBondingAtom(null); clearSelection() }
        break
      case 'measure':
        // 背景点击 = 提交当前 pending（由 store 按 auto/手动模式决定是否提交）
        commitPendingMeasure()
        break
      default:
        if (!event.shiftKey && !event.altKey) clearSelection()
        break
    }
  }, [store])

  // 拖动起点快照：拖动选中集中的任意一个原子 → 整个选中集一起平移
  const dragSnapshot = useRef<Map<string, { x: number; y: number; z: number }> | null>(null)

  const onAtomDragStart = useCallback((id: string) => {
    const st = useMoleculeStore.getState()
    const snap = new Map<string, { x: number; y: number; z: number }>()
    const group = st.selectedAtomIds.has(id) ? st.selectedAtomIds : new Set([id])
    for (const a of selectActiveMoleculeOrEmpty(st).atoms) {
      if (group.has(a.id)) snap.set(a.id, { x: a.x, y: a.y, z: a.z })
    }
    dragSnapshot.current = snap
    st.beginTransaction()
  }, [])

  const onAtomDrag = useCallback((id: string, x: number, y: number, z: number) => {
    const snap = dragSnapshot.current
    if (!snap) return
    const origin = snap.get(id)
    if (!origin) return
    const dx = x - origin.x, dy = y - origin.y, dz = z - origin.z
    const positions = new Map<string, { x: number; y: number; z: number }>()
    for (const [aid, p0] of snap) {
      positions.set(aid, { x: p0.x + dx, y: p0.y + dy, z: p0.z + dz })
    }
    useMoleculeStore.getState().setAtomPositions(positions)
  }, [])

  const onAtomDragEnd = useCallback((_id: string) => {
    dragSnapshot.current = null
    useMoleculeStore.getState().endTransaction()
  }, [])

  const onAtomDoubleClick = useCallback((_atomId: string, _event: MouseEvent) => {
    const { activeTool, addHydrogens } = store.getState()
    if (activeTool !== 'select') return
    addHydrogens(_atomId)
  }, [store])

  return { onAtomClick, onAtomDoubleClick, onBondClick, onBackgroundClick, onAtomDragStart, onAtomDrag, onAtomDragEnd }
}

/**
 * 对选中的恰好两个原子执行成键操作。
 * 供属性面板按钮 / 快捷键调用。
 */
export function bondSelectedAtoms(): { ok: boolean; reason?: string } {
  const { selectedAtomIds, addBond } = useMoleculeStore.getState()
  const molecule = selectActiveMoleculeOrEmpty(useMoleculeStore.getState())
  const ids = [...selectedAtomIds]
  if (ids.length !== 2) return { ok: false, reason: '请先选中恰好两个原子' }

  const [a1, a2] = ids.map(id => molecule.atoms.find(a => a.id === id)!)
  if (!a1 || !a2) return { ok: false, reason: '原子不存在' }

  const check = canBond(a1, a2, molecule.bonds)
  if (!check.ok) return check

  addBond(a1.id, a2.id)
  return { ok: true }
}
