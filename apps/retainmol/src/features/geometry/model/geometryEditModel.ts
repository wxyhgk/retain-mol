import type { Atom } from '@retainmol/mol-viewer/core'
import { calcAngle, calcDihedral, calcDistance } from '@/domain/viewer/geometry'

export interface GeometryEditResult {
  readonly ok: boolean
  readonly reason?: string
}

export interface GeometryEditActions {
  readonly setBondLength: (aId: string, bId: string, length: number) => GeometryEditResult
  readonly setBondAngle: (aId: string, bId: string, cId: string, degrees: number) => GeometryEditResult
  readonly setDihedralAngle: (
    aId: string,
    bId: string,
    cId: string,
    dId: string,
    degrees: number,
  ) => GeometryEditResult
}

export interface LiveGeometryModel {
  readonly kind: 'distance' | 'angle' | 'dihedral'
  readonly atoms: Atom[]
  readonly label: string
  readonly value: number
  readonly unit: string
  readonly editHint: string
  readonly commit: (value: number) => GeometryEditResult
}

export function selectGeometryEditActions(actions: GeometryEditActions): GeometryEditActions {
  return {
    setBondLength: actions.setBondLength,
    setBondAngle: actions.setBondAngle,
    setDihedralAngle: actions.setDihedralAngle,
  }
}

export function selectLiveGeometry(
  orderedAtoms: Atom[],
  actions: GeometryEditActions,
): LiveGeometryModel | null {
  if (orderedAtoms.length < 2 || orderedAtoms.length > 4) return null

  const label = orderedAtoms.map(atom => atom.symbol).join('—')
  if (orderedAtoms.length === 2) {
    const [first, second] = orderedAtoms
    return {
      kind: 'distance',
      atoms: orderedAtoms,
      label,
      value: calcDistance(first, second),
      unit: 'Å',
      editHint: '修改距离将平移后选原子一侧',
      commit: value => actions.setBondLength(first.id, second.id, value),
    }
  }

  if (orderedAtoms.length === 3) {
    const [first, vertex, last] = orderedAtoms
    return {
      kind: 'angle',
      atoms: orderedAtoms,
      label,
      value: calcAngle(first, vertex, last),
      unit: '°',
      editHint: '键角顶点 = 第 2 个选中原子 · 转动末端一侧',
      commit: value => actions.setBondAngle(first.id, vertex.id, last.id, value),
    }
  }

  const [first, axisStart, axisEnd, last] = orderedAtoms
  return {
    kind: 'dihedral',
    atoms: orderedAtoms,
    label,
    value: calcDihedral(first, axisStart, axisEnd, last),
    unit: '°',
    editHint: '二面角绕 2–3 号原子轴转动末端一侧',
    commit: value => actions.setDihedralAngle(
      first.id,
      axisStart.id,
      axisEnd.id,
      last.id,
      value,
    ),
  }
}
