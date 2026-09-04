import type { Molecule } from '@retainmol/mol-viewer/core'
import { computeContentHash, computeTopologyFingerprint } from '../domain/canonicalize'
import type { CreateMoleculeRevisionRequest } from './moleculeAssetsApi'

/** Freezes the hashes sent with a revision from the same molecule snapshot. */
export async function prepareMoleculeRevisionRequest(
  molecule: Molecule,
  parentRevisionId: string | null = null,
  expectedVersion = 1,
  metadata: Readonly<Record<string, unknown>> = {},
): Promise<CreateMoleculeRevisionRequest> {
  const [contentHash, topologyFingerprint] = await Promise.all([
    computeContentHash(molecule),
    computeTopologyFingerprint(molecule),
  ])
  return {
    parentRevisionId,
    expectedHeadRevisionId: parentRevisionId,
    expectedVersion,
    molecule,
    contentHash,
    topologyFingerprint,
    metadata,
  }
}
