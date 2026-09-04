import { useMemo, useState } from 'react'
import { GitMerge, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useCreateTsPreparationWorkflowMutation } from '../application/workflowQueries'
import type { TsPreparationSourceJob, WorkflowDefinition } from '../domain/workflowTypes'

const selectClass = 'h-9 w-full border border-border bg-card px-2 text-sm text-foreground outline-none focus:border-black'

export function TsPreparationWorkflowDialog({
  sources,
  onCreated,
}: {
  sources: TsPreparationSourceJob[]
  onCreated: (workflow: WorkflowDefinition) => void | Promise<void>
}) {
  const mutation = useCreateTsPreparationWorkflowMutation()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('TS 前置流程')
  const [reactantJobId, setReactantJobId] = useState('')
  const [reactantArtifactId, setReactantArtifactId] = useState('')
  const [productJobId, setProductJobId] = useState('')
  const [productArtifactId, setProductArtifactId] = useState('')

  const reactantJob = useMemo(
    () => sources.find(job => job.id === reactantJobId),
    [reactantJobId, sources],
  )
  const productJob = useMemo(
    () => sources.find(job => job.id === productJobId),
    [productJobId, sources],
  )
  const canSubmit = Boolean(
    name.trim()
      && reactantJobId
      && productJobId
      && reactantJobId !== productJobId
      && reactantArtifactId
      && productArtifactId,
  )

  async function createWorkflow() {
    if (!canSubmit) return
    const workflow = await mutation.mutateAsync({
      name: name.trim(),
      reactantJobId,
      reactantArtifactId,
      productJobId,
      productArtifactId,
    })
    await onCreated(workflow)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <GitMerge />TS 前置流程
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建 TS 前置流程</DialogTitle>
          <DialogDescription>
            选择两个已经成功优化的结构产物。系统会创建一个 TS 初猜草稿，并保存明确的 Artifact 引用。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium">
            流程名称
            <input
              value={name}
              onChange={event => setName(event.target.value)}
              className={selectClass}
            />
          </label>
          <EndpointFields
            label="反应物"
            jobs={sources}
            excludedJobId={productJobId}
            jobId={reactantJobId}
            artifactId={reactantArtifactId}
            selectedJob={reactantJob}
            onJobChange={value => {
              setReactantJobId(value)
              setReactantArtifactId('')
            }}
            onArtifactChange={setReactantArtifactId}
          />
          <EndpointFields
            label="产物"
            jobs={sources}
            excludedJobId={reactantJobId}
            jobId={productJobId}
            artifactId={productArtifactId}
            selectedJob={productJob}
            onJobChange={value => {
              setProductJobId(value)
              setProductArtifactId('')
            }}
            onArtifactChange={setProductArtifactId}
          />
          {sources.length < 2 && (
            <p className="border border-foreground/30 bg-muted px-3 py-2 text-xs text-foreground">
              至少需要两个已成功且具有 XYZ、SDF、MOL 或 RetainMol JSON 输出的任务。
            </p>
          )}
          {mutation.error && (
            <p className="border border-foreground/30 bg-muted px-3 py-2 text-xs text-foreground">
              {mutation.error.message}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button disabled={!canSubmit || mutation.isPending} onClick={() => void createWorkflow()}>
            {mutation.isPending ? <LoaderCircle className="animate-spin" /> : <GitMerge />}
            创建流程
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EndpointFields({
  label,
  jobs,
  excludedJobId,
  jobId,
  artifactId,
  selectedJob,
  onJobChange,
  onArtifactChange,
}: {
  label: string
  jobs: TsPreparationSourceJob[]
  excludedJobId: string
  jobId: string
  artifactId: string
  selectedJob?: TsPreparationSourceJob
  onJobChange: (value: string) => void
  onArtifactChange: (value: string) => void
}) {
  return (
    <fieldset className="grid gap-2 border border-border p-3">
      <legend className="px-1 text-sm font-semibold">{label}</legend>
      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
        优化任务
        <select value={jobId} onChange={event => onJobChange(event.target.value)} className={selectClass}>
          <option value="">选择任务</option>
          {jobs.map(job => (
            <option key={job.id} value={job.id} disabled={job.id === excludedJobId}>{job.name}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
        结构产物
        <select
          value={artifactId}
          onChange={event => onArtifactChange(event.target.value)}
          className={selectClass}
          disabled={!selectedJob}
        >
          <option value="">选择 Artifact</option>
          {selectedJob?.artifacts.map(artifact => (
            <option key={artifact.id} value={artifact.id}>{artifact.name} · {artifact.format.toUpperCase()}</option>
          ))}
        </select>
      </label>
    </fieldset>
  )
}
