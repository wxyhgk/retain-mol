import type { EditSlice } from './types'
import type { EditActionContext } from './editActionTypes'
import {
  applyActiveMoleculeEdit,
  applyActiveMoleculeEditWithSelection,
  applySceneObjectUpdatedResult,
  applySetMoleculeInSceneResult,
  getEditableObject,
} from './helpers'
import { runAutoInferBondsCommand } from '../../lib/builder/commands/bond'
import {
  runMoveAtomCommand,
  runSetAtomPositionsCommand,
} from '../../lib/builder/commands/geometry'
import {
  runCenterMoleculeCommand,
  runClearMoleculeCommand,
  runSetMoleculeInSceneCommand,
  runSetSceneObjectAtomPositionsCommand,
} from '../../lib/builder/commands/scene'
import { runClearSelectionCommand } from '../../lib/builder/commands/selection'
import { editWithSelectionSets } from '../../lib/builder/commands/shared'
import { editChanged, editUnchanged, type EditCommandResult } from '../../lib/builder/commands/shared'
import type { Bond } from '../../lib/molecule'

/** 键的拓扑指纹：端点对（无序）+ 键级 + 芳香标记，忽略键 ID。 */
function bondTopologyKey(bond: Bond): string {
  const [a, b] = bond.atomId1 < bond.atomId2
    ? [bond.atomId1, bond.atomId2]
    : [bond.atomId2, bond.atomId1]
  return `${a}|${b}|${bond.order}|${bond.aromatic ? 1 : 0}`
}

/** 两组键在拓扑上等价（多重集比较，忽略 ID 与顺序）。 */
function bondTopologyEqual(before: readonly Bond[], after: readonly Bond[]): boolean {
  if (before.length !== after.length) return false
  const counts = new Map<string, number>()
  for (const bond of before) {
    const key = bondTopologyKey(bond)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  for (const bond of after) {
    const key = bondTopologyKey(bond)
    const count = counts.get(key)
    if (!count) return false
    counts.set(key, count - 1)
  }
  return true
}

type MoleculeEditActions = Pick<
  EditSlice,
  | 'setMolecule'
  | 'commitEditResult'
  | 'moveAtom'
  | 'setAtomPositions'
  | 'setObjectAtomPositions'
  | 'autoInferBonds'
  | 'clearMolecule'
  | 'centerMolecule'
>

export function createMoleculeEditActions({
  set,
}: EditActionContext): MoleculeEditActions {
  const commitEditResult = (
    result: EditCommandResult,
    options: { selectionPolicy?: 'clear' | 'preserve'; bumpAtomPositionVersion?: boolean } = {},
  ) => {
    if (!result.ok || !result.changed) return
    set((s) => {
      if (s.activeObjectId && !getEditableObject(s, s.activeObjectId)) return {}
      const sceneResult = runSetMoleculeInSceneCommand(
        s.objectsById,
        s.objectOrder,
        s.activeObjectId,
        result.molecule,
      )
      const patch = applySetMoleculeInSceneResult(s, sceneResult)
      if (options.selectionPolicy !== 'preserve') return patch

      const validAtomIds = new Set(result.molecule.atoms.map(atom => atom.id))
      const validBondIds = new Set(result.molecule.bonds.map(bond => bond.id))
      return {
        ...patch,
        selectedAtomIds: new Set([...s.selectedAtomIds].filter(id => validAtomIds.has(id))),
        selectedBondIds: new Set([...s.selectedBondIds].filter(id => validBondIds.has(id))),
        selectionVersion: s.selectionVersion + 1,
        ...(options.bumpAtomPositionVersion
          ? { atomPositionVersion: s.atomPositionVersion + 1 }
          : {}),
      }
    })
  }

  return {
    setMolecule: mol => commitEditResult(editChanged(mol)),
    commitEditResult,

    moveAtom: (id, x, y, z) =>
      set((s) =>
        applyActiveMoleculeEdit(
          s,
          (mol) => runMoveAtomCommand(mol, id, x, y, z),
          {
            bumpAtomPositionVersion: true,
          },
        ),
      ),

    setAtomPositions: (positions) =>
      set((s) =>
        applyActiveMoleculeEdit(
          s,
          (mol) => runSetAtomPositionsCommand(mol, positions),
          {
            bumpAtomPositionVersion: true,
          },
        ),
      ),

    setObjectAtomPositions: (objectId, positions) =>
      set((s) => {
        if (!getEditableObject(s, objectId)) return {}
        const result = runSetSceneObjectAtomPositionsCommand(
          s.objectsById,
          objectId,
          positions,
        )
        return applySceneObjectUpdatedResult(s, result, {
          bumpAtomPositionVersion: true,
        })
      }),

    autoInferBonds: () =>
      set((s) =>
        applyActiveMoleculeEdit(s, (mol) => {
          const result = runAutoInferBondsCommand(mol)
          if (!result.ok || !result.changed) return result
          // 无变化短路：推断结果与现有键拓扑等价时不落盘。
          // 命令层总是全量重建键 ID，直接落盘会把 selectedBondIds 打成
          // 悬空引用，并在拓扑毫无变化时平白压一步 undo。
          return bondTopologyEqual(mol.bonds, result.molecule.bonds)
            ? editUnchanged('键拓扑无变化')
            : result
        }),
      ),

    clearMolecule: () =>
      set((s) =>
        applyActiveMoleculeEditWithSelection(s, (_molecule, selection) => {
          const molecule = runClearMoleculeCommand().molecule
          const cleared = runClearSelectionCommand(
            selection.selectedAtomIds,
            selection.selectedBondIds,
          )
          return editWithSelectionSets(
            molecule,
            cleared.selectedAtomIds,
            cleared.selectedBondIds,
            selection,
            { moleculeChanged: true },
          )
        }),
      ),

    centerMolecule: () =>
      set((s) => applyActiveMoleculeEdit(s, runCenterMoleculeCommand)),
  }
}
