import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '@/domain/viewer/moleculeState'
import { getMolecularFormula } from '@retainmol/mol-viewer/core'

export function CanvasLabel() {
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)
  const formula = getMolecularFormula(molecule.atoms)
  const selTotal = useMoleculeStore(state => state.selectedAtomIds.size + state.selectedBondIds.size)

  return (
    <div className="pointer-events-none absolute left-4 top-4 z-10 flex select-none items-center gap-1.5">
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
