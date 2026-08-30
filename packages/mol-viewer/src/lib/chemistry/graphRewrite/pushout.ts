import type { Atom, Bond, Molecule } from '../../types'
import { maxValence, valenceUsed } from '../valence'
import type {
  AtomInterfaceMapping,
  ChemicalRewriteFailure,
  ChemicalRewriteResult,
  ExplicitChemicalRewrite,
} from './types'

const AROMATIC_RESIDUE = 1 - 1e-8

const fail = (
  code: ChemicalRewriteFailure['code'],
  reason: string,
): ChemicalRewriteFailure => ({ ok: false, code, reason })

const endpointKey = (atomId1: string, atomId2: string): string =>
  JSON.stringify(atomId1 < atomId2 ? [atomId1, atomId2] : [atomId2, atomId1])

const validateGraph = (
  molecule: Molecule,
  side: 'host' | 'right',
): ChemicalRewriteFailure | undefined => {
  const atomIds = new Set<string>()
  for (const atom of molecule.atoms) {
    if (atomIds.has(atom.id)) return fail('id-collision', `${side} contains duplicate atom id ${atom.id}`)
    atomIds.add(atom.id)
  }
  const bondIds = new Set<string>()
  const endpoints = new Set<string>()
  for (const bond of molecule.bonds) {
    if (bondIds.has(bond.id)) return fail('id-collision', `${side} contains duplicate bond id ${bond.id}`)
    bondIds.add(bond.id)
    if (!atomIds.has(bond.atomId1) || !atomIds.has(bond.atomId2)) {
      return fail('dangling-bond', `${side} bond ${bond.id} has a missing endpoint`)
    }
    if (bond.atomId1 === bond.atomId2) return fail('self-bond', `${side} bond ${bond.id} is a self bond`)
    const key = endpointKey(bond.atomId1, bond.atomId2)
    if (endpoints.has(key)) return fail('duplicate-bond', `${side} has duplicate bonds at ${key}`)
    endpoints.add(key)
  }
  return undefined
}

const validateValence = (molecule: Molecule): ChemicalRewriteFailure | undefined => {
  for (const atom of molecule.atoms) {
    const used = valenceUsed(molecule, atom.id)
    const maximum = maxValence(atom)
    if (used - maximum >= AROMATIC_RESIDUE) {
      return fail('over-valence', `atom ${atom.id} uses valence ${used} above ${maximum}`)
    }
  }
  return undefined
}

const atomLabelsCompatible = (host: Atom, right: Atom): boolean =>
  JSON.stringify([
    host.symbol,
    host.charge ?? 0,
    host.radical ?? 0,
    host.coordinationGeometry ?? null,
    host.coordinationNumber ?? null,
    host.coordinationSites ?? null,
  ]) === JSON.stringify([
    right.symbol,
    right.charge ?? 0,
    right.radical ?? 0,
    right.coordinationGeometry ?? null,
    right.coordinationNumber ?? null,
    right.coordinationSites ?? null,
  ])

const validateAtomInterface = (
  hostAtoms: ReadonlyMap<string, Atom>,
  rightAtoms: ReadonlyMap<string, Atom>,
  mappings: readonly AtomInterfaceMapping[],
): ChemicalRewriteFailure | undefined => {
  const hostSeen = new Set<string>()
  const rightSeen = new Set<string>()
  for (const mapping of mappings) {
    const hostAtom = hostAtoms.get(mapping.hostAtomId)
    const rightAtom = rightAtoms.get(mapping.rightAtomId)
    if (!hostAtom) return fail('host-atom-missing', `host atom ${mapping.hostAtomId} is missing`)
    if (!rightAtom) return fail('right-atom-missing', `right atom ${mapping.rightAtomId} is missing`)
    if (hostSeen.has(mapping.hostAtomId) || rightSeen.has(mapping.rightAtomId)) {
      return fail('atom-interface-not-injective', 'atom interface must be one-to-one')
    }
    if (!atomLabelsCompatible(hostAtom, rightAtom)) {
      return fail('atom-label-conflict', `atoms ${hostAtom.id}/${rightAtom.id} have incompatible chemical labels`)
    }
    hostSeen.add(mapping.hostAtomId)
    rightSeen.add(mapping.rightAtomId)
  }
  return undefined
}

const bondsCompatible = (host: Bond, right: Bond): boolean =>
  host.aromatic && right.aromatic
    ? true
    : Boolean(host.aromatic) === Boolean(right.aromatic) && host.order === right.order

export const chemicalTopologyKey = (molecule: Molecule): string => {
  const atoms = molecule.atoms
    .map((atom) => [
      atom.id,
      atom.symbol,
      atom.charge ?? 0,
      atom.radical ?? 0,
      atom.coordinationGeometry ?? null,
      atom.coordinationNumber ?? null,
      atom.coordinationSites ?? null,
    ] as const)
    .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))
  const bonds = molecule.bonds
    .map((bond) => {
      const endpoints = bond.atomId1 < bond.atomId2
        ? [bond.atomId1, bond.atomId2]
        : [bond.atomId2, bond.atomId1]
      return [endpoints, bond.order, Boolean(bond.aromatic), bond.coordinationSites ?? null] as const
    })
    .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))
  return JSON.stringify({ atoms, bonds })
}

