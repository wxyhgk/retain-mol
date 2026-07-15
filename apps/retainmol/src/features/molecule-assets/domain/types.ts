import type { Molecule } from '@retainmol/mol-viewer/core'

export const MOLECULE_ASSET_SCHEMA_VERSION = 1 as const
export const MOLECULE_REVISION_SCHEMA_VERSION = 1 as const

/** Lowercase, 64-character SHA-256 digest encoded as hexadecimal. */
export type Sha256Hex = string

export interface MoleculeAssetV1 {
  readonly schemaVersion: typeof MOLECULE_ASSET_SCHEMA_VERSION
  readonly id: string
  readonly name: string
  readonly headRevisionId: string | null
  readonly version: number
  readonly createdAt: string
  readonly updatedAt: string
}

export interface MoleculeRevisionV1 {
  readonly schemaVersion: typeof MOLECULE_REVISION_SCHEMA_VERSION
  readonly id: string
  readonly assetId: string
  readonly parentRevisionId: string | null
  readonly molecule: Molecule
  readonly contentHash: Sha256Hex
  readonly topologyFingerprint: Sha256Hex
  readonly metadata: Readonly<Record<string, unknown>>
  readonly createdAt: string
}

export type MoleculeAsset = MoleculeAssetV1
export type MoleculeRevision = MoleculeRevisionV1
