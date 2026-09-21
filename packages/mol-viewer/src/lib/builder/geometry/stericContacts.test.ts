import { describe, it, expect } from 'vitest'
import type { Molecule } from '../../model/types'
import { analyzeStericContacts } from './stericContacts'
import { clashDistanceThreshold } from './clash'

describe('steric contacts', () => {
  it('distinguishes nonlocal overlaps, short graph neighbors, and 1-4 warnings', () => {
    const atoms = [0, 1, 2, 3, 4].map(i => ({ id: String(i), symbol: 'C', x: 0, y: 0, z: 0 }))
    const bonds = [0, 1, 2].map(i => ({ id: `b${i}`, atomId1: String(i), atomId2: String(i + 1), order: 1 as const }))
    const result = analyzeStericContacts({ atoms, bonds })
    expect(result.contacts.find(c => c.atomId1 === '0' && c.atomId2 === '1')).toBeUndefined()
    expect(result.contacts.find(c => c.atomId1 === '0' && c.atomId2 === '2')).toBeUndefined()
    expect(result.contacts.find(c => c.atomId1 === '0' && c.atomId2 === '3')?.severity).toBe('warning')
    expect(result.contacts.find(c => c.atomId1 === '0' && c.atomId2 === '4')?.severity).toBe('error')
    expect(result.hydrogenCoverage).toBe('incomplete')
  })
  it('reports unsupported elements, corrupt topology, and nonfinite coordinates explicitly', () => {
    const atom = { id: 'x', symbol: 'Fe', x: NaN, y: 0, z: 0 }
    const report = analyzeStericContacts({ atoms: [atom], bonds: [{ id: 'b', atomId1: 'x', atomId2: 'missing', order: 1 }] })
    expect(report.supported).toBe(false)
    expect(report.issues.length).toBeGreaterThanOrEqual(3)
    expect(report.contacts).toEqual([])
  })
  it('matches brute force for 150 atoms and is independent of input ordering', () => {
    const molecule: Molecule = { atoms: Array.from({ length: 150 }, (_, i) => ({
      id: `a${String(i).padStart(3, '0')}`, symbol: i % 2 ? 'C' : 'H',
      x: Math.sin(i * 13.7) * 8, y: Math.cos(i * 2.9) * 8, z: Math.sin(i * 5.3) * 8,
    })), bonds: [] }
    const expected: string[] = []
    for (let i = 0; i < molecule.atoms.length; i++) for (let j = i + 1; j < molecule.atoms.length; j++) {
      const a = molecule.atoms[i]!, b = molecule.atoms[j]!
      const d = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
      const threshold = (a.symbol === 'C' ? 1.7 : 1.2) + (b.symbol === 'C' ? 1.7 : 1.2)
      if (d < threshold) expected.push(`${a.id}:${b.id}:${d < clashDistanceThreshold(a.symbol, b.symbol) ? 'error' : 'warning'}`)
    }
    const report = analyzeStericContacts(molecule)
    expect(report.contacts.map(c => `${c.atomId1}:${c.atomId2}:${c.severity}`).sort()).toEqual(expected.sort())
    expect(analyzeStericContacts({ ...molecule, atoms: [...molecule.atoms].reverse() })).toEqual(report)
  })
})
