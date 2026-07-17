import { useEffect, useState } from 'react'
import { Atom, LoaderCircle, X } from 'lucide-react'
import { Button } from '@retainmol/ui-kit'
import { useMoleculeStore } from '@retainmol/mol-viewer/state'
import { useEditorStore } from '@retainmol/mol-viewer/state'
import {
  loadMoleculeRevisionForEditor,
  moleculeAssetsApi,
  useMoleculeDocumentStore,
} from '@retainmol/molecule-assets'
import { resolveOptimizedJobStructure } from '../application/loadJobStructure'
import { jobsApi } from '../application/jobQueries'

export interface JobEditorLoadSessionProps {
  jobId: string
  artifactId: string | null
  onClose: (jobId: string) => void
}

export function JobEditorLoadSession({ jobId, artifactId, onClose }: JobEditorLoadSessionProps) {
  const [loading, setLoading] = useState(true)
  const [loadedName, setLoadedName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [job, artifacts] = await Promise.all([
          jobsApi.getJob(jobId),
          jobsApi.listJobArtifacts(jobId),
        ])
        const revisionId = revisionIdFor(job.request)
        if (!revisionId) throw new Error('该任务没有绑定可编辑的分子版本')
        const revision = await moleculeAssetsApi.getRevision(revisionId)
        const asset = await moleculeAssetsApi.getAsset(revision.assetId)
        const document = await loadMoleculeRevisionForEditor(asset, revisionId)
        if (cancelled) return

        let molecule = document.revision.molecule
        if (artifactId) {
          const artifact = artifacts.find(item => item.id === artifactId)
          if (!artifact) throw new Error('任务输出产物不存在或已被删除')
          const result = resolveOptimizedJobStructure(artifact, { ...job, artifacts }, molecule)
          if (result.ok === false) throw new Error(result.message)
          molecule = result.molecule
        }

        const moleculeStore = useMoleculeStore.getState()
        const objectId = moleculeStore.activeObjectId
          ? moleculeStore.activeObjectId
          : moleculeStore.addToScene(molecule, false)
        if (moleculeStore.activeObjectId) moleculeStore.setMolecule(molecule)
        moleculeStore.clearSelection()

        useMoleculeDocumentStore.getState().bindSavedDocument({
          objectId,
          assetId: asset.id,
          headRevisionId: document.headRevision.id,
          assetVersion: asset.version,
          savedContentHash: document.headRevision.contentHash,
          savedAt: document.headRevision.createdAt,
        })
        useMoleculeDocumentStore.getState().setPendingRevisionMetadata(objectId, {
          sourceJobId: job.id,
          sourceRevisionId: revisionId,
          ...(artifactId ? { derivedFromArtifactId: artifactId } : {}),
        })
        setLoadedName(job.name)
        useEditorStore.getState().flashHint(
          artifactId ? `已载入任务“${job.name}”的输出结构` : `已载入任务“${job.name}”的输入结构`,
        )
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : '无法载入任务结构')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [artifactId, jobId])

  return (
    <div className="pointer-events-none absolute left-1/2 top-3 z-40 w-[min(680px,calc(100%-24px))] -translate-x-1/2">
      <section className="pointer-events-auto border border-border bg-card/95 text-card-foreground shadow-lg backdrop-blur-md" aria-label="任务结构载入会话">
        <div className="flex min-h-12 items-center gap-3 px-3 py-2">
          <span className="grid size-8 shrink-0 place-items-center bg-foreground text-background"><Atom className="size-4" /></span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{loadedName ?? '载入任务结构'}</p>
            <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">{jobId}{artifactId ? ` · ${artifactId}` : ' · 输入版本'}</p>
          </div>
          {loading && <LoaderCircle className="size-4 animate-spin text-muted-foreground" />}
          <Button variant="ghost" size="sm" className="h-8" onClick={() => onClose(jobId)}><X />返回任务</Button>
        </div>
        {error && <p role="alert" className="border-t border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</p>}
      </section>
    </div>
  )
}

function revisionIdFor(request: { moleculeRevisionId?: string } | undefined): string | null {
  return request?.moleculeRevisionId?.trim() || null
}
