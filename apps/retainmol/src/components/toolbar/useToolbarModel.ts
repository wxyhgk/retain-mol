import { getMolecularFormula } from '@retainmol/mol-viewer/core'
import { useMoleculeHistory } from '@/domain/viewer/history'
import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '@/domain/viewer/moleculeState'
import { useFileIO } from '@/hooks/useFileIO'

export function useToolbarModel() {
  const history = useMoleculeHistory()
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)
  const fileIO = useFileIO()

  return {
    moleculeName: molecule.name || 'New Molecule',
    formula: getMolecularFormula(molecule.atoms),
    history,
    fileIO,
  }
}

export type ToolbarModel = ReturnType<typeof useToolbarModel>
