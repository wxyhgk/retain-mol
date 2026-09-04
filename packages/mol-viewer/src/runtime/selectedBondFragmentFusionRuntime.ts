import type { Molecule } from '../lib/molecule'
import {
  commitSelectedBondFragmentFusion as commitSelectedBondFragmentFusionInStore,
  previewSelectedBondFragmentFusion as previewSelectedBondFragmentFusionInStore,
} from '../store/fragmentFusionStore'
import {
  defaultViewerRuntime,
  getViewerRuntimeServices,
  type ViewerRuntime,
} from './ViewerRuntime'

export interface SelectedBondFragmentFusionPreviewInput {
  readonly fragment: Molecule
  readonly fragmentBondIds: readonly [string, string]
  readonly reconcileHydrogens?: boolean
}

export type SelectedBondFragmentFusionFailureCode =
  | 'no-editable-active-molecule'
  | 'requires-two-selected-bonds'
  | 'selection-changed'
  | 'target-object-changed'
  | 'candidate-not-found'
  | 'stale-host'
  | 'candidate-no-longer-valid'
  | 'concurrent-store-change'

export interface SelectedBondFragmentFusionFailure {
  readonly ok: false
  readonly code: SelectedBondFragmentFusionFailureCode
  readonly reason: string
}

export interface SelectedBondFragmentFusionDiagnostic {
  readonly code: string
  readonly reason: string
}

export interface SelectedBondFragmentFusionCandidate {
  readonly key: string
  readonly molecule: Molecule
  readonly coordinatesStale: true
  readonly flippedAnchors: readonly boolean[]
}

export interface SelectedBondFragmentFusionPreview {
  readonly ok: true
  readonly targetObjectId: string
  readonly selectionVersion: number
  readonly candidates: readonly SelectedBondFragmentFusionCandidate[]
  readonly rejected: readonly SelectedBondFragmentFusionDiagnostic[]
}

export type SelectedBondFragmentFusionPreviewResult =
  | SelectedBondFragmentFusionPreview
  | SelectedBondFragmentFusionFailure

export interface SelectedBondFragmentFusionCommitInput
  extends SelectedBondFragmentFusionPreviewInput {
  readonly candidateKey: string
  readonly targetObjectId: string
  readonly selectionVersion: number
}

export interface SelectedBondFragmentFusionEffect {
  readonly addedAtomIds: readonly string[]
  readonly removedAtomIds: readonly string[]
  readonly addedBondIds: readonly string[]
  readonly removedBondIds: readonly string[]
}

export interface SelectedBondFragmentFusionCommitSuccess {
  readonly ok: true
  readonly molecule: Molecule
  readonly effect: SelectedBondFragmentFusionEffect
  readonly selectedTopologyKey: string
  readonly coordinatesStale: true
}

export type SelectedBondFragmentFusionCommitResult =
  | SelectedBondFragmentFusionCommitSuccess
  | SelectedBondFragmentFusionFailure

export function previewSelectedBondFragmentFusion(
  input: SelectedBondFragmentFusionPreviewInput,
  runtime: ViewerRuntime = defaultViewerRuntime,
): SelectedBondFragmentFusionPreviewResult {
  const store = getViewerRuntimeServices(runtime).moleculeStore
  const result = previewSelectedBondFragmentFusionInStore(store, input)
  if (!result.ok) return result
  return {
    ok: true,
    targetObjectId: result.targetObjectId,
    selectionVersion: result.selectionVersion,
    candidates: result.candidates.map((candidate) => ({
      key: candidate.key,
      molecule: candidate.molecule,
      coordinatesStale: true,
      flippedAnchors: candidate.flippedAnchors,
    })),
    rejected: result.rejected.map(({ code, reason }) => ({ code, reason })),
  }
}

export function commitSelectedBondFragmentFusion(
  input: SelectedBondFragmentFusionCommitInput,
  runtime: ViewerRuntime = defaultViewerRuntime,
): SelectedBondFragmentFusionCommitResult {
  const store = getViewerRuntimeServices(runtime).moleculeStore
  const state = store.getState()
  if (state.activeObjectId !== input.targetObjectId) {
    return {
      ok: false,
      code: 'target-object-changed',
      reason: 'the active scene object changed after fusion preview',
    }
  }
  if (state.selectionVersion !== input.selectionVersion) {
    return {
      ok: false,
      code: 'selection-changed',
      reason: 'the selected host bonds changed after fusion preview',
    }
  }
  const refreshed = previewSelectedBondFragmentFusionInStore(store, input)
  if ('code' in refreshed) return refreshed
  const result = commitSelectedBondFragmentFusionInStore(
    store,
    refreshed,
    input.candidateKey,
  )
  if (!result.ok) return result
  return {
    ok: true,
    molecule: result.molecule,
    effect: result.effect,
    selectedTopologyKey: result.selectedTopologyKey,
    coordinatesStale: true,
  }
}
