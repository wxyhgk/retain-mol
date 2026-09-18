import { create } from 'zustand'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { canonicalizeMolecule } from '@/features/molecule-assets'

/**
 * 浏览器本地持久化：编辑器唯一的保存位置（无后端保存）。
 * - 显式保存位（用户按保存/Ctrl+S）：下次打开可恢复，是 dirty 判定基准。
 * - 崩溃快照位（自动防抖兜底）：显式保存后清除，保存优先。
 * 给未来宿主项目集成：读 `readLocalSave()` 拿标准 Molecule 即可。
 */
export const LOCAL_SAVE_KEY = 'retainmol/save/active-molecule-v1'
export const CRASH_SNAPSHOT_KEY = 'retainmol/crash-snapshot/active-molecule-v1'

export interface LocalMoleculeRecord {
  readonly version: 1
  readonly savedAt: string
  readonly canonical: string
  readonly molecule: Molecule
}

function storage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function readRecord(key: string): LocalMoleculeRecord | null {
  try {
    const raw = storage()?.getItem(key)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (!('version' in parsed) || parsed.version !== 1) return null
    if (!('canonical' in parsed) || typeof parsed.canonical !== 'string') return null
    if (!('molecule' in parsed) || !parsed.molecule || typeof parsed.molecule !== 'object') return null
    if (!('atoms' in parsed.molecule) || !Array.isArray(parsed.molecule.atoms)) return null
    return parsed as LocalMoleculeRecord
  } catch {
    return null
  }
}

export function readLocalSave(): LocalMoleculeRecord | null {
  return readRecord(LOCAL_SAVE_KEY)
}

export function readCrashSnapshot(): LocalMoleculeRecord | null {
  return readRecord(CRASH_SNAPSHOT_KEY)
}

export function writeCrashSnapshot(molecule: Molecule): boolean {
  try {
    if (!molecule || molecule.atoms.length === 0) return false
    const store = storage()
    if (!store) return false
    const record: LocalMoleculeRecord = {
      version: 1,
      savedAt: new Date().toISOString(),
      canonical: canonicalizeMolecule(molecule),
      molecule,
    }
    store.setItem(CRASH_SNAPSHOT_KEY, JSON.stringify(record))
    return true
  } catch {
    return false
  }
}

export function removeCrashSnapshot(): void {
  try {
    storage()?.removeItem(CRASH_SNAPSHOT_KEY)
  } catch {
    // 快照清理失败不影响编辑
  }
}

/** 脏 = 画布非空且与显式保存不一致（从未保存过则非空即脏）。纯函数，可单元测试。 */
export function isDirtyVsSave(molecule: Molecule | null, savedCanonical: string | null): boolean {
  if (!molecule || molecule.atoms.length === 0) return false
  if (!savedCanonical) return true
  try {
    return canonicalizeMolecule(molecule) !== savedCanonical
  } catch {
    return true
  }
}

interface LocalSaveState {
  readonly savedCanonical: string | null
  readonly savedAt: string | null
  /** 显式保存到浏览器；成功返回 true（同时清除崩溃快照，保存优先）。 */
  recordSave: (molecule: Molecule) => boolean
}

export const useLocalSaveStore = create<LocalSaveState>()((set) => {
  const initial = readLocalSave()
  return {
    savedCanonical: initial?.canonical ?? null,
    savedAt: initial?.savedAt ?? null,
    recordSave: (molecule) => {
      try {
        if (!molecule || molecule.atoms.length === 0) return false
        const canonical = canonicalizeMolecule(molecule)
        const savedAt = new Date().toISOString()
        const store = storage()
        if (!store) return false
        const record: LocalMoleculeRecord = { version: 1, savedAt, canonical, molecule }
        store.setItem(LOCAL_SAVE_KEY, JSON.stringify(record))
        set({ savedCanonical: canonical, savedAt })
        removeCrashSnapshot()
        return true
      } catch {
        return false
      }
    },
  }
})
