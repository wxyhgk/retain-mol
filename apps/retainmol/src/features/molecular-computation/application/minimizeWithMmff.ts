import type { Molecule } from '@retainmol/mol-viewer/core'
import { runMoleculeComputation } from '../infrastructure/molWorkerClient'

export function minimizeWithMmff(molecule: Molecule) {
  return runMoleculeComputation('minimize', molecule)
}
