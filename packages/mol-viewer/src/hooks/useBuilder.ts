/**
 * useBuilder — 分子建模交互 hook
 * 连接 BuilderEngine（纯逻辑）和 Zustand store（状态）
 */

import { useCallback, useRef } from 'react'
import * as THREE from 'three'
import { useMoleculeStore, selectActiveMoleculeOrEmpty } from '../store/moleculeStore'
import { useEditorStore } from '../store/editorStore'
import { calcGrowPosition, getGrowGuide as calcGrowGuide, canBond,
         degree, resolveHSlotGrowth,
         attachFragmentToAtom, placeFragmentStandalone, placeHybridPrototype, fuseFragmentOnBond, ringPlaneIntersection,
         maxValence, valenceUsedByBonds } from '../lib/builder/BuilderEngine'
import type { GrowGuideSpec } from '../lib/types'
import { getElementConfig } from '../config/elements.config'
import { RENDER } from '../config/render.config'
import { getFragment } from '../lib/builder/fragmentLibrary'
import { isSlotH, activateAndResolve } from '../lib/builder/queries'
import { toolCan } from '../config/toolCapabilities.config'
export { bondSelectedAtoms } from '../lib/builder/commands'

export interface BuilderHandlers {
  onAtomClick: (atomId: string, event: MouseEvent) => void
  onAtomDoubleClick: (atomId: string, event: MouseEvent) => void
  onBondClick: (bondId: string, event: MouseEvent) => void
  onBackgroundClick: (worldPos: THREE.Vector3, event: MouseEvent, viewDirLocal?: THREE.Vector3) => void
  onBackgroundDoubleClick: (worldPos: THREE.Vector3, event: MouseEvent, viewDirLocal?: THREE.Vector3) => void
  onAtomDragStart: (id: string) => void
  onAtomDrag: (id: string, x: number, y: number, z: number) => void
  onAtomDragEnd: (id: string) => void
  onBondDragStart: (sourceId: string) => boolean
  onBondDragEnd: (sourceId: string, targetId: string | null, dropLocal: THREE.Vector3 | null) => void
  getGrowPreview: (sourceId: string, cursorLocal: THREE.Vector3, freeDirection: boolean)
    => { pos: THREE.Vector3; radius: number; color: number } | null
  getGrowGuide: (sourceId: string) => GrowGuideSpec
}

