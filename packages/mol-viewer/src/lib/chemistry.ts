import { findElementConfig } from '../config/elements.config'
import type { Atom } from './types'

export type ElementLike = Pick<Atom, 'symbol' | 'isotope'>

/** Hill system：含碳体系 C、H 优先；无碳体系全部元素按字母排序。 */
export function getMolecularFormula(atoms: readonly ElementLike[]): string {
  if (atoms.length === 0) return ''
  const counts = new Map<string, number>()
  for (const atom of atoms) counts.set(atom.symbol, (counts.get(atom.symbol) ?? 0) + 1)
  const symbols = [...counts.keys()]
  const ordered = counts.has('C')
    ? [
        'C',
        ...(counts.has('H') ? ['H'] : []),
        ...symbols.filter(symbol => symbol !== 'C' && symbol !== 'H').sort(),
      ]
    : symbols.sort()
  return ordered
    .map(symbol => `${symbol}${counts.get(symbol)! > 1 ? counts.get(symbol) : ''}`)
    .join('')
}

/** 标准原子量之和（g/mol）；未配置元素或显式同位素返回 null（尚无同位素质量表）。 */
export function calculateMolecularWeight(atoms: readonly ElementLike[]): number | null {
  let total = 0
  for (const atom of atoms) {
    const element = findElementConfig(atom.symbol)
    if (atom.isotope !== undefined || !element || element.atomicMass === null || element.atomicMass <= 0) return null
    total += element.atomicMass
  }
  return total
}
