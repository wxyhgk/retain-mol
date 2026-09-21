import type { Bond, Molecule } from '../../molecule'
import type { SceneObject } from '../../sceneObject'
import {
  add,
  angleBetween,
  cross,
  distance,
  dot,
  length,
  normalize,
  rotateAround,
  scale,
  sub,
  type Vec3,
} from '../../math/vec3'
import { getConnectedFragment } from '../../graph/components'
import type {
  BondPairGizmoGeometry,
  BondPairGizmoValue,
} from '../../bondPairGizmo'

const EPSILON = 1e-9

export type AlignBondPairFailureCode =
  | 'invalid-number'
  | 'invalid-angle'
  | 'invalid-distance'
  | 'unsupported-move-mode'
  | 'session-not-started'
  | 'reference-bond-not-found'
  | 'moving-bond-not-found'
  | 'same-bond'
  | 'reference-object-hidden'
  | 'moving-object-hidden'
  | 'moving-object-locked'
  | 'reference-anchor-not-on-bond'
  | 'moving-anchor-not-on-bond'
  | 'zero-length-reference-bond'
  | 'zero-length-moving-bond'
  | 'connected-bond-pair'

export interface AlignBondPairInput {
  readonly referenceBondId: string
  readonly movingBondId: string
  /** Endpoint of the reference bond nearest the moving fragment. */
  readonly referenceAnchorAtomId: string
  /** Endpoint of the moving bond nearest the reference fragment. */
  readonly movingAnchorAtomId: string
  /** Target distance between the two anchor atoms, in molecule coordinate units. */
  readonly anchorDistance: number
  /** Target angle between the two directed bond axes, from 0 through 180 degrees. */
  readonly axisAngleDegrees: number
  /**
   * Rigid rotation of the moving arrangement around the directed reference axis.
   * This is applied relative to the current arrangement using the right-hand rule.
   */
  readonly azimuthDegrees: number
  /** Snap all four bond endpoints into one mathematical plane. */
  readonly coplanar: boolean
  /** Selects either of the two coplanar moving-axis directions. */
  readonly coplanarDirection?: 0 | 180
  /** Only whole-fragment rigid movement is currently supported. */
  readonly moveWholeFragment?: boolean
}

export interface AlignBondPairDiagnostics {
  readonly anchorDistance: number
  readonly axisAngleDegrees: number
  /** Signed tetrahedral volume of the four directed bond endpoints. */
  readonly orientedVolume: number
  readonly movedAtomIds: ReadonlySet<string>
}

export type AlignBondPairGeometryResult =
  | {
      readonly ok: true
      readonly changed: boolean
      readonly objectsById: Readonly<Record<string, SceneObject>>
      readonly diagnostics: AlignBondPairDiagnostics
    }
  | {
      readonly ok: false
      readonly code: AlignBondPairFailureCode
      readonly reason: string
    }

interface LocatedBond {
  readonly object: SceneObject
  readonly molecule: Molecule
  readonly bond: Bond
}

export type InspectBondPairGeometryResult =
  | { readonly ok: true; readonly snapshot: BondPairGizmoGeometry }
  | { readonly ok: false; readonly code: AlignBondPairFailureCode; readonly reason: string }

function atomPosition(object: SceneObject, atomId: string): Vec3 | null {
  const atom = object.molecule.atoms.find(candidate => candidate.id === atomId)
  if (!atom) return null
  return [
    atom.x + object.offset.x,
    atom.y + object.offset.y,
    atom.z + object.offset.z,
  ]
}

function locateBond(
  objectsById: Readonly<Record<string, SceneObject>>,
  objectOrder: readonly string[],
  bondId: string,
): LocatedBond | null {
  for (const objectId of objectOrder) {
    const object = objectsById[objectId]
    if (!object) continue
    const bond = object.molecule.bonds.find(candidate => candidate.id === bondId)
    if (bond) return { object, molecule: object.molecule, bond }
  }
  return null
}

function otherEndpoint(bond: Bond, anchorAtomId: string): string | null {
  if (bond.atomId1 === anchorAtomId) return bond.atomId2
  if (bond.atomId2 === anchorAtomId) return bond.atomId1
  return null
}

function fallbackPerpendicular(axis: Vec3): Vec3 {
  const candidate: Vec3 = Math.abs(axis[0]) <= Math.abs(axis[1])
    ? (Math.abs(axis[0]) <= Math.abs(axis[2]) ? [1, 0, 0] : [0, 0, 1])
    : (Math.abs(axis[1]) <= Math.abs(axis[2]) ? [0, 1, 0] : [0, 0, 1])
  return normalize(cross(axis, candidate))
}

