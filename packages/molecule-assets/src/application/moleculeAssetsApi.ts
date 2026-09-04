import type { Molecule } from '@retainmol/mol-viewer/core'
import type { MoleculeAsset, MoleculeRevision, Sha256Hex } from '../domain/types'

export interface MoleculeAssetsRequestOptions {
  readonly signal?: AbortSignal
}

export interface CreateMoleculeAssetRequest {
  readonly name: string
}

export interface CreateMoleculeRevisionRequest {
  readonly parentRevisionId: string | null
  readonly expectedHeadRevisionId: string | null
  readonly expectedVersion: number
  readonly molecule: Molecule
  readonly contentHash: Sha256Hex
  readonly topologyFingerprint: Sha256Hex
  readonly metadata?: Readonly<Record<string, unknown>>
}

/** Application port implemented by infrastructure adapters, never by a page. */
export interface MoleculeAssetsApi {
  listAssets(options?: MoleculeAssetsRequestOptions): Promise<MoleculeAsset[]>
  getAsset(
    assetId: string,
    options?: MoleculeAssetsRequestOptions,
  ): Promise<MoleculeAsset>
  createAsset(
    request: CreateMoleculeAssetRequest,
    options?: MoleculeAssetsRequestOptions,
  ): Promise<MoleculeAsset>
  getRevision(
    revisionId: string,
    options?: MoleculeAssetsRequestOptions,
  ): Promise<MoleculeRevision>
  listRevisions(
    assetId: string,
    options?: MoleculeAssetsRequestOptions,
  ): Promise<MoleculeRevision[]>
  createRevision(
    assetId: string,
    request: CreateMoleculeRevisionRequest,
    options?: MoleculeAssetsRequestOptions,
  ): Promise<MoleculeRevision>
}
