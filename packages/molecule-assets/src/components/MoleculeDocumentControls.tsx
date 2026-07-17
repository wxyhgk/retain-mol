import { useEffect, useState } from 'react'
import { Database, History, LoaderCircle, Save } from 'lucide-react'
import { Button } from '@retainmol/ui-kit'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@retainmol/ui-kit'
import { useEditorStore } from '@retainmol/mol-viewer/state'
import { useMoleculeStore } from '@retainmol/mol-viewer/state'
import { computeContentHash } from '../domain/canonicalize'
import type { MoleculeAsset, MoleculeRevision } from '../domain/types'
import {
  loadMoleculeRevisionForEditor,
  useMoleculeAssetRevisionsQuery,
  useMoleculeAssetsQuery,
  useSaveMoleculeDocumentMutation,
} from '../application/moleculeAssetQueries'
import {
  useMoleculeDocumentStore,
  type MoleculeDocumentBinding,
} from '../model/moleculeDocumentStore'

export function MoleculeDocumentControls() {
  const activeObjectId = useMoleculeStore(state => state.activeObjectId)
  const molecule = useMoleculeStore(state => (
    state.activeObjectId ? state.objectsById[state.activeObjectId]?.molecule : undefined
  ))
  const binding = useMoleculeDocumentStore(state => (
    activeObjectId ? state.bindingsByObjectId[activeObjectId] : undefined
  ))
  const conflict = useMoleculeDocumentStore(state => (
    activeObjectId ? state.conflictsByObjectId[activeObjectId] : undefined
  ))
  const pendingRevisionMetadata = useMoleculeDocumentStore(state => (
    activeObjectId ? state.pendingRevisionMetadataByObjectId[activeObjectId] : undefined
  ))
  const saveDocument = useSaveMoleculeDocumentMutation()
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [hashSnapshot, setHashSnapshot] = useState<{ molecule: typeof molecule; hash: string } | null>(null)

  useEffect(() => {
    let current = true
    if (molecule) {
      void computeContentHash(molecule).then(hash => {
        if (current) setHashSnapshot({ molecule, hash })
      })
    }
    return () => { current = false }
  }, [molecule])

  const contentHash = hashSnapshot?.molecule === molecule ? hashSnapshot.hash : null

  const dirty = Boolean(
    activeObjectId
    && molecule
    && contentHash
    && (
      !binding
      || binding.savedContentHash !== contentHash
      || Boolean(pendingRevisionMetadata && Object.keys(pendingRevisionMetadata).length > 0)
    ),
  )

  const save = (bindingOverride: MoleculeDocumentBinding | null | undefined = binding) => {
    if (!activeObjectId || !molecule || saveDocument.isPending) return
    saveDocument.mutate(
      {
        objectId: activeObjectId,
        molecule,
        binding: bindingOverride ?? null,
        metadata: pendingRevisionMetadata,
      },
      {
        onSuccess: result => useEditorStore.getState().flashHint(
          result.status === 'unchanged'
            ? '当前分子没有需要保存的更改'
            : result.status === 'created'
              ? '已创建分子文档并保存第一个版本'
              : '已保存新的分子版本',
        ),
        onError: error => {
          if (!useMoleculeDocumentStore.getState().conflictsByObjectId[activeObjectId]) {
            useEditorStore.getState().flashHint(error instanceof Error ? error.message : '保存分子失败')
          }
        },
      },
    )
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        save()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const saveLabel = saveDocument.isPending
    ? '正在保存'
    : binding
      ? dirty ? '保存新版本' : '已保存'
      : '保存到分子库'

  return (
    <>
      <Button
        type="button"
        variant={dirty ? 'default' : 'ghost'}
        size="sm"
        className="h-8 gap-1.5 px-2.5 text-xs"
        disabled={!activeObjectId || !molecule?.atoms.length || saveDocument.isPending || contentHash === null}
        title={`${saveLabel} (Ctrl+S)`}
        onClick={() => save()}
      >
        {saveDocument.isPending
          ? <LoaderCircle size={14} className="animate-spin" />
          : <Save size={14} />}
        <span className="hidden lg:inline">{saveLabel}</span>
        {dirty && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-label="有未保存更改" />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        title="分子库与版本历史"
        onClick={() => setLibraryOpen(true)}
      >
        <Database size={14} />
      </Button>

      <MoleculeLibraryDialog
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        activeObjectId={activeObjectId}
        currentBinding={binding ?? null}
      />
      {conflict && activeObjectId && molecule && (
        <MoleculeConflictDialog
          objectId={activeObjectId}
          asset={conflict.currentAsset}
          onSaveAsCopy={() => {
            useMoleculeDocumentStore.getState().detachDocument(activeObjectId)
            save(null)
          }}
        />
      )}
    </>
  )
}

function MoleculeLibraryDialog({
  open,
  onOpenChange,
  activeObjectId,
  currentBinding,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeObjectId: string | null
  currentBinding: MoleculeDocumentBinding | null
}) {
  const assetsQuery = useMoleculeAssetsQuery(open)
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [loadingRevisionId, setLoadingRevisionId] = useState<string | null>(null)

  const effectiveAssetId = assetsQuery.data?.some(asset => asset.id === selectedAssetId)
    ? selectedAssetId
    : assetsQuery.data?.some(asset => asset.id === currentBinding?.assetId)
      ? currentBinding?.assetId ?? null
      : assetsQuery.data?.[0]?.id ?? null
  const selectedAsset = assetsQuery.data?.find(asset => asset.id === effectiveAssetId) ?? null
  const revisionsQuery = useMoleculeAssetRevisionsQuery(open ? effectiveAssetId : null)

  const loadRevision = async (asset: MoleculeAsset, revision: MoleculeRevision) => {
    if (!activeObjectId) return
    setLoadingRevisionId(revision.id)
    try {
      const loaded = await loadMoleculeRevisionForEditor(asset, revision.id)
      useMoleculeStore.getState().setMolecule(loaded.revision.molecule)
      useMoleculeDocumentStore.getState().bindSavedDocument({
        objectId: activeObjectId,
        assetId: asset.id,
        headRevisionId: loaded.headRevision.id,
        assetVersion: asset.version,
        savedContentHash: loaded.headRevision.contentHash,
        savedAt: loaded.headRevision.createdAt,
      })
      useEditorStore.getState().flashHint(
        loaded.revision.id === loaded.headRevision.id
          ? `已载入“${asset.name}”最新版本`
          : `已载入“${asset.name}”历史版本；保存将创建新的头版本`,
      )
      onOpenChange(false)
    } catch (error) {
      useEditorStore.getState().flashHint(error instanceof Error ? error.message : '载入分子版本失败')
    } finally {
      setLoadingRevisionId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[min(680px,calc(100dvh-48px))] max-w-4xl grid-rows-[auto_minmax(0,1fr)] gap-3 p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-base"><Database size={16} />分子库</DialogTitle>
          <DialogDescription>载入最新版本，或将历史快照恢复为新的编辑版本。</DialogDescription>
        </DialogHeader>
        <div className="grid min-h-0 grid-cols-[minmax(180px,0.8fr)_minmax(280px,1.4fr)]">
          <div className="min-h-0 overflow-y-auto border-r border-border p-3">
            {assetsQuery.isLoading && <EmptyLine>正在读取分子库…</EmptyLine>}
            {assetsQuery.isError && <EmptyLine>无法读取分子库</EmptyLine>}
            {assetsQuery.data?.length === 0 && <EmptyLine>尚未保存分子</EmptyLine>}
            <div className="space-y-1">
              {assetsQuery.data?.map(asset => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setSelectedAssetId(asset.id)}
                  className={`w-full rounded-md border px-3 py-2.5 text-left transition-colors ${
                    effectiveAssetId === asset.id
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-transparent hover:border-border hover:bg-muted'
                  }`}
                >
                  <div className="truncate text-xs font-semibold">{asset.name}</div>
                  <div className={`mt-1 text-[10px] ${effectiveAssetId === asset.id ? 'text-background/70' : 'text-muted-foreground'}`}>
                    v{asset.version} · {formatDate(asset.updatedAt)}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="min-h-0 overflow-y-auto p-4">
            {!selectedAsset && <EmptyLine>选择一个分子查看版本</EmptyLine>}
            {selectedAsset && (
              <>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{selectedAsset.name}</h3>
                    <p className="text-[10px] text-muted-foreground">不可变修订 · 当前资产版本 v{selectedAsset.version}</p>
                  </div>
                  <History size={16} className="shrink-0 text-muted-foreground" />
                </div>
                {revisionsQuery.isLoading && <EmptyLine>正在读取版本历史…</EmptyLine>}
                {revisionsQuery.data?.length === 0 && <EmptyLine>该分子尚无修订</EmptyLine>}
                <div className="space-y-2">
                  {revisionsQuery.data?.map((revision, index) => {
                    const isHead = revision.id === selectedAsset.headRevisionId
                    return (
                      <div key={revision.id} className="flex items-center gap-3 rounded-md border border-border p-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            {isHead ? '最新版本' : `历史版本 ${revisionsQuery.data.length - index}`}
                            {isHead && <span className="rounded bg-foreground px-1.5 py-0.5 text-[9px] text-background">HEAD</span>}
                          </div>
                          <div className="mt-1 truncate font-mono text-[9px] text-muted-foreground" title={revision.id}>
                            {revision.id} · {formatDate(revision.createdAt)}
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant={isHead ? 'default' : 'outline'}
                          disabled={!activeObjectId || loadingRevisionId !== null}
                          onClick={() => void loadRevision(selectedAsset, revision)}
                        >
                          {loadingRevisionId === revision.id && <LoaderCircle size={12} className="mr-1 animate-spin" />}
                          {isHead ? '载入' : '恢复'}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MoleculeConflictDialog({
  objectId,
  asset,
  onSaveAsCopy,
}: {
  objectId: string
  asset: MoleculeAsset
  onSaveAsCopy: () => void
}) {
  const [loading, setLoading] = useState(false)

  const loadServerHead = async () => {
    if (!asset.headRevisionId) return
    setLoading(true)
    try {
      const loaded = await loadMoleculeRevisionForEditor(asset, asset.headRevisionId)
      useMoleculeStore.getState().setMolecule(loaded.headRevision.molecule)
      useMoleculeDocumentStore.getState().bindSavedDocument({
        objectId,
        assetId: asset.id,
        headRevisionId: loaded.headRevision.id,
        assetVersion: asset.version,
        savedContentHash: loaded.headRevision.contentHash,
        savedAt: loaded.headRevision.createdAt,
      })
      useEditorStore.getState().flashHint('已载入服务器最新版本')
    } catch (error) {
      useEditorStore.getState().flashHint(error instanceof Error ? error.message : '载入服务器版本失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={open => {
      if (!open) useMoleculeDocumentStore.getState().clearConflict(objectId)
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>发现更新冲突</DialogTitle>
          <DialogDescription>
            “{asset.name}”已经被其他编辑会话保存为 v{asset.version}。本地结构尚未丢失，请选择处理方式。
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border border-border bg-muted p-3 text-xs leading-5 text-muted-foreground">
          载入服务器版本会替换当前画布；另存为新分子会保留本地结构并创建独立文档。
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onSaveAsCopy}>保留本地并另存</Button>
          <Button disabled={loading || !asset.headRevisionId} onClick={() => void loadServerHead()}>
            {loading && <LoaderCircle size={13} className="mr-1 animate-spin" />}
            载入服务器版本
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EmptyLine({ children }: { children: string }) {
  return <div className="py-10 text-center text-xs text-muted-foreground">{children}</div>
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString('zh-CN', { hour12: false })
}
