import { lookupBondLengthByOrder } from '../../../config/geometry.config'
import type { Atom, Bond, Molecule } from '../../molecule'
import { getFragmentByDigest } from '../../builder/fragment/registry'
import type { FragmentDef } from '../../builder/fragment/model'
import { validateFragmentDef } from '../../builder/kernel/FragmentValidator'
import type {
  FragmentAttachCommand,
  FragmentAttachRelation,
  FragmentAttachRelationCompileResult,
  FragmentAttachRelationDiagnostic,
} from './attachContracts'
import { FRAGMENT_ATTACH_RELATION_POLICY } from './attachPolicy'
import { compareUnicodeCodePoints, sortedStrings } from './ordering'

type Vec3 = readonly [number, number, number]
type Quat = readonly [number, number, number, number]

function failure(
  verdict: 'reject' | 'indeterminate',
  diagnostic: FragmentAttachRelationDiagnostic,
): FragmentAttachRelationCompileResult {
  return { verdict, diagnostic }
}

function subtract(left: Vec3, right: Vec3): Vec3 {
  return [left[0] - right[0], left[1] - right[1], left[2] - right[2]]
}

function add(left: Vec3, right: Vec3): Vec3 {
  return [left[0] + right[0], left[1] + right[1], left[2] + right[2]]
}

function scale(vector: Vec3, factor: number): Vec3 {
  return [vector[0] * factor, vector[1] * factor, vector[2] * factor]
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

function normalized(vector: Vec3): Vec3 | null {
  const length = norm(vector)
  if (!Number.isFinite(length) || length <= FRAGMENT_ATTACH_RELATION_POLICY.degenerateAxisLength) return null
  return scale(vector, 1 / length)
}

function normalizeQuat(quaternion: Quat): Quat {
  const length = Math.hypot(...quaternion)
  if (!Number.isFinite(length) || length <= Number.EPSILON) return [0, 0, 0, 1]
  return quaternion.map(value => value / length) as unknown as Quat
}

function shortestArcQuaternion(from: Vec3, to: Vec3): Quat {
  const real = dot(from, to) + 1
  if (real < 1e-6) {
    const axis: Vec3 = Math.abs(from[0]) > Math.abs(from[2])
      ? [-from[1], from[0], 0]
      : [0, -from[2], from[1]]
    return normalizeQuat([axis[0], axis[1], axis[2], real])
  }
  const axis = cross(from, to)
  return normalizeQuat([axis[0], axis[1], axis[2], real])
}

function axisAngleQuaternion(axis: Vec3, angleRadians: number): Quat {
  const halfAngle = angleRadians / 2
  const sine = Math.sin(halfAngle)
  return [axis[0] * sine, axis[1] * sine, axis[2] * sine, Math.cos(halfAngle)]
}

function multiplyQuaternions(left: Quat, right: Quat): Quat {
  return [
    left[3] * right[0] + left[0] * right[3] + left[1] * right[2] - left[2] * right[1],
    left[3] * right[1] - left[0] * right[2] + left[1] * right[3] + left[2] * right[0],
    left[3] * right[2] + left[0] * right[1] - left[1] * right[0] + left[2] * right[3],
    left[3] * right[3] - left[0] * right[0] - left[1] * right[1] - left[2] * right[2],
  ]
}

function applyQuaternion(vector: Vec3, input: Quat): Vec3 {
  const [qx, qy, qz, qw] = normalizeQuat(input)
  const [x, y, z] = vector
  const ix = qw * x + qy * z - qz * y
  const iy = qw * y + qz * x - qx * z
  const iz = qw * z + qx * y - qy * x
  const iw = -qx * x - qy * y - qz * z
  return [
    ix * qw + iw * -qx + iy * -qz - iz * -qy,
    iy * qw + iw * -qy + iz * -qx - ix * -qz,
    iz * qw + iw * -qz + ix * -qy - iy * -qx,
  ]
}

function point(atom: { readonly x: number; readonly y: number; readonly z: number }): Vec3 {
  return [atom.x, atom.y, atom.z]
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
    if (bond.atomId1 === bond.atomId2 || !atomIds.has(bond.atomId1) || !atomIds.has(bond.atomId2)) {
      return `Before graph has an invalid bond ${bond.id}`
    }
    const pair = [bond.atomId1, bond.atomId2].sort(compareUnicodeCodePoints).join('\u0000')
    if (endpointPairs.has(pair)) return `Before graph has duplicate bonds between ${bond.atomId1} and ${bond.atomId2}`
    endpointPairs.add(pair)
    bondIds.add(bond.id)
  }
  return null
}

