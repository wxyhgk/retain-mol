import { validateFragmentDef } from '../kernel/FragmentValidator'
import { FRAGMENTS } from './catalog'
import type { FragmentDef } from './model'

const registeredFragments = new Map<string, FragmentDef>()

function cloneFragment(fragment: FragmentDef): FragmentDef {
  return {
    ...fragment,
    atoms: fragment.atoms.map(atom => ({ ...atom })),
    bonds: fragment.bonds.map(bond => ({ ...bond })),
    ...(fragment.attachBond ? { attachBond: [...fragment.attachBond] } : {}),
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
  registeredFragments.set(stored.id, stored)
  return cloneFragment(stored)
}

export function unregisterFragment(id: string): boolean {
  return registeredFragments.delete(id)
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
