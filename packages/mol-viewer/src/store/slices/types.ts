/**
 * moleculeStore slice 类型拆分
 *
 * 单一 store 按职责拆成三个 slice（场景 / 选择 / 编辑）。
 * 各 slice 的 StateCreator 在 moleculeStore.ts 组合，仍是同一个 store，
 * 所以类型也拆成三段接口再交集为完整的 MoleculeState。
 */

import type { Molecule } from '../../lib/molecule'
import type { MolClipboard } from '../../lib/types'
import type { SceneObject } from '../../lib/sceneObject'
import type { UndoTransactionHandle } from '../contracts/transaction'
import type { EditCommandResult } from '../../lib/builder/commands/shared'
import type {
  AlignBondPairDiagnostics,
  AlignBondPairFailureCode,
  AlignBondPairInput,
} from '../../lib/builder/geometry/bondPairAlignment'

// ── 场景 slice ──────────────────────────────────────────────────────────────
export interface SceneSlice {
  objectsById:    Record<string, SceneObject>
  objectOrder:    string[]
  activeObjectId: string | null

  addToScene:        (mol: Molecule, autoOffset?: boolean) => string
  setActiveObject:   (id: string | null) => void
  removeSceneObject: (id: string) => void
  splitSceneObject:  (id: string) => void
  setObjectVisible:  (id: string, visible: boolean) => void
  setObjectLocked:   (id: string, locked: boolean) => void
  renameObject:      (id: string, name: string) => void

  /** 激活包含指定原子的场景对象；不可见或锁定的对象拒绝（返回 false）。
   *  多分子场景下所有编辑手势的统一入口守卫。 */
  activateObjectContainingAtom: (atomId: string) => boolean
  /** 同上，按键 id 定位 */
  activateObjectContainingBond: (bondId: string) => boolean
}

// ── 选择 slice ──────────────────────────────────────────────────────────────
export interface SelectionSlice {
  selectionVersion: number
  selectedAtomIds:  Set<string>
  selectedBondIds:  Set<string>

  selectAtom:     (id: string, multi?: boolean) => void
  selectAtoms:    (ids: Iterable<string>, mode?: 'replace' | 'add' | 'subtract') => void
  selectBond:     (id: string, multi?: boolean) => void
  setSelection:   (atomIds: Iterable<string>, bondIds: Iterable<string>) => void
  clearSelection: () => void
}

// ── 编辑 slice ──────────────────────────────────────────────────────────────
export interface EditSlice {
  // 版本号（脏检测，不进 undo 历史）
  atomPositionVersion: number

  setMolecule:            (mol: Molecule) => void
  commitEditResult:       (
    result: EditCommandResult,
    options?: { selectionPolicy?: 'clear' | 'preserve'; bumpAtomPositionVersion?: boolean },
  ) => void
  addAtom:                (symbol: string, x: number, y: number, z: number) => string
  removeAtom:             (id: string) => void
  moveAtom:               (id: string, x: number, y: number, z: number) => void
  setAtomPositions:       (positions: ReadonlyMap<string, { x: number; y: number; z: number }>) => void
  setObjectAtomPositions: (objectId: string, positions: ReadonlyMap<string, { x: number; y: number; z: number }>) => void
  beginTransaction:       (owner?: string) => UndoTransactionHandle
  endTransaction:         (owner?: string) => void
  runTransaction:         <T>(owner: string, operation: () => T) => T
  addBond:                (atomId1: string, atomId2: string, order?: 1 | 2 | 3) => void
  removeBond:             (id: string) => void
  setBondOrder:           (id: string, order: 1 | 2 | 3) => void
  cycleBondOrder:         (id: string) => void
  cycleBondLength:        (id: string) => { ok: boolean; reason?: string; moved?: boolean }
  // GaussView 式几何参数编辑（按选择顺序传入原子 id）
  setBondLength:          (aId: string, bId: string, length: number) => { ok: boolean; reason?: string }
  setBondAngle:           (aId: string, bId: string, cId: string, deg: number) => { ok: boolean; reason?: string }
  setDihedralAngle:       (aId: string, bId: string, cId: string, dId: string, deg: number) => { ok: boolean; reason?: string }
  alignBondPair:          (input: AlignBondPairInput) =>
    | { ok: true; diagnostics: AlignBondPairDiagnostics }
    | { ok: false; code: AlignBondPairFailureCode; reason: string }
  autoInferBonds:         () => void
  addHydrogens:           (atomId?: string) => void
  /** 力场几何清理（MMFF94）：弛豫坐标到物理合理（一步 undo，不动拓扑）。返回是否成功 */
  cleanupGeometry:        () => { ok: boolean; reason?: string }
  canAddOneHydrogen:      (atomId: string) => { ok: boolean; reason?: string }
  canAddOneHydrogens:     (atomIds: readonly string[]) => { ok: boolean; allowedAtomIds: readonly string[]; reason?: string }
  addOneHydrogen:         (atomId: string) => void
  addOneHydrogens:        (atomIds: readonly string[]) => void
  replaceAtom:            (atomId: string, symbol: string) => void
  replaceAtoms:           (atomIds: readonly string[], symbol: string) => void
  removeAtoms:            (atomIds: readonly string[]) => void
  /** 设形式电荷并按新有效价态增删 H（N⁺→长第4个H、O⁻→掉一个H） */
  setAtomCharge:          (atomId: string, charge: number) => void
  /** 设未配对电子数（自由基）并按新有效价态增删 H */
  setAtomRadical:         (atomId: string, radical: number) => void
  growFromHydrogen:       (atomId: string, symbol: string) => void
  bondViaHydrogen:        (sourceHId: string, targetId: string) => { ok: boolean; reason?: string }
  bondSelectedAtoms:      () => { ok: boolean; reason?: string }
  clearMolecule:          () => void
  centerMolecule:         () => void
  pasteAtoms:             (clipboard: MolClipboard) => string[]
  /** 把当前选中原子（及两端都选中的键）序列化为剪贴板格式；无选中返回 null */
  copySelection:          () => MolClipboard | null
  /** 删除所有选中的原子和键（一步 undo）；无选中时为 no-op */
  removeSelected:         () => void
}

/** 完整 store 状态：三 slice 交集 */
export type MoleculeState = SceneSlice & SelectionSlice & EditSlice