function maximumCoordinateMagnitude(values: readonly { readonly x: number; readonly y: number; readonly z: number }[]): number {
  return values.reduce((maximum, value) => Math.max(
    maximum,
    Math.abs(value.x),
    Math.abs(value.y),
    Math.abs(value.z),
  ), 0)
}

function radialDistance(vector: Vec3, unitAxis: Vec3): number {
  return norm(subtract(vector, scale(unitAxis, dot(vector, unitAxis))))
}

function signedVolume(origin: Vec3, first: Vec3, second: Vec3, third: Vec3): number {
  return dot(subtract(first, origin), cross(subtract(second, origin), subtract(third, origin)))
}

function chiralityWitness(atoms: readonly Atom[]): readonly [string, string, string, string] | undefined {
  const orderedAtoms = [...atoms].sort((left, right) => compareUnicodeCodePoints(left.id, right.id))
  const origin = orderedAtoms[0]
  if (!origin) return undefined
  for (let firstIndex = 1; firstIndex < orderedAtoms.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < orderedAtoms.length; secondIndex += 1) {
      for (let thirdIndex = secondIndex + 1; thirdIndex < orderedAtoms.length; thirdIndex += 1) {
        const first = orderedAtoms[firstIndex]
        const second = orderedAtoms[secondIndex]
        const third = orderedAtoms[thirdIndex]
        if (!first || !second || !third) continue
        if (Math.abs(signedVolume(point(origin), point(first), point(second), point(third))) > FRAGMENT_ATTACH_RELATION_POLICY.chiralityVolume) {
          return [origin.id, first.id, second.id, third.id]
        }
      }
    }
  }
  return undefined
}

function expectedAtom(
  fragment: FragmentDef,
  templateAtomIndex: number,
  atomId: string,
  transformPoint: (value: Vec3) => Vec3,
  transformDirection: (value: Vec3) => Vec3,
): Atom {
  const templateAtom = fragment.atoms[templateAtomIndex]!
  const position = transformPoint(point(templateAtom))
  if (templateAtomIndex !== fragment.attachIndex || !fragment.coordination) {
    return { id: atomId, symbol: templateAtom.symbol, x: position[0], y: position[1], z: position[2] }
  }
  const coordination = fragment.coordination
  return {
    id: atomId,
    symbol: templateAtom.symbol,
    x: position[0],
    y: position[1],
    z: position[2],
    coordinationGeometry: coordination.geometryId,
    coordinationNumber: coordination.coordinationNumber,
    coordinationDirections: coordination.directions.map(direction => transformDirection(direction)),
    coordinationSites: coordination.sites.map(site => ({
      ...site,
      direction: transformDirection(site.direction),
    })),
  }
}

