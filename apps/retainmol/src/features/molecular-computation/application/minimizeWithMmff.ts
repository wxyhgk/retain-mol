import type { Molecule } from '@retainmol/core'
import { runMoleculeComputation } from '../infrastructure/molWorkerClient'

export function minimizeWithMmff(molecule: Molecule) {
  return runMoleculeComputation('minimize', molecule)
}
