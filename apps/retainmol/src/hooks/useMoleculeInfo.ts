import { useMemo } from 'react'
import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '@/domain/viewer/moleculeState'
import {
  calculateMolecularWeight,
  getMolecularFormula,
} from '@retainmol/mol-viewer/core'

export interface MoleculeInfo {
  formula: string
  molecularWeight: number | null
  atomCount: number
  bondCount: number
}

export function useMoleculeInfo(): MoleculeInfo {
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)
  return useMemo(() => ({
    formula: getMolecularFormula(molecule.atoms),
    molecularWeight: calculateMolecularWeight(molecule.atoms),
    atomCount: molecule.atoms.length,
    bondCount: molecule.bonds.length,
  }), [molecule.atoms, molecule.bonds])
}

export {
  getMolecularFormula as calcFormula,
  calculateMolecularWeight as calcMW,
} from '@retainmol/mol-viewer/core'
