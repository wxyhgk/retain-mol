import type { Molecule } from '@retainmol/mol-viewer/core'
import type { MoleculeAsset, MoleculeRevision } from '../domain/types'
import type { MoleculeDocumentBinding } from '../model/moleculeDocumentStore'
import type { MoleculeAssetsApi } from './moleculeAssetsApi'
import { prepareMoleculeRevisionRequest } from './prepareMoleculeRevisionRequest'

export interface SaveMoleculeDocumentInput {
  readonly objectId: string
  readonly molecule: Molecule
  readonly binding: MoleculeDocumentBinding | null
  readonly metadata?: Readonly<Record<string, unknown>>
}

export interface SaveMoleculeDocumentResult {
  readonly status: 'created' | 'saved' | 'unchanged'
  readonly asset: MoleculeAsset | null
  readonly revision: MoleculeRevision | null
  readonly binding: MoleculeDocumentBinding | null
}

export async function saveMoleculeDocument(
  api: MoleculeAssetsApi,
  input: SaveMoleculeDocumentInput,
): Promise<SaveMoleculeDocumentResult> {
  if (input.molecule.atoms.length === 0) throw new Error('空分子不能保存到分子库')

  const revisionRequest = await prepareMoleculeRevisionRequest(
    input.molecule,
    input.binding?.headRevisionId ?? null,
    input.binding?.assetVersion ?? 1,
    input.metadata,
  )
  const hasMetadata = Boolean(input.metadata && Object.keys(input.metadata).length > 0)
  if (!hasMetadata && input.binding?.savedContentHash === revisionRequest.contentHash) {
    return { status: 'unchanged', asset: null, revision: null, binding: input.binding }
  }

  const createdAsset = input.binding
    ? null
    : await api.createAsset({ name: input.molecule.name?.trim() || 'New Molecule' })
  const assetId = input.binding?.assetId ?? createdAsset!.id
  const revision = await api.createRevision(assetId, revisionRequest)
  const asset = await api.getAsset(assetId)
  if (asset.headRevisionId !== revision.id) {
    throw new Error('服务器保存成功，但返回的分子头版本不一致')
  }

  return {
    status: createdAsset ? 'created' : 'saved',
    asset,
    revision,
    binding: {
      objectId: input.objectId,
      assetId,
      headRevisionId: revision.id,
      assetVersion: asset.version,
      savedContentHash: revision.contentHash,
      savedAt: revision.createdAt,
    },
  }
}
