import type { MoleculeState } from './types'

export interface EditActionContext {
  readonly get: () => MoleculeState
  readonly set: (fn: (s: MoleculeState) => Partial<MoleculeState>) => void
}
