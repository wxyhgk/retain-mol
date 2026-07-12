import type { Molecule } from '@retainmol/mol-viewer/core'
import { runMoleculeComputation } from '../infrastructure/molWorkerClient'

export function generateInitial3D(molecule: Molecule) {
  return runMoleculeComputation('gen3d', molecule)
}
