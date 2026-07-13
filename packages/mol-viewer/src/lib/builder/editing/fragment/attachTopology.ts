import type { Atom, Molecule } from '../../../molecule'
import { newBond } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { instantiate } from './instantiate'
import { add, applyQuat, sub, type Quat, type Vec3 } from '../../math'

export interface ApplyAttachFragmentTopologyInput {
  readonly molecule: Molecule
  readonly fragment: FragmentDef
  readonly host: Atom
  readonly order: 1 | 2 | 3
  readonly attachOrigin: Vec3
  readonly rotation: Quat
  readonly anchor: Vec3
  readonly removeAtomIds: ReadonlySet<string>
  readonly hostCoordinationSiteId?: string
}

export function applyAttachFragmentTopology(input: ApplyAttachFragmentTopologyInput): Molecule {
  const { molecule, fragment, host, order, attachOrigin, rotation, anchor, removeAtomIds, hostCoordinationSiteId } = input
  const { atoms, bonds, idByIndex } = instantiate(
    fragment,
    p => add(applyQuat(sub(p, attachOrigin), rotation), anchor),
    fragment.attachHIndex,
  )
  const attachAtomId = idByIndex.get(fragment.attachIndex)
  if (attachAtomId === undefined) {
    throw new Error(`fragment attach atom ${fragment.attachIndex} was not instantiated`)
  }
  const fragmentSiteId = fragment.bonds.find(bond =>
    bond.coordinationSiteId &&
    ((bond.a === fragment.attachIndex && bond.b === fragment.attachHIndex) ||
      (bond.b === fragment.attachIndex && bond.a === fragment.attachHIndex)),
  )?.coordinationSiteId
  const assignments = [
    hostCoordinationSiteId ? { atomId: host.id, siteId: hostCoordinationSiteId } : null,
    fragmentSiteId ? { atomId: attachAtomId, siteId: fragmentSiteId } : null,
  ].filter((assignment): assignment is { atomId: string; siteId: string } => assignment !== null)
  const baseLinkBond = newBond(host.id, attachAtomId, order)
  const linkBond = assignments.length > 0
    ? { ...baseLinkBond, coordinationSites: assignments }
    : baseLinkBond

  return {
    ...molecule,
    atoms: [...molecule.atoms.filter(a => !removeAtomIds.has(a.id)), ...atoms],
    bonds: [
      ...molecule.bonds.filter(b => !removeAtomIds.has(b.atomId1) && !removeAtomIds.has(b.atomId2)),
      linkBond,
      ...bonds,
    ],
  }
}
