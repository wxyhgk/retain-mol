import type { Molecule } from '@retainmol/core'
import { runMoleculeComputation } from '../infrastructure/molWorkerClient'

export function generateInitial3D(molecule: Molecule) {
  return runMoleculeComputation('gen3d', molecule)
}
