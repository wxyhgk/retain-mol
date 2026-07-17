import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { CirclePlus, GitBranch, LoaderCircle, RefreshCw, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { validateWorkflowGraph } from '../domain/workflowGraph'
import type { TsPreparationSourceJob, WorkflowDefinition, WorkflowJobOption, WorkflowReferenceDraft, WorkflowSaveRequest } from '../domain/workflowTypes'
import { useSaveWorkflowMutation, useWorkflowsQuery, workflowsApi } from '../application/workflowQueries'
import { TsPreparationWorkflowDialog } from './TsPreparationWorkflowDialog'

const WorkflowCanvas = lazy(() => import('./WorkflowCanvas'))

export interface WorkflowEditorProps {
  jobs: WorkflowJobOption[]
  tsPreparationSources?: TsPreparationSourceJob[]
  initialWorkflowId?: string | null
  onEditJobStructure?: (workflowId: string, jobId: string) => void
  onWorkflowSaved?: (workflow: WorkflowDefinition) => void | Promise<void>
  className?: string
}

const inputClass = 'h-8 w-full border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/20'

function emptyReference(): WorkflowReferenceDraft {
  return {
    sourceJobId: '',
    sourceKind: 'artifact',
    sourceName: 'optimized.xyz',
    targetJobId: '',
    targetInputName: 'structure',
  }
}

function asDraft(workflow: WorkflowDefinition) {
  return {
    name: workflow.name,
    jobIds: workflow.jobIds,
    references: workflow.references.map(({ targetJobId, targetInputName, sourceJobId, sourceKind, sourceName }) => ({
      targetJobId,
      targetInputName,
      sourceJobId,
      sourceKind,
      sourceName,
    })),
  }
}

export function WorkflowEditor({ jobs, tsPreparationSources = [], initialWorkflowId, onEditJobStructure, onWorkflowSaved, className }: WorkflowEditorProps) {
  const workflowsQuery = useWorkflowsQuery()
  const saveWorkflow = useSaveWorkflowMutation()
  const workflows = workflowsQuery.data ?? []
  const isLoading = workflowsQuery.isLoading
  const isSaving = saveWorkflow.isPending
  const error = workflowsQuery.error?.message ?? saveWorkflow.error?.message ?? null
  const [workflowId, setWorkflowId] = useState<string | null>(null)
  const [name, setName] = useState('Untitled workflow')
  const [jobIds, setJobIds] = useState<string[]>([])
  const [references, setReferences] = useState<WorkflowReferenceDraft[]>([])
  const [reference, setReference] = useState(emptyReference)
  const [editorError, setEditorError] = useState<string | null>(null)
  const appliedInitialWorkflowId = useRef<string | null>(null)

  const jobsById = useMemo(() => new Map(jobs.map(job => [job.id, job])), [jobs])
  const graph = useMemo(() => validateWorkflowGraph(jobIds, references), [jobIds, references])
  const selectedJobs = jobIds.map(jobId => jobsById.get(jobId)).filter(Boolean) as WorkflowJobOption[]

  function beginNew() {
    setWorkflowId(null)
    setName('Untitled workflow')
    setJobIds([])
    setReferences([])
    setReference(emptyReference())
    setEditorError(null)
  }

  function applyWorkflow(workflow: WorkflowDefinition) {
    const draft = asDraft(workflow)
    setWorkflowId(workflow.workflowId)
    setName(draft.name)
    setJobIds(draft.jobIds)
    setReferences(draft.references)
    setReference(emptyReference())
    setEditorError(null)
  }

  function selectWorkflow(nextId: string) {
    const workflow = workflows.find(current => current.workflowId === nextId)
    if (!workflow) return
    applyWorkflow(workflow)
  }

  useEffect(() => {
    if (!initialWorkflowId || appliedInitialWorkflowId.current === initialWorkflowId) return
    appliedInitialWorkflowId.current = initialWorkflowId
    let cancelled = false
    void workflowsApi.getWorkflow(initialWorkflowId).then(workflow => {
      if (cancelled) return
      applyWorkflow(workflow)
    }).catch(caught => {
      if (!cancelled) setEditorError(caught instanceof Error ? caught.message : '无法载入工作流。')
    })
    return () => { cancelled = true }
  }, [initialWorkflowId])

  function toggleJob(jobId: string) {
    const selected = jobIds.includes(jobId)
    setJobIds(current => selected ? current.filter(id => id !== jobId) : [...current, jobId])
    if (selected) {
      setReferences(current => current.filter(edge => edge.sourceJobId !== jobId && edge.targetJobId !== jobId))
    }
  }

  function addReference() {
    const next = [...references, reference]
    const validation = validateWorkflowGraph(jobIds, next)
    if (!validation.ok) {
      setEditorError(validation.error ?? 'Invalid reference.')
      return
    }
    setReferences(next)
    setReference(emptyReference())
    setEditorError(null)
  }

  async function save() {
    const request: WorkflowSaveRequest = { name: name.trim(), jobIds, references }
    const validation = validateWorkflowGraph(request.jobIds, request.references)
    if (!request.name) {
      setEditorError('A workflow name is required.')
      return
    }
    if (!validation.ok) {
      setEditorError(validation.error ?? 'Invalid workflow graph.')
      return
    }
    setEditorError(null)
    try {
      const saved = await saveWorkflow.mutateAsync({ workflowId, request })
      setWorkflowId(saved.workflowId)
      if (onWorkflowSaved) await onWorkflowSaved(saved)
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : '无法保存工作流。')
    }
  }

  return (
    <section className={cn('grid h-full min-h-0 min-w-0 grid-cols-[13rem_minmax(0,1fr)_17rem] overflow-hidden border border-border bg-card text-foreground', className)}>
      <aside className="flex min-h-0 flex-col border-r border-border bg-muted">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div><h2 className="text-sm font-semibold">Workflows</h2><p className="text-[11px] text-muted-foreground">Saved DAGs</p></div>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Refresh workflows" disabled={workflowsQuery.isFetching} onClick={() => void workflowsQuery.refetch()}><RefreshCw className={cn('size-3.5', workflowsQuery.isFetching && 'animate-spin')} /></Button>
        </div>
        <Button variant="outline" size="sm" className="m-2 h-8 justify-start text-xs" onClick={beginNew}><CirclePlus />New workflow</Button>
        <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-2">
          {workflows.length === 0 && !isLoading && <p className="px-2 py-4 text-center text-xs text-muted-foreground">No saved workflows.</p>}
          {workflows.map(workflow => <button key={workflow.workflowId} type="button" onClick={() => selectWorkflow(workflow.workflowId)} className={cn('mb-1 w-full border px-2.5 py-2 text-left transition-colors', workflowId === workflow.workflowId ? 'border-foreground/40 bg-card shadow-sm' : 'border-transparent hover:border-border hover:bg-accent/50')}><span className="block truncate text-xs font-medium">{workflow.name}</span><span className="mt-1 block text-[10px] text-muted-foreground">{workflow.jobIds.length} jobs · {workflow.references.length} links</span></button>)}
        </div>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-col">
        <header className="flex items-center gap-3 border-b border-border px-3 py-2">
          <GitBranch className="size-4 text-foreground" />
          <input value={name} onChange={event => setName(event.target.value)} aria-label="Workflow name" className="h-8 min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold outline-none focus:ring-0" />
          <span className={cn('shrink-0 border px-1.5 py-0.5 text-[10px] font-medium', graph.ok ? 'border-border text-muted-foreground' : 'border-foreground/50 text-foreground')}>{graph.ok ? 'DAG valid' : 'Graph invalid'}</span>
          <TsPreparationWorkflowDialog
            sources={tsPreparationSources}
            onCreated={async workflow => {
              applyWorkflow(workflow)
              if (onWorkflowSaved) await onWorkflowSaved(workflow)
            }}
          />
          <Button size="sm" className="h-8" disabled={isSaving} onClick={() => void save()}>{isSaving ? <LoaderCircle className="animate-spin" /> : <Save />}Save</Button>
        </header>
        {(error || editorError) && <div className="mx-3 mt-3 flex items-start justify-between gap-3 border border-foreground/30 bg-muted px-2.5 py-2 text-xs text-foreground"><span>{editorError ?? error}</span><button type="button" className="font-medium" onClick={() => setEditorError(null)}>Close</button></div>}
        <Suspense fallback={<div className="grid min-h-0 flex-1 place-items-center text-xs text-muted-foreground"><LoaderCircle className="mr-2 animate-spin" />加载工作流画布</div>}>
          <WorkflowCanvas
            jobs={selectedJobs}
            references={references}
            onEditJobStructure={workflowId && onEditJobStructure
              ? jobId => onEditJobStructure(workflowId, jobId)
              : undefined}
            onConnectJobs={(sourceJobId, targetJobId) => setReference({
              sourceJobId,
              sourceKind: 'artifact',
              sourceName: 'optimized.xyz',
              targetJobId,
              targetInputName: 'structure',
            })}
          />
        </Suspense>
        <div className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">Execution order: {graph.ok ? graph.order.map(id => jobsById.get(id)?.name ?? id).join(' → ') : 'Resolve graph errors before saving.'}</div>
      </main>

      <aside className="min-h-0 overflow-y-auto border-l border-border bg-muted p-3">
        <section>
          <h2 className="text-sm font-semibold">Jobs</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Select task nodes for this workflow.</p>
          <div className="mt-2 space-y-1.5">
            {jobs.map(job => <label key={job.id} className="flex cursor-pointer items-center gap-2 border border-border bg-card px-2 py-1.5 text-xs"><input type="checkbox" checked={jobIds.includes(job.id)} onChange={() => toggleJob(job.id)} className="size-3.5 accent-foreground" /><span className="min-w-0 flex-1 truncate">{job.name}</span>{job.status && <span className="text-[10px] text-muted-foreground">{job.status}</span>}</label>)}
          </div>
        </section>

        <section className="mt-4 border-t border-border pt-3">
          <h2 className="text-sm font-semibold">Add reference</h2>
          <div className="mt-2 grid gap-2">
            <WorkflowSelect label="From job" value={reference.sourceJobId} onChange={value => setReference(current => ({ ...current, sourceJobId: value }))} jobs={selectedJobs} />
            <label className="grid gap-1 text-[11px] font-medium text-muted-foreground">Source type<select value={reference.sourceKind} onChange={event => setReference(current => ({ ...current, sourceKind: event.target.value as WorkflowReferenceDraft['sourceKind'] }))} className={inputClass}><option value="artifact">Output artifact</option><option value="input">Input value</option></select></label>
            <label className="grid gap-1 text-[11px] font-medium text-muted-foreground">Source name<input value={reference.sourceName} onChange={event => setReference(current => ({ ...current, sourceName: event.target.value }))} className={inputClass} /></label>
            <WorkflowSelect label="To job" value={reference.targetJobId} onChange={value => setReference(current => ({ ...current, targetJobId: value }))} jobs={selectedJobs} />
            <label className="grid gap-1 text-[11px] font-medium text-muted-foreground">Target input<input value={reference.targetInputName} onChange={event => setReference(current => ({ ...current, targetInputName: event.target.value }))} className={inputClass} /></label>
            <Button variant="outline" size="sm" className="h-8" onClick={addReference} disabled={!reference.sourceJobId || !reference.targetJobId || !reference.sourceName.trim() || !reference.targetInputName.trim()}><GitBranch />Add link</Button>
          </div>
        </section>

        <section className="mt-4 border-t border-border pt-3">
          <h2 className="text-sm font-semibold">References</h2>
          {references.length === 0 && <p className="mt-1.5 text-xs text-muted-foreground">No data dependencies.</p>}
          <div className="mt-2 space-y-1.5">
            {references.map((edge, index) => <div key={`${edge.sourceJobId}-${edge.targetJobId}-${edge.targetInputName}`} className="flex items-start gap-1.5 border border-border bg-card px-2 py-1.5"><p className="min-w-0 flex-1 text-[11px] text-foreground"><span className="font-medium">{jobsById.get(edge.sourceJobId)?.name ?? edge.sourceJobId}</span> · {edge.sourceName}<br /><span className="font-medium">{jobsById.get(edge.targetJobId)?.name ?? edge.targetJobId}</span> · {edge.targetInputName}</p><Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" title="Remove reference" onClick={() => setReferences(current => current.filter((_, currentIndex) => currentIndex !== index))}><Trash2 className="size-3.5" /></Button></div>)}
          </div>
        </section>
      </aside>
    </section>
  )
}

function WorkflowSelect({ label, value, onChange, jobs }: { label: string; value: string; onChange: (value: string) => void; jobs: WorkflowJobOption[] }) {
  return <label className="grid gap-1 text-[11px] font-medium text-muted-foreground">{label}<select value={value} onChange={event => onChange(event.target.value)} className={inputClass}><option value="">Select job</option>{jobs.map(job => <option key={job.id} value={job.id}>{job.name}</option>)}</select></label>
}
