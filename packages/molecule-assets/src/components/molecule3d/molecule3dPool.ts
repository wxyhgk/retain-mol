import { useSyncExternalStore } from 'react'

/**
 * 3D 视图池：同屏活跃的 Molecule3D 数量封顶（WebGL context 是稀缺资源，
 * 展柜/编辑器各占一个，浏览器上限 ~8-16）。超出上限逐出最早的活跃者，
 * 被逐出的 MoleculeStructureView 自动退回 2D。模块级单例，无需 Provider。
 */
const DEFAULT_CAP = 3

let cap = DEFAULT_CAP
let active: readonly string[] = []
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

export function configureMolecule3DPool(options: { cap: number }): void {
  cap = Math.max(1, options.cap)
}

export function acquire3DSlot(id: string): void {
  if (active.includes(id)) return
  const next = [...active, id]
  active = next.length > cap ? next.slice(next.length - cap) : next
  emit()
}

export function release3DSlot(id: string): void {
  if (!active.includes(id)) return
  active = active.filter(item => item !== id)
  emit()
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

/** 订阅"我是否仍持有池位"（被逐出时触发重渲）。 */
export function use3DSlotActive(id: string): boolean {
  return useSyncExternalStore(subscribe, () => active.includes(id), () => false)
}

/** 仅测试用。 */
export function reset3DPoolForTest(): void {
  active = []
  cap = DEFAULT_CAP
  emit()
}

export function active3DSlots(): readonly string[] {
  return active
}
