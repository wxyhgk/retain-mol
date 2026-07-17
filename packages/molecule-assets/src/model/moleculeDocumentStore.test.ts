import { beforeEach, describe, expect, it } from 'vitest'
import { useMoleculeDocumentStore } from './moleculeDocumentStore'

const asset = {
  schemaVersion: 1 as const,
  id: 'asset-1',
  name: 'Water',
  headRevisionId: 'revision-2',
  version: 3,
  createdAt: '2026-07-15T00:00:00Z',
  updatedAt: '2026-07-15T00:01:00Z',
}

beforeEach(() => useMoleculeDocumentStore.getState().reset())

describe('moleculeDocumentStore', () => {
  it('keeps save cursors per scene object and clears a resolved conflict', () => {
    useMoleculeDocumentStore.getState().markConflict({ objectId: 'object-1', currentAsset: asset })
    useMoleculeDocumentStore.getState().setPendingRevisionMetadata('object-1', {
      derivedFromJobId: 'job-1',
    })
    useMoleculeDocumentStore.getState().bindSavedDocument({
      objectId: 'object-1',
      assetId: asset.id,
      headRevisionId: asset.headRevisionId!,
      assetVersion: asset.version,
      savedContentHash: 'a'.repeat(64),
      savedAt: asset.updatedAt,
    })

    expect(useMoleculeDocumentStore.getState().bindingsByObjectId['object-1']).toMatchObject({
      assetId: 'asset-1', assetVersion: 3,
    })
    expect(useMoleculeDocumentStore.getState().conflictsByObjectId['object-1']).toBeUndefined()
    expect(useMoleculeDocumentStore.getState().pendingRevisionMetadataByObjectId['object-1'])
      .toBeUndefined()
  })

  it('detaches one object without affecting another document', () => {
    const bind = useMoleculeDocumentStore.getState().bindSavedDocument
    bind({ objectId: 'one', assetId: 'a', headRevisionId: 'r1', assetVersion: 2, savedContentHash: 'a'.repeat(64), savedAt: '' })
    bind({ objectId: 'two', assetId: 'b', headRevisionId: 'r2', assetVersion: 4, savedContentHash: 'b'.repeat(64), savedAt: '' })

    useMoleculeDocumentStore.getState().detachDocument('one')

    expect(useMoleculeDocumentStore.getState().bindingsByObjectId.one).toBeUndefined()
    expect(useMoleculeDocumentStore.getState().bindingsByObjectId.two?.assetId).toBe('b')
  })
})
