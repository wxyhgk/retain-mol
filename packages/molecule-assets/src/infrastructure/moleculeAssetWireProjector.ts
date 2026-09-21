import { parseMolecule } from '@retainmol/mol-viewer/core'
import {
  MOLECULE_ASSET_SCHEMA_VERSION,
  MOLECULE_REVISION_SCHEMA_VERSION,
  type MoleculeAsset,
  type MoleculeRevision,
  type Sha256Hex,
} from '../domain/types'

type JsonObject = Record<string, unknown>

const SHA256_HEX = /^[0-9a-f]{64}$/

export function projectMoleculeAssetWire(value: unknown, path = 'molecule asset'): MoleculeAsset {
  if (!isObject(value)) throw wireError(path)
  const schemaVersion = schemaVersionAt(
    value,
    `${path}.schemaVersion`,
    MOLECULE_ASSET_SCHEMA_VERSION,
  )
  return {
    schemaVersion,
    id: requiredString(value, `${path}.id`, 'id', 'assetId', 'asset_id', 'moleculeAssetId', 'molecule_asset_id'),
    name: requiredString(value, `${path}.name`, 'name'),
    headRevisionId: requiredNullableString(
      value,
      `${path}.headRevisionId`,
      'headRevisionId',
      'head_revision_id',
    ),
    version: requiredPositiveInteger(value, `${path}.version`, 'version'),
    createdAt: requiredString(value, `${path}.createdAt`, 'createdAt', 'created_at'),
    updatedAt: requiredString(value, `${path}.updatedAt`, 'updatedAt', 'updated_at'),
  }
}

export function projectMoleculeAssetListWire(value: unknown): MoleculeAsset[] {
  const assets = Array.isArray(value)
    ? value
    : isObject(value)
      ? readValue(value, 'assets', 'moleculeAssets', 'molecule_assets')
      : undefined
  if (!Array.isArray(assets)) throw wireError('molecule assets collection')
  return assets.map((asset, index) => projectMoleculeAssetWire(asset, `molecule assets[${index}]`))
}

export function projectMoleculeRevisionListWire(value: unknown): MoleculeRevision[] {
  const revisions = Array.isArray(value)
    ? value
    : isObject(value)
      ? readValue(value, 'revisions', 'moleculeRevisions', 'molecule_revisions')
      : undefined
  if (!Array.isArray(revisions)) throw wireError('molecule revisions collection')
  return revisions.map((revision, index) => (
    projectMoleculeRevisionWire(revision, `molecule revisions[${index}]`)
  ))
}

export function projectMoleculeRevisionWire(
  value: unknown,
  path = 'molecule revision',
): MoleculeRevision {
  if (!isObject(value)) throw wireError(path)
  let molecule
  try {
    molecule = parseMolecule(readValue(value, 'molecule', 'structure'))
  } catch {
    throw wireError(`${path}.molecule`)
  }
  return {
    schemaVersion: schemaVersionAt(
      value,
      `${path}.schemaVersion`,
      MOLECULE_REVISION_SCHEMA_VERSION,
    ),
    id: requiredString(value, `${path}.id`, 'id', 'revisionId', 'revision_id'),
    assetId: requiredString(
      value,
      `${path}.assetId`,
      'assetId',
      'asset_id',
      'moleculeAssetId',
      'molecule_asset_id',
    ),
    parentRevisionId: requiredNullableString(
      value,
      `${path}.parentRevisionId`,
      'parentRevisionId',
      'parent_revision_id',
    ),
    molecule,
    contentHash: requiredSha256(value, `${path}.contentHash`, 'contentHash', 'content_hash', 'sha256'),
    topologyFingerprint: requiredSha256(
      value,
      `${path}.topologyFingerprint`,
      'topologyFingerprint',
      'topology_fingerprint',
    ),
    metadata: optionalObject(value, 'metadata'),
    createdAt: requiredString(value, `${path}.createdAt`, 'createdAt', 'created_at'),
  }
}

function schemaVersionAt<T extends number>(value: JsonObject, path: string, supported: T): T {
  const candidate = readValue(value, 'schemaVersion', 'schema_version')
  if (candidate === undefined) return supported
  if (candidate !== supported) throw wireError(path)
  return supported
}

function requiredSha256(
  value: JsonObject,
  path: string,
  ...keys: string[]
): Sha256Hex {
  const candidate = requiredString(value, path, ...keys)
  if (!SHA256_HEX.test(candidate)) throw wireError(path)
  return candidate
}

function requiredNullableString(value: JsonObject, path: string, ...keys: string[]): string | null {
  const candidate = readValueIncludingNull(value, ...keys)
  if (candidate === null) return null
  if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
  throw wireError(path)
}

function requiredString(value: JsonObject, path: string, ...keys: string[]): string {
  const candidate = readValue(value, ...keys)
  if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
  throw wireError(path)
}

function requiredPositiveInteger(value: JsonObject, path: string, ...keys: string[]): number {
  const candidate = readValue(value, ...keys)
  if (typeof candidate === 'number' && Number.isInteger(candidate) && candidate >= 1) {
    return candidate
  }
  throw wireError(path)
}

function optionalObject(value: JsonObject, ...keys: string[]): Readonly<Record<string, unknown>> {
  const candidate = readValue(value, ...keys)
  if (candidate === undefined) return {}
  if (!isObject(candidate)) throw wireError(keys.join('.') || 'metadata')
  return candidate
}

function readValue(value: JsonObject, ...keys: string[]): unknown {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(value, key) && value[key] !== undefined && value[key] !== null) {
      return value[key]
    }
  }
  return undefined
}

function readValueIncludingNull(value: JsonObject, ...keys: string[]): unknown {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(value, key) && value[key] !== undefined) return value[key]
  }
  return undefined
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function wireError(path: string): TypeError {
  return new TypeError(`Invalid molecule assets wire payload at ${path}`)
}
