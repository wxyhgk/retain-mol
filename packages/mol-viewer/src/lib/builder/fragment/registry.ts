import { validateFragmentDef } from '../kernel/FragmentValidator'
import { FRAGMENTS } from './catalog'
import { computeFragmentDigest } from './identity'
import type { FragmentDef } from './model'

const registeredFragments = new Map<string, FragmentDef>()
const registeredFragmentsByDigest = new Map<string, FragmentDef>()

function cloneFragment(fragment: FragmentDef): FragmentDef {
  return {
    ...fragment,
    atoms: fragment.atoms.map(atom => ({ ...atom })),
    bonds: fragment.bonds.map(bond => ({ ...bond })),
    ...(fragment.attachDirection ? { attachDirection: [...fragment.attachDirection] } : {}),
    ...(fragment.attachBond ? { attachBond: [...fragment.attachBond] } : {}),
    ...(fragment.bridgeAttachment
      ? {
          bridgeAttachment: {
            centerIndex: fragment.bridgeAttachment.centerIndex,
            sites: fragment.bridgeAttachment.sites.map(site => ({ ...site })) as [
              typeof fragment.bridgeAttachment.sites[0],
              typeof fragment.bridgeAttachment.sites[1],
            ],
          },
        }
      : {}),
    ...(fragment.coordination
      ? {
          coordination: {
            ...fragment.coordination,
            directions: fragment.coordination.directions.map(direction => [...direction]),
            sites: fragment.coordination.sites.map(site => ({
              ...site,
              direction: [...site.direction],
            })),
          },
        }
      : {}),
  }
}

export function registerFragment(fragment: FragmentDef): FragmentDef {
  const issues = validateFragmentDef(fragment)
  if (issues.length > 0) throw new Error(issues.map(issue => issue.message).join('；'))
  const stored = cloneFragment(fragment)
  const digest = computeFragmentDigest(stored)
  registeredFragments.set(stored.id, stored)
  if (!registeredFragmentsByDigest.has(digest)) {
    registeredFragmentsByDigest.set(digest, stored)
  }
  return cloneFragment(stored)
}

export function unregisterFragment(id: string): boolean {
  const deleted = registeredFragments.delete(id)
  for (const [digest, fragment] of registeredFragmentsByDigest) {
    if (fragment.id === id) registeredFragmentsByDigest.delete(digest)
  }
  return deleted
}

export function listFragments(): FragmentDef[] {
  const merged = new Map(FRAGMENTS.map(fragment => [fragment.id, fragment]))
  for (const fragment of registeredFragments.values()) merged.set(fragment.id, fragment)
  return [...merged.values()].map(cloneFragment)
}

export function getFragment(id: string): FragmentDef | undefined {
  const fragment = registeredFragments.get(id) ?? FRAGMENTS.find(candidate => candidate.id === id)
  return fragment ? cloneFragment(fragment) : undefined
}

export function getFragmentDigest(id: string): string | undefined {
  const fragment = registeredFragments.get(id) ?? FRAGMENTS.find(candidate => candidate.id === id)
  return fragment ? computeFragmentDigest(fragment) : undefined
}

/**
 * Resolve immutable content selected by a plan. Re-registering the same display
 * id cannot silently redirect an already-authored command to different bytes.
 */
export function getFragmentByDigest(digest: string): FragmentDef | undefined {
  const registered = registeredFragmentsByDigest.get(digest)
  if (registered) return cloneFragment(registered)
  const bundled = FRAGMENTS.find(fragment => computeFragmentDigest(fragment) === digest)
  return bundled ? cloneFragment(bundled) : undefined
}

export { computeFragmentDigest }
