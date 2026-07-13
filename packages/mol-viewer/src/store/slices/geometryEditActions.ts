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

type GeometryEditActions = Pick<
  EditSlice,
  | 'cycleBondLength'
  | 'setBondLength'
  | 'setBondAngle'
  | 'setDihedralAngle'
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

    cleanupGeometry: () => {
      return applyGeomEdit(get, set, runCleanupGeometryCommand)
    },
  }
}
