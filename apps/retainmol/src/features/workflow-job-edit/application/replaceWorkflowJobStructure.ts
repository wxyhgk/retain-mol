import type { JobsApi, JobDetail } from '@retainmol/jobs'
import type {
  WorkflowDefinition,
  WorkflowReferenceDraft,
  WorkflowsApi,
} from '@/features/workflows'

export interface ReplaceWorkflowJobStructureInput {
  readonly workflowId: string
  readonly jobId: string
  readonly moleculeRevisionId: string
}

export interface ReplaceWorkflowJobStructureResult {
  readonly previousJob: JobDetail
  readonly replacementJob: JobDetail
  readonly workflow: WorkflowDefinition
}

/**
 * Jobs and molecule revisions are immutable. Editing a workflow input therefore
 * creates a replacement job and rewires the saved DAG instead of mutating history.
 */
export async function replaceWorkflowJobStructure(
  jobsApi: JobsApi,
  workflowsApi: WorkflowsApi,
  input: ReplaceWorkflowJobStructureInput,
): Promise<ReplaceWorkflowJobStructureResult> {
  const [workflow, previousJob] = await Promise.all([
    workflowsApi.getWorkflow(input.workflowId),
    jobsApi.getJob(input.jobId),
  ])
  if (!workflow.jobIds.includes(input.jobId)) {
    throw new Error('目标任务不属于当前工作流')
  }
  if (!previousJob.request) {
    throw new Error('目标任务缺少可复用的计算参数')
  }

  const request = previousJob.request
  if (request.method !== 'gfn2' || !('optLevel' in request) || !('maxSteps' in request)) {
    throw new Error('当前仅支持替换工作流中的 xTB 优化任务结构')
  }
  const replacementJob = await jobsApi.createXtbOptimizationJob({
    name: request.name ?? previousJob.name,
    charge: request.charge,
    multiplicity: request.multiplicity,
    method: request.method,
    maxSteps: request.maxSteps,
    optLevel: request.optLevel,
    moleculeRevisionId: input.moleculeRevisionId,
  })
  const replaceId = (jobId: string) => jobId === input.jobId ? replacementJob.id : jobId
  const references: WorkflowReferenceDraft[] = workflow.references.map(reference => ({
    targetJobId: replaceId(reference.targetJobId),
    targetInputName: reference.targetInputName,
    sourceJobId: replaceId(reference.sourceJobId),
    sourceKind: reference.sourceKind,
    sourceName: reference.sourceName,
    ...(reference.sourceArtifactId && reference.sourceJobId !== input.jobId
      ? { sourceArtifactId: reference.sourceArtifactId }
      : {}),
  }))
  const updatedWorkflow = await workflowsApi.updateWorkflow(workflow.workflowId, {
    name: workflow.name,
    jobIds: workflow.jobIds.map(replaceId),
    references,
  })

  return { previousJob, replacementJob, workflow: updatedWorkflow }
}
