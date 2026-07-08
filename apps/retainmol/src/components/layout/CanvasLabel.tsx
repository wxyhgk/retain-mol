import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '@/domain/viewerAdapter'

function computeFormula(atoms: readonly { symbol: string }[]): string {
  if (atoms.length === 0) return ''
  const counts: Record<string, number> = {}
  for (const atom of atoms) counts[atom.symbol] = (counts[atom.symbol] || 0) + 1
  const priority = ['C', 'H']
  const keys = [
    ...priority.filter(symbol => counts[symbol]),
    ...Object.keys(counts).filter(symbol => !priority.includes(symbol)).sort(),
  ]
  return keys.map(symbol => `${symbol}${counts[symbol] > 1 ? counts[symbol] : ''}`).join('')
}

export function CanvasLabel() {
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)
  const { selectedAtomIds, selectedBondIds } = useMoleculeStore()
  const formula = computeFormula(molecule.atoms)
  const selTotal = selectedAtomIds.size + selectedBondIds.size

  return (
    <div className="absolute left-[100px] top-4 z-10 flex items-center gap-1.5 select-none pointer-events-none">
      <span className="text-xs font-medium text-gray-700 bg-white/85 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-gray-200/60">
        {molecule.name || 'New Molecule'}
      </span>
      {formula && (
        <span className="text-[11px] text-gray-500 font-mono bg-white/85 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-gray-200/60">
          {formula}
        </span>
      )}
      {selTotal > 0 && (
        <span className="text-[11px] font-medium text-white bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
          {selTotal} 已选
        </span>
      )}
    </div>
  )
}
