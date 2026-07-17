import { describe, expect, it } from 'vitest'
import type { Molecule } from '../molecule'
import { newAtom, newBond } from '../molecule'
import { depictMolecule2D } from './depict'

function water(): Molecule {
  const o = newAtom('O', 0, 0, 0)
  const h1 = newAtom('H', 0.96, 0, 0)
  const h2 = newAtom('H', -0.24, 0.93, 0)
  return { name: 'water', atoms: [o, h1, h2], bonds: [newBond(o.id, h1.id, 1), newBond(o.id, h2.id, 1)] }
}

function benzene(): Molecule {
  const atoms = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI) / 3
    return newAtom('C', Math.cos(angle) * 1.39, Math.sin(angle) * 1.39, 0)
  })
  const bonds = atoms.map((atom, i) => {
    const next = atoms[(i + 1) % 6]!
    return newBond(atom.id, next.id, i % 2 === 0 ? 2 : 1)
  })
  return { name: 'benzene', atoms, bonds }
}

describe('depictMolecule2D', () => {
  it('renders an svg with theme-aware skeleton colors', () => {
    const svg = depictMolecule2D(benzene())
    expect(svg).toContain('<svg')
    expect(svg).toContain('currentColor')
    expect(svg).not.toMatch(/rgb\(0,0,0\)/)
  })

  it('keeps heteroatom colors while theming the skeleton', () => {
    const svg = depictMolecule2D(water())
    // O 的元素色（红系）应保留，不被 currentColor 覆盖
    expect(svg).toContain('<svg')
    expect(svg.includes('rgb(255,') || svg.includes('#ff') || svg.includes('red')).toBe(true)
  })

  it('respects size, id, and non-themed output', () => {
    const svg = depictMolecule2D(benzene(), { width: 100, height: 80, id: 'card-1', themeAware: false })
    expect(svg).toContain('card-1')
    expect(svg).not.toContain('currentColor')
  })

  it('returns an empty placeholder for empty molecules', () => {
    const svg = depictMolecule2D({ atoms: [], bonds: [] })
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
  })
})