function perpendicularDirection(vector: Vec3, axis: Vec3, fallback?: Vec3): Vec3 {
  const projected = sub(vector, scale(axis, dot(vector, axis)))
  if (length(projected) >= EPSILON) return normalize(projected)
  if (fallback) {
    const projectedFallback = sub(fallback, scale(axis, dot(fallback, axis)))
    if (length(projectedFallback) >= EPSILON) return normalize(projectedFallback)
  }
  return fallbackPerpendicular(axis)
}

function rotateVectorFromTo(vector: Vec3, from: Vec3, to: Vec3): Vec3 {
  const cosine = Math.max(-1, Math.min(1, dot(from, to)))
  if (cosine > 1 - EPSILON) return vector
  if (cosine < -1 + EPSILON) {
    return rotateAround(vector, fallbackPerpendicular(from), Math.PI)
  }
  return rotateAround(vector, normalize(cross(from, to)), Math.acos(cosine))
}

function orientedVolume(a1: Vec3, a2: Vec3, b1: Vec3, b2: Vec3): number {
  return dot(sub(a2, a1), cross(sub(b1, a1), sub(b2, a1))) / 6
}

function invalid(code: AlignBondPairFailureCode, reason: string): AlignBondPairGeometryResult {
  return { ok: false, code, reason }
}

function inspectionInvalid(
  code: AlignBondPairFailureCode,
  reason: string,
): InspectBondPairGeometryResult {
  return { ok: false, code, reason }
}

/** Validate a bond pair and read its current world-space geometry without mutation. */
export function inspectBondPairGeometry(
  objectsById: Readonly<Record<string, SceneObject>>,
  objectOrder: readonly string[],
  input: Pick<
    AlignBondPairInput,
    | 'referenceBondId'
    | 'movingBondId'
    | 'referenceAnchorAtomId'
    | 'movingAnchorAtomId'
  >,
): InspectBondPairGeometryResult {
  const reference = locateBond(objectsById, objectOrder, input.referenceBondId)
  if (!reference) return inspectionInvalid('reference-bond-not-found', '找不到参考键')
  const moving = locateBond(objectsById, objectOrder, input.movingBondId)
  if (!moving) return inspectionInvalid('moving-bond-not-found', '找不到移动键')
  if (reference.bond.id === moving.bond.id) {
    return inspectionInvalid('same-bond', '参考键和移动键不能是同一条键')
  }
  if (!reference.object.visible) {
    return inspectionInvalid('reference-object-hidden', '参考键所在对象不可见')
  }
  if (!moving.object.visible) {
    return inspectionInvalid('moving-object-hidden', '移动键所在对象不可见')
  }
  if (moving.object.locked) {
    return inspectionInvalid('moving-object-locked', '移动键所在对象已锁定')
  }

  const referenceOtherId = otherEndpoint(reference.bond, input.referenceAnchorAtomId)
  if (!referenceOtherId) {
    return inspectionInvalid('reference-anchor-not-on-bond', '参考锚点不是参考键的端点')
  }
  const movingOtherId = otherEndpoint(moving.bond, input.movingAnchorAtomId)
  if (!movingOtherId) {
    return inspectionInvalid('moving-anchor-not-on-bond', '移动锚点不是移动键的端点')
  }

  const referenceAnchor = atomPosition(reference.object, input.referenceAnchorAtomId)!
  const referenceOther = atomPosition(reference.object, referenceOtherId)!
  const movingAnchor = atomPosition(moving.object, input.movingAnchorAtomId)!
  const movingOther = atomPosition(moving.object, movingOtherId)!
  const referenceAxisVector = sub(referenceAnchor, referenceOther)
  const movingAxisVector = sub(movingOther, movingAnchor)
  if (length(referenceAxisVector) < EPSILON) {
    return inspectionInvalid('zero-length-reference-bond', '参考键长度为 0，无法建立参考轴')
  }
  if (length(movingAxisVector) < EPSILON) {
    return inspectionInvalid('zero-length-moving-bond', '移动键长度为 0，无法建立移动轴')
  }

  const movingAtomIds = getConnectedFragment(
    moving.molecule.atoms,
    moving.molecule.bonds,
    input.movingAnchorAtomId,
  )
  if (
    reference.object.id === moving.object.id
    && (movingAtomIds.has(reference.bond.atomId1) || movingAtomIds.has(reference.bond.atomId2))
  ) {
    return inspectionInvalid(
      'connected-bond-pair',
      '两条键属于同一连通片段；整体移动第二条键会同时移动参考键',
    )
  }

  const volume = orientedVolume(referenceOther, referenceAnchor, movingAnchor, movingOther)
  const referenceAxis = normalize(referenceAxisVector)
  const movingAxis = normalize(movingAxisVector)
  const anchorDirection = normalize(sub(movingAnchor, referenceAnchor))
  const radial = perpendicularDirection(anchorDirection, referenceAxis, movingAxis)
  const movingRadial = dot(movingAxis, radial)
  const coplanar: false | 0 | 180 = Math.abs(volume) <= 1e-8
    ? (movingRadial >= 0 ? 0 : 180)
    : false
  const topologySignature = [
    reference.object.id,
    reference.bond.id,
    reference.bond.atomId1,
    reference.bond.atomId2,
    moving.object.id,
    ...moving.molecule.bonds
      .filter(bond => movingAtomIds.has(bond.atomId1) || movingAtomIds.has(bond.atomId2))
      .map(bond => `${bond.id}:${bond.atomId1}:${bond.atomId2}:${bond.order}`)
      .sort(),
    ...[...movingAtomIds].sort(),
  ].join('|')

  return {
    ok: true,
    snapshot: {
      value: {
        distance: distance(referenceAnchor, movingAnchor),
        axisAngleDegrees: angleBetween(referenceAxisVector, movingAxisVector) * 180 / Math.PI,
        azimuthDegrees: 0,
        coplanar,
      },
      referenceOther,
      referenceAnchor,
      movingAnchor,
      movingOther,
      movingAtomIds,
      movingObjectId: moving.object.id,
      topologySignature,
    },
  }
}

