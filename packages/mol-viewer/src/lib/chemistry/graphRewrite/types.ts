import type { Molecule } from '../../types'

export interface AtomInterfaceMapping {
  readonly hostAtomId: string
  readonly rightAtomId: string
}

export interface BondInterfaceMapping {
  readonly hostBondId: string
  readonly rightBondId: string
}

export interface ExplicitChemicalRewrite {
  readonly right: Molecule
  readonly atomInterface: readonly AtomInterfaceMapping[]
  readonly bondInterface?: readonly BondInterfaceMapping[]
  readonly removeHostAtomIds?: readonly string[]
  readonly removeHostBondIds?: readonly string[]
}

export type ChemicalRewriteFailureCode =
  | 'host-atom-missing'
  | 'right-atom-missing'
  | 'host-bond-missing'
  | 'right-bond-missing'
  | 'atom-interface-not-injective'
  | 'atom-label-conflict'
  | 'bond-interface-endpoint-conflict'
  | 'bond-label-conflict'
  | 'id-collision'
  | 'self-bond'
  | 'duplicate-bond'
  | 'dangling-bond'
  | 'too-many-anchors'
  | 'over-valence'

export interface ChemicalRewriteFailure {
  readonly ok: false
  readonly code: ChemicalRewriteFailureCode
  readonly reason: string
}

export interface ChemicalRewriteSuccess {
  readonly ok: true
  readonly molecule: Molecule
  readonly removedHostAtomIds: readonly string[]
  readonly topologyKey: string
  readonly coordinatesStale: true
}

export type ChemicalRewriteResult = ChemicalRewriteFailure | ChemicalRewriteSuccess

export interface BondFusionAnchor {
  readonly hostBondId: string
  readonly fragmentBondId: string
}

export interface FragmentFusionRequest {
  readonly host: Molecule
  readonly fragment: Molecule
  readonly anchors: readonly BondFusionAnchor[]
  readonly reconcileHydrogens?: boolean
}

export interface FragmentFusionCandidate extends ChemicalRewriteSuccess {
  readonly atomInterface: readonly AtomInterfaceMapping[]
  readonly bondInterface: readonly BondInterfaceMapping[]
  readonly flippedAnchors: readonly boolean[]
  readonly removedFragmentAtomIds: readonly string[]
}

export interface FragmentFusionPlan {
  readonly candidates: readonly FragmentFusionCandidate[]
  readonly rejected: readonly ChemicalRewriteFailure[]
}
