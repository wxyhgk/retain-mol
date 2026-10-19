import type { Molecule } from '../../model/types'
import { planFragmentFusionAcrossBonds } from './fragmentFusion'
import type {
  BondFusionAnchor,
  ChemicalRewriteFailure,
  FragmentFusionCandidate,
  FragmentFusionRequest,
} from './types'

export interface FragmentFusionEffect {
  readonly addedAtomIds: readonly string[]
  readonly removedAtomIds: readonly string[]
  readonly addedBondIds: readonly string[]
  readonly removedBondIds: readonly string[]
}

export interface PreparedFragmentFusionCommand {
  readonly commandKey: string
  readonly hostStateKey: string
  readonly candidates: readonly FragmentFusionCandidate[]
  readonly rejected: readonly ChemicalRewriteFailure[]
  readonly request: {
    readonly fragment: Molecule
    readonly anchors: readonly BondFusionAnchor[]
    readonly reconcileHydrogens: boolean
  }
}

export type FragmentFusionCommitFailureCode =
  | 'stale-host'
  | 'candidate-not-found'
  | 'candidate-no-longer-valid'

export interface FragmentFusionCommitFailure {
  readonly ok: false
  readonly code: FragmentFusionCommitFailureCode
  readonly reason: string
}

export interface FragmentFusionCommitSuccess {
  readonly ok: true
  readonly molecule: Molecule
  readonly effect: FragmentFusionEffect
  readonly selectedTopologyKey: string
  readonly coordinatesStale: true
}

export type FragmentFusionCommitResult =
  | FragmentFusionCommitFailure
  | FragmentFusionCommitSuccess

const cloneMolecule = (molecule: Molecule): Molecule => ({
  ...molecule,
  atoms: molecule.atoms.map((atom) => ({ ...atom })),
  bonds: molecule.bonds.map((bond) => ({ ...bond })),
})

const stableValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stableValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, stableValue(entry)]),
    )
  }
  return value
}

const atomState = (atom: Molecule['atoms'][number]): unknown =>
  stableValue(Object.fromEntries(
    Object.entries(atom as unknown as Record<string, unknown>)
      .filter(([key]) => key !== 'x' && key !== 'y' && key !== 'z'),
  ))

const bondState = (bond: Molecule['bonds'][number]): unknown => {
  const record = { ...(bond as unknown as Record<string, unknown>) }
  const atomId1 = String(record.atomId1)
  const atomId2 = String(record.atomId2)
  record.atomId1 = atomId1 < atomId2 ? atomId1 : atomId2
  record.atomId2 = atomId1 < atomId2 ? atomId2 : atomId1
  return stableValue(record)
}

export const chemicalCommandStateKey = (molecule: Molecule): string =>
  JSON.stringify({
    atoms: molecule.atoms
      .map(atomState)
      .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))),
    bonds: molecule.bonds
      .map(bondState)
      .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))),
  })

const topologyEffect = (before: Molecule, after: Molecule): FragmentFusionEffect => {
  const beforeAtomIds = new Set(before.atoms.map((atom) => atom.id))
  const afterAtomIds = new Set(after.atoms.map((atom) => atom.id))
  const beforeBondIds = new Set(before.bonds.map((bond) => bond.id))
  const afterBondIds = new Set(after.bonds.map((bond) => bond.id))
  return {
    addedAtomIds: [...afterAtomIds].filter((id) => !beforeAtomIds.has(id)).sort(),
    removedAtomIds: [...beforeAtomIds].filter((id) => !afterAtomIds.has(id)).sort(),
    addedBondIds: [...afterBondIds].filter((id) => !beforeBondIds.has(id)).sort(),
    removedBondIds: [...beforeBondIds].filter((id) => !afterBondIds.has(id)).sort(),
  }
}

export const prepareFragmentFusionCommand = (
  request: FragmentFusionRequest,
): PreparedFragmentFusionCommand => {
  const fragment = cloneMolecule(request.fragment)
  const anchors = request.anchors.map((anchor) => ({ ...anchor }))
  const reconcileHydrogens = request.reconcileHydrogens !== false
  const plan = planFragmentFusionAcrossBonds({
    host: request.host,
    fragment,
    anchors,
    reconcileHydrogens,
  })
  const hostStateKey = chemicalCommandStateKey(request.host)
  return {
    commandKey: JSON.stringify({
      hostStateKey,
      fragmentStateKey: chemicalCommandStateKey(fragment),
      anchors,
      reconcileHydrogens,
    }),
    hostStateKey,
    candidates: plan.candidates,
    rejected: plan.rejected,
    request: { fragment, anchors, reconcileHydrogens },
  }
}

export const commitFragmentFusionCommand = (
  prepared: PreparedFragmentFusionCommand,
  selectedTopologyKey: string,
  currentHost: Molecule,
): FragmentFusionCommitResult => {
  if (chemicalCommandStateKey(currentHost) !== prepared.hostStateKey) {
    return {
      ok: false,
      code: 'stale-host',
      reason: 'host topology or chemical labels changed after preview',
    }
  }
  if (!prepared.candidates.some((candidate) => candidate.topologyKey === selectedTopologyKey)) {
    return {
      ok: false,
      code: 'candidate-not-found',
      reason: 'selected candidate was not part of this preview',
    }
  }

  const refreshed = planFragmentFusionAcrossBonds({
    host: currentHost,
    fragment: prepared.request.fragment,
    anchors: prepared.request.anchors,
    reconcileHydrogens: prepared.request.reconcileHydrogens,
  })
  const candidate = refreshed.candidates.find(
    (entry) => entry.topologyKey === selectedTopologyKey,
  )
  if (!candidate) {
    return {
      ok: false,
      code: 'candidate-no-longer-valid',
      reason: 'selected candidate could not be reproduced against the current host',
    }
  }
  return {
    ok: true,
    molecule: candidate.molecule,
    effect: topologyEffect(currentHost, candidate.molecule),
    selectedTopologyKey,
    coordinatesStale: true,
  }
}
