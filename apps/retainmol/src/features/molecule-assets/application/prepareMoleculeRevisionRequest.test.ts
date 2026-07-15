import type { Molecule } from '@retainmol/mol-viewer/core'
import { describe, expect, it } from 'vitest'
import { computeContentHash, computeTopologyFingerprint } from '../domain/canonicalize'
import { prepareMoleculeRevisionRequest } from './prepareMoleculeRevisionRequest'

describe('prepareMoleculeRevisionRequest', () => {
  it('computes both revision hashes from the submitted snapshot', async () => {
    const molecule: Molecule = {
      name: 'Water',
      atoms: [
        { id: 'o', symbol: 'O', x: 0, y: 0, z: 0 },
        { id: 'h', symbol: 'H', x: 0.9, y: 0, z: 0 },
      ],
      bonds: [{ id: 'b', atomId1: 'o', atomId2: 'h', order: 1 }],
    }

    await expect(prepareMoleculeRevisionRequest(molecule, 'rev-parent', 7)).resolves.toEqual({
      parentRevisionId: 'rev-parent',
      expectedHeadRevisionId: 'rev-parent',
      expectedVersion: 7,
      molecule,
      contentHash: await computeContentHash(molecule),
      topologyFingerprint: await computeTopologyFingerprint(molecule),
      metadata: {},
    })
  })
})
