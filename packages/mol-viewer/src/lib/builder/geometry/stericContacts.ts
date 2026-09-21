import type { Molecule } from '../../model/types'
import { clashDistanceThreshold } from './clash'
import { ClashSpatialIndex } from './clashSpatialIndex'

/** Demo contact policy, not a force field or a chemical-validity verdict. */
export const STERIC_POLICY_VERSION = 'ch-contact-v1' as const
const CONTACT_RADII: Readonly<Record<string, number>> = { C: 1.70, H: 1.20 }
export interface StericContact {
  readonly atomId1: string
  readonly atomId2: string
  readonly distance: number
  readonly hardThreshold: number
  readonly contactThreshold: number
  readonly overlap: number
  readonly separation: 'three-bonds' | 'nonlocal'
  readonly severity: 'warning' | 'error'
}
export interface StericReport {
  readonly policyVersion: typeof STERIC_POLICY_VERSION
  readonly unit: 'angstrom'
  readonly scope: 'all-nonbonded-pairs'
  readonly supported: boolean
  readonly hydrogenCoverage: 'complete' | 'incomplete'
  readonly issues: readonly string[]
  readonly contacts: readonly StericContact[]
  readonly hardClashCount: number
  readonly crowdingScore: number
}

/** C/H-only heuristic. 1-2 and 1-3 pairs are omitted; 1-4 pairs are warnings only. */
export function analyzeStericContacts(molecule: Molecule): StericReport {
  const atoms = [...molecule.atoms].sort((a, b) => a.id.localeCompare(b.id))
  const adjacency = new Map(atoms.map(a => [a.id, new Set<string>()]))
  const valence = new Map(atoms.map(a => [a.id, 0]))
  const issues: string[] = []
  if (adjacency.size !== atoms.length) issues.push('原子 ID 重复')
  if (new Set(molecule.bonds.map(b => b.id)).size !== molecule.bonds.length) issues.push('键 ID 重复')
  for (const atom of atoms) {
    if (!Object.hasOwn(CONTACT_RADII, atom.symbol)) issues.push(`未支持元素：${atom.symbol}`)
    if (![atom.x, atom.y, atom.z].every(Number.isFinite)) issues.push(`坐标无效：${atom.id}`)
    if (atom.charge || atom.radical) issues.push(`暂不支持带电或自由基原子：${atom.id}`)
  }
  const pairs = new Set<string>()
  for (const bond of molecule.bonds) {
    const key = JSON.stringify([bond.atomId1, bond.atomId2].sort())
    if (!adjacency.has(bond.atomId1) || !adjacency.has(bond.atomId2) || bond.atomId1 === bond.atomId2 || pairs.has(key) || ![1, 2, 3].includes(bond.order)) {
      issues.push(`键连接无效：${bond.id}`); continue
    }
    pairs.add(key)
    adjacency.get(bond.atomId1)!.add(bond.atomId2)
    adjacency.get(bond.atomId2)!.add(bond.atomId1)
    valence.set(bond.atomId1, valence.get(bond.atomId1)! + bond.order)
    valence.set(bond.atomId2, valence.get(bond.atomId2)! + bond.order)
  }
  const complete = atoms.every(a => valence.get(a.id) === (a.symbol === 'C' ? 4 : 1))
  const contacts: StericContact[] = []
  if (!issues.length) {
    const grid = new ClashSpatialIndex(atoms)
    for (const a of atoms) {
      const depths = new Map<string, number>([[a.id, 0]])
      let frontier = [a.id]
      for (let depth = 1; depth <= 3; depth++) {
        const next: string[] = []
        for (const id of frontier) for (const neighbor of adjacency.get(id)!) {
          if (!depths.has(neighbor)) { depths.set(neighbor, depth); next.push(neighbor) }
        }
        frontier = next
      }
      for (const b of grid.nearby(a, CONTACT_RADII[a.symbol]! + 1.70)) {
        if (a.id.localeCompare(b.id) >= 0 || (depths.get(b.id) ?? Infinity) <= 2) continue
        const distance = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
        const contactThreshold = CONTACT_RADII[a.symbol]! + CONTACT_RADII[b.symbol]!
        if (distance >= contactThreshold) continue
        const hardThreshold = clashDistanceThreshold(a.symbol, b.symbol)
        const separation = depths.get(b.id) === 3 ? 'three-bonds' : 'nonlocal'
        contacts.push({ atomId1: a.id, atomId2: b.id, distance, hardThreshold, contactThreshold,
          overlap: contactThreshold - distance, separation,
          severity: separation === 'nonlocal' && distance < hardThreshold ? 'error' : 'warning' })
      }
    }
  }
  contacts.sort((a, b) => a.atomId1.localeCompare(b.atomId1) || a.atomId2.localeCompare(b.atomId2))
  return { policyVersion: STERIC_POLICY_VERSION, unit: 'angstrom', scope: 'all-nonbonded-pairs',
    supported: !issues.length, hydrogenCoverage: complete ? 'complete' : 'incomplete', issues,
    contacts, hardClashCount: contacts.filter(c => c.severity === 'error').length,
    crowdingScore: contacts.reduce((sum, c) => sum + c.overlap ** 2, 0) }
}
