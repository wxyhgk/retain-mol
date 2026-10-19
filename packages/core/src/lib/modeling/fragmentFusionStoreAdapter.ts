import {
  chemicalCommandStateKey,
  commitFragmentFusionCommand,
  prepareFragmentFusionCommand,
} from '../chemistry/graphRewrite'
import type {
  BondFusionAnchor,
  FragmentFusionCommitResult,
  FragmentFusionEffect,
  PreparedFragmentFusionCommand,
} from '../chemistry/graphRewrite'
import type { Molecule } from '../model/types'

export interface MoleculeTransaction {
  readonly label: string
  readonly expectedStateKey: string
  readonly molecule: Molecule
  readonly effect: FragmentFusionEffect
}

export interface MoleculeTransactionPort {
  getMolecule(): Molecule
  commit(transaction: MoleculeTransaction): boolean
}

export interface ZustandStoreApi<State> {
  getState(): State
  setState(
    update: State | Partial<State> | ((state: State) => State | Partial<State>),
    replace?: boolean,
  ): void
}

export interface ZustandMoleculeTransactionOptions<State> {
  readonly store: ZustandStoreApi<State>
  readonly selectMolecule: (state: State) => Molecule
  readonly replaceMolecule: (state: State, molecule: Molecule) => State
  readonly onCommitted?: (transaction: MoleculeTransaction) => void
}

export const createZustandMoleculeTransactionPort = <State>(
  options: ZustandMoleculeTransactionOptions<State>,
): MoleculeTransactionPort => ({
  getMolecule: () => options.selectMolecule(options.store.getState()),
  commit: (transaction) => {
    let committed = false
    options.store.setState((state) => {
      const current = options.selectMolecule(state)
      if (chemicalCommandStateKey(current) !== transaction.expectedStateKey) return state
      committed = true
      return options.replaceMolecule(state, transaction.molecule)
    })
    if (committed) options.onCommitted?.(transaction)
    return committed
  },
})

export interface FragmentFusionPreviewInput {
  readonly fragment: Molecule
  readonly anchors: readonly BondFusionAnchor[]
  readonly reconcileHydrogens?: boolean
}

export interface ConcurrentStoreChangeFailure {
  readonly ok: false
  readonly code: 'concurrent-store-change'
  readonly reason: string
}

export type FragmentFusionStoreCommitResult =
  | FragmentFusionCommitResult
  | ConcurrentStoreChangeFailure

export interface FragmentFusionStoreController {
  preview(input: FragmentFusionPreviewInput): PreparedFragmentFusionCommand
  commit(
    prepared: PreparedFragmentFusionCommand,
    selectedTopologyKey: string,
  ): FragmentFusionStoreCommitResult
}

export const createFragmentFusionStoreController = (
  transactions: MoleculeTransactionPort,
): FragmentFusionStoreController => ({
  preview: (input) => prepareFragmentFusionCommand({
    host: transactions.getMolecule(),
    fragment: input.fragment,
    anchors: input.anchors,
    ...(input.reconcileHydrogens !== undefined
      ? { reconcileHydrogens: input.reconcileHydrogens }
      : {}),
  }),
  commit: (prepared, selectedTopologyKey) => {
    const current = transactions.getMolecule()
    const result = commitFragmentFusionCommand(prepared, selectedTopologyKey, current)
    if (!result.ok) return result
    const committed = transactions.commit({
      label: `Fuse fragment across ${prepared.request.anchors.length} bond anchor(s)`,
      expectedStateKey: chemicalCommandStateKey(current),
      molecule: result.molecule,
      effect: result.effect,
    })
    if (!committed) {
      return {
        ok: false,
        code: 'concurrent-store-change',
        reason: 'molecule changed while the fusion transaction was committing',
      }
    }
    return result
  },
})
