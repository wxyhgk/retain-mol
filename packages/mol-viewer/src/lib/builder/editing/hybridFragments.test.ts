import { describe, it, expect } from 'vitest'
import { placeFragmentStandalone, attachFragmentToAtom } from './fragmentOps'
import { getFragment } from '../fragmentLibrary'
import type { Molecule } from '../../molecule'

const methyl    = getFragment('c-sp3')!   // –C 四面体，放空白 = CH4（attachOrder 1）
const carbonyl  = getFragment('o-sp2')!   // =O   attachOrder 2
const methylene = getFragment('c-sp2')!   // =C   attachOrder 2（=CH₂）
const ethynyl   = getFragment('c-sp')!    // ≡C   attachOrder 3（≡CH）

const place = (frag = methyl): Molecule =>
  placeFragmentStandalone({ atoms: [], bonds: [] }, frag, { x: 0, y: 0, z: 0 })

const firstH = (mol: Molecule) => mol.atoms.find(a => a.symbol === 'H')!.id

function bondBetween(mol: Molecule, s1: string, s2: string) {
  const byId = new Map(mol.atoms.map(a => [a.id, a]))
  return mol.bonds.find(b => {
    const a = byId.get(b.atomId1)!.symbol, c = byId.get(b.atomId2)!.symbol
    return (a === s1 && c === s2) || (a === s2 && c === s1)
  })
}
function neighborsOfSymbol(mol: Molecule, id: string, sym: string) {
  const byId = new Map(mol.atoms.map(a => [a.id, a]))
  return mol.bonds.filter(b => {
    const other = b.atomId1 === id ? b.atomId2 : b.atomId2 === id ? b.atomId1 : null
    return other !== null && byId.get(other)!.symbol === sym
  }).length
}

describe('杂化片段 attachOrder（GaussView 式双/三键接桩）', () => {
  it('羰基 =O 接到碳上 → C=O 双键（order 2），O 不带 H', () => {
    const methane = place()
    const r = attachFragmentToAtom(methane, carbonyl, firstH(methane))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(bondBetween(r.molecule, 'C', 'O')?.order).toBe(2)
    const oId = r.molecule.atoms.find(a => a.symbol === 'O')!.id
    expect(neighborsOfSymbol(r.molecule, oId, 'H')).toBe(0)   // 羰基氧无 H
  })

  it('亚甲基 =CH₂ 接碳 → C=C 双键，新碳带 2 个 H', () => {
    const methane = place()
    const r = attachFragmentToAtom(methane, methylene, firstH(methane))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const cc = bondBetween(r.molecule, 'C', 'C')
    expect(cc?.order).toBe(2)
    // 新加入的碳（=CH₂ 的中心）带 2 个 H
    const newC = r.molecule.atoms.filter(a => a.symbol === 'C')
      .map(a => a.id).find(id => neighborsOfSymbol(r.molecule, id, 'H') === 2)
    expect(newC).toBeDefined()
  })

  it('炔基 ≡CH 接碳 → C≡C 三键', () => {
    const methane = place()
    const r = attachFragmentToAtom(methane, ethynyl, firstH(methane))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(bondBetween(r.molecule, 'C', 'C')?.order).toBe(3)
  })

  it('现有单键片段（甲基）attachOrder 默认 1 → 所有 C–C 仍是单键（零行为变化）', () => {
    const methane = place()
    const r = attachFragmentToAtom(methane, methyl, firstH(methane))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const byId = new Map(r.molecule.atoms.map(a => [a.id, a]))
    const cc = r.molecule.bonds.filter(b =>
      byId.get(b.atomId1)!.symbol === 'C' && byId.get(b.atomId2)!.symbol === 'C')
    expect(cc.length).toBe(1)
    expect(cc.every(b => b.order === 1)).toBe(true)
  })
})