/**
 * Rigidly align two disconnected bond-bearing fragments in scene/world coordinates.
 * The reference object is never modified. The moving bond's complete connected
 * component is transformed by one rotation and one translation.
 */
export function runAlignBondPairGeometry(
  objectsById: Readonly<Record<string, SceneObject>>,
  objectOrder: readonly string[],
  input: AlignBondPairInput,
): AlignBondPairGeometryResult {
  if ([input.anchorDistance, input.axisAngleDegrees, input.azimuthDegrees]
    .some(value => !Number.isFinite(value))) {
    return invalid('invalid-number', '距离、轴间夹角和方位角必须是有限数值')
  }
  if (input.anchorDistance <= 0) {
    return invalid('invalid-distance', '锚点距离必须大于 0')
  }
  if (input.axisAngleDegrees < 0 || input.axisAngleDegrees > 180) {
    return invalid('invalid-angle', '轴间夹角必须在 0° 到 180° 之间')
  }
  if (input.moveWholeFragment === false) {
    return invalid('unsupported-move-mode', '当前只支持刚性移动第二条键所属的整个连通片段')
  }

  const reference = locateBond(objectsById, objectOrder, input.referenceBondId)
  if (!reference) return invalid('reference-bond-not-found', '找不到参考键')
  const moving = locateBond(objectsById, objectOrder, input.movingBondId)
  if (!moving) return invalid('moving-bond-not-found', '找不到移动键')
  if (reference.bond.id === moving.bond.id) {
    return invalid('same-bond', '参考键和移动键不能是同一条键')
  }
  if (!reference.object.visible) {
    return invalid('reference-object-hidden', '参考键所在对象不可见')
  }
  if (!moving.object.visible) {
    return invalid('moving-object-hidden', '移动键所在对象不可见')
  }
  if (moving.object.locked) {
    return invalid('moving-object-locked', '移动键所在对象已锁定')
  }

  const referenceOtherId = otherEndpoint(reference.bond, input.referenceAnchorAtomId)
  if (!referenceOtherId) {
    return invalid('reference-anchor-not-on-bond', '参考锚点不是参考键的端点')
  }
  const movingOtherId = otherEndpoint(moving.bond, input.movingAnchorAtomId)
  if (!movingOtherId) {
    return invalid('moving-anchor-not-on-bond', '移动锚点不是移动键的端点')
  }

  const referenceAnchor = atomPosition(reference.object, input.referenceAnchorAtomId)!
  const referenceOther = atomPosition(reference.object, referenceOtherId)!
  const movingAnchor = atomPosition(moving.object, input.movingAnchorAtomId)!
  const movingOther = atomPosition(moving.object, movingOtherId)!
  const referenceAxisVector = sub(referenceAnchor, referenceOther)
  const movingAxisVector = sub(movingOther, movingAnchor)
  if (length(referenceAxisVector) < EPSILON) {
    return invalid('zero-length-reference-bond', '参考键长度为 0，无法建立参考轴')
  }
  if (length(movingAxisVector) < EPSILON) {
    return invalid('zero-length-moving-bond', '移动键长度为 0，无法建立移动轴')
  }

  const movingAtomIds = getConnectedFragment(
    moving.molecule.atoms,
    moving.molecule.bonds,
    input.movingAnchorAtomId,
  )
  if (
    reference.object.id === moving.object.id
    && (movingAtomIds.has(reference.bond.atomId1) || movingAtomIds.has(reference.bond.atomId2))
  ) {
    return invalid(
      'connected-bond-pair',
      '两条键属于同一连通片段；整体移动第二条键会同时移动参考键',
    )
  }

  const referenceAxis = normalize(referenceAxisVector)
  const movingAxis = normalize(movingAxisVector)
  const anchorVector = sub(movingAnchor, referenceAnchor)
  const baseAnchorDirection = length(anchorVector) >= EPSILON
    ? normalize(anchorVector)
    : perpendicularDirection(movingAxis, referenceAxis)
  const targetAnchorDirection = rotateAround(
    baseAnchorDirection,
    referenceAxis,
    input.azimuthDegrees * Math.PI / 180,
  )
  const targetMovingAnchor = add(
    referenceAnchor,
    scale(targetAnchorDirection, input.anchorDistance),
  )

  const radial = perpendicularDirection(targetAnchorDirection, referenceAxis, movingAxis)
  const binormal = normalize(cross(referenceAxis, radial))
  const targetAngleRadians = input.axisAngleDegrees * Math.PI / 180
  let perpendicularAxis: Vec3
  if (input.coplanar) {
    perpendicularAxis = scale(radial, input.coplanarDirection === 180 ? -1 : 1)
  } else {
    const currentRadial = perpendicularDirection(baseAnchorDirection, referenceAxis, movingAxis)
    const currentBinormal = normalize(cross(referenceAxis, currentRadial))
    const phase = Math.atan2(
      dot(movingAxis, currentBinormal),
      dot(movingAxis, currentRadial),
    )
    perpendicularAxis = add(
      scale(radial, Math.cos(phase)),
      scale(binormal, Math.sin(phase)),
    )
  }
  const targetMovingAxis = normalize(add(
    scale(referenceAxis, Math.cos(targetAngleRadians)),
    scale(perpendicularAxis, Math.sin(targetAngleRadians)),
  ))

  const positions = new Map<string, Vec3>()
  for (const atom of moving.molecule.atoms) {
    if (!movingAtomIds.has(atom.id)) continue
    const world: Vec3 = [
      atom.x + moving.object.offset.x,
      atom.y + moving.object.offset.y,
      atom.z + moving.object.offset.z,
    ]
    const rotatedRelative = rotateVectorFromTo(
      sub(world, movingAnchor),
      movingAxis,
      targetMovingAxis,
    )
    const targetWorld = add(targetMovingAnchor, rotatedRelative)
    positions.set(atom.id, [
      targetWorld[0] - moving.object.offset.x,
      targetWorld[1] - moving.object.offset.y,
      targetWorld[2] - moving.object.offset.z,
    ])
  }

  const nextMolecule: Molecule = {
    ...moving.molecule,
    atoms: moving.molecule.atoms.map(atom => {
      const position = positions.get(atom.id)
      return position
        ? { ...atom, x: position[0], y: position[1], z: position[2] }
        : atom
    }),
  }
  const nextObject: SceneObject = { ...moving.object, molecule: nextMolecule }
  const nextObjectsById = { ...objectsById, [moving.object.id]: nextObject }
  const nextMovingAnchor = atomPosition(nextObject, input.movingAnchorAtomId)!
  const nextMovingOther = atomPosition(nextObject, movingOtherId)!

  return {
    ok: true,
    changed: true,
    objectsById: nextObjectsById,
    diagnostics: {
      anchorDistance: distance(referenceAnchor, nextMovingAnchor),
      axisAngleDegrees: angleBetween(
        referenceAxis,
        sub(nextMovingOther, nextMovingAnchor),
      ) * 180 / Math.PI,
      orientedVolume: orientedVolume(
        referenceOther,
        referenceAnchor,
        nextMovingAnchor,
        nextMovingOther,
      ),
      movedAtomIds: movingAtomIds,
    },
  }
}
