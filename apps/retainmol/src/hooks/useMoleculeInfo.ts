/**
 * useMoleculeInfo — 从分子状态计算派生信息
 * 纯计算，无副作用，可独立测试
 */

import { useMemo } from 'react'
import { useMoleculeStore, selectActiveMoleculeOrEmpty, getElementConfig } from '@retainmol/mol-viewer'
import type { Atom } from '@retainmol/mol-viewer'

export interface MoleculeInfo {
  formula: string
  molecularWeight: number
  atomCount: number
  bondCount: number
}

function calcFormula(atoms: readonly Atom[]): string {
  if (atoms.length === 0) return '—'
  const counts: Record<string, number> = {}
  // Hill order: C first, H second, then alphabetical
  atoms.forEach(a => { counts[a.symbol] = (counts[a.symbol] ?? 0) + 1 })
  const symbols = Object.keys(counts).sort((a, b) => {
    if (a === 'C') return -1
    if (b === 'C') return 1
    if (a === 'H') return -1
    if (b === 'H') return 1
    return a.localeCompare(b)
  })
  return symbols.map(s => `${s}${counts[s] > 1 ? counts[s] : ''}`).join('')
}

function calcMW(atoms: readonly Atom[]): number {
  return atoms.reduce((sum, a) => sum + getElementConfig(a.symbol).atomicMass, 0)
}

export function useMoleculeInfo(): MoleculeInfo {
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)

  return useMemo(() => ({
    formula: calcFormula(molecule.atoms),
    molecularWeight: calcMW(molecule.atoms),
    atomCount: molecule.atoms.length,
    bondCount: molecule.bonds.length,
  }), [molecule.atoms, molecule.bonds])
}

/** 独立的纯函数，供非 hook 上下文使用 */
export { calcFormula, calcMW }
