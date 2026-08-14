import type { Molecule } from '../../molecule'
import type {
  RotateGroupCommand,
  RotateGroupRelationCompileResult,
  RotateGroupRelationDiagnostic,
} from './contracts'
import { ROTATE_GROUP_RELATION_POLICY } from './policy'

function failure(
  verdict: 'reject' | 'indeterminate',
  diagnostic: RotateGroupRelationDiagnostic,
): RotateGroupRelationCompileResult {
  return { verdict, diagnostic }
}

function sorted(values: Iterable<string>): string[] {
  return [...values].sort((left, right) => left.localeCompare(right))
}

function sameSet(left: ReadonlySet<string>, right: ReadonlySet<string>): boolean {
  return left.size === right.size && [...left].every(value => right.has(value))
}

function validateBeforeGraph(molecule: Molecule): string | null {
  const atomIds = new Set<string>()
  for (const atom of molecule.atoms) {
    if (!atom.id || atomIds.has(atom.id)) return 'Before graph has missing or duplicate atom IDs'
    if (![atom.x, atom.y, atom.z].every(Number.isFinite)) {
      return `Before graph has non-finite coordinates for atom ${atom.id}`
    }
    atomIds.add(atom.id)
  }

  const bondIds = new Set<string>()
  const endpointPairs = new Set<string>()
  for (const bond of molecule.bonds) {
    if (!bond.id || bondIds.has(bond.id)) return 'Before graph has missing or duplicate bond IDs'
    if (
      bond.atomId1 === bond.atomId2
      || !atomIds.has(bond.atomId1)
      || !atomIds.has(bond.atomId2)
    ) {
      return `Before graph has an invalid bond ${bond.id}`
    }
    const pair = [bond.atomId1, bond.atomId2].sort().join('\u0000')
    if (endpointPairs.has(pair)) return `Before graph has duplicate bonds between ${bond.atomId1} and ${bond.atomId2}`
    endpointPairs.add(pair)
    bondIds.add(bond.id)
  }
  return null
}

function maximumCoordinateMagnitude(molecule: Molecule): number {
  return molecule.atoms.reduce((maximum, atom) => Math.max(
    maximum,
    Math.abs(atom.x),
    Math.abs(atom.y),
    Math.abs(atom.z),
  ), 0)
}

function reachableWithoutBond(
  molecule: Molecule,
  startAtomId: string,
  excludedBondId: string,
): Set<string> {
  const adjacency = new Map<string, string[]>()
  for (const atom of molecule.atoms) adjacency.set(atom.id, [])
  for (const bond of molecule.bonds) {
    if (bond.id === excludedBondId) continue
    adjacency.get(bond.atomId1)?.push(bond.atomId2)
    adjacency.get(bond.atomId2)?.push(bond.atomId1)
  }

  const visited = new Set([startAtomId])
  const pending = [startAtomId]
  while (pending.length > 0) {
    const current = pending.pop()!
    for (const neighbor of adjacency.get(current) ?? []) {
      if (visited.has(neighbor)) continue
      visited.add(neighbor)
      pending.push(neighbor)
    }
  }
  return visited
}

function radialDistance(
  atom: { readonly x: number; readonly y: number; readonly z: number },
  origin: { readonly x: number; readonly y: number; readonly z: number },
  unitAxis: readonly [number, number, number],
): number {
  const dx = atom.x - origin.x
  const dy = atom.y - origin.y
  const dz = atom.z - origin.z
  const axial = dx * unitAxis[0] + dy * unitAxis[1] + dz * unitAxis[2]
  return Math.hypot(
    dx - axial * unitAxis[0],
    dy - axial * unitAxis[1],
    dz - axial * unitAxis[2],
  )
}

