import { create } from 'zustand'
import type { MoleculeAsset, Sha256Hex } from '../domain/types'

export interface MoleculeDocumentBinding {
  readonly objectId: string
  readonly assetId: string
  readonly headRevisionId: string
  readonly assetVersion: number
  readonly savedContentHash: Sha256Hex
  readonly savedAt: string
}

export interface MoleculeDocumentConflict {
  readonly objectId: string
  readonly currentAsset: MoleculeAsset
}

interface MoleculeDocumentState {
  readonly bindingsByObjectId: Readonly<Record<string, MoleculeDocumentBinding>>
  readonly conflictsByObjectId: Readonly<Record<string, MoleculeDocumentConflict>>
  readonly pendingRevisionMetadataByObjectId: Readonly<Record<string, Readonly<Record<string, unknown>>>>
  bindSavedDocument: (binding: MoleculeDocumentBinding) => void
  setPendingRevisionMetadata: (objectId: string, metadata: Readonly<Record<string, unknown>>) => void
  clearPendingRevisionMetadata: (objectId: string) => void
  markConflict: (conflict: MoleculeDocumentConflict) => void
  clearConflict: (objectId: string) => void
  detachDocument: (objectId: string) => void
  reset: () => void
}

const EMPTY_BINDINGS: Readonly<Record<string, MoleculeDocumentBinding>> = {}
const EMPTY_CONFLICTS: Readonly<Record<string, MoleculeDocumentConflict>> = {}
const EMPTY_METADATA: Readonly<Record<string, Readonly<Record<string, unknown>>>> = {}

function withoutKey<T>(record: Readonly<Record<string, T>>, key: string): Readonly<Record<string, T>> {
  return Object.fromEntries(Object.entries(record).filter(([candidate]) => candidate !== key))
}

export const useMoleculeDocumentStore = create<MoleculeDocumentState>(set => ({
  bindingsByObjectId: EMPTY_BINDINGS,
  conflictsByObjectId: EMPTY_CONFLICTS,
  pendingRevisionMetadataByObjectId: EMPTY_METADATA,
  bindSavedDocument: binding => set(state => {
    return {
      bindingsByObjectId: { ...state.bindingsByObjectId, [binding.objectId]: binding },
      conflictsByObjectId: withoutKey(state.conflictsByObjectId, binding.objectId),
      pendingRevisionMetadataByObjectId: withoutKey(
        state.pendingRevisionMetadataByObjectId,
        binding.objectId,
      ),
    }
  }),
  setPendingRevisionMetadata: (objectId, metadata) => set(state => ({
    pendingRevisionMetadataByObjectId: {
      ...state.pendingRevisionMetadataByObjectId,
      [objectId]: { ...metadata },
    },
  })),
  clearPendingRevisionMetadata: objectId => set(state => ({
    pendingRevisionMetadataByObjectId: withoutKey(
      state.pendingRevisionMetadataByObjectId,
      objectId,
    ),
  })),
  markConflict: conflict => set(state => ({
    conflictsByObjectId: { ...state.conflictsByObjectId, [conflict.objectId]: conflict },
  })),
  clearConflict: objectId => set(state => ({
    conflictsByObjectId: withoutKey(state.conflictsByObjectId, objectId),
  })),
  detachDocument: objectId => set(state => ({
    bindingsByObjectId: withoutKey(state.bindingsByObjectId, objectId),
    conflictsByObjectId: withoutKey(state.conflictsByObjectId, objectId),
    pendingRevisionMetadataByObjectId: withoutKey(
      state.pendingRevisionMetadataByObjectId,
      objectId,
    ),
  })),
  reset: () => set({
    bindingsByObjectId: EMPTY_BINDINGS,
    conflictsByObjectId: EMPTY_CONFLICTS,
    pendingRevisionMetadataByObjectId: EMPTY_METADATA,
  }),
}))
