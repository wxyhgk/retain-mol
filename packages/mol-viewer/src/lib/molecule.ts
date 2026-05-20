import { genId } from './utils'
export interface Atom {
  readonly id: string
  readonly symbol: string
  readonly x: number
  readonly y: number
  readonly z: number
  readonly charge?: number
  readonly label?: string
}

export interface Bond {
  readonly id: string
  readonly atomId1: string
  readonly atomId2: string
  readonly order: 1 | 2 | 3
  readonly aromatic?: boolean
}

export interface Molecule {
  readonly atoms: readonly Atom[]
  readonly bonds: readonly Bond[]
  readonly name?: string
}

export function parseXYZ(text: string): Molecule {
  const lines = text.trim().split('\n')
  const count = parseInt(lines[0].trim())
  const name = lines[1]?.trim() || 'molecule'
  const atoms: Atom[] = []

  for (let i = 2; i < 2 + count && i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/)
    if (parts.length >= 4) {
      atoms.push({
        id: genId(),
        symbol: parts[0],
        x: parseFloat(parts[1]),
        y: parseFloat(parts[2]),
        z: parseFloat(parts[3]),
      })
    }
  }

  const bonds = inferBonds(atoms)
  return { atoms, bonds, name }
}

export function exportXYZ(mol: Molecule): string {
  const lines = [String(mol.atoms.length), mol.name ?? 'molecule']
  for (const a of mol.atoms) {
    lines.push(`${a.symbol.padEnd(4)} ${a.x.toFixed(6).padStart(12)} ${a.y.toFixed(6).padStart(12)} ${a.z.toFixed(6).padStart(12)}`)
  }
  return lines.join('\n')
}

import { BONDING, BOND_RADII } from '../config/bonding.config'

function bondRadius(sym: string) {
  return BOND_RADII[sym] ?? BOND_RADII.default
}

export function inferBonds(atoms: readonly Atom[]): Bond[] {
  const bonds: Bond[] = []

  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const a = atoms[i], b = atoms[j]
      const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      const maxBond = (bondRadius(a.symbol) + bondRadius(b.symbol)) * BONDING.tolerance
      if (dist < maxBond && dist > BONDING.minBondLength) {
        bonds.push({ id: genId(), atomId1: a.id, atomId2: b.id, order: 1 })
      }
    }
  }
  return bonds
}

export function newAtom(symbol: string, x = 0, y = 0, z = 0): Atom {
  return { id: genId(), symbol, x, y, z }
}

export function newBond(atomId1: string, atomId2: string, order: 1 | 2 | 3 = 1): Bond {
  return { id: genId(), atomId1, atomId2, order }
}

export function centerMolecule(mol: Molecule): Molecule {
  if (mol.atoms.length === 0) return mol
  const cx = mol.atoms.reduce((s, a) => s + a.x, 0) / mol.atoms.length
  const cy = mol.atoms.reduce((s, a) => s + a.y, 0) / mol.atoms.length
  const cz = mol.atoms.reduce((s, a) => s + a.z, 0) / mol.atoms.length
  return {
    ...mol,
    atoms: mol.atoms.map(a => ({ ...a, x: a.x - cx, y: a.y - cy, z: a.z - cz })),
  }
}

export function shiftMolecule(mol: Molecule, dx: number, dy: number, dz: number): Molecule {
  if (dx === 0 && dy === 0 && dz === 0) return mol
  return {
    ...mol,
    atoms: mol.atoms.map(a => ({ ...a, x: a.x + dx, y: a.y + dy, z: a.z + dz })),
  }
}