export function compileRotateGroupRelation(
  before: Molecule,
  command: RotateGroupCommand,
): RotateGroupRelationCompileResult {
  const invalidGraphReason = validateBeforeGraph(before)
  if (invalidGraphReason) {
    return failure('indeterminate', {
      code: 'invalid-before-graph',
      message: invalidGraphReason,
    })
  }
  if (maximumCoordinateMagnitude(before) > ROTATE_GROUP_RELATION_POLICY.maxReliableCoordinateMagnitude) {
    return failure('indeterminate', {
      code: 'numeric-uncertainty',
      message: 'Before coordinates exceed the reliable floating-point envelope',
    })
  }
  if (
    !command.commandId
    || command.axisAtomId1 === command.axisAtomId2
    || !Number.isFinite(command.angleDegrees)
  ) {
    return failure('reject', {
      code: 'invalid-command',
      message: 'rotateGroup requires a command ID, two distinct axis atoms, and a finite angle',
    })
  }
  if (Math.abs(command.angleDegrees) > ROTATE_GROUP_RELATION_POLICY.maxAbsoluteAngleDegrees) {
    return failure('reject', {
      code: 'invalid-command',
      message: 'Requested angle exceeds the rotateGroup plan schema range',
    })
  }

  const atomsById = new Map(before.atoms.map(atom => [atom.id, atom]))
  const first = atomsById.get(command.axisAtomId1)
  const second = atomsById.get(command.axisAtomId2)
  if (!first || !second) {
    return failure('reject', {
      code: 'axis-not-single-bond',
      message: 'Rotation axis atoms must both exist in the before graph',
    })
  }

  const axisBond = before.bonds.find(bond =>
    (bond.atomId1 === first.id && bond.atomId2 === second.id)
    || (bond.atomId1 === second.id && bond.atomId2 === first.id))
  if (!axisBond || axisBond.order !== 1 || axisBond.aromatic === true) {
    return failure('reject', {
      code: 'axis-not-single-bond',
      message: 'Rotation axis must be an existing non-aromatic single bond',
    })
  }

  const firstSide = reachableWithoutBond(before, first.id, axisBond.id)
  if (firstSide.has(second.id)) {
    return failure('reject', {
      code: 'axis-not-bridge',
      message: 'Deleting the rotation-axis bond must disconnect its endpoints',
    })
  }
  const secondSide = reachableWithoutBond(before, second.id, axisBond.id)

  const selected = new Set(command.atomIds)
  for (const atomId of selected) {
    if (!atomsById.has(atomId)) {
      return failure('reject', {
        code: 'invalid-command',
        message: `Moving selection contains unknown atom ${atomId}`,
        atomId,
      })
    }
  }
  selected.delete(first.id)
  selected.delete(second.id)

  const firstOffAxis = new Set([...firstSide].filter(id => id !== first.id && id !== second.id))
  const secondOffAxis = new Set([...secondSide].filter(id => id !== first.id && id !== second.id))
  const matchesFirst = sameSet(selected, firstOffAxis)
  const matchesSecond = sameSet(selected, secondOffAxis)
  if (!matchesFirst && !matchesSecond) {
    return failure('reject', {
      code: 'moving-side-incomplete',
      message: 'Moving atom IDs must normalize to one complete component after cutting the axis bond',
    })
  }
  if (matchesFirst === matchesSecond) {
    return failure('reject', {
      code: 'moving-side-ambiguous',
      message: 'Moving atom IDs do not identify exactly one side of the axis bond',
    })
  }

  const movingSide = matchesFirst ? firstSide : secondSide
  const movingAxisAtom = matchesFirst ? first : second
  const fixedAxisAtom = matchesFirst ? second : first
  const axisDx = movingAxisAtom.x - fixedAxisAtom.x
  const axisDy = movingAxisAtom.y - fixedAxisAtom.y
  const axisDz = movingAxisAtom.z - fixedAxisAtom.z
  const axisLength = Math.hypot(axisDx, axisDy, axisDz)
  if (axisLength <= ROTATE_GROUP_RELATION_POLICY.degenerateAxisLength) {
    return failure('indeterminate', {
      code: 'degenerate-axis',
      message: 'Rotation-axis endpoints are coincident',
    })
  }
  if (axisLength < ROTATE_GROUP_RELATION_POLICY.certainAxisLength) {
    return failure('indeterminate', {
      code: 'numeric-uncertainty',
      message: 'Rotation axis is too short for reliable orientation',
    })
  }

  const unitAxis: readonly [number, number, number] = [
    axisDx / axisLength,
    axisDy / axisLength,
    axisDz / axisLength,
  ]
  const radialCandidates = sorted(movingSide)
    .filter(atomId => atomId !== movingAxisAtom.id)
    .map(atomId => ({
      atomId,
      distance: radialDistance(atomsById.get(atomId)!, fixedAxisAtom, unitAxis),
    }))
  let radialCandidate = radialCandidates[0]
  for (const candidate of radialCandidates.slice(1)) {
    if (!radialCandidate || candidate.distance > radialCandidate.distance) radialCandidate = candidate
  }
  if (!radialCandidate || radialCandidate.distance <= ROTATE_GROUP_RELATION_POLICY.degenerateRadialDistance) {
    return failure('indeterminate', {
      code: 'no-radial-witness',
      message: 'Moving side has no proper off-axis atom to witness a signed rotation',
    })
  }
  if (radialCandidate.distance < ROTATE_GROUP_RELATION_POLICY.certainRadialDistance) {
    return failure('indeterminate', {
      code: 'numeric-uncertainty',
      message: 'Moving-side radial witness is too close to the axis',
      atomId: radialCandidate.atomId,
    })
  }

  const movingAtomIds = sorted(movingSide)
  const fixedAtomIds = sorted(before.atoms
    .map(atom => atom.id)
    .filter(atomId => !movingSide.has(atomId)))
  return {
    verdict: 'pass',
    relation: {
      kind: 'rotate-group',
      commandId: command.commandId,
      angleDegrees: command.angleDegrees,
      axisAtomIds: [first.id, second.id],
      fixedAxisAtomId: fixedAxisAtom.id,
      movingAxisAtomId: movingAxisAtom.id,
      fixedAtomIds,
      movingAtomIds,
      radialAtomId: radialCandidate.atomId,
    },
  }
}
