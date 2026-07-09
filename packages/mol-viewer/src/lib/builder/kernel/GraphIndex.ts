import type { Atom, Bond, Molecule } from '../../molecule'

function pairKey(id1: string, id2: string): string {
  return id1 < id2 ? `${id1}\0${id2}` : `${id2}\0${id1}`
}

/**
 * Read-only indexed view over a molecule graph.
 *
 * This is the aggregation point for repeated atom/bond lookup logic. Editing
 * algorithms should prefer this over ad-hoc atoms.find / bonds.filter scans
 * when they need several graph queries in one operation.
 */
export class GraphIndex {
  readonly molecule: Molecule

  private readonly atomById = new Map<string, Atom>()
  private readonly bondById = new Map<string, Bond>()
  private readonly bondsByAtom = new Map<string, Bond[]>()
  private readonly firstBondByPair = new Map<string, Bond>()

  constructor(molecule: Molecule) {
    this.molecule = molecule
    for (const atom of molecule.atoms) {
      this.atomById.set(atom.id, atom)
      this.bondsByAtom.set(atom.id, [])
    }
    for (const bond of molecule.bonds) {
      this.bondById.set(bond.id, bond)
      if (!this.bondsByAtom.has(bond.atomId1)) this.bondsByAtom.set(bond.atomId1, [])
      if (!this.bondsByAtom.has(bond.atomId2)) this.bondsByAtom.set(bond.atomId2, [])
      this.bondsByAtom.get(bond.atomId1)!.push(bond)
      this.bondsByAtom.get(bond.atomId2)!.push(bond)
      const key = pairKey(bond.atomId1, bond.atomId2)
      if (!this.firstBondByPair.has(key)) this.firstBondByPair.set(key, bond)
    }
  }

  atom(atomId: string): Atom | undefined {
    return this.atomById.get(atomId)
  }

  bond(bondId: string): Bond | undefined {
    return this.bondById.get(bondId)
  }

  hasAtom(atomId: string): boolean {
    return this.atomById.has(atomId)
  }

  hasBond(bondId: string): boolean {
    return this.bondById.has(bondId)
  }

  bondsOf(atomId: string): readonly Bond[] {
    return this.bondsByAtom.get(atomId) ?? []
  }

  degree(atomId: string): number {
    return this.bondsOf(atomId).length
  }

  otherEnd(bond: Bond, atomId: string): string | null {
    if (bond.atomId1 === atomId) return bond.atomId2
    if (bond.atomId2 === atomId) return bond.atomId1
    return null
  }

  findBond(id1: string, id2: string): Bond | undefined {
    return this.firstBondByPair.get(pairKey(id1, id2))
  }

  neighborsOf(atomId: string): Atom[] {
    const out: Atom[] = []
    for (const bond of this.bondsOf(atomId)) {
      const otherId = this.otherEnd(bond, atomId)
      if (!otherId) continue
      const atom = this.atomById.get(otherId)
      if (atom) out.push(atom)
    }
    return out
  }

  hNeighborsOf(atomId: string): Atom[] {
    return this.neighborsOf(atomId).filter(atom => atom.symbol === 'H')
  }

  hParentOf(hId: string): { parent: Atom; bond: Bond } | null {
    const h = this.atom(hId)
    if (!h || h.symbol !== 'H') return null
    const bond = this.bondsOf(hId)[0]
    if (!bond) return null
    const parentId = this.otherEnd(bond, hId)
    if (!parentId) return null
    const parent = this.atom(parentId)
    return parent ? { parent, bond } : null
  }

  hParentsOf(hId: string): Array<{ parent: Atom; bond: Bond }> {
    const h = this.atom(hId)
    if (!h || h.symbol !== 'H') return []
    const out: Array<{ parent: Atom; bond: Bond }> = []
    for (const bond of this.bondsOf(hId)) {
      const parentId = this.otherEnd(bond, hId)
      const parent = parentId ? this.atom(parentId) : undefined
      if (parent) out.push({ parent, bond })
    }
    return out
  }

  isSlotHydrogen(atomId: string): boolean {
    const atom = this.atom(atomId)
    return !!atom && atom.symbol === 'H' && this.degree(atomId) > 0
  }
}

export function createGraphIndex(molecule: Molecule): GraphIndex {
  return new GraphIndex(molecule)
}