export function useBuilder(): BuilderHandlers {
  const store = useMoleculeStore

  // ── activateAndResolve 的 store 适配：激活宿主对象 + 激活后重读活跃分子 ──
  const activate = useCallback(
    (atomId: string) => store.getState().activateObjectContainingAtom(atomId),
    [store],
  )
  const getActiveMol = useCallback(
    () => selectActiveMoleculeOrEmpty(store.getState()),
    [store],
  )

  const onAtomClick = useCallback((atomId: string, event: MouseEvent) => {
    const { activeTool, activeElement, activeFragmentId, atomClickMode, flashHint } = useEditorStore.getState()

    // ── 自动激活包含被点击原子的分子 ──────────────────────────────────────────
    // 多分子场景下，点击非 active 分子的原子时先切换 activeObjectId，
    // 否则所有编辑操作都会在 active 分子里找不到该原子而静默失败。
    // 宿主对象不可见/锁定时返回 false → 整个手势中止。
    if (!store.getState().activateObjectContainingAtom(atomId)) return
    const st = store.getState()       // 激活是同步 set，重新读取

    const { selectAtom } = st
    const molecule = selectActiveMoleculeOrEmpty(st)

    switch (activeTool) {

      // ── 测量工具：点击原子加入 pending，凑满自动提交 ──
      case 'measure': {
        useEditorStore.getState().addMeasureAtom(atomId)
        break
      }

      case 'move-object':
        break

      // ── 指针工具：按笔刷武装态显式分流，同一次点击不再有选择/编辑歧义 ──
      default: {
        const centerAtom = molecule.atoms.find(a => a.id === atomId)
        if (!centerAtom) break

        // Shift 多选：两个态都可用（修饰键显式，无歧义）
        if (event.shiftKey) {
          selectAtom(atomId, true)
          break
        }

        // ── 选择态（未武装）：点击只做选择，任何点击都不产生编辑 ──
        if (!useEditorStore.getState().brushArmed) {
          selectAtom(atomId, false)
          break
        }

        // ── 构建态（已武装）：点击只做构建，不做选择 ──

        // 片段笔刷：点 H 替换为基团，点不饱和重原子沿 VSEPR 接上（一步 undo）
        const fragment = activeFragmentId ? getFragment(activeFragmentId) : undefined
        if (fragment) {
          const result = attachFragmentToAtom(molecule, fragment, atomId)
          if (result.ok === true) {
            st.setMolecule(result.molecule)
          } else {
            flashHint(result.reason)
          }
          break
        }

        // 原子替换模式：面板选元素后，点到哪个原子就替换哪个原子；点 H 不自动生长补氢。
        if (atomClickMode === 'replace') {
          if (centerAtom.symbol === 'H') {
            if (activeElement === 'H') { flashHint('已是 H'); break }
            st.replaceAtom(atomId, activeElement)
            break
          }

          const targetAtom = molecule.atoms.find(a => a.id === atomId)
          if (!targetAtom) break
          if (activeElement === targetAtom.symbol) { flashHint(`已是 ${activeElement}`); break }
          st.replaceAtom(atomId, activeElement)
          break
        }

        // 点击 H：替换为当前元素的饱和基团（价态完整模型的主生长路径）
        if (centerAtom.symbol === 'H' && activeElement !== 'H' &&
            degree(molecule.bonds, atomId) > 0) {
          st.growFromHydrogen(atomId, activeElement)
          break
        }

        // 点重原子 = 纯元素替换（键和显式 H 都保留）。生长走「点 H」；同元素则无操作。
        if (centerAtom.symbol !== 'H') {
          if (activeElement === centerAtom.symbol) { flashHint(`已是 ${activeElement}`); break }
          st.replaceAtom(atomId, activeElement)
          break
        }

        // 剩下：游离 H（无键）——构建态无操作
        flashHint('孤立 H · Esc 切换到选择')
        break
      }
    }
  }, [store])

  const onBondClick = useCallback((bondId: string, event: MouseEvent) => {
    const { activeTool, activeFragmentId, flashHint } = useEditorStore.getState()
    if (!toolCan(activeTool, 'canEdit')) return

    // 键可能在非 active 分子里：先激活宿主对象（不可见/锁定则中止），
    // 否则 cycleBondLength / fuseFragmentOnBond 都会静默失败。
    if (!selectActiveMoleculeOrEmpty(store.getState()).bonds.some(b => b.id === bondId)) {
      if (!store.getState().activateObjectContainingBond(bondId)) return
    }
    const { cycleBondLength, selectBond } = store.getState()

    // 片段笔刷点键 = 并环（Ketcher 式，仅构建态）
    const armed = useEditorStore.getState().brushArmed
    const fragment = armed && activeFragmentId ? getFragment(activeFragmentId) : undefined
    if (fragment) {
      const st = store.getState()
      const mol = selectActiveMoleculeOrEmpty(st)
      const result = fuseFragmentOnBond(mol, fragment, bondId)
      if (result.ok === true) {
        st.setMolecule(result.molecule)
      } else {
        flashHint(result.reason)
      }
      return
    }

    // Shift+点键 = 循环标准键长（几何是真相，键级跟随）；环内键退回纯键级循环。
    // 单击 = 选中（Alt 连带两端原子）
    if (event.shiftKey) {
      const result = cycleBondLength(bondId)
      if (!result.ok) {
        flashHint(result.reason ?? '无法调整')
      } else if (result.moved === false) {
        flashHint('环内键：仅切换键级，几何不变')
      }
    } else {
      selectBond(bondId, event.altKey)
    }
  }, [store])

  // 单击空白只做无害操作（清除选择/提交测量），放置一律走双击 ——
  // 转视角和点击共用左键，误触不能产生编辑
  const onBackgroundClick = useCallback((_worldPos: THREE.Vector3, event: MouseEvent) => {
    const { activeTool, commitPendingMeasure } = useEditorStore.getState()
    const { clearSelection } = store.getState()
    switch (activeTool) {
      case 'measure':
        commitPendingMeasure()
        break
      default:
        if (!event.shiftKey && !event.altKey) clearSelection()
        break
    }
  }, [store])

  // 双击空白 = 放置（仅构建态）：片段笔刷放完整片段，否则放单个光原子（单原子就是单原子）
  const onBackgroundDoubleClick = useCallback((worldPos: THREE.Vector3, _event: MouseEvent, viewDirLocal?: THREE.Vector3) => {
    const { activeTool, activeElement, activeFragmentId, brushArmed } = useEditorStore.getState()
    if (!toolCan(activeTool, 'canEdit') || !brushArmed) return
    const st = store.getState()
    const fragment = activeFragmentId ? getFragment(activeFragmentId) : undefined
    if (fragment) {
      // 放完整片段：草图模式与平面共面，否则片段面朝向相机
      const mol = selectActiveMoleculeOrEmpty(st)
      const sketch = useEditorStore.getState().sketchPlane
      const orient = sketch
        ? { x: sketch.normal[0], y: sketch.normal[1], z: sketch.normal[2] }
        : viewDirLocal
      // 杂化桩（attachOrder>1）放空白 → 放最小完整原型（=C→乙烯、≡C→乙炔、=O→甲醛…）：
      // 孤立杂化中心无意义，补一个碳同级桩凑真实小分子（同 GaussView 的「放下即成键」）。
      const order = fragment.attachOrder ?? 1
      if (order > 1) {
        const partner = getFragment(order === 3 ? 'c-sp' : 'c-sp2')
        if (partner) {
          st.setMolecule(placeHybridPrototype(mol, fragment, partner, worldPos, orient))
          return
        }
      }
      st.setMolecule(placeFragmentStandalone(mol, fragment, worldPos, orient))
      return
    }
    // 单原子就是单原子：放一个光原子，不自动补 H（要饱和氢化物请选 sp³ 桩）
    st.addAtom(activeElement, worldPos.x, worldPos.y, worldPos.z)
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

  const onAtomDoubleClick = useCallback((atomId: string, _event: MouseEvent) => {
    if (!toolCan(useEditorStore.getState().activeTool, 'canEdit')) return
    // 双击非 active 分子的原子时先切换（宿主不可见/锁定则中止）
    const resolved = activateAndResolve(atomId, activate, getActiveMol)
    if (!resolved) return
    store.getState().selectAtoms(resolved.fragment, 'replace')
  }, [store, activate, getActiveMol])

  // 返回 true 则 InteractionHandler 进入 bond-drag 候选模式（智能指针的拖拽手势：
  // 拖到原子=成键，拖到空白=生长新原子；位移不足时由 click 处理器接管）
  const onBondDragStart = useCallback((sourceId: string): boolean => {
    const { activeTool, activeFragmentId, brushArmed } = useEditorStore.getState()
    // 成键手势仅在构建态；片段笔刷只用点击语义（拖出整片段的 ghost 预览留作后续）
    if (!toolCan(activeTool, 'canEdit') || !brushArmed || activeFragmentId) return false

    // 选中的原子拖拽 = 移动（canDragAtom 路径），不进成键手势
    if (store.getState().selectedAtomIds.has(sourceId)) return false

    // 源原子可能在非 active 分子里：先切换（宿主不可见/锁定则不进手势）
    const resolved = activateAndResolve(sourceId, activate, getActiveMol)
    if (!resolved) return false
    const mol = resolved.mol

    const src = mol.atoms.find(a => a.id === sourceId)
    if (!src) return false
    // 槽位 H：可拖到其他原子成键 / 拖到空白替换生长（语义在 onBondDragEnd）
    if (isSlotH(mol, sourceId)) return true
    // 饱和重原子拖拽不做成键（转相机/框选不受影响）；未饱和骨架原子保留拖出生长
    return valenceUsedByBonds(mol.bonds, sourceId) < maxValence(src)
  }, [store, activate, getActiveMol])

  const onBondDragEnd = useCallback((sourceId: string, targetId: string | null, dropLocal: THREE.Vector3 | null) => {
    const { activeTool, activeElement, flashHint } = useEditorStore.getState()
    if (!toolCan(activeTool, 'canEdit')) return
    const st = store.getState()
    const mol = selectActiveMoleculeOrEmpty(st)
    const a1 = mol.atoms.find(a => a.id === sourceId)
    if (!a1) return

    // 拖到已有原子 → 成键；任一端是槽位 H 时让 H 让位（闭环的标准操作）
    if (targetId) {
      const a2 = mol.atoms.find(a => a.id === targetId)
      if (!a2) { flashHint('目标原子在另一个分子里，暂不支持跨分子成键'); return }
      const srcSlot = isSlotH(mol, sourceId)
      const tgtSlot = isSlotH(mol, targetId)
      if (srcSlot || tgtSlot) {
        const result = srcSlot
          ? st.bondViaHydrogen(sourceId, targetId)
          : st.bondViaHydrogen(targetId, sourceId)
        if (!result.ok) flashHint(result.reason ?? '无法成键')
        return
      }
      const check = canBond(a1, a2, mol.bonds)
      if (!check.ok) { flashHint(check.reason ?? '无法成键'); return }
      st.addBond(sourceId, targetId)
      return
    }

    // 拖到空白：
    //  - 槽位 H → 替换为当前元素的饱和基团（方向就是原 H 槽位，同点击）
    //  - 未饱和重原子 → 在吸附位置生长新原子+键+补氢（合为一步 undo）
    if (dropLocal) {
      if (isSlotH(mol, sourceId)) {
        if (activeElement !== 'H') st.growFromHydrogen(sourceId, activeElement)
        return
      }
      st.beginTransaction()
      try {
        const newId = st.addAtom(activeElement, dropLocal.x, dropLocal.y, dropLocal.z)
        st.addBond(sourceId, newId)
        if (activeElement !== 'H') st.addHydrogens(newId)
      } finally {
        st.endTransaction()
      }
    }
  }, [store])

  // 拖出生长的实时预览：返回 VSEPR 吸附后的落点和新原子外观
  const getGrowPreview = useCallback((
    sourceId: string, cursorLocal: THREE.Vector3, freeDirection: boolean,
  ): { pos: THREE.Vector3; radius: number; color: number } | null => {
    const { activeTool, activeElement } = useEditorStore.getState()
    if (!toolCan(activeTool, 'canEdit')) return null
    const mol = selectActiveMoleculeOrEmpty(store.getState())
    const center = mol.atoms.find(a => a.id === sourceId)
    if (!center) return null
    const cfg = getElementConfig(activeElement)

    // 槽位 H：替换落点固定在原 H 方向（与 growByReplacingH 共用落点计算，
    // 保证所见即所得），不随光标吸附
    if (isSlotH(mol, sourceId)) {
      if (activeElement === 'H') return null
      const p = resolveHSlotGrowth(mol, sourceId, activeElement)
      if (!p) return null
      return {
        pos: new THREE.Vector3(p.x, p.y, p.z),
        radius: cfg.covalentRadius * RENDER.growGhostRadiusFactor,
        color: cfg.color,
      }
    }

    const pos = calcGrowPosition(
      center, mol.bonds, mol.atoms, activeElement,
      [cursorLocal.x, cursorLocal.y, cursorLocal.z],
      !freeDirection,   // 按住 Shift 取消 VSEPR 吸附
    )
    return {
      pos: new THREE.Vector3(pos[0], pos[1], pos[2]),
      radius: cfg.covalentRadius * RENDER.growGhostRadiusFactor,
      color: cfg.color,
    }
  }, [store])

  // 拖出生长开始时的候选槽位参考几何（环 / 点）
  const getGrowGuide = useCallback((sourceId: string): GrowGuideSpec => {
    const { activeTool, activeElement } = useEditorStore.getState()
    if (!toolCan(activeTool, 'canEdit')) return null
    const mol = selectActiveMoleculeOrEmpty(store.getState())
    const center = mol.atoms.find(a => a.id === sourceId)
    if (!center) return null
    // 槽位 H 拖拽没有候选槽位可选（落点固定 / 目标决定语义），不画参考几何
    if (isSlotH(mol, sourceId)) return null
    const guide = calcGrowGuide(center, mol.bonds, mol.atoms, activeElement)
    if (guide.kind === 'free') return null
    const cfg = getElementConfig(activeElement)
    const ghostRadius = cfg.covalentRadius * RENDER.growGhostRadiusFactor
    const ghostColor = cfg.color

    // 平面草图模式：圆锥候选环退化为"环 ∩ 草图平面"的两个点
    const sketch = useEditorStore.getState().sketchPlane
    if (sketch && guide.kind === 'ring') {
      const pts = ringPlaneIntersection(guide.center, guide.axis, guide.radius, {
        origin: sketch.origin, normal: sketch.normal,
      })
      if (pts.length > 0) {
        return {
          kind: 'points',
          positions: pts.map(p => new THREE.Vector3(p[0], p[1], p[2])),
          ghostRadius, ghostColor,
        }
      }
    }

    if (guide.kind === 'ring') {
      return {
        kind: 'ring',
        center: new THREE.Vector3(...guide.center),
        axis: new THREE.Vector3(...guide.axis),
        radius: guide.radius,
        ghostRadius, ghostColor,
      }
    }
    return {
      kind: 'points',
      positions: guide.positions.map(p => new THREE.Vector3(...p)),
      ghostRadius, ghostColor,
    }
  }, [store])

  return {
    onAtomClick, onAtomDoubleClick, onBondClick, onBackgroundClick, onBackgroundDoubleClick,
    onAtomDragStart, onAtomDrag, onAtomDragEnd,
    onBondDragStart, onBondDragEnd, getGrowPreview, getGrowGuide,
  }
}
