import { sha256Hex } from '../../modeling/effects/sha256'
import type { FragmentDef } from './model'

const FRAGMENT_DIGEST_PREFIX = 'fragment-v1-sha256-'

function canonicalNumber(value: number): number {
  if (!Number.isFinite(value)) throw new TypeError('Fragment identity requires finite numbers')
  return Object.is(value, -0) ? 0 : value
}

/**
 * Bind every field that can change fragment topology, placement, or authored
 * coordination semantics. Array order remains significant because atom and
 * bond indices are part of the fragment contract.
 */
export function computeFragmentDigest(fragment: FragmentDef): string {
  const canonical = {
    schemaVersion: 1,
    id: fragment.id,
    name: fragment.name,
    short: fragment.short,
    formula: fragment.formula,
    atoms: fragment.atoms.map(atom => ({
      symbol: atom.symbol,
      x: canonicalNumber(atom.x),
      y: canonicalNumber(atom.y),
      z: canonicalNumber(atom.z),
    })),
    bonds: fragment.bonds.map(bond => ({
      a: bond.a,
      b: bond.b,
      order: bond.order,
      coordinationSiteId: bond.coordinationSiteId ?? null,
    })),
    attachIndex: fragment.attachIndex,
    attachHIndex: fragment.attachHIndex,
    attachDirection: fragment.attachDirection?.map(canonicalNumber) ?? null,
    attachBond: fragment.attachBond ?? null,
    attachOrder: fragment.attachOrder ?? null,
    bridgeAttachment: fragment.bridgeAttachment
      ? {
          centerIndex: fragment.bridgeAttachment.centerIndex,
          sites: fragment.bridgeAttachment.sites.map(site => ({
            leavingHydrogenIndex: site.leavingHydrogenIndex,
            order: site.order,
          })),
        }
      : null,
    group: fragment.group ?? null,
    coordination: fragment.coordination
      ? {
          geometryId: fragment.coordination.geometryId,
          coordinationNumber: fragment.coordination.coordinationNumber,
          pointGroup: fragment.coordination.pointGroup ?? null,
          directions: fragment.coordination.directions.map(direction => direction.map(canonicalNumber)),
          sites: fragment.coordination.sites.map(site => ({
            id: site.id,
            label: site.label,
            direction: site.direction.map(canonicalNumber),
            bondOrder: site.bondOrder,
            equivalenceGroup: site.equivalenceGroup,
          })),
        }
      : null,
  }
  return `${FRAGMENT_DIGEST_PREFIX}${sha256Hex(JSON.stringify(canonical))}`
}

export function isFragmentDigest(value: string): boolean {
  return /^fragment-v1-sha256-[0-9a-f]{64}$/.test(value)
}
