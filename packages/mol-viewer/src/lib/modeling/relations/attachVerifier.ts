import type { Atom, Bond, Molecule } from '../../molecule'
import { compileFragmentAttachRelation } from './attachCompiler'
import type {
  FragmentAttachCommand,
  FragmentAttachRelation,
  FragmentAttachRelationDiagnostic,
  FragmentAttachVerificationResult,
} from './attachContracts'
import {
  assessFragmentAttachDeviation,
  FRAGMENT_ATTACH_RELATION_POLICY,
} from './attachPolicy'
import { compareUnicodeCodePoints, sortedStrings } from './ordering'

type Vec3 = readonly [number, number, number]

function failure(
  verdict: 'reject' | 'indeterminate',
  diagnostic: FragmentAttachRelationDiagnostic,
  relation?: FragmentAttachRelation,
): FragmentAttachVerificationResult {
  return { verdict, diagnostic, ...(relation ? { relation } : {}) }
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

function distance(left: Vec3, right: Vec3): number {
  const delta = subtract(left, right)
  return Math.hypot(delta[0], delta[1], delta[2])
}

function signedVolume(origin: Vec3, first: Vec3, second: Vec3, third: Vec3): number {
  return dot(subtract(first, origin), cross(subtract(second, origin), subtract(third, origin)))
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
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

function normalizedAssignments(bond: Bond): readonly unknown[] {
  return [...(bond.coordinationSites ?? [])]
    .map(assignment => ({ atomId: assignment.atomId, siteId: assignment.siteId }))
    .sort((left, right) => compareUnicodeCodePoints(
      `${left.atomId}\u0000${left.siteId}`,
      `${right.atomId}\u0000${right.siteId}`,
    ))
}

function sameBond(left: Bond, right: Bond): boolean {
  const leftEndpoints = [left.atomId1, left.atomId2].sort(compareUnicodeCodePoints)
  const rightEndpoints = [right.atomId1, right.atomId2].sort(compareUnicodeCodePoints)
  return left.id === right.id
    && sameValue(leftEndpoints, rightEndpoints)
    && left.order === right.order
    && (left.aromatic ?? false) === (right.aromatic ?? false)
    && sameValue(normalizedAssignments(left), normalizedAssignments(right))
}

function hasValidGraph(molecule: Molecule): boolean {
  const atomIds = new Set(molecule.atoms.map(atom => atom.id))
  const bondIds = new Set(molecule.bonds.map(bond => bond.id))
  if (atomIds.size !== molecule.atoms.length || bondIds.size !== molecule.bonds.length) return false
  const pairs = new Set<string>()
  for (const bond of molecule.bonds) {
    if (bond.atomId1 === bond.atomId2 || !atomIds.has(bond.atomId1) || !atomIds.has(bond.atomId2)) return false
    const pair = [bond.atomId1, bond.atomId2].sort(compareUnicodeCodePoints).join('\u0000')
    if (pairs.has(pair)) return false
    pairs.add(pair)
  }
  return true
}

function sameIds(actual: readonly { readonly id: string }[], expected: readonly string[]): boolean {
  const actualIds = sortedStrings(actual.map(value => value.id))
  return sameValue(actualIds, sortedStrings(expected))
}

function maximumCoordinateMagnitude(atoms: readonly Atom[]): number {
  return atoms.reduce((maximum, atom) => Math.max(
    maximum,
    Math.abs(atom.x),
    Math.abs(atom.y),
    Math.abs(atom.z),
  ), 0)
}

export function verifyFragmentAttachRelation(
  before: Molecule,
  after: Molecule,
  command: FragmentAttachCommand,
): FragmentAttachVerificationResult {
  const compiled = compileFragmentAttachRelation(before, command)
  if (compiled.verdict !== 'pass') return compiled
  const relation = compiled.relation

  if (
    after.atoms.length > FRAGMENT_ATTACH_RELATION_POLICY.maxCandidateAtoms
    || after.bonds.length > FRAGMENT_ATTACH_RELATION_POLICY.maxCandidateBonds
  ) {
    return failure('indeterminate', {
      code: 'resource-limit',
      message: 'After graph exceeds the fragment.attach certificate resource budget',
    }, relation)
  }
  if (!hasValidGraph(after)) {
    return failure('reject', {
      code: 'graph-rewrite-mismatch',
      message: 'After graph is incomplete or does not have stable unique IDs',
    }, relation)
  }
  if (after.atoms.some(atom => ![atom.x, atom.y, atom.z].every(Number.isFinite))) {
    return failure('indeterminate', {
      code: 'numeric-uncertainty',
      message: 'After graph contains non-finite coordinates',
    }, relation)
  }
  if (maximumCoordinateMagnitude(after.atoms) > FRAGMENT_ATTACH_RELATION_POLICY.maxReliableCoordinateMagnitude) {
    return failure('indeterminate', {
      code: 'numeric-uncertainty',
      message: 'After coordinates exceed the reliable floating-point envelope',
    }, relation)
  }

  const expectedAtomIds = [...relation.fixedAtomIds, ...relation.addedAtomIds]
  const expectedBondIds = [...relation.fixedBondIds, ...relation.addedBondIds]
  if (!sameIds(after.atoms, expectedAtomIds) || !sameIds(after.bonds, expectedBondIds)) {
    return failure('reject', {
      code: 'graph-rewrite-mismatch',
      message: 'After graph must contain exactly the fixed and deterministic added entities',
    }, relation)
  }
  if ((before.name ?? null) !== (after.name ?? null)) {
    return failure('reject', {
      code: 'graph-rewrite-mismatch',
      message: 'Molecule name changed during fragment.attach',
    }, relation)
  }

  const beforeAtoms = new Map(before.atoms.map(atom => [atom.id, atom]))
  const afterAtoms = new Map(after.atoms.map(atom => [atom.id, atom]))
  const beforeBonds = new Map(before.bonds.map(bond => [bond.id, bond]))
  const afterBonds = new Map(after.bonds.map(bond => [bond.id, bond]))
  for (const atomId of relation.fixedAtomIds) {
    if (!sameValue(beforeAtoms.get(atomId), afterAtoms.get(atomId))) {
      return failure('reject', {
        code: 'fixed-atom-changed',
        message: `Fixed atom ${atomId} changed during fragment.attach`,
        atomId,
      }, relation)
    }
  }
  for (const bondId of relation.fixedBondIds) {
    if (!sameValue(beforeBonds.get(bondId), afterBonds.get(bondId))) {
      return failure('reject', {
        code: 'fixed-bond-changed',
        message: `Fixed bond ${bondId} changed during fragment.attach`,
        bondId,
      }, relation)
    }
  }

  for (const expectedAtom of relation.expectedAddedAtoms) {
    const actualAtom = afterAtoms.get(expectedAtom.id)!
    if (!sameValue(atomMetadata(expectedAtom), atomMetadata(actualAtom))) {
      return failure('reject', {
        code: 'new-atom-metadata-mismatch',
        message: `Generated atom ${expectedAtom.id} does not match its template atom metadata`,
        atomId: expectedAtom.id,
      }, relation)
    }
  }
  const expectedLinkBond = relation.expectedAddedBonds.find(bond => bond.id === relation.linkBondId)!
  const actualLinkBond = afterBonds.get(relation.linkBondId)!
  if (!sameBond(expectedLinkBond, actualLinkBond)) {
    return failure('reject', {
      code: 'link-bond-mismatch',
      message: 'The deterministic link bond has the wrong endpoints, order, or coordination metadata',
      bondId: relation.linkBondId,
    }, relation)
  }
  for (const expectedBond of relation.expectedAddedBonds) {
    if (expectedBond.id === relation.linkBondId) continue
    if (!sameBond(expectedBond, afterBonds.get(expectedBond.id)!)) {
      const mapping = relation.templateBondIdByIndex.find(candidate => candidate.bondId === expectedBond.id)
      return failure('reject', {
        code: 'new-bond-mismatch',
        message: `Generated template bond ${expectedBond.id} does not match the registered topology`,
        bondId: expectedBond.id,
        ...(mapping ? { templateBondIndex: mapping.templateBondIndex } : {}),
      }, relation)
    }
  }

  let uncertainty: FragmentAttachRelationDiagnostic | undefined
  for (let leftIndex = 0; leftIndex < relation.expectedAddedAtoms.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < relation.expectedAddedAtoms.length; rightIndex += 1) {
      const expectedLeft = relation.expectedAddedAtoms[leftIndex]!
      const expectedRight = relation.expectedAddedAtoms[rightIndex]!
      const actualLeft = afterAtoms.get(expectedLeft.id)!
      const actualRight = afterAtoms.get(expectedRight.id)!
      const expectedDistance = distance(point(expectedLeft), point(expectedRight))
      const actualDistance = distance(point(actualLeft), point(actualRight))
      const assessment = assessFragmentAttachDeviation(
        Math.abs(actualDistance - expectedDistance),
        Math.max(actualDistance, expectedDistance),
        FRAGMENT_ATTACH_RELATION_POLICY.distance,
      )
      if (assessment === 'reject') {
        return failure('reject', {
          code: 'template-distorted',
          message: `Template distance changed between ${expectedLeft.id} and ${expectedRight.id}`,
          atomId: expectedLeft.id,
          atomId2: expectedRight.id,
        }, relation)
      }
      if (assessment === 'indeterminate' && !uncertainty) {
        uncertainty = {
          code: 'numeric-uncertainty',
          message: `Template distance evidence is within the uncertainty band for ${expectedLeft.id} and ${expectedRight.id}`,
          atomId: expectedLeft.id,
          atomId2: expectedRight.id,
        }
      }
    }
  }

  if (relation.chiralityWitnessAtomIds) {
    const [originId, firstId, secondId, thirdId] = relation.chiralityWitnessAtomIds
    const expected = new Map(relation.expectedAddedAtoms.map(atom => [atom.id, atom]))
    const expectedVolume = signedVolume(
      point(expected.get(originId)!),
      point(expected.get(firstId)!),
      point(expected.get(secondId)!),
      point(expected.get(thirdId)!),
    )
    const actualVolume = signedVolume(
      point(afterAtoms.get(originId)!),
      point(afterAtoms.get(firstId)!),
      point(afterAtoms.get(secondId)!),
      point(afterAtoms.get(thirdId)!),
    )
    if (expectedVolume * actualVolume < 0) {
      return failure('reject', {
        code: 'template-mirrored',
        message: 'Generated template preserves distances but reverses a proper-orientation witness',
      }, relation)
    }
  }

  for (const expectedAtom of relation.expectedAddedAtoms) {
    const actualAtom = afterAtoms.get(expectedAtom.id)!
    const fixedHost = beforeAtoms.get(relation.hostAtomId)!
    const deviation = distance(point(expectedAtom), point(actualAtom))
    const assessment = assessFragmentAttachDeviation(
      deviation,
      Math.max(
        distance(point(fixedHost), point(expectedAtom)),
        distance(point(fixedHost), point(actualAtom)),
      ),
      FRAGMENT_ATTACH_RELATION_POLICY.coordinate,
    )
    if (assessment === 'reject') {
      return failure('reject', {
        code: 'template-placement-mismatch',
        message: `Generated atom ${expectedAtom.id} does not follow the explicit attachment torsion`,
        atomId: expectedAtom.id,
      }, relation)
    }
    if (assessment === 'indeterminate' && !uncertainty) {
      uncertainty = {
        code: 'numeric-uncertainty',
        message: `Placement evidence is within the uncertainty band for ${expectedAtom.id}`,
        atomId: expectedAtom.id,
      }
    }
  }

  if (uncertainty) return failure('indeterminate', uncertainty, relation)
  return { verdict: 'pass', relation }
}
