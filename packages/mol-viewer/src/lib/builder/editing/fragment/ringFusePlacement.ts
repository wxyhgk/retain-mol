import * as THREE from 'three'
import type { Atom, Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { isBetterPlacementScore, scoreMoleculePlacement, type PlacementScore } from '../../geometry/placementPlanner'
import { detectMergeAtoms, remapAndMergeBonds, selectHydrogensToRemove } from './ringFuseTopology'

export interface RingFusePlacementInput {
  readonly molecule: Molecule
  readonly fragment: FragmentDef
  readonly f1i: number
  readonly f2i: number
  readonly targetAtom1: Atom
  readonly targetAtom2: Atom
  readonly skip: Set<number>
  readonly isHydrogenIndex: (index: number) => boolean
  readonly fragmentMidpoint: THREE.Vector3
  readonly fragmentAxis1: THREE.Vector3
  readonly fragmentAxis2: THREE.Vector3
  readonly fragmentAxis3: THREE.Vector3
  readonly fragmentCentroid: THREE.Vector3
  readonly targetMidpoint: THREE.Vector3
  readonly targetAxis1: THREE.Vector3
  readonly preferredTargetAxis2: THREE.Vector3
  readonly orderOverride: Map<string, 1 | 2 | 3>
  readonly atomById: Map<string, Atom>
}

export interface RingFusePlacementCandidate {
  readonly molecule: Molecule
  readonly mergeCount: number
  readonly score: PlacementScore
}

export function planRingFusePlacement(input: RingFusePlacementInput): RingFusePlacementCandidate | null {
  const reversedInput: RingFusePlacementInput = {
    ...input,
    targetAtom1: input.targetAtom2,
    targetAtom2: input.targetAtom1,
    targetAxis1: input.targetAxis1.clone().negate(),
  }
  const candidates = [input, reversedInput]
    .flatMap(orientedInput => [
      buildRingFuseCandidate(orientedInput, orientedInput.preferredTargetAxis2),
      buildRingFuseCandidate(orientedInput, orientedInput.preferredTargetAxis2.clone().negate()),
    ])
    .filter((candidate): candidate is RingFusePlacementCandidate => candidate !== null)

  candidates.sort(compareRingFuseCandidates)
  return candidates[0] ?? null
}

function compareRingFuseCandidates(a: RingFusePlacementCandidate, b: RingFusePlacementCandidate): number {
  if (a.mergeCount !== b.mergeCount) return a.mergeCount - b.mergeCount
  if (isBetterPlacementScore(a.score, b.score)) return -1
  if (isBetterPlacementScore(b.score, a.score)) return 1
  return 0
}

function buildRingFuseCandidate(
  input: RingFusePlacementInput,
  targetAxis2: THREE.Vector3,
): RingFusePlacementCandidate | null {
  const targetAxis3 = input.targetAxis1.clone().cross(targetAxis2)
  const fragmentBasis = new THREE.Matrix4().makeBasis(
    input.fragmentAxis1,
    input.fragmentAxis2,
    input.fragmentAxis3,
  )
  const targetBasis = new THREE.Matrix4().makeBasis(input.targetAxis1, targetAxis2, targetAxis3)
  const rotation = targetBasis.multiply(fragmentBasis.clone().transpose())
  const transform = (p: THREE.Vector3) => p.sub(input.fragmentMidpoint).applyMatrix4(rotation).add(input.targetMidpoint)
  const newCentroid = transform(input.fragmentCentroid.clone())

  const merge = detectMergeAtoms(
    input.fragment,
    input.molecule,
    transform,
    input.skip,
    input.isHydrogenIndex,
    input.targetAtom1.id,
    input.targetAtom2.id,
  )
  if (merge === null) return null

  const removeIds = selectHydrogensToRemove(
    input.molecule,
    newCentroid,
    [
      input.targetAtom1.id,
      input.targetAtom2.id,
      ...merge.mergeByIndex.values(),
    ],
  )

  const result = remapAndMergeBonds(input.fragment, input.molecule, transform, {
    f1i: input.f1i,
    f2i: input.f2i,
    T1id: input.targetAtom1.id,
    T2id: input.targetAtom2.id,
    skip: input.skip,
    isH: input.isHydrogenIndex,
    merge,
    removeIds,
    orderOverride: input.orderOverride,
  })
  if (!result) return null

  const existingIds = new Set(input.molecule.atoms.map(atom => atom.id))
  const placementAtoms = result.molecule.atoms.filter(atom => !existingIds.has(atom.id))
  const score = scoreMoleculePlacement(
    input.molecule.atoms,
    { atoms: placementAtoms, bonds: [] },
    {
      excludeAtomIds: new Set([
        input.targetAtom1.id,
        input.targetAtom2.id,
        ...removeIds,
        ...merge.mergeByIndex.values(),
      ]),
    },
  )

  return { ...result, score }
}
