import { genId } from './utils'
import type { Atom, Bond, Molecule } from './molecule'
import { inferBonds, newBond } from './molecule'

function makeMol(name: string, atomDefs: [string, number, number, number][]): Molecule {
  const atoms = atomDefs.map(([symbol, x, y, z]) => ({
    id: genId(), symbol, x, y, z,
  }))
  return { name, atoms, bonds: inferBonds(atoms) }
}

export const SAMPLE_MOLECULES: { name: string; mol: () => Molecule }[] = [
  {
    name: '水 (H₂O)',
    mol: () => makeMol('H2O', [
      ['O',  0.000,  0.000,  0.000],
      ['H',  0.757,  0.586,  0.000],
      ['H', -0.757,  0.586,  0.000],
    ]),
  },
  {
    name: '甲烷 (CH₄)',
    mol: () => makeMol('CH4', [
      ['C',  0.000,  0.000,  0.000],
      ['H',  0.629,  0.629,  0.629],
      ['H', -0.629, -0.629,  0.629],
      ['H', -0.629,  0.629, -0.629],
      ['H',  0.629, -0.629, -0.629],
    ]),
  },
  {
    name: '乙醇 (C₂H₅OH)',
    mol: () => makeMol('Ethanol', [
      ['C', -1.204,  0.046, -0.000],
      ['C',  0.274,  0.046, -0.000],
      ['O',  0.830,  1.342,  0.000],
      ['H', -1.572,  1.072, -0.000],
      ['H', -1.572, -0.480,  0.889],
      ['H', -1.572, -0.480, -0.889],
      ['H',  0.630, -0.489,  0.889],
      ['H',  0.630, -0.489, -0.889],
      ['H',  1.793,  1.342,  0.000],
    ]),
  },
  {
    name: '苯 (C₆H₆)',
    mol: () => {
      const r = 1.40, rh = 2.49
      const atoms: Atom[] = []
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3
        atoms.push({ id: genId(), symbol: 'C', x: r * Math.cos(a), y: r * Math.sin(a), z: 0 })
        atoms.push({ id: genId(), symbol: 'H', x: rh * Math.cos(a), y: rh * Math.sin(a), z: 0 })
      }
      const bonds: Bond[] = []
      for (let i = 0; i < 6; i++) {
        const c = atoms[i * 2]
        const h = atoms[i * 2 + 1]
        const nextC = atoms[((i + 1) % 6) * 2]
        if (!c || !h || !nextC) throw new Error('Invalid benzene atom layout')
        bonds.push({ ...newBond(c.id, nextC.id, 1), aromatic: true })
        bonds.push(newBond(c.id, h.id, 1))
      }
      return { name: 'Benzene', atoms, bonds }
    },
  },
  {
    name: 'CO₂',
    mol: () => makeMol('CO2', [
      ['O', -1.16, 0, 0],
      ['C',  0.00, 0, 0],
      ['O',  1.16, 0, 0],
    ]),
  },
  {
    name: '氨 (NH₃)',
    mol: () => makeMol('NH3', [
      ['N',  0.000,  0.000,  0.116],
      ['H',  0.000,  0.939, -0.271],
      ['H',  0.813, -0.470, -0.271],
      ['H', -0.813, -0.470, -0.271],
    ]),
  },
]
