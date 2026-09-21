import { BONDING } from '../../../config/bonding.config'
import { getElementData } from '../../model/elements'
import type { Atom } from '../../molecule'

export interface ClashPosition {
  readonly symbol: string
  readonly x: number
  readonly y: number
  readonly z: number
}

export interface ClashScore {
  readonly minClearance: number
  readonly overlapPenalty: number
}

export function clashAtomRadius(symbol: string): number {
  return getElementData(symbol).covalentRadius
}

export function clashDistanceThreshold(symbolA: string, symbolB: string): number {
  return (clashAtomRadius(symbolA) + clashAtomRadius(symbolB))
    * BONDING.buildClashRadiusFactor
}

export function clashClearance(a: ClashPosition, b: ClashPosition): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  const distance = Math.hypot(dx, dy, dz)
  const minDistance = clashDistanceThreshold(a.symbol, b.symbol)
  return distance - minDistance
}

export function scoreClashes(
  candidates: readonly ClashPosition[],
  atoms: readonly Atom[],
  excludeAtomIds: ReadonlySet<string> = new Set(),
): ClashScore {
  let minClearance = Infinity
  let overlapPenalty = 0

  for (const candidate of candidates) {
    for (const atom of atoms) {
      if (excludeAtomIds.has(atom.id)) continue
      const clearance = clashClearance(candidate, atom)
      minClearance = Math.min(minClearance, clearance)
      if (clearance < 0) overlapPenalty += clearance * clearance
    }
  }

  return {
    minClearance: minClearance === Infinity ? 0 : minClearance,
    overlapPenalty,
  }
}

export function isBetterClashScore(candidate: ClashScore, current: ClashScore): boolean {
  if (Math.abs(candidate.overlapPenalty - current.overlapPenalty) > 1e-9) {
    return candidate.overlapPenalty < current.overlapPenalty
  }
  return candidate.minClearance > current.minClearance
}
