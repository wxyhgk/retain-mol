import {
  computeFragmentDigest as computeInternalFragmentDigest,
  getFragment as getInternalFragment,
  getFragmentDigest as getInternalFragmentDigest,
  listFragments as listInternalFragments,
  registerFragment as registerInternalFragment,
  unregisterFragment as unregisterInternalFragment,
  type FragmentDef,
} from '../lib/builder/fragmentLibrary'
import type {
  FragmentAttachmentSite,
  FragmentSummary,
  PublicFragmentBond,
  PublicFragmentBridgeAttachment,
  PublicFragmentCoordination,
  PublicFragmentDef,
} from './contracts/fragments'

export type {
  FragmentAttachmentSite,
  FragmentSummary,
  PublicCoordinationSite,
  PublicFragmentAtom,
  PublicFragmentBond,
  PublicFragmentBondOrder,
  PublicFragmentBridgeAttachment,
  PublicFragmentCoordination,
  PublicFragmentDef,
  PublicFragmentDirection,
  PublicFragmentGroup,
} from './contracts/fragments'

function clonePublicBond(bond: PublicFragmentBond): PublicFragmentBond {
  const { coordinationSiteId, ...required } = bond
  return {
    ...required,
    ...(coordinationSiteId === undefined ? {} : { coordinationSiteId }),
  }
}

function clonePublicCoordination(
  coordination: PublicFragmentCoordination,
): PublicFragmentCoordination {
  const { pointGroup, ...required } = coordination
  return {
    ...required,
    ...(pointGroup === undefined ? {} : { pointGroup }),
    directions: coordination.directions.map(direction => [...direction]),
    sites: coordination.sites.map(site => ({ ...site, direction: [...site.direction] })),
  }
}

function clonePublicBridgeAttachment(
  attachment: PublicFragmentBridgeAttachment,
): PublicFragmentBridgeAttachment {
  return {
    centerIndex: attachment.centerIndex,
    sites: [{ ...attachment.sites[0] }, { ...attachment.sites[1] }],
  }
}

function clonePublicFragment(fragment: PublicFragmentDef): PublicFragmentDef {
  const {
    attachDirection,
    attachBond,
    attachOrder,
    bridgeAttachment,
    group,
    coordination,
    ...required
  } = fragment
  return {
    ...required,
    atoms: fragment.atoms.map(atom => ({ ...atom })),
    bonds: fragment.bonds.map(clonePublicBond),
    ...(attachDirection === undefined ? {} : { attachDirection: [...attachDirection] }),
    ...(attachBond === undefined ? {} : { attachBond: [...attachBond] as [number, number] }),
    ...(attachOrder === undefined ? {} : { attachOrder }),
    ...(bridgeAttachment === undefined
      ? {}
      : { bridgeAttachment: clonePublicBridgeAttachment(bridgeAttachment) }),
    ...(group === undefined ? {} : { group }),
    ...(coordination === undefined ? {} : { coordination: clonePublicCoordination(coordination) }),
  }
}

function toPublicFragment(fragment: FragmentDef): PublicFragmentDef {
  return clonePublicFragment(fragment)
}

function toFragmentSummary(fragment: FragmentDef): FragmentSummary {
  const { group, attachOrder } = fragment
  return {
    id: fragment.id,
    name: fragment.name,
    short: fragment.short,
    formula: fragment.formula,
    ...(group === undefined ? {} : { group }),
    ...(attachOrder === undefined ? {} : { attachOrder }),
    atomCount: fragment.atoms.length,
    bondCount: fragment.bonds.length,
  }
}

export function listFragments(): readonly PublicFragmentDef[] {
  return listInternalFragments().map(toPublicFragment)
}

export function listFragmentSummaries(): readonly FragmentSummary[] {
  return listInternalFragments().map(toFragmentSummary)
}

export function getFragment(id: string): PublicFragmentDef | undefined {
  const fragment = getInternalFragment(id)
  return fragment ? toPublicFragment(fragment) : undefined
}

/** Immutable content identity for plans that execute a registered fragment later. */
export function getFragmentDigest(id: string): string | undefined {
  return getInternalFragmentDigest(id)
}

/** Compute the same identity before registering an authored fragment. */
export function computeFragmentDigest(fragment: PublicFragmentDef): string {
  return computeInternalFragmentDigest(fragment as FragmentDef)
}

