import { reconcileAtomChirality } from '../lib/stereo/perception'
import type { Molecule } from '../lib/molecule'
import { editChanged } from '../lib/builder/commands/shared'
import type {
  ChemicalRewriteFailure,
  FragmentFusionCandidate,
  PreparedFragmentFusionCommand,
} from '../lib/chemistry/graphRewrite'
import {
  chemicalCommandStateKey,
} from '../lib/chemistry/graphRewrite'
import {
  createFragmentFusionStoreController,
  type FragmentFusionStoreCommitResult,
} from '../lib/modeling/fragmentFusionStoreAdapter'
import type { MoleculeStoreApi } from './moleculeStore'
import { getActiveMol } from './slices/helpers'

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

export interface SelectedBondFragmentFusionFailure {
  readonly ok: false
  readonly code: SelectedBondFragmentFusionFailureCode
  readonly reason: string
}

export interface SelectedBondFragmentFusionCandidate {
  readonly key: string
  readonly molecule: Molecule
  readonly coordinatesStale: true
  readonly flippedAnchors: readonly boolean[]
  readonly prepared: PreparedFragmentFusionCommand
}

export interface SelectedBondFragmentFusionPreview {
  readonly ok: true
  readonly targetObjectId: string
  readonly selectionVersion: number
  readonly candidates: readonly SelectedBondFragmentFusionCandidate[]
  readonly rejected: readonly ChemicalRewriteFailure[]
}

export type SelectedBondFragmentFusionPreviewResult =
  | SelectedBondFragmentFusionPreview
  | SelectedBondFragmentFusionFailure

export type SelectedBondFragmentFusionCommitResult =
  | FragmentFusionStoreCommitResult
  | SelectedBondFragmentFusionFailure

const addedEntityIds = (
  host: Molecule,
  candidate: FragmentFusionCandidate,
): readonly string[] => {
  const hostAtomIds = new Set(host.atoms.map((atom) => atom.id))
  const hostBondIds = new Set(host.bonds.map((bond) => bond.id))
  return [
    ...candidate.molecule.atoms
      .filter((atom) => !hostAtomIds.has(atom.id))
      .map((atom) => atom.id),
    ...candidate.molecule.bonds
      .filter((bond) => !hostBondIds.has(bond.id))
      .map((bond) => bond.id),
  ]
}

const idsOutsideTargetObject = (
  store: MoleculeStoreApi,
  targetObjectId: string,
): ReadonlySet<string> => {
  const ids = new Set<string>()
  const state = store.getState()
  for (const [objectId, object] of Object.entries(state.objectsById)) {
    if (objectId === targetObjectId) continue
    for (const atom of object.molecule.atoms) ids.add(atom.id)
    for (const bond of object.molecule.bonds) ids.add(bond.id)
  }
  return ids
}

const createActiveObjectController = (store: MoleculeStoreApi) =>
  createFragmentFusionStoreController({
    getMolecule: () => getActiveMol(store.getState()) ?? { atoms: [], bonds: [] },
    commit: (transaction) => {
      const state = store.getState()
      const current = getActiveMol(state)
      if (!current || chemicalCommandStateKey(current) !== transaction.expectedStateKey) {
        return false
      }
      state.commitEditResult(editChanged(reconcileAtomChirality(transaction.molecule)), {
        selectionPolicy: 'clear',
      })
      return true
    },
  })

export function previewSelectedBondFragmentFusion(
  store: MoleculeStoreApi,
  input: SelectedBondFragmentFusionPreviewInput,
): SelectedBondFragmentFusionPreviewResult {
  const state = store.getState()
  const host = getActiveMol(state)
  if (!state.activeObjectId || !host) {
    return {
      ok: false,
      code: 'no-editable-active-molecule',
      reason: 'an editable active molecule is required',
    }
  }
  const hostBondIds = [...state.selectedBondIds]
  if (hostBondIds.length !== 2) {
    return {
      ok: false,
      code: 'requires-two-selected-bonds',
      reason: 'select exactly two host bonds before previewing fragment fusion',
    }
  }

  const controller = createActiveObjectController(store)
  const pairings: readonly (readonly [string, string])[] = [
    input.fragmentBondIds,
    [input.fragmentBondIds[1], input.fragmentBondIds[0]],
  ]
  const outsideIds = idsOutsideTargetObject(store, state.activeObjectId)
  const candidates = new Map<string, SelectedBondFragmentFusionCandidate>()
  const rejected: ChemicalRewriteFailure[] = []
  for (const fragmentBondIds of pairings) {
    const prepared = controller.preview({
      fragment: input.fragment,
      anchors: hostBondIds.map((hostBondId, index) => ({
        hostBondId,
        fragmentBondId: fragmentBondIds[index] as string,
      })),
      ...(input.reconcileHydrogens !== undefined
        ? { reconcileHydrogens: input.reconcileHydrogens }
        : {}),
    })
    rejected.push(...prepared.rejected)
    for (const candidate of prepared.candidates) {
      if (addedEntityIds(host, candidate).some((id) => outsideIds.has(id))) {
        rejected.push({
          ok: false,
          code: 'id-collision',
          reason: 'candidate entity id collides with another scene object',
        })
        continue
      }
      if (!candidates.has(candidate.topologyKey)) {
        candidates.set(candidate.topologyKey, {
          key: candidate.topologyKey,
          molecule: candidate.molecule,
          coordinatesStale: true,
          flippedAnchors: candidate.flippedAnchors,
          prepared,
        })
      }
    }
  }
  return {
    ok: true,
    targetObjectId: state.activeObjectId,
    selectionVersion: state.selectionVersion,
    candidates: [...candidates.values()].sort((left, right) => left.key.localeCompare(right.key)),
    rejected,
  }
}

export function commitSelectedBondFragmentFusion(
  store: MoleculeStoreApi,
  preview: SelectedBondFragmentFusionPreview,
  candidateKey: string,
): SelectedBondFragmentFusionCommitResult {
  const state = store.getState()
  if (state.activeObjectId !== preview.targetObjectId) {
    return {
      ok: false,
      code: 'target-object-changed',
      reason: 'the active scene object changed after fusion preview',
    }
  }
  if (state.selectionVersion !== preview.selectionVersion) {
    return {
      ok: false,
      code: 'selection-changed',
      reason: 'the selected host bonds changed after fusion preview',
    }
  }
  const candidate = preview.candidates.find((entry) => entry.key === candidateKey)
  if (!candidate) {
    return {
      ok: false,
      code: 'candidate-not-found',
      reason: 'the selected fusion candidate is not part of this preview',
    }
  }
  return createActiveObjectController(store).commit(candidate.prepared, candidate.key)
}
