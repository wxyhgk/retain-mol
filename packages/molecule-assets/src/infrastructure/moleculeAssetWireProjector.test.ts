import { describe, expect, it } from 'vitest'
import {
  projectMoleculeAssetListWire,
  projectMoleculeAssetWire,
  projectMoleculeRevisionWire,
} from './moleculeAssetWireProjector'

const contentHash = 'a'.repeat(64)
const topologyFingerprint = 'b'.repeat(64)
const molecule = {
  name: 'Water',
  atoms: [
    { id: 'o', symbol: 'O', x: 0, y: 0, z: 0 },
    { id: 'h', symbol: 'H', x: 0.9, y: 0, z: 0 },
  ],
  bonds: [{ id: 'b', atomId1: 'o', atomId2: 'h', order: 1 }],
}

describe('moleculeAssetWireProjector', () => {
  it('projects snake_case persisted assets and revisions', () => {
    expect(projectMoleculeAssetWire({
      schema_version: 1,
      asset_id: 'mol-1',
      name: 'Water',
      head_revision_id: 'rev-1',
      version: 2,
      created_at: '2026-07-14T00:00:00Z',
      updated_at: '2026-07-14T00:01:00Z',
    })).toEqual({
      schemaVersion: 1,
      id: 'mol-1',
      name: 'Water',
      headRevisionId: 'rev-1',
      version: 2,
      createdAt: '2026-07-14T00:00:00Z',
      updatedAt: '2026-07-14T00:01:00Z',
    })

    expect(projectMoleculeRevisionWire({
      schema_version: 1,
      revision_id: 'rev-1',
      molecule_asset_id: 'mol-1',
      parent_revision_id: null,
      structure: molecule,
      sha256: contentHash,
      topology_fingerprint: topologyFingerprint,
      created_at: '2026-07-14T00:01:00Z',
    })).toEqual({
      schemaVersion: 1,
      id: 'rev-1',
      assetId: 'mol-1',
      parentRevisionId: null,
      molecule,
      contentHash,
      topologyFingerprint,
      metadata: {},
      createdAt: '2026-07-14T00:01:00Z',
    })
  })

  it('accepts camelCase collection envelopes and defaults an omitted v1 schema marker', () => {
    expect(projectMoleculeAssetListWire({ moleculeAssets: [{
      moleculeAssetId: 'mol-2',
      name: 'Methane',
      headRevisionId: null,
      version: 1,
      createdAt: '2026-07-14T00:00:00Z',
      updatedAt: '2026-07-14T00:00:00Z',
    }] })).toEqual([{
      schemaVersion: 1,
      id: 'mol-2',
      name: 'Methane',
      headRevisionId: null,
      version: 1,
      createdAt: '2026-07-14T00:00:00Z',
      updatedAt: '2026-07-14T00:00:00Z',
    }])
  })

  it('accepts authored coordination metadata in molecule snapshots', () => {
    expect(projectMoleculeRevisionWire({
      revisionId: 'rev-metal',
      assetId: 'mol-metal',
      parentRevisionId: null,
      molecule: {
        atoms: [{
          id: 'fe', symbol: 'Fe', x: 0, y: 0, z: 0,
          coordinationGeometry: 'octahedral',
          coordinationNumber: 6,
          coordinationDirections: [[1, 0, 0]],
          coordinationSites: [{
            id: 'site-1', label: 'site 1', direction: [1, 0, 0], bondOrder: 1,
            equivalenceGroup: 'axial',
          }],
        }],
        bonds: [],
      },
      contentHash,
      topologyFingerprint,
      createdAt: '2026-07-14T00:00:00Z',
    }).id).toBe('rev-metal')
  })

  it('preserves immutable revision provenance metadata', () => {
    expect(projectMoleculeRevisionWire({
      revisionId: 'rev-derived', assetId: 'mol-1', parentRevisionId: 'rev-source',
      molecule, contentHash, topologyFingerprint,
      metadata: { derivedFromJobId: 'job-1', derivedFromArtifactId: 'artifact-1' },
      createdAt: '2026-07-14T00:02:00Z',
    }).metadata).toEqual({
      derivedFromJobId: 'job-1',
      derivedFromArtifactId: 'artifact-1',
    })
  })

  it('rejects unsupported schemas, malformed hashes, and invalid molecule data', () => {
    const validAsset = {
      id: 'mol-1', name: 'Water', headRevisionId: null, version: 1,
      createdAt: '2026-07-14T00:00:00Z', updatedAt: '2026-07-14T00:00:00Z',
    }
    const validRevision = {
      id: 'rev-1', assetId: 'mol-1', parentRevisionId: null, molecule,
      contentHash, topologyFingerprint, createdAt: '2026-07-14T00:00:00Z',
    }

    expect(() => projectMoleculeAssetWire({ ...validAsset, schemaVersion: 2 }))
      .toThrow('schemaVersion')
    expect(() => projectMoleculeRevisionWire({ ...validRevision, contentHash: 'not-a-hash' }))
      .toThrow('contentHash')
    expect(() => projectMoleculeRevisionWire({
      ...validRevision,
      molecule: { atoms: [{ id: 'o', symbol: 'O', x: Number.NaN, y: 0, z: 0 }], bonds: [] },
    })).toThrow('molecule')
    expect(() => projectMoleculeAssetWire({ ...validAsset, headRevisionId: undefined }))
      .toThrow('headRevisionId')
    expect(() => projectMoleculeAssetListWire({ assets: [null] }))
      .toThrow('molecule assets[0]')
  })
})
