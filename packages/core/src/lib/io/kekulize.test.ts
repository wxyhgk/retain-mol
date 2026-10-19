import { describe, it, expect } from 'vitest'
import { newAtom, newBond } from '../molecule'
import type { Atom, Bond, Molecule } from '../molecule'
import { kekulizeAromaticBonds } from './kekulize'

function ringAtoms(n: number, symbol = 'C'): Atom[] {
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2
    return newAtom(symbol, Math.cos(angle), Math.sin(angle), 0)
  })
}

function aromaticRing(n: number): { atoms: Atom[]; bonds: Bond[] } {
  const atoms = ringAtoms(n)
  const bonds = atoms.map((a, i) => ({
    ...newBond(a.id, atoms[(i + 1) % n]!.id, 1),
    aromatic: true,
  }))
  return { atoms, bonds }
}

function ordersAround(ring: Atom[], override: Map<string, 1 | 2>, bonds: Bond[]): (1 | 2 | undefined)[] {
  return ring.map((a, i) => {
    const next = ring[(i + 1) % ring.length]!
    const bond = bonds.find(
      b =>
        (b.atomId1 === a.id && b.atomId2 === next.id) ||
        (b.atomId1 === next.id && b.atomId2 === a.id),
    )
    return bond ? override.get(bond.id) : undefined
  })
}

describe('kekulizeAromaticBonds', () => {
  it('无芳香键 → 空表', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.4, 0, 0)
    const mol: Molecule = { atoms: [c1, c2], bonds: [newBond(c1.id, c2.id, 2)] }
    expect(kekulizeAromaticBonds(mol).size).toBe(0)
  })

  it('苯单环 → 3 个交替双键，每碳恰 1 个', () => {
    const { atoms, bonds } = aromaticRing(6)
    const override = kekulizeAromaticBonds({ atoms, bonds })
    expect(override.size).toBe(6)
    const orders = ordersAround(atoms, override, bonds)
    expect(orders.every(o => o === 1 || o === 2)).toBe(true)
    for (let i = 0; i < 6; i += 1) {
      expect(orders[i]).not.toBe(orders[(i + 1) % 6])
    }
  })

  it('并环共享边只赋值一次，两环各自交替', () => {
    // 萘式骨架：左环 a0..a5，右环共用边 a2-a3
    const left = ringAtoms(6)
    const [a0, a1, a2, a3, a4, a5] = left as [Atom, Atom, Atom, Atom, Atom, Atom]
    const extra = ringAtoms(4)
    const [b1, b2, b3, b4] = extra as [Atom, Atom, Atom, Atom]
    const right = [a2!, a3!, b1!, b2!, b3!, b4!]
    const atoms = [...left, ...extra]
    const aro = (x: Atom, y: Atom): Bond => ({ ...newBond(x.id, y.id, 1), aromatic: true })
    const bonds = [
      aro(a0!, a1!), aro(a1!, a2!), aro(a2!, a3!), aro(a3!, a4!), aro(a4!, a5!), aro(a5!, a0!),
      aro(a3!, b1!), aro(b1!, b2!), aro(b2!, b3!), aro(b3!, b4!), aro(b4!, a2!),
    ]
    const override = kekulizeAromaticBonds({ atoms, bonds })
    for (const ring of [left, right]) {
      const orders = ordersAround(ring, override, bonds)
      expect(orders.every(o => o === 1 || o === 2)).toBe(true)
      for (let i = 0; i < ring.length; i += 1) {
        expect(orders[i]).not.toBe(orders[(i + 1) % ring.length])
      }
    }
  })

  it('已有外挂双键的原子不再分配环双键', () => {
    const { atoms, bonds } = aromaticRing(6)
    const oxo = newAtom('O', 3, 0, 0)
    const withDouble: Molecule = {
      atoms: [...atoms, oxo],
      bonds: [...bonds, newBond(atoms[0]!.id, oxo.id, 2)],
    }
    const override = kekulizeAromaticBonds(withDouble)
    const incident = withDouble.bonds.filter(
      b => b.atomId1 === atoms[0]!.id || b.atomId2 === atoms[0]!.id,
    )
    for (const b of incident) {
      expect(override.get(b.id) ?? 1).toBe(1)
    }
  })

  it('奇元环不抛、尽量排（五元环 2 个双键）', () => {
    const { atoms, bonds } = aromaticRing(5)
    const override = kekulizeAromaticBonds({ atoms, bonds })
    const doubles = [...override.values()].filter(o => o === 2)
    expect(doubles).toHaveLength(2)
  })
})
