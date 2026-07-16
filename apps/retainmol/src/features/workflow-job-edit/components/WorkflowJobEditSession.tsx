import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { GitBranch, LoaderCircle, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '@/domain/viewer/moleculeState'
import { useEditorStore } from '@/domain/viewer/editorState'
import { jobQueryKeys, jobsApi, type JobDetail } from '@/features/jobs'
import {
  loadMoleculeRevisionForEditor,
  moleculeAssetsApi,
  useMoleculeDocumentStore,
  useSaveMoleculeDocumentMutation,
} from '@/features/molecule-assets'
import { workflowQueryKeys, workflowsApi } from '@/features/workflows'
import { replaceWorkflowJobStructure } from '../application/replaceWorkflowJobStructure'

export interface WorkflowJobEditSessionProps {
  workflowId: string
  jobId: string
  onClose: (workflowId: string) => void
}

interface LoadedSession {
  readonly job: JobDetail
  readonly objectId: string
}

export function WorkflowJobEditSession({ workflowId, jobId, onClose }: WorkflowJobEditSessionProps) {
  const queryClient = useQueryClient()
  const saveDocument = useSaveMoleculeDocumentMutation()
  const [loaded, setLoaded] = useState<LoadedSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [committing, setCommitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [workflow, job] = await Promise.all([
          workflowsApi.getWorkflow(workflowId),
          jobsApi.getJob(jobId),
        ])
        if (!workflow.jobIds.includes(jobId)) throw new Error('该任务不属于当前工作流')
        const revisionId = revisionIdFor(job)
        if (!revisionId) throw new Error('该任务没有绑定可编辑的分子版本')
        const revision = await moleculeAssetsApi.getRevision(revisionId)
        const asset = await moleculeAssetsApi.getAsset(revision.assetId)
        const document = await loadMoleculeRevisionForEditor(asset, revisionId)
        if (cancelled) return

        const moleculeStore = useMoleculeStore.getState()
        const objectId = moleculeStore.activeObjectId
          ? moleculeStore.activeObjectId
          : moleculeStore.addToScene(document.revision.molecule, false)
        if (moleculeStore.activeObjectId) moleculeStore.setMolecule(document.revision.molecule)
        useMoleculeStore.getState().clearSelection()
        useMoleculeDocumentStore.getState().bindSavedDocument({
          objectId,
          assetId: asset.id,
          headRevisionId: document.headRevision.id,
          assetVersion: asset.version,
          savedContentHash: document.headRevision.contentHash,
          savedAt: document.headRevision.createdAt,
        })
        useMoleculeDocumentStore.getState().setPendingRevisionMetadata(objectId, {
          workflowId,
          replacesJobId: jobId,
          sourceRevisionId: revisionId,
        })
        setLoaded({ job, objectId })
        useEditorStore.getState().flashHint(`已载入工作流任务“${job.name}”的输入结构`)
      } catch (caught) {
        if (!cancelled) setError(messageFor(caught, '无法载入工作流节点结构'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [jobId, workflowId])

  async function saveAndReplace() {
    if (!loaded || committing) return
    setCommitting(true)
    setError(null)
    try {
      const moleculeState = useMoleculeStore.getState()
      if (moleculeState.activeObjectId !== loaded.objectId) {
        throw new Error('当前活动分子已经切换，拒绝覆盖工作流节点')
      }
      const molecule = selectActiveMoleculeOrEmpty(moleculeState)
      const documentState = useMoleculeDocumentStore.getState()
      const binding = documentState.bindingsByObjectId[loaded.objectId] ?? null
      const result = await saveDocument.mutateAsync({
        objectId: loaded.objectId,
        molecule,
        binding,
        metadata: {
          workflowId,
          replacesJobId: jobId,
          sourceRevisionId: revisionIdFor(loaded.job),
        },
      })
      const revisionId = result.binding?.headRevisionId
      if (!revisionId) throw new Error('分子版本保存成功，但没有返回头版本')

      const replaced = await replaceWorkflowJobStructure(jobsApi, workflowsApi, {
        workflowId,
        jobId,
        moleculeRevisionId: revisionId,
      })
      queryClient.setQueryData(workflowQueryKeys.detail(workflowId), replaced.workflow)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workflowQueryKeys.list() }),
        queryClient.invalidateQueries({ queryKey: jobQueryKeys.all }),
      ])
      useEditorStore.getState().flashHint(`已创建替代任务 ${replaced.replacementJob.id}`)
      onClose(workflowId)
    } catch (caught) {
      setError(messageFor(caught, '无法保存并替换工作流节点'))
    } finally {
      setCommitting(false)
    }
  }

  return (
    <div className="pointer-events-none absolute left-1/2 top-3 z-40 w-[min(680px,calc(100%-24px))] -translate-x-1/2">
      <section className="pointer-events-auto border border-border bg-card/95 text-card-foreground shadow-lg backdrop-blur-md" aria-label="工作流结构编辑会话">
        <div className="flex min-h-12 items-center gap-3 px-3 py-2">
          <span className="grid size-8 shrink-0 place-items-center bg-foreground text-background"><GitBranch className="size-4" /></span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{loaded?.job.name ?? '载入工作流节点'}</p>
            <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">{workflowId} · {jobId}</p>
          </div>
          {loading && <LoaderCircle className="size-4 animate-spin text-muted-foreground" />}
          <Button variant="ghost" size="sm" className="h-8" onClick={() => onClose(workflowId)}><X />取消</Button>
          <Button size="sm" className="h-8" disabled={!loaded || loading || committing} onClick={() => void saveAndReplace()}>
            {committing ? <LoaderCircle className="animate-spin" /> : <Save />}
            {committing ? '正在替换' : '保存并替换节点'}
          </Button>
        </div>
        {error && <p role="alert" className="border-t border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</p>}
      </section>
    </div>
  )
}

function revisionIdFor(job: JobDetail): string | null {
  const request = job.request
  if (!request || !('moleculeRevisionId' in request)) return null
  return typeof request.moleculeRevisionId === 'string' ? request.moleculeRevisionId : null
}

function messageFor(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}
