import type { Molecule } from '@retainmol/mol-viewer/core'

export type MoleculeComputationOperation = 'gen3d' | 'minimize'

export interface MoleculeComputationRequest {
  readonly id: number
  readonly op: MoleculeComputationOperation
  readonly mol: Molecule
  readonly resourceUrl: string
}