export function getFragmentSummary(id: string): FragmentSummary | undefined {
  const fragment = getInternalFragment(id)
  return fragment ? toFragmentSummary(fragment) : undefined
}

export function getFragmentAttachmentSites(id: string): readonly FragmentAttachmentSite[] {
  const fragment = getInternalFragment(id)
  if (!fragment) return []
  if (fragment.coordination) {
    return fragment.coordination.sites.map(site => ({
      ...site,
      direction: [...site.direction],
    }))
  }

  const center = fragment.atoms[fragment.attachIndex]
  if (!center) return []
  const groupCounts = new Map<string, number>()
  return fragment.bonds.flatMap(bond => {
    const atomIndex = bond.a === fragment.attachIndex
      ? bond.b
      : bond.b === fragment.attachIndex
        ? bond.a
        : -1
    const atom = fragment.atoms[atomIndex]
    if (atomIndex < 0 || atom?.symbol !== 'H') return []
    const bondOrder = atomIndex === fragment.attachHIndex ? (fragment.attachOrder ?? 1) : 1
    const equivalenceGroup = `bond-order-${bondOrder}`
    const ordinal = (groupCounts.get(equivalenceGroup) ?? 0) + 1
    groupCounts.set(equivalenceGroup, ordinal)
    const dx = atom.x - center.x
    const dy = atom.y - center.y
    const dz = atom.z - center.z
    const length = Math.hypot(dx, dy, dz) || 1
    return [{
      id: `atom:${atomIndex}`,
      label: `${bondOrderLabel(bondOrder)}位 ${ordinal}`,
      direction: [dx / length, dy / length, dz / length] as const,
      bondOrder,
      equivalenceGroup,
    }]
  })
}

