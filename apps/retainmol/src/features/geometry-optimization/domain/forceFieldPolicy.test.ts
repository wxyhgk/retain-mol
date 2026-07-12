import type { Molecule } from '@retainmol/mol-viewer/core'
import { describe, expect, it } from 'vitest'
import { selectFastForceField } from './forceFieldPolicy'

function molecule(symbols: string[]): Molecule {
  return {
    name: 'test',
    atoms: symbols.map((symbol, index) => ({
      id: `a${index}`,
      symbol,
      x: index,
      y: 0,
      z: 0,
    })),
    bonds: [],
  }
}

describe('selectFastForceField', () => {
  it('uses MMFF94 for a small supported organic molecule', () => {
    expect(selectFastForceField(molecule(['C', 'C', 'H', 'O']))).toBe('MMFF94')
  })

  it('uses UFF for boron and large molecules', () => {
    expect(selectFastForceField(molecule(['B', 'N']))).toBe('UFF')
    expect(selectFastForceField(molecule(Array.from({ length: 80 }, () => 'C')))).toBe('UFF')
  })
})
