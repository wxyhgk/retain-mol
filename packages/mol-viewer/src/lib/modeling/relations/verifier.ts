import type { Atom, Bond, Molecule } from '../../molecule'
import { compileRotateGroupRelation } from './compiler'
import type {
  RotateGroupCommand,
  RotateGroupRelation,
  RotateGroupRelationDiagnostic,
  RotateGroupVerificationResult,
} from './contracts'
import {
  ROTATE_GROUP_RELATION_POLICY,
  assessNumericDeviation,
  type NumericAssessment,
} from './policy'

type Vec3 = readonly [number, number, number]

function failure(
  verdict: 'reject' | 'indeterminate',
  diagnostic: RotateGroupRelationDiagnostic,
  relation?: RotateGroupRelation,
): RotateGroupVerificationResult {
  return {
    verdict,
    diagnostic,
    ...(relation ? { relation } : {}),
  }
}

function point(atom: Atom): Vec3 {
  return [atom.x, atom.y, atom.z]
}

function subtract(left: Vec3, right: Vec3): Vec3 {
  return [left[0] - right[0], left[1] - right[1], left[2] - right[2]]
}

function dot(left: Vec3, right: Vec3): number {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2]
}

function cross(left: Vec3, right: Vec3): Vec3 {
  return [
    left[1] * right[2] - left[2] * right[1],
    left[2] * right[0] - left[0] * right[2],
    left[0] * right[1] - left[1] * right[0],
  ]
}

function norm(vector: Vec3): number {
  return Math.hypot(vector[0], vector[1], vector[2])
}

function distance(left: Vec3, right: Vec3): number {
  return norm(subtract(left, right))
}

function maximumCoordinateMagnitude(atoms: readonly Atom[]): number {
  return atoms.reduce((maximum, atom) => Math.max(
    maximum,
    Math.abs(atom.x),
    Math.abs(atom.y),
    Math.abs(atom.z),
  ), 0)
}

function coordinateMagnitude(vector: Vec3): number {
  return Math.max(Math.abs(vector[0]), Math.abs(vector[1]), Math.abs(vector[2]))
}

function normalized(vector: Vec3): Vec3 | null {
  const length = norm(vector)
  if (!Number.isFinite(length) || length <= ROTATE_GROUP_RELATION_POLICY.degenerateAxisLength) return null
  return [vector[0] / length, vector[1] / length, vector[2] / length]
}

function radial(vector: Vec3, unitAxis: Vec3): Vec3 {
  const axial = dot(vector, unitAxis)
  return [
    vector[0] - axial * unitAxis[0],
    vector[1] - axial * unitAxis[1],
    vector[2] - axial * unitAxis[2],
  ]
}

function periodicRadians(angleDegrees: number): number {
  let normalizedDegrees = angleDegrees % 360
  if (normalizedDegrees >= 180) normalizedDegrees -= 360
  if (normalizedDegrees < -180) normalizedDegrees += 360
  return normalizedDegrees * Math.PI / 180
}

function periodicDifferenceRadians(left: number, right: number): number {
  const difference = left - right
  return Math.abs(Math.atan2(Math.sin(difference), Math.cos(difference)))
}

/** Independent Rodrigues implementation; it does not call the production executor. */
function rotatePoint(pointToRotate: Vec3, origin: Vec3, unitAxis: Vec3, angle: number): Vec3 {
  const vector = subtract(pointToRotate, origin)
  const cosine = Math.cos(angle)
  const sine = Math.sin(angle)
  const projection = dot(unitAxis, vector)
  const perpendicular = cross(unitAxis, vector)
  return [
    origin[0] + vector[0] * cosine + perpendicular[0] * sine + unitAxis[0] * projection * (1 - cosine),
    origin[1] + vector[1] * cosine + perpendicular[1] * sine + unitAxis[1] * projection * (1 - cosine),
    origin[2] + vector[2] * cosine + perpendicular[2] * sine + unitAxis[2] * projection * (1 - cosine),
  ]
}

function atomMetadata(atom: Atom): unknown {
  return {
    id: atom.id,
    symbol: atom.symbol,
    charge: atom.charge ?? null,
    radical: atom.radical ?? null,
    label: atom.label ?? null,
    coordinationGeometry: atom.coordinationGeometry ?? null,
    coordinationDirections: atom.coordinationDirections ?? [],
    coordinationSites: atom.coordinationSites ?? [],
    coordinationNumber: atom.coordinationNumber ?? null,
  }
}

