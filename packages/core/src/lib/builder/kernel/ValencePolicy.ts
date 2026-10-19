import type { Atom, Bond, Molecule } from '../../molecule'
import {
  availableMaxValenceByBonds,
  availableValence,
  bondValence,
  maxValence,
  targetValence,
  valenceUsed,
  valenceUsedByBonds,
} from '../valence'
import type { GraphIndex } from './GraphIndex'

export interface CanAddBondResult {
  readonly ok: boolean
  readonly reason?: string
}

/**
 * Shared valence policy for builder operations.
 *
 * targetValence is the hydrogen saturation target. maxValence is the hard
 * bonding capacity. Keeping both behind this policy makes the distinction
 * explicit at call sites.
 */
export class ValencePolicy {
  readonly graph: GraphIndex

  constructor(graph: GraphIndex) {
    this.graph = graph
  }

  bondValence(bond: Bond): number {
    return bondValence(bond)
  }

  used(atomId: string): number {
    return valenceUsed(this.graph.molecule, atomId)
  }

  usedByBonds(atomId: string): number {
    return valenceUsedByBonds(this.graph.molecule.bonds, atomId)
  }

  max(atom: Atom): number {
    return maxValence(atom)
  }

  hydrogenTarget(atom: Atom): number {
    return targetValence(atom)
  }

  availableForHydrogen(molecule: Molecule, atom: Atom): number {
    return availableValence(molecule, atom)
  }

  availableForBond(atom: Atom): number {
    return availableMaxValenceByBonds(atom, this.graph.molecule.bonds)
  }

  canAddBond(atom1: Atom, atom2: Atom, order: 1 | 2 | 3 = 1): CanAddBondResult {
    if (atom1.id === atom2.id) return { ok: false, reason: '不能与自身成键' }
    if (this.graph.findBond(atom1.id, atom2.id)) return { ok: false, reason: '两原子之间已存在键' }

    const available1 = this.availableForBond(atom1)
    const available2 = this.availableForBond(atom2)
    if (available1 < order) return { ok: false, reason: `${atom1.symbol} 已达最大键数 (${this.max(atom1)})` }
    if (available2 < order) return { ok: false, reason: `${atom2.symbol} 已达最大键数 (${this.max(atom2)})` }

    return { ok: true }
  }
}
