import type { Atom, Bond, Molecule } from '../../types'
import { bondValence, targetValence, valenceUsed } from '../valence'
import { applyExplicitChemicalRewrite } from './pushout'
import type {
  AtomInterfaceMapping,
  BondInterfaceMapping,
  ChemicalRewriteFailure,
  FragmentFusionCandidate,
  FragmentFusionPlan,
  FragmentFusionRequest,
} from './types'

export const MAX_FRAGMENT_FUSION_ANCHORS = 8

const failure = (
  reason: string,
  code: ChemicalRewriteFailure['code'] = 'bond-interface-endpoint-conflict',
): ChemicalRewriteFailure => ({ ok: false, code, reason })

interface TerminalHydrogen {
  readonly atomId: string
  readonly bondId: string
}

const terminalHydrogensAt = (
  molecule: Molecule,
  atomId: string,
): readonly TerminalHydrogen[] => {
  const atoms = new Map(molecule.atoms.map((atom) => [atom.id, atom]))
  const degree = new Map<string, number>()
  for (const bond of molecule.bonds) {
    degree.set(bond.atomId1, (degree.get(bond.atomId1) ?? 0) + 1)
    degree.set(bond.atomId2, (degree.get(bond.atomId2) ?? 0) + 1)
  }
  return molecule.bonds
    .flatMap((bond) => {
      const otherId = bond.atomId1 === atomId
        ? bond.atomId2
        : bond.atomId2 === atomId
          ? bond.atomId1
          : undefined
      const other = otherId ? atoms.get(otherId) : undefined
      return other?.symbol === 'H' && degree.get(other.id) === 1
        ? [{ atomId: other.id, bondId: bond.id }]
        : []
    })
    .sort((left, right) => left.atomId.localeCompare(right.atomId))
}

const withoutAtoms = (molecule: Molecule, atomIds: ReadonlySet<string>): Molecule => ({
  ...molecule,
  atoms: molecule.atoms.filter((atom) => !atomIds.has(atom.id)),
  bonds: molecule.bonds.filter(
    (bond) => !atomIds.has(bond.atomId1) && !atomIds.has(bond.atomId2),
  ),
})

interface HostRemovalPlan {
  readonly atomIds: readonly string[]
  readonly bondIds: readonly string[]
}

const addedContribution = (hostAtom: Atom, bond: Bond): number =>
  hostAtom.coordinationSites || hostAtom.coordinationNumber !== undefined
    ? 1
    : bondValence(bond)

const planHostHydrogenRemoval = (
  host: Molecule,
  fragment: Molecule,
  atomInterface: readonly AtomInterfaceMapping[],
  bondInterface: readonly BondInterfaceMapping[],
): HostRemovalPlan => {
  const hostAtoms = new Map(host.atoms.map((atom) => [atom.id, atom]))
  const rightToHost = new Map(atomInterface.map((mapping) => [mapping.rightAtomId, mapping.hostAtomId]))
  const interfaceBonds = new Set(bondInterface.map((mapping) => mapping.rightBondId))
  const additions = new Map<string, number>()
  for (const bond of fragment.bonds) {
    if (interfaceBonds.has(bond.id)) continue
    for (const endpoint of [bond.atomId1, bond.atomId2]) {
      const hostAtomId = rightToHost.get(endpoint)
      const hostAtom = hostAtomId ? hostAtoms.get(hostAtomId) : undefined
      if (hostAtomId && hostAtom) {
        additions.set(
          hostAtomId,
          (additions.get(hostAtomId) ?? 0) + addedContribution(hostAtom, bond),
        )
      }
    }
  }

  const atomIds: string[] = []
  const bondIds: string[] = []
  for (const [hostAtomId, addition] of additions) {
    const atom = hostAtoms.get(hostAtomId)
    if (!atom) continue
    const excess = valenceUsed(host, hostAtomId) + addition - targetValence(atom)
    const removals = terminalHydrogensAt(host, hostAtomId)
      .slice(0, Math.max(0, Math.floor(excess + 1e-6)))
    for (const removal of removals) {
      atomIds.push(removal.atomId)
      bondIds.push(removal.bondId)
    }
  }
  return { atomIds: atomIds.sort(), bondIds: bondIds.sort() }
}

const prepareFragment = (
  fragment: Molecule,
  mappedRightAtomIds: ReadonlySet<string>,
  reconcileHydrogens: boolean,
): { molecule: Molecule; removedAtomIds: readonly string[] } => {
  if (!reconcileHydrogens) return { molecule: fragment, removedAtomIds: [] }
  const removed = new Set<string>()
  for (const atomId of mappedRightAtomIds) {
    for (const hydrogen of terminalHydrogensAt(fragment, atomId)) removed.add(hydrogen.atomId)
  }
  return {
    molecule: withoutAtoms(fragment, removed),
    removedAtomIds: [...removed].sort(),
  }
}

