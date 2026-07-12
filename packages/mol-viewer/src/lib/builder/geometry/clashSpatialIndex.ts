import { BONDING } from '../../../config/bonding.config'
import type { Atom } from '../../molecule'
import {
  clashAtomRadius,
  clashClearance,
  type ClashPosition,
  type ClashScore,
} from './clash'

export interface ClashQueryStats {
  comparedPairs: number
}

/** Spatial lookup used while testing many placement offsets against one molecule. */
export class ClashSpatialIndex {
  private readonly cells = new Map<string, Atom[]>()
  private readonly maxAtomRadius: number

  constructor(
    atoms: readonly Atom[],
    excludeAtomIds: ReadonlySet<string> = new Set(),
    private readonly cellSize = 2.5,
  ) {
    let maxAtomRadius = 0
    for (const atom of atoms) {
      if (excludeAtomIds.has(atom.id)) continue
      maxAtomRadius = Math.max(maxAtomRadius, clashAtomRadius(atom.symbol))
      const key = this.cellKey(atom.x, atom.y, atom.z)
      const cell = this.cells.get(key)
      if (cell) cell.push(atom)
      else this.cells.set(key, [atom])
    }
    this.maxAtomRadius = maxAtomRadius
  }

  score(
    candidates: readonly ClashPosition[],
    stats?: ClashQueryStats,
  ): ClashScore {
    let minClearance = Infinity
    let overlapPenalty = 0

    if (this.cells.size === 0 || candidates.length === 0) {
      return { minClearance: 0, overlapPenalty: 0 }
    }

    for (const candidate of candidates) {
      const queryRadius = (
        clashAtomRadius(candidate.symbol) + this.maxAtomRadius
      ) * BONDING.buildClashRadiusFactor
      const cellRadius = Math.ceil(queryRadius / this.cellSize)
      const centerX = this.cellCoordinate(candidate.x)
      const centerY = this.cellCoordinate(candidate.y)
      const centerZ = this.cellCoordinate(candidate.z)

      for (let x = centerX - cellRadius; x <= centerX + cellRadius; x++) {
        for (let y = centerY - cellRadius; y <= centerY + cellRadius; y++) {
          for (let z = centerZ - cellRadius; z <= centerZ + cellRadius; z++) {
            const atoms = this.cells.get(`${x}:${y}:${z}`)
            if (!atoms) continue
            for (const atom of atoms) {
              if (stats) stats.comparedPairs += 1
              const clearance = clashClearance(candidate, atom)
              if (clearance >= 0) continue
              minClearance = Math.min(minClearance, clearance)
              overlapPenalty += clearance * clearance
            }
          }
        }
      }
    }

    return {
      minClearance: minClearance === Infinity ? 0 : minClearance,
      overlapPenalty,
    }
  }

  private cellCoordinate(value: number): number {
    return Math.floor(value / this.cellSize)
  }

  private cellKey(x: number, y: number, z: number): string {
    return `${this.cellCoordinate(x)}:${this.cellCoordinate(y)}:${this.cellCoordinate(z)}`
  }
}