export const applyExplicitChemicalRewrite = (
  host: Molecule,
  rewrite: ExplicitChemicalRewrite,
): ChemicalRewriteResult => {
  const invalidHost = validateGraph(host, 'host')
  if (invalidHost) return invalidHost
  const invalidRight = validateGraph(rewrite.right, 'right')
  if (invalidRight) return invalidRight

  const hostAtoms = new Map(host.atoms.map((atom) => [atom.id, atom]))
  const rightAtoms = new Map(rewrite.right.atoms.map((atom) => [atom.id, atom]))
  const hostBonds = new Map(host.bonds.map((bond) => [bond.id, bond]))
  const rightBonds = new Map(rewrite.right.bonds.map((bond) => [bond.id, bond]))
  const invalidInterface = validateAtomInterface(hostAtoms, rightAtoms, rewrite.atomInterface)
  if (invalidInterface) return invalidInterface

  const removedHostAtoms = new Set(rewrite.removeHostAtomIds ?? [])
  const removedHostBonds = new Set(rewrite.removeHostBondIds ?? [])
  for (const atomId of removedHostAtoms) {
    if (!hostAtoms.has(atomId)) return fail('host-atom-missing', `host atom ${atomId} is missing`)
  }
  for (const bondId of removedHostBonds) {
    if (!hostBonds.has(bondId)) return fail('host-bond-missing', `host bond ${bondId} is missing`)
  }
  for (const mapping of rewrite.atomInterface) {
    if (removedHostAtoms.has(mapping.hostAtomId)) {
      return fail('host-atom-missing', `mapped host atom ${mapping.hostAtomId} is deleted`)
    }
  }
  for (const bond of host.bonds) {
    const touchesRemovedAtom = removedHostAtoms.has(bond.atomId1) || removedHostAtoms.has(bond.atomId2)
    if (touchesRemovedAtom && !removedHostBonds.has(bond.id)) {
      return fail('dangling-bond', `deleting an atom requires explicitly deleting incident bond ${bond.id}`)
    }
  }

  const rightToHost = new Map(
    rewrite.atomInterface.map((mapping) => [mapping.rightAtomId, mapping.hostAtomId]),
  )
  const mappedHostBonds = new Set<string>()
  const mappedRightBonds = new Set<string>()
  for (const mapping of rewrite.bondInterface ?? []) {
    const hostBond = hostBonds.get(mapping.hostBondId)
    const rightBond = rightBonds.get(mapping.rightBondId)
    if (!hostBond) return fail('host-bond-missing', `host bond ${mapping.hostBondId} is missing`)
    if (!rightBond) return fail('right-bond-missing', `right bond ${mapping.rightBondId} is missing`)
    if (removedHostBonds.has(hostBond.id)) {
      return fail('host-bond-missing', `mapped host bond ${hostBond.id} is deleted`)
    }
    const transformed1 = rightToHost.get(rightBond.atomId1)
    const transformed2 = rightToHost.get(rightBond.atomId2)
    if (
      !transformed1
      || !transformed2
      || endpointKey(transformed1, transformed2) !== endpointKey(hostBond.atomId1, hostBond.atomId2)
    ) {
      return fail('bond-interface-endpoint-conflict', `bond mapping ${hostBond.id}/${rightBond.id} disagrees with atom mapping`)
    }
    if (!bondsCompatible(hostBond, rightBond)) {
      return fail('bond-label-conflict', `bond mapping ${hostBond.id}/${rightBond.id} has incompatible labels`)
    }
    if (mappedHostBonds.has(hostBond.id) || mappedRightBonds.has(rightBond.id)) {
      return fail('id-collision', 'bond interface must be one-to-one')
    }
    mappedHostBonds.add(hostBond.id)
    mappedRightBonds.add(rightBond.id)
  }

  const atoms: Atom[] = host.atoms.filter((atom) => !removedHostAtoms.has(atom.id))
  const outputAtomIds = new Set(atoms.map((atom) => atom.id))
  for (const atom of rewrite.right.atoms) {
    if (rightToHost.has(atom.id)) continue
    if (hostAtoms.has(atom.id) || outputAtomIds.has(atom.id)) {
      return fail('id-collision', `right atom id ${atom.id} collides with a host id`)
    }
    atoms.push({ ...atom })
    outputAtomIds.add(atom.id)
  }

  const bonds: Bond[] = host.bonds.filter((bond) => !removedHostBonds.has(bond.id))
  const outputBondIds = new Set(bonds.map((bond) => bond.id))
  const outputEndpoints = new Set(bonds.map((bond) => endpointKey(bond.atomId1, bond.atomId2)))
  for (const bond of rewrite.right.bonds) {
    if (mappedRightBonds.has(bond.id)) continue
    if (hostBonds.has(bond.id) || outputBondIds.has(bond.id)) {
      return fail('id-collision', `right bond id ${bond.id} collides with a host id`)
    }
    const atomId1 = rightToHost.get(bond.atomId1) ?? bond.atomId1
    const atomId2 = rightToHost.get(bond.atomId2) ?? bond.atomId2
    if (atomId1 === atomId2) return fail('self-bond', `right bond ${bond.id} collapses to a self bond`)
    if (!outputAtomIds.has(atomId1) || !outputAtomIds.has(atomId2)) {
      return fail('dangling-bond', `right bond ${bond.id} has a missing endpoint after gluing`)
    }
    const key = endpointKey(atomId1, atomId2)
    if (outputEndpoints.has(key)) {
      return fail('duplicate-bond', `right bond ${bond.id} duplicates an edge outside the interface`)
    }
    bonds.push({ ...bond, atomId1, atomId2 })
    outputBondIds.add(bond.id)
    outputEndpoints.add(key)
  }

  const molecule: Molecule = { ...host, atoms, bonds }
  const valenceFailure = validateValence(molecule)
  if (valenceFailure) return valenceFailure
  return {
    ok: true,
    molecule,
    removedHostAtomIds: [...removedHostAtoms].sort(),
    topologyKey: chemicalTopologyKey(molecule),
    coordinatesStale: true,
  }
}
