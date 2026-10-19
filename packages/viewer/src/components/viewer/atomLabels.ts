export interface AtomLabelSource {
  readonly symbol: string
}

export function buildNumberedAtomLabels(atoms: readonly AtomLabelSource[]): string[] {
  return atoms.map((atom, index) => `${atom.symbol}${index + 1}`)
}