export function compileFragmentAttachRelation(
  before: Molecule,
  command: FragmentAttachCommand,
): FragmentAttachRelationCompileResult {
  if (
    before.atoms.length > FRAGMENT_ATTACH_RELATION_POLICY.maxBeforeAtoms
    || before.bonds.length > FRAGMENT_ATTACH_RELATION_POLICY.maxBeforeBonds
  ) {
    return failure('indeterminate', {
      code: 'resource-limit',
      message: 'Before graph exceeds the fragment.attach certificate resource budget',
    })
  }
  const invalidGraphReason = validateBeforeGraph(before)
  if (invalidGraphReason) {
    return failure('indeterminate', { code: 'invalid-before-graph', message: invalidGraphReason })
  }
  if (maximumCoordinateMagnitude(before.atoms) > FRAGMENT_ATTACH_RELATION_POLICY.maxReliableCoordinateMagnitude) {
    return failure('indeterminate', {
      code: 'numeric-uncertainty',
      message: 'Before coordinates exceed the reliable floating-point envelope',
    })
  }
  if (
    command.kind !== 'fragment.attach'
    || !command.commandId
    || !command.atomId
    || !command.fragmentId
    || !command.fragmentDigest
  ) {
    return failure('reject', {
      code: 'invalid-command',
      message: 'fragment.attach requires command, target atom, and registered fragment IDs',
    })
  }
  if (command.torsionAngleDegrees === undefined) {
    return failure('indeterminate', {
      code: 'automatic-torsion',
      message: 'Automatic torsion selection cannot produce a deterministic relation certificate',
    })
  }
  if (
    !Number.isFinite(command.torsionAngleDegrees)
    || Math.abs(command.torsionAngleDegrees) > FRAGMENT_ATTACH_RELATION_POLICY.maxAbsoluteTorsionDegrees
  ) {
    return failure('reject', {
      code: 'invalid-command',
      message: 'fragment.attach requires a finite explicit torsion within the plan schema range',
    })
  }

  const atomsById = new Map(before.atoms.map(atom => [atom.id, atom]))
  const targetHydrogen = atomsById.get(command.atomId)
  const incidentBonds = before.bonds.filter(bond => bond.atomId1 === command.atomId || bond.atomId2 === command.atomId)
  const targetBond = incidentBonds[0]
  const hostAtomId = targetBond
    ? (targetBond.atomId1 === command.atomId ? targetBond.atomId2 : targetBond.atomId1)
    : undefined
  const host = hostAtomId ? atomsById.get(hostAtomId) : undefined
  if (
    !targetHydrogen
    || targetHydrogen.symbol !== 'H'
    || incidentBonds.length !== 1
    || !targetBond
    || targetBond.order !== 1
    || targetBond.aromatic === true
    || !host
    || host.symbol === 'H'
  ) {
    return failure('reject', {
      code: 'target-not-terminal-hydrogen',
      message: 'fragment.attach certificate target must be an H with exactly one non-aromatic single bond to one heavy atom',
      atomId: command.atomId,
    })
  }

  const fragment = getFragmentByDigest(command.fragmentDigest)
  if (!fragment) {
    return failure('reject', {
      code: 'template-not-registered',
      message: `Fragment template digest ${command.fragmentDigest} is not registered`,
    })
  }
  if (fragment.id !== command.fragmentId) {
    return failure('reject', {
      code: 'template-digest-mismatch',
      message: `Fragment template digest does not identify ${command.fragmentId}`,
    })
  }
  if (
    fragment.atoms.length > FRAGMENT_ATTACH_RELATION_POLICY.maxTemplateAtoms
    || fragment.bonds.length > FRAGMENT_ATTACH_RELATION_POLICY.maxTemplateBonds
  ) {
    return failure('indeterminate', {
      code: 'resource-limit',
      message: `Fragment template ${command.fragmentId} exceeds the relation certificate resource budget`,
    })
  }
  const templateIssues = validateFragmentDef(fragment)
  const attachAtom = fragment.atoms[fragment.attachIndex]
  const attachHydrogen = fragment.atoms[fragment.attachHIndex]
  const attachHydrogenBonds = fragment.bonds.filter(bond => (
    bond.a === fragment.attachHIndex || bond.b === fragment.attachHIndex
  ))
  const leavingBondIndex = fragment.bonds.findIndex(bond => (
    (bond.a === fragment.attachIndex && bond.b === fragment.attachHIndex)
    || (bond.b === fragment.attachIndex && bond.a === fragment.attachHIndex)
  ))
  if (
    templateIssues.length > 0
    || !attachAtom
    || attachAtom.symbol === 'H'
    || !attachHydrogen
    || attachHydrogen.symbol !== 'H'
    || attachHydrogenBonds.length !== 1
    || leavingBondIndex < 0
    || fragment.bonds[leavingBondIndex]?.order !== 1
  ) {
    return failure('reject', {
      code: 'invalid-template-attachment',
      message: templateIssues[0]?.message ?? 'Registered fragment must have one valid attach H bonded to its heavy attach atom',
    })
  }
  const retainedTemplateAtomCount = fragment.atoms.length - 1
  const retainedTemplateBondCount = fragment.bonds.filter(bond => (
    bond.a !== fragment.attachHIndex && bond.b !== fragment.attachHIndex
  )).length
  const candidateAtomCount = before.atoms.length - 1 + retainedTemplateAtomCount
  const candidateBondCount = before.bonds.length + retainedTemplateBondCount
  if (
    candidateAtomCount > FRAGMENT_ATTACH_RELATION_POLICY.maxCandidateAtoms
    || candidateBondCount > FRAGMENT_ATTACH_RELATION_POLICY.maxCandidateBonds
  ) {
    return failure('indeterminate', {
      code: 'resource-limit',
      message: 'Attached candidate exceeds the relation certificate resource budget',
    })
  }

  const hostSiteId = targetBond.coordinationSites
    ?.find(assignment => assignment.atomId === host.id)?.siteId
  const hostSiteOrder = hostSiteId
    ? host.coordinationSites?.find(site => site.id === hostSiteId)?.bondOrder
    : undefined
  const linkBondOrder = hostSiteOrder ?? fragment.attachOrder ?? 1
  if (linkBondOrder !== 1) {
    return failure('indeterminate', {
      code: 'unsupported-link-order',
      message: 'The first fragment.attach relation certificate only covers a torsion-bearing single link bond',
    })
  }

  const hostAxis = subtract(point(targetHydrogen), point(host))
  const hostAxisLength = norm(hostAxis)
  const templateAxis = subtract(point(attachHydrogen), point(attachAtom))
  const templateAxisLength = norm(templateAxis)
  if (
    hostAxisLength <= FRAGMENT_ATTACH_RELATION_POLICY.degenerateAxisLength
    || templateAxisLength <= FRAGMENT_ATTACH_RELATION_POLICY.degenerateAxisLength
  ) {
    return failure('indeterminate', {
      code: 'degenerate-attachment-axis',
      message: 'Host-H and template attach-H axes must both have nonzero length',
    })
  }
  if (
    hostAxisLength < FRAGMENT_ATTACH_RELATION_POLICY.certainAxisLength
    || templateAxisLength < FRAGMENT_ATTACH_RELATION_POLICY.certainAxisLength
  ) {
    return failure('indeterminate', {
      code: 'numeric-uncertainty',
      message: 'An attachment axis is too short for reliable orientation evidence',
    })
  }
  const unitHostAxis = normalized(hostAxis)!
  const unitTemplateAxis = normalized(templateAxis)!
  const retainedTemplateIndices = fragment.atoms
    .map((_atom, index) => index)
    .filter(index => index !== fragment.attachHIndex)
  const maximumRadialDistance = retainedTemplateIndices.reduce((maximum, index) => Math.max(
    maximum,
    radialDistance(subtract(point(fragment.atoms[index]!), point(attachAtom)), unitTemplateAxis),
  ), 0)
  if (maximumRadialDistance <= FRAGMENT_ATTACH_RELATION_POLICY.degenerateOrientationDistance) {
    return failure('indeterminate', {
      code: 'degenerate-orientation-evidence',
      message: 'Retained template atoms are collinear with the attachment axis, so torsion is unobservable',
    })
  }
  if (maximumRadialDistance < FRAGMENT_ATTACH_RELATION_POLICY.certainOrientationDistance) {
    return failure('indeterminate', {
      code: 'numeric-uncertainty',
      message: 'Template orientation evidence is too close to the attachment axis',
    })
  }

  const templateAtomIdByIndex = retainedTemplateIndices.map((templateAtomIndex, index) => ({
    templateAtomIndex,
    atomId: `${command.commandId}:atom:${index + 1}`,
  }))
  const retainedTemplateBondIndices = fragment.bonds
    .map((_bond, index) => index)
    .filter(index => {
      const bond = fragment.bonds[index]!
      return bond.a !== fragment.attachHIndex && bond.b !== fragment.attachHIndex
    })
  const templateBondIdByIndex = retainedTemplateBondIndices.map((templateBondIndex, index) => ({
    templateBondIndex,
    bondId: `${command.commandId}:bond:${index + 2}`,
  }))
  const generatedIds = new Set([
    ...templateAtomIdByIndex.map(mapping => mapping.atomId),
    `${command.commandId}:bond:1`,
    ...templateBondIdByIndex.map(mapping => mapping.bondId),
  ])
  const occupiedIds = new Set([...before.atoms.map(atom => atom.id), ...before.bonds.map(bond => bond.id)])
  const collision = [...generatedIds].find(id => occupiedIds.has(id))
  if (collision) {
    return failure('reject', {
      code: 'invalid-command',
      message: `Deterministic generated ID already exists: ${collision}`,
    })
  }

  const alignedRotation = shortestArcQuaternion(unitTemplateAxis, scale(unitHostAxis, -1))
  const roll = axisAngleQuaternion(unitHostAxis, command.torsionAngleDegrees * Math.PI / 180)
  const rotation = multiplyQuaternions(roll, alignedRotation)
  const linkLength = lookupBondLengthByOrder(host.symbol, attachAtom.symbol, 1)
  if (!linkLength || !Number.isFinite(linkLength)) {
    return failure('indeterminate', {
      code: 'numeric-uncertainty',
      message: 'No reliable single-bond length is available for the link bond',
    })
  }
  const anchor = add(point(host), scale(unitHostAxis, linkLength))
  const attachOrigin = point(attachAtom)
  const transformDirection = (value: Vec3): Vec3 => normalized(applyQuaternion(value, rotation)) ?? [0, 0, 0]
  const transformPoint = (value: Vec3): Vec3 => add(applyQuaternion(subtract(value, attachOrigin), rotation), anchor)
  const atomIdByTemplateIndex = new Map(templateAtomIdByIndex.map(mapping => [mapping.templateAtomIndex, mapping.atomId]))
  const expectedAddedAtoms = templateAtomIdByIndex.map(mapping => expectedAtom(
    fragment,
    mapping.templateAtomIndex,
    mapping.atomId,
    transformPoint,
    transformDirection,
  ))
  if (
    maximumCoordinateMagnitude(expectedAddedAtoms) > FRAGMENT_ATTACH_RELATION_POLICY.maxReliableCoordinateMagnitude
    || expectedAddedAtoms.some(atom => ![atom.x, atom.y, atom.z].every(Number.isFinite))
  ) {
    return failure('indeterminate', {
      code: 'numeric-uncertainty',
      message: 'Expected attached-template coordinates exceed the reliable floating-point envelope',
    })
  }

  const leavingBond = fragment.bonds[leavingBondIndex]!
  const linkAssignments = [
    hostSiteId ? { atomId: host.id, siteId: hostSiteId } : null,
    leavingBond.coordinationSiteId
      ? { atomId: atomIdByTemplateIndex.get(fragment.attachIndex)!, siteId: leavingBond.coordinationSiteId }
      : null,
  ].filter((assignment): assignment is { atomId: string; siteId: string } => assignment !== null)
  const linkBondId = `${command.commandId}:bond:1`
  const baseLinkBond: Bond = {
    id: linkBondId,
    atomId1: host.id,
    atomId2: atomIdByTemplateIndex.get(fragment.attachIndex)!,
    order: 1,
  }
  const linkBond: Bond = linkAssignments.length > 0
    ? { ...baseLinkBond, coordinationSites: linkAssignments }
    : baseLinkBond
  const expectedInternalBonds = templateBondIdByIndex.map(mapping => {
    const templateBond = fragment.bonds[mapping.templateBondIndex]!
    const atomId1 = atomIdByTemplateIndex.get(templateBond.a)!
    const atomId2 = atomIdByTemplateIndex.get(templateBond.b)!
    const coordinationAtomId = templateBond.a === fragment.attachIndex
      ? atomId1
      : templateBond.b === fragment.attachIndex
        ? atomId2
        : undefined
    const bond: Bond = {
      id: mapping.bondId,
      atomId1,
      atomId2,
      order: templateBond.order,
    }
    return coordinationAtomId && templateBond.coordinationSiteId
      ? { ...bond, coordinationSites: [{ atomId: coordinationAtomId, siteId: templateBond.coordinationSiteId }] }
      : bond
  })
  const fixedAtomIds = sortedStrings(before.atoms.filter(atom => atom.id !== targetHydrogen.id).map(atom => atom.id))
  const fixedBondIds = sortedStrings(before.bonds.filter(bond => bond.id !== targetBond.id).map(bond => bond.id))
  const expectedAddedBonds = [linkBond, ...expectedInternalBonds]
  const orientationWitness = chiralityWitness(expectedAddedAtoms)
  const relation: FragmentAttachRelation = {
    kind: 'fragment-attach',
    commandId: command.commandId,
    fragmentId: fragment.id,
    fragmentDigest: command.fragmentDigest,
    torsionAngleDegrees: command.torsionAngleDegrees,
    hostAtomId: host.id,
    deletedHydrogenAtomId: targetHydrogen.id,
    deletedHydrogenBondId: targetBond.id,
    templateAttachAtomIndex: fragment.attachIndex,
    templateAttachHydrogenIndex: fragment.attachHIndex,
    templateAtomIdByIndex,
    templateBondIdByIndex,
    linkBondId,
    linkBondOrder: 1,
    fixedAtomIds,
    fixedBondIds,
    addedAtomIds: templateAtomIdByIndex.map(mapping => mapping.atomId),
    addedBondIds: expectedAddedBonds.map(bond => bond.id),
    expectedAddedAtoms,
    expectedAddedBonds,
    ...(orientationWitness
      ? { chiralityWitnessAtomIds: orientationWitness }
      : {}),
  }
  return { verdict: 'pass', relation }
}
