import { genId } from './model/identity'
// 核心类型定义在叶子层 model/types.ts（config 也要用，避免 lib⇄config 循环）；
// 这里 re-export 保持既有 import 路径兼容
import type { Atom, Bond, Molecule } from './model/types'
export type { Atom, Bond, Molecule }

export function parseXYZ(text: string): Molecule {
  const lines = text.trim().split('\n')
  const count = parseInt(lines[0]?.trim() ?? '0')
  const name = lines[1]?.trim() || 'molecule'
  const atoms: Atom[] = []

  for (let i = 2; i < 2 + count && i < lines.length; i++) {
    const parts = lines[i]?.trim().split(/\s+/) ?? []
    if (parts.length >= 4) {
      const [symbol, x, y, z] = parts
      if (symbol === undefined || x === undefined || y === undefined || z === undefined) continue
      atoms.push({
        id: genId(),
        symbol,
        x: parseFloat(x),
        y: parseFloat(y),
        z: parseFloat(z),
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

import { BONDING } from '../config/bonding.config'
import { getElementData } from './model/elements'
import { lookupBondLengthByOrder } from '../config/geometry.config'

function inferBondOrder(sym1: string, sym2: string, dist: number): 1 | 2 | 3 {
  const d1 = lookupBondLengthByOrder(sym1, sym2, 1)!
  const d2 = lookupBondLengthByOrder(sym1, sym2, 2)
  const d3 = lookupBondLengthByOrder(sym1, sym2, 3)
  const bias = BONDING.orderMidpointBias
  if (d3 !== null && d2 !== null && dist <= (d2 + d3) / 2 - bias) return 3
  if (d2 !== null && dist <= (d1 + d2) / 2 - bias) return 2
  return 1
}

export function inferBonds(atoms: readonly Atom[]): Bond[] {
  const bonds: Bond[] = []

  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const a = atoms[i], b = atoms[j]
      if (a === undefined || b === undefined) continue
      const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      const r1 = getElementData(a.symbol).covalentRadius
      const r2 = getElementData(b.symbol).covalentRadius
      const maxBond = (r1 + r2) * BONDING.tolerance
      if (dist < maxBond && dist > BONDING.minBondLength) {
        const order = inferBondOrder(a.symbol, b.symbol, dist)
        bonds.push({ id: genId(), atomId1: a.id, atomId2: b.id, order })
      }
    }
  }
  return bonds
}

export function newAtom(symbol: string, x = 0, y = 0, z = 0): Atom {
  return { id: genId(), symbol, x, y, z }
}

export function newBond(
  atomId1: string,
  atomId2: string,
  order: 1 | 2 | 3 = 1,
  init?: Pick<Bond, 'wedge' | 'ez' | 'aromatic'>,
): Bond {
  return { id: genId(), atomId1, atomId2, order, ...init }
}

export function centerMolecule(mol: Molecule): Molecule {
  if (mol.atoms.length === 0) return mol
  const cx = mol.atoms.reduce((s, a) => s + a.x, 0) / mol.atoms.length
  const cy = mol.atoms.reduce((s, a) => s + a.y, 0) / mol.atoms.length
  const cz = mol.atoms.reduce((s, a) => s + a.z, 0) / mol.atoms.length
  if (Math.max(Math.abs(cx), Math.abs(cy), Math.abs(cz)) <= 1e-10) return mol
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