const buildInterface = (
  hostBonds: ReadonlyMap<string, Bond>,
  fragmentBonds: ReadonlyMap<string, Bond>,
  request: FragmentFusionRequest,
  flippedAnchors: readonly boolean[],
): { atomInterface: AtomInterfaceMapping[]; bondInterface: BondInterfaceMapping[] } | ChemicalRewriteFailure => {
  const rightToHost = new Map<string, string>()
  const hostToRight = new Map<string, string>()
  const bondInterface: BondInterfaceMapping[] = []
  for (let index = 0; index < request.anchors.length; index += 1) {
    const anchor = request.anchors[index]
    if (!anchor) return failure(`anchor ${index} is missing`)
    const hostBond = hostBonds.get(anchor.hostBondId)
    const fragmentBond = fragmentBonds.get(anchor.fragmentBondId)
    if (!hostBond) return failure(`host bond ${anchor.hostBondId} is missing`, 'host-bond-missing')
    if (!fragmentBond) return failure(`fragment bond ${anchor.fragmentBondId} is missing`, 'right-bond-missing')
    const hostEndpoints: readonly [string, string] = flippedAnchors[index]
      ? [hostBond.atomId2, hostBond.atomId1]
      : [hostBond.atomId1, hostBond.atomId2]
    const pairs = [
      [fragmentBond.atomId1, hostEndpoints[0]],
      [fragmentBond.atomId2, hostEndpoints[1]],
    ] as const
    for (const [rightAtomId, hostAtomId] of pairs) {
      const existingHost = rightToHost.get(rightAtomId)
      const existingRight = hostToRight.get(hostAtomId)
      if ((existingHost && existingHost !== hostAtomId) || (existingRight && existingRight !== rightAtomId)) {
        return failure(`anchor ${index} conflicts with an earlier endpoint mapping`)
      }
      rightToHost.set(rightAtomId, hostAtomId)
      hostToRight.set(hostAtomId, rightAtomId)
    }
    bondInterface.push({ hostBondId: hostBond.id, rightBondId: fragmentBond.id })
  }
  return {
    atomInterface: [...rightToHost]
      .map(([rightAtomId, hostAtomId]) => ({ rightAtomId, hostAtomId }))
      .sort((left, right) => left.rightAtomId.localeCompare(right.rightAtomId)),
    bondInterface,
  }
}

export const planFragmentFusionAcrossBonds = (
  request: FragmentFusionRequest,
): FragmentFusionPlan => {
  if (request.anchors.length === 0) {
    return { candidates: [], rejected: [failure('at least one bond anchor is required')] }
  }
  if (request.anchors.length > MAX_FRAGMENT_FUSION_ANCHORS) {
    return {
      candidates: [],
      rejected: [failure(
        `at most ${MAX_FRAGMENT_FUSION_ANCHORS} bond anchors are supported`,
        'too-many-anchors',
      )],
    }
  }
  const hostBondIds = new Set<string>()
  const fragmentBondIds = new Set<string>()
  for (const anchor of request.anchors) {
    if (hostBondIds.has(anchor.hostBondId) || fragmentBondIds.has(anchor.fragmentBondId)) {
      return { candidates: [], rejected: [failure('anchor bond ids must be unique on each side')] }
    }
    hostBondIds.add(anchor.hostBondId)
    fragmentBondIds.add(anchor.fragmentBondId)
  }

  const hostBonds = new Map(request.host.bonds.map((bond) => [bond.id, bond]))
  const fragmentBonds = new Map(request.fragment.bonds.map((bond) => [bond.id, bond]))
  for (const anchor of request.anchors) {
    if (!hostBonds.has(anchor.hostBondId)) {
      return { candidates: [], rejected: [failure(`host bond ${anchor.hostBondId} is missing`, 'host-bond-missing')] }
    }
    if (!fragmentBonds.has(anchor.fragmentBondId)) {
      return { candidates: [], rejected: [failure(`fragment bond ${anchor.fragmentBondId} is missing`, 'right-bond-missing')] }
    }
  }

  const candidates = new Map<string, FragmentFusionCandidate>()
  const rejected: ChemicalRewriteFailure[] = []
  const orientationCount = 2 ** request.anchors.length
  for (let mask = 0; mask < orientationCount; mask += 1) {
    const flippedAnchors = request.anchors.map(
      (_, index) => Math.floor(mask / (2 ** index)) % 2 === 1,
    )
    const interfaceResult = buildInterface(hostBonds, fragmentBonds, request, flippedAnchors)
    if ('ok' in interfaceResult) {
      rejected.push(interfaceResult)
      continue
    }
    const { atomInterface, bondInterface } = interfaceResult
    const mappedRightAtomIds = new Set(atomInterface.map((mapping) => mapping.rightAtomId))
    const prepared = prepareFragment(
      request.fragment,
      mappedRightAtomIds,
      request.reconcileHydrogens !== false,
    )
    const removals = request.reconcileHydrogens === false
      ? { atomIds: [], bondIds: [] }
      : planHostHydrogenRemoval(request.host, prepared.molecule, atomInterface, bondInterface)
    const result = applyExplicitChemicalRewrite(request.host, {
      right: prepared.molecule,
      atomInterface,
      bondInterface,
      removeHostAtomIds: removals.atomIds,
      removeHostBondIds: removals.bondIds,
    })
    if ('code' in result) {
      rejected.push(result)
      continue
    }
    if (!candidates.has(result.topologyKey)) {
      candidates.set(result.topologyKey, {
        ...result,
        atomInterface,
        bondInterface,
        flippedAnchors,
        removedFragmentAtomIds: prepared.removedAtomIds,
      })
    }
  }
  return {
    candidates: [...candidates.values()].sort((left, right) => left.topologyKey.localeCompare(right.topologyKey)),
    rejected,
  }
}