export function createFragmentForAttachmentSite(
  fragmentId: string,
  siteId: string,
): PublicFragmentDef {
  const fragment = getFragment(fragmentId)
  if (!fragment) throw new Error(`未找到片段：${fragmentId}`)
  const site = getFragmentAttachmentSites(fragmentId).find(candidate => candidate.id === siteId)
  if (!site) throw new Error(`未找到连接位点：${siteId}`)

  let attachHIndex = -1
  if (fragment.coordination) {
    const slotBond = fragment.bonds.find(bond =>
      bond.coordinationSiteId === siteId &&
      (bond.a === fragment.attachIndex || bond.b === fragment.attachIndex),
    )
    if (slotBond) attachHIndex = slotBond.a === fragment.attachIndex ? slotBond.b : slotBond.a
  } else if (siteId.startsWith('atom:')) {
    attachHIndex = Number(siteId.slice('atom:'.length))
  }
  if (!Number.isInteger(attachHIndex) || fragment.atoms[attachHIndex]?.symbol !== 'H') {
    throw new Error(`连接位点缺少可移除的 H：${siteId}`)
  }

  const preparedFragment = shouldMaterializeCarbonMultipleBondPartner(fragment, site)
    ? materializeCarbonMultipleBondPartner(fragment)
    : fragment
  const clonedFragment = clonePublicFragment(preparedFragment)

  return {
    ...clonedFragment,
    id: `${fragment.id}--site--${site.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
    name: `${fragment.name} · ${site.label}`,
    attachHIndex,
    attachDirection: [...site.direction],
    attachOrder: site.bondOrder,
  }
}

export function registerFragment(fragment: PublicFragmentDef): PublicFragmentDef {
  const {
    attachDirection,
    attachBond,
    attachOrder,
    bridgeAttachment,
    group,
    coordination,
    ...required
  } = fragment
  const internalFragment: FragmentDef = {
    ...required,
    atoms: fragment.atoms.map(atom => ({ ...atom })),
    bonds: fragment.bonds.map(bond => {
      const { coordinationSiteId, ...requiredBond } = bond
      return {
        ...requiredBond,
        ...(coordinationSiteId === undefined ? {} : { coordinationSiteId }),
      }
    }),
    ...(attachDirection === undefined
      ? {}
      : { attachDirection: [...attachDirection] as [number, number, number] }),
    ...(attachBond === undefined ? {} : { attachBond: [...attachBond] as [number, number] }),
    ...(attachOrder === undefined ? {} : { attachOrder }),
    ...(bridgeAttachment === undefined
      ? {}
      : {
          bridgeAttachment: {
            centerIndex: bridgeAttachment.centerIndex,
            sites: [{ ...bridgeAttachment.sites[0] }, { ...bridgeAttachment.sites[1] }],
          },
        }),
    ...(group === undefined ? {} : { group }),
    ...(coordination === undefined
      ? {}
      : {
          coordination: {
            geometryId: coordination.geometryId,
            coordinationNumber: coordination.coordinationNumber,
            ...(coordination.pointGroup === undefined ? {} : { pointGroup: coordination.pointGroup }),
            directions: coordination.directions.map(direction => [...direction] as [number, number, number]),
            sites: coordination.sites.map(site => ({
              ...site,
              direction: [...site.direction] as [number, number, number],
            })),
          },
        }),
  }
  return toPublicFragment(registerInternalFragment(internalFragment))
}

export function unregisterFragment(id: string): boolean {
  return unregisterInternalFragment(id)
}

function bondOrderLabel(order: 1 | 2 | 3) {
  return order === 1 ? '单键' : order === 2 ? '双键' : '三键'
}

function shouldMaterializeCarbonMultipleBondPartner(
  fragment: PublicFragmentDef,
  site: FragmentAttachmentSite,
) {
  return fragment.atoms[fragment.attachIndex]?.symbol === 'C' &&
    (fragment.group === 'sp2' || fragment.group === 'sp') &&
    (fragment.attachOrder ?? 1) > 1 &&
    site.bondOrder === 1
}

function materializeCarbonMultipleBondPartner(fragment: PublicFragmentDef): PublicFragmentDef {
  const order = fragment.attachOrder === 3 ? 3 : 2
  const center = fragment.atoms[fragment.attachIndex]
  const primarySlot = fragment.atoms[fragment.attachHIndex]
  if (!center || !primarySlot) return fragment

  const rawDirection: [number, number, number] = [
    primarySlot.x - center.x,
    primarySlot.y - center.y,
    primarySlot.z - center.z,
  ]
  const direction = normalizeDirection(rawDirection)
  const multipleBondLength = order === 2 ? 1.34 : 1.20
  const partner = {
    symbol: 'C',
    x: center.x + direction[0] * multipleBondLength,
    y: center.y + direction[1] * multipleBondLength,
    z: center.z + direction[2] * multipleBondLength,
  }
  const atoms = fragment.atoms.map(atom => ({ ...atom }))
  atoms[fragment.attachHIndex] = partner
  const bonds: PublicFragmentBond[] = fragment.bonds.map(bond => {
    const isPrimaryBond =
      (bond.a === fragment.attachIndex && bond.b === fragment.attachHIndex) ||
      (bond.b === fragment.attachIndex && bond.a === fragment.attachHIndex)
    return isPrimaryBond ? { ...bond, order } : { ...bond }
  })

  if (order === 2) {
    const perpendicular = perpendicularDirection(direction)
    const cos60 = 0.5
    const sin60 = Math.sqrt(3) / 2
    for (const side of [-1, 1] as const) {
      const hydrogenDirection: [number, number, number] = [
        direction[0] * cos60 + perpendicular[0] * sin60 * side,
        direction[1] * cos60 + perpendicular[1] * sin60 * side,
        direction[2] * cos60 + perpendicular[2] * sin60 * side,
      ]
      atoms.push({
        symbol: 'H',
        x: partner.x + hydrogenDirection[0] * 1.09,
        y: partner.y + hydrogenDirection[1] * 1.09,
        z: partner.z + hydrogenDirection[2] * 1.09,
      })
      bonds.push({ a: fragment.attachHIndex, b: atoms.length - 1, order: 1 })
    }
  } else {
    atoms.push({
      symbol: 'H',
      x: partner.x + direction[0] * 1.06,
      y: partner.y + direction[1] * 1.06,
      z: partner.z + direction[2] * 1.06,
    })
    bonds.push({ a: fragment.attachHIndex, b: atoms.length - 1, order: 1 })
  }

  return {
    ...fragment,
    short: order === 2 ? '–C=C' : '–C≡C',
    formula: order === 2 ? 'C₂H₄' : 'C₂H₂',
    atoms,
    bonds,
  }
}

function normalizeDirection([x, y, z]: readonly [number, number, number]): [number, number, number] {
  const length = Math.hypot(x, y, z) || 1
  return [x / length, y / length, z / length]
}

function perpendicularDirection(direction: readonly [number, number, number]): [number, number, number] {
  const [x, y, z] = direction
  if (Math.hypot(x, y) > 1e-6) return normalizeDirection([-y, x, 0])
  return normalizeDirection([0, -z, y])
}
