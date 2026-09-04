import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import type { MoleculeAsset, MoleculeRevision } from '../domain/types'
import { MoleculeAssetsApiClient, MoleculeAssetsApiError } from '../infrastructure/moleculeAssetsApiClient'
import { useMoleculeDocumentStore } from '../model/moleculeDocumentStore'
import { saveMoleculeDocument, type SaveMoleculeDocumentInput } from './saveMoleculeDocument'

export const moleculeAssetsApi = new MoleculeAssetsApiClient()

export const moleculeAssetQueryKeys = {
  all: ['molecule-assets'] as const,
  list: () => [...moleculeAssetQueryKeys.all, 'list'] as const,
  detail: (assetId: string) => [...moleculeAssetQueryKeys.all, 'detail', assetId] as const,
  revisions: (assetId: string) => [...moleculeAssetQueryKeys.all, 'revisions', assetId] as const,
  revision: (revisionId: string) => [...moleculeAssetQueryKeys.all, 'revision', revisionId] as const,
}

export function moleculeAssetsListOptions() {
  return queryOptions({
    queryKey: moleculeAssetQueryKeys.list(),
    queryFn: ({ signal }) => moleculeAssetsApi.listAssets({ signal }),
  })
}

export function moleculeAssetRevisionsOptions(assetId: string) {
  return queryOptions({
    queryKey: moleculeAssetQueryKeys.revisions(assetId),
    queryFn: ({ signal }) => moleculeAssetsApi.listRevisions(assetId, { signal }),
    enabled: Boolean(assetId),
  })
}

export function moleculeAssetOptions(assetId: string) {
  return queryOptions({
    queryKey: moleculeAssetQueryKeys.detail(assetId),
    queryFn: ({ signal }) => moleculeAssetsApi.getAsset(assetId, { signal }),
    enabled: Boolean(assetId),
  })
}

export function moleculeRevisionOptions(revisionId: string) {
  return queryOptions({
    queryKey: moleculeAssetQueryKeys.revision(revisionId),
    queryFn: ({ signal }) => moleculeAssetsApi.getRevision(revisionId, { signal }),
    enabled: Boolean(revisionId),
  })
}

export function useMoleculeAssetsQuery(enabled = true) {
  return useQuery({ ...moleculeAssetsListOptions(), enabled })
}

export function useMoleculeAssetRevisionsQuery(assetId: string | null) {
  return useQuery({ ...moleculeAssetRevisionsOptions(assetId ?? ''), enabled: Boolean(assetId) })
}

export function useMoleculeAssetQuery(assetId: string | null) {
  return useQuery({ ...moleculeAssetOptions(assetId ?? ''), enabled: Boolean(assetId) })
}

export function useMoleculeRevisionQuery(revisionId: string | null) {
  return useQuery({ ...moleculeRevisionOptions(revisionId ?? ''), enabled: Boolean(revisionId) })
}

function mergeAsset(assets: MoleculeAsset[] | undefined, asset: MoleculeAsset): MoleculeAsset[] {
  const current = assets ?? []
  return current.some(item => item.id === asset.id)
    ? current.map(item => item.id === asset.id ? asset : item)
    : [asset, ...current]
}

function commitSavedDocument(
  queryClient: QueryClient,
  asset: MoleculeAsset,
  revision: MoleculeRevision,
) {
  queryClient.setQueryData<MoleculeAsset[]>(
    moleculeAssetQueryKeys.list(),
    assets => mergeAsset(assets, asset),
  )
  queryClient.setQueryData(moleculeAssetQueryKeys.detail(asset.id), asset)
  queryClient.setQueryData<MoleculeRevision[]>(
    moleculeAssetQueryKeys.revisions(asset.id),
    revisions => revisions?.some(item => item.id === revision.id)
      ? revisions
      : [revision, ...(revisions ?? [])],
  )
  queryClient.setQueryData(moleculeAssetQueryKeys.revision(revision.id), revision)
}

export function useSaveMoleculeDocumentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SaveMoleculeDocumentInput) => saveMoleculeDocument(moleculeAssetsApi, input),
    onSuccess: result => {
      if (result.asset && result.revision) commitSavedDocument(queryClient, result.asset, result.revision)
      if (result.binding) useMoleculeDocumentStore.getState().bindSavedDocument(result.binding)
    },
    onError: (error, input) => {
      if (
        error instanceof MoleculeAssetsApiError
        && error.status === 409
        && error.code === 'molecule_head_conflict'
        && error.currentAsset
      ) {
        useMoleculeDocumentStore.getState().markConflict({
          objectId: input.objectId,
          currentAsset: error.currentAsset,
        })
        commitAsset(queryClient, error.currentAsset)
      }
    },
  })
}

function commitAsset(queryClient: QueryClient, asset: MoleculeAsset) {
  queryClient.setQueryData<MoleculeAsset[]>(
    moleculeAssetQueryKeys.list(),
    assets => mergeAsset(assets, asset),
  )
  queryClient.setQueryData(moleculeAssetQueryKeys.detail(asset.id), asset)
}

export async function loadMoleculeRevisionForEditor(
  asset: MoleculeAsset,
  revisionId: string,
): Promise<{ revision: MoleculeRevision; headRevision: MoleculeRevision }> {
  if (!asset.headRevisionId) throw new Error('该分子尚无可载入版本')
  const [revision, headRevision] = await Promise.all([
    moleculeAssetsApi.getRevision(revisionId),
    revisionId === asset.headRevisionId
      ? moleculeAssetsApi.getRevision(revisionId)
      : moleculeAssetsApi.getRevision(asset.headRevisionId),
  ])
  return { revision, headRevision }
}
