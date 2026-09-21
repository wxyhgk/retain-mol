import type { Molecule } from '@retainmol/mol-viewer/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  LOCAL_SAVE_KEY,
  CRASH_SNAPSHOT_KEY,
  isDirtyVsSave,
  readLocalSave,
  readCrashSnapshot,
  writeCrashSnapshot,
  useLocalSaveStore,
} from './localMoleculeSave'

class MemoryStorage {
  private readonly data = new Map<string, string>()
  get length(): number {
    return this.data.size
  }
  clear(): void {
    this.data.clear()
  }
  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }
  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null
  }
  removeItem(key: string): void {
    this.data.delete(key)
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }
}

const mol = (extra = {}): Molecule => ({
  name: 'm',
  atoms: [{ id: 'c1', symbol: 'C', x: 0, y: 0, z: 0 }],
  bonds: [],
  ...extra,
} as Molecule)

describe('localMoleculeSave', () => {
  it('preserves authored fields in save and crash recovery and repairs a stale dirty baseline', () => {
    const storage = new MemoryStorage()
    vi.stubGlobal('window', { localStorage: storage })
    const molecule = mol({ atoms: [{ id: 'c1', symbol: 'C', isotope: 13, charge: -1, radical: 1, label: '连接位点', x: 0, y: 2, z: -1 }] })
    expect(useLocalSaveStore.getState().recordSave(molecule)).toBe(true)
    expect(readLocalSave()?.molecule).toEqual(molecule)
    expect(writeCrashSnapshot(molecule)).toBe(true)
    expect(readCrashSnapshot()?.molecule).toEqual(molecule)
    const record = JSON.parse(storage.getItem(LOCAL_SAVE_KEY)!)
    storage.setItem(LOCAL_SAVE_KEY, JSON.stringify({ ...record, canonical: 'wrong baseline' }))
    expect(isDirtyVsSave(molecule, readLocalSave()!.canonical)).toBe(false)
  })

  it('rejects malformed saved graphs without overwriting the last valid record', () => {
    const storage = new MemoryStorage()
    vi.stubGlobal('window', { localStorage: storage })
    expect(useLocalSaveStore.getState().recordSave(mol())).toBe(true)
    const previous = storage.getItem(LOCAL_SAVE_KEY)
    const invalid = mol({ bonds: [{ id: 'b', atomId1: 'c1', atomId2: 'missing', order: 1 }] })
    expect(useLocalSaveStore.getState().recordSave(invalid)).toBe(false)
    expect(writeCrashSnapshot(invalid)).toBe(false)
    expect(storage.getItem(LOCAL_SAVE_KEY)).toBe(previous)
    const record = { version: 1, savedAt: 'now', canonical: '', molecule: invalid }
    storage.setItem(LOCAL_SAVE_KEY, JSON.stringify(record))
    storage.setItem(CRASH_SNAPSHOT_KEY, JSON.stringify(record))
    expect(readLocalSave()).toBeNull()
    expect(readCrashSnapshot()).toBeNull()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('isDirtyVsSave: 空画布永远不脏，无保存时非空即脏', () => {
    expect(isDirtyVsSave(null, null)).toBe(false)
    expect(isDirtyVsSave(mol({ atoms: [] }), null)).toBe(false)
    expect(isDirtyVsSave(mol(), null)).toBe(true)
  })

  it('recordSave round-trip 本地槽并驱动 dirty', () => {
    vi.stubGlobal('window', { localStorage: new MemoryStorage() })
    expect(useLocalSaveStore.getState().recordSave(mol())).toBe(true)
    const saved = readLocalSave()
    expect(saved?.molecule.atoms).toHaveLength(1)
    expect(saved?.version).toBe(1)
    expect(isDirtyVsSave(mol(), saved?.canonical ?? null)).toBe(false)
    expect(isDirtyVsSave(mol({ name: 'changed' }), saved?.canonical ?? null)).toBe(true)
  })


  it('recordSave 拒绝空画布', () => {
    vi.stubGlobal('window', { localStorage: new MemoryStorage() })
    expect(useLocalSaveStore.getState().recordSave(mol({ atoms: [] }))).toBe(false)
    expect(readLocalSave()).toBeNull()
  })

  it('脏记录版本不对时读出 null', () => {
    const storage = new MemoryStorage()
    vi.stubGlobal('window', { localStorage: storage })
    storage.setItem(LOCAL_SAVE_KEY, '{"version":2}')
    expect(readLocalSave()).toBeNull()
    storage.setItem(LOCAL_SAVE_KEY, 'not-json')
    expect(readLocalSave()).toBeNull()
  })
})
