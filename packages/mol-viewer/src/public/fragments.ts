import { FRAGMENTS, type FragmentAtom, type FragmentBond, type FragmentDef } from '../lib/builder/fragmentLibrary'

export type PublicFragmentDef =
  Readonly<Omit<FragmentDef, 'atoms' | 'bonds' | 'attachBond'>> & {
    readonly atoms: readonly Readonly<FragmentAtom>[]
    readonly bonds: readonly Readonly<FragmentBond>[]
    readonly attachBond?: readonly [number, number]
  }

export interface FragmentSummary {
  readonly id: string
  readonly name: string
  readonly short: string
  readonly formula: string
  readonly group?: FragmentDef['group']
  readonly attachOrder?: FragmentDef['attachOrder']
  readonly atomCount: number
  readonly bondCount: number
}

function toPublicFragment(fragment: FragmentDef): PublicFragmentDef {
  return {
    ...fragment,
    atoms: fragment.atoms.map(atom => ({ ...atom })),
    bonds: fragment.bonds.map(bond => ({ ...bond })),
    attachBond: fragment.attachBond ? [...fragment.attachBond] : undefined,
  }
}

function toFragmentSummary(fragment: FragmentDef): FragmentSummary {
  return {
    id: fragment.id,
    name: fragment.name,
    short: fragment.short,
    formula: fragment.formula,
    group: fragment.group,
    attachOrder: fragment.attachOrder,
    atomCount: fragment.atoms.length,
    bondCount: fragment.bonds.length,
  }
}

export function listFragments(): readonly PublicFragmentDef[] {
  return FRAGMENTS.map(toPublicFragment)
}

export function listFragmentSummaries(): readonly FragmentSummary[] {
  return FRAGMENTS.map(toFragmentSummary)
}

export function getFragment(id: string): PublicFragmentDef | undefined {
  const fragment = FRAGMENTS.find(item => item.id === id)
  return fragment ? toPublicFragment(fragment) : undefined
}

export function getFragmentSummary(id: string): FragmentSummary | undefined {
  const fragment = FRAGMENTS.find(item => item.id === id)
  return fragment ? toFragmentSummary(fragment) : undefined
}