function bondMetadata(bond: Bond): unknown {
  return {
    id: bond.id,
    atomId1: bond.atomId1,
    atomId2: bond.atomId2,
    order: bond.order,
    aromatic: bond.aromatic ?? false,
    coordinationSites: bond.coordinationSites ?? [],
  }
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function sortedIds(values: readonly { readonly id: string }[]): string[] {
  return values.map(value => value.id).sort((left, right) => left.localeCompare(right))
}

function hasValidAfterGraph(molecule: Molecule): boolean {
  const atomIds = new Set(molecule.atoms.map(atom => atom.id))
  const bondIds = new Set(molecule.bonds.map(bond => bond.id))
  if (atomIds.size !== molecule.atoms.length || bondIds.size !== molecule.bonds.length) return false
  return molecule.bonds.every(bond =>
    bond.atomId1 !== bond.atomId2
    && atomIds.has(bond.atomId1)
    && atomIds.has(bond.atomId2))
}

function assessCoordinateChange(before: Vec3, after: Vec3): NumericAssessment {
  return assessNumericDeviation(
    distance(before, after),
    1,
    ROTATE_GROUP_RELATION_POLICY.coordinate,
  )
}

export function verifyRotateGroupRelation(
  before: Molecule,
  after: Molecule,
  command: RotateGroupCommand,
): RotateGroupVerificationResult {
  const compiled = compileRotateGroupRelation(before, command)
  if (compiled.verdict !== 'pass') return compiled
  const relation = compiled.relation

  if (!hasValidAfterGraph(after)) {
    return failure('reject', {
      code: 'graph-changed',
      message: 'After graph is incomplete or does not have stable unique IDs',
    }, relation)
  }
  if (after.atoms.some(atom => ![atom.x, atom.y, atom.z].every(Number.isFinite))) {
    return failure('indeterminate', {
      code: 'numeric-uncertainty',
      message: 'After graph contains non-finite coordinates',
    }, relation)
  }
  if (maximumCoordinateMagnitude(after.atoms) > ROTATE_GROUP_RELATION_POLICY.maxReliableCoordinateMagnitude) {
    return failure('indeterminate', {
      code: 'numeric-uncertainty',
      message: 'After coordinates exceed the reliable floating-point envelope',
    }, relation)
  }
  if (
    !sameValue(sortedIds(before.atoms), sortedIds(after.atoms))
    || !sameValue(sortedIds(before.bonds), sortedIds(after.bonds))
  ) {
    return failure('reject', {
      code: 'graph-changed',
      message: 'After graph does not preserve all atom and bond IDs',
    }, relation)
  }

  const beforeAtoms = new Map(before.atoms.map(atom => [atom.id, atom]))
  const afterAtoms = new Map(after.atoms.map(atom => [atom.id, atom]))
  const beforeBonds = new Map(before.bonds.map(bond => [bond.id, bond]))
  const afterBonds = new Map(after.bonds.map(bond => [bond.id, bond]))
  if ((before.name ?? null) !== (after.name ?? null)) {
    return failure('reject', {
      code: 'non-coordinate-field-changed',
      message: 'Molecule name changed during rotateGroup',
    }, relation)
  }
  for (const [atomId, beforeAtom] of beforeAtoms) {
    const afterAtom = afterAtoms.get(atomId)!
    if (!sameValue(atomMetadata(beforeAtom), atomMetadata(afterAtom))) {
      return failure('reject', {
        code: 'non-coordinate-field-changed',
        message: `Non-coordinate fields changed for atom ${atomId}`,
        atomId,
      }, relation)
    }
  }
  for (const [bondId, beforeBond] of beforeBonds) {
    if (!sameValue(bondMetadata(beforeBond), bondMetadata(afterBonds.get(bondId)!))) {
      return failure('reject', {
        code: 'non-coordinate-field-changed',
        message: `Bond ${bondId} changed during rotateGroup`,
      }, relation)
    }
  }

  let uncertainty: RotateGroupRelationDiagnostic | null = null
  const recordAssessment = (
    assessment: NumericAssessment,
    rejectDiagnostic: RotateGroupRelationDiagnostic,
    uncertaintyMessage: string,
  ): RotateGroupVerificationResult | null => {
    if (assessment === 'reject') return failure('reject', rejectDiagnostic, relation)
    if (assessment === 'indeterminate' && !uncertainty) {
      uncertainty = {
        code: 'numeric-uncertainty',
        message: uncertaintyMessage,
        ...(rejectDiagnostic.atomId ? { atomId: rejectDiagnostic.atomId } : {}),
        ...(rejectDiagnostic.atomId2 ? { atomId2: rejectDiagnostic.atomId2 } : {}),
      }
    }
    return null
  }

  const { fixedAxisAtomId, movingAxisAtomId } = relation
  const axisEndpoints = new Set(relation.axisAtomIds)
  for (const atomId of relation.fixedAtomIds) {
    const result = recordAssessment(
      assessCoordinateChange(point(beforeAtoms.get(atomId)!), point(afterAtoms.get(atomId)!)),
      {
        code: axisEndpoints.has(atomId) ? 'axis-endpoint-moved' : 'fixed-side-moved',
        message: axisEndpoints.has(atomId)
          ? `Axis endpoint ${atomId} moved`
          : `Fixed-side atom ${atomId} moved`,
        atomId,
      },
      `Coordinate evidence for fixed atom ${atomId} is within the uncertainty band`,
    )
    if (result) return result
  }
  if (!relation.fixedAtomIds.includes(movingAxisAtomId)) {
    const result = recordAssessment(
      assessCoordinateChange(
        point(beforeAtoms.get(movingAxisAtomId)!),
        point(afterAtoms.get(movingAxisAtomId)!),
      ),
      {
        code: 'axis-endpoint-moved',
        message: `Axis endpoint ${movingAxisAtomId} moved`,
        atomId: movingAxisAtomId,
      },
      `Coordinate evidence for axis endpoint ${movingAxisAtomId} is within the uncertainty band`,
    )
    if (result) return result
  }

  for (let leftIndex = 0; leftIndex < relation.movingAtomIds.length; leftIndex += 1) {
    const leftId = relation.movingAtomIds[leftIndex]!
    for (let rightIndex = leftIndex + 1; rightIndex < relation.movingAtomIds.length; rightIndex += 1) {
      const rightId = relation.movingAtomIds[rightIndex]!
      const beforeDistance = distance(point(beforeAtoms.get(leftId)!), point(beforeAtoms.get(rightId)!))
      const afterDistance = distance(point(afterAtoms.get(leftId)!), point(afterAtoms.get(rightId)!))
      const result = recordAssessment(
        assessNumericDeviation(
          Math.abs(afterDistance - beforeDistance),
          Math.max(beforeDistance, afterDistance),
          ROTATE_GROUP_RELATION_POLICY.distance,
        ),
        {
          code: 'moving-side-not-rigid',
          message: `Moving-side distance changed between ${leftId} and ${rightId}`,
          atomId: leftId,
          atomId2: rightId,
        },
        `Rigidity evidence for ${leftId} and ${rightId} is within the uncertainty band`,
      )
      if (result) return result
    }
  }

  const [commandAxisOriginId, commandAxisDirectionId] = relation.axisAtomIds
  const origin = point(beforeAtoms.get(commandAxisOriginId)!)
  const unitAxis = normalized(subtract(point(beforeAtoms.get(commandAxisDirectionId)!), origin))
  if (!unitAxis) {
    return failure('indeterminate', {
      code: 'degenerate-axis',
      message: 'Compiled rotation axis no longer has a usable direction',
    }, relation)
  }
  const requestedAngle = periodicRadians(relation.angleDegrees)
  let witnessedSignedAngle = false
  for (const atomId of relation.movingAtomIds) {
    const beforePoint = point(beforeAtoms.get(atomId)!)
    const afterPoint = point(afterAtoms.get(atomId)!)
    const expectedPoint = rotatePoint(beforePoint, origin, unitAxis, requestedAngle)
    const floatingPointScale = Math.max(
      norm(subtract(beforePoint, origin)),
      norm(subtract(afterPoint, origin)),
      coordinateMagnitude(origin),
      coordinateMagnitude(beforePoint),
      coordinateMagnitude(afterPoint),
    )
    const positionResult = recordAssessment(
      assessNumericDeviation(
        distance(expectedPoint, afterPoint),
        floatingPointScale,
        ROTATE_GROUP_RELATION_POLICY.rotationCoordinate,
      ),
      {
        code: 'rotation-mismatch',
        message: `Atom ${atomId} does not follow the requested Rodrigues rotation`,
        atomId,
      },
      `Rodrigues evidence for atom ${atomId} is within the uncertainty band`,
    )
    if (positionResult) return positionResult

    const beforeRadial = radial(subtract(beforePoint, origin), unitAxis)
    const afterRadial = radial(subtract(afterPoint, origin), unitAxis)
    if (norm(beforeRadial) < ROTATE_GROUP_RELATION_POLICY.certainRadialDistance) continue
    if (norm(afterRadial) <= ROTATE_GROUP_RELATION_POLICY.degenerateRadialDistance) {
      return failure('reject', {
        code: 'rotation-mismatch',
        message: `Off-axis atom ${atomId} collapsed onto the rotation axis`,
        atomId,
      }, relation)
    }
    const observedAngle = Math.atan2(
      dot(unitAxis, cross(beforeRadial, afterRadial)),
      dot(beforeRadial, afterRadial),
    )
    const angleResult = recordAssessment(
      assessNumericDeviation(
        periodicDifferenceRadians(observedAngle, requestedAngle),
        1,
        ROTATE_GROUP_RELATION_POLICY.angleRadians,
      ),
      {
        code: 'angle-mismatch',
        message: `Atom ${atomId} follows the wrong signed periodic angle`,
        atomId,
      },
      `Signed-angle evidence for atom ${atomId} is within the uncertainty band`,
    )
    if (angleResult) return angleResult
    if (atomId === relation.radialAtomId) witnessedSignedAngle = true
  }

  if (!witnessedSignedAngle) {
    return failure('indeterminate', {
      code: 'no-radial-witness',
      message: 'The deterministic radial atom did not provide a proper signed-angle witness',
      atomId: relation.radialAtomId,
    }, relation)
  }
  if (uncertainty) return failure('indeterminate', uncertainty, relation)
  return { verdict: 'pass', relation }
}
