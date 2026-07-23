import type { EditSlice } from './types'
import type { EditActionContext } from './editActionTypes'
import { applyGeomEdit, applyGeomEditWithMeta } from './helpers'
import {
  runCleanupGeometryCommand,
  runCycleBondLengthCommand,
  runSetBondAngleCommand,
  runSetBondLengthCommand,
  runSetDihedralAngleCommand,
} from '../../lib/builder/commands/geometry'
import { runAlignBondPairGeometry } from '../../lib/builder/geometry/bondPairAlignment'

type GeometryEditActions = Pick<
  EditSlice,
  | 'cycleBondLength'
  | 'setBondLength'
  | 'setBondAngle'
  | 'setDihedralAngle'
  | 'alignBondPair'
  | 'cleanupGeometry'
>

export function createGeometryEditActions({
  get,
  set,
}: EditActionContext): GeometryEditActions {
  return {
    cycleBondLength: (id) => {
      return applyGeomEditWithMeta(
        get,
        set,
        (mol) => runCycleBondLengthCommand(mol, id),
        (result) => result.moved === undefined ? {} : { moved: result.moved },
      )
    },

    setBondLength: (aId, bId, length) => {
      return applyGeomEdit(get, set, (mol) =>
        runSetBondLengthCommand(mol, aId, bId, length),
      )
    },

    setBondAngle: (aId, bId, cId, deg) => {
      return applyGeomEdit(get, set, (mol) =>
        runSetBondAngleCommand(mol, aId, bId, cId, deg),
      )
    },

    setDihedralAngle: (aId, bId, cId, dId, deg) => {
      return applyGeomEdit(get, set, (mol) =>
        runSetDihedralAngleCommand(mol, aId, bId, cId, dId, deg),
      )
    },

    alignBondPair: (input) => {
      const state = get()
      const result = runAlignBondPairGeometry(state.objectsById, state.objectOrder, input)
      if (!result.ok) return result
      if (result.changed) {
        set((current) => ({
          objectsById: result.objectsById as typeof current.objectsById,
          atomPositionVersion: current.atomPositionVersion + 1,
        }))
      }
      return { ok: true, diagnostics: result.diagnostics }
    },

    cleanupGeometry: () => {
      return applyGeomEdit(get, set, runCleanupGeometryCommand)
    },
  }
}
