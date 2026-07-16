import { describe, expect, it, vi } from 'vitest'
import type { JobsApi, JobDetail } from '@/features/jobs'
import type { WorkflowDefinition, WorkflowsApi } from '@/features/workflows'
import { replaceWorkflowJobStructure } from './replaceWorkflowJobStructure'

const oldJob: JobDetail = {
  id: 'job-old',
  kind: 'xtb.optimize',
  status: 'succeeded',
  name: 'Reactant optimization',
  createdAt: '2026-07-15T00:00:00Z',
  request: {
    name: 'Reactant optimization',
    charge: 0,
    multiplicity: 1,
    method: 'gfn2',
    maxSteps: 250,
    optLevel: 'tight',
    moleculeRevisionId: 'rev-old',
  },
}

const workflow: WorkflowDefinition = {
  workflowId: 'workflow-1',
  name: 'TS preparation',
  createdAt: '2026-07-15T00:00:00Z',
  updatedAt: '2026-07-15T00:00:00Z',
  jobIds: ['job-old', 'job-next'],
  references: [{
    referenceId: 'reference-1',
    workflowId: 'workflow-1',
    targetJobId: 'job-next',
    targetInputName: 'structure',
    sourceJobId: 'job-old',
    sourceKind: 'artifact',
    sourceName: 'optimized.xyz',
    sourceArtifactId: 'artifact-old',
    createdAt: '2026-07-15T00:00:00Z',
  }],
}

describe('replaceWorkflowJobStructure', () => {
  it('creates an immutable replacement job and rewires every DAG reference', async () => {
    const replacement = { ...oldJob, id: 'job-new', status: 'queued' as const }
    const jobsApi = {
      getJob: vi.fn().mockResolvedValue(oldJob),
      createXtbOptimizationJob: vi.fn().mockResolvedValue(replacement),
    } as unknown as JobsApi
    const workflowsApi = {
      getWorkflow: vi.fn().mockResolvedValue(workflow),
      updateWorkflow: vi.fn().mockImplementation(async (_id, request) => ({
        ...workflow,
        jobIds: request.jobIds,
        references: request.references,
      })),
    } as unknown as WorkflowsApi

    const result = await replaceWorkflowJobStructure(jobsApi, workflowsApi, {
      workflowId: 'workflow-1',
      jobId: 'job-old',
      moleculeRevisionId: 'rev-new',
    })

    expect(jobsApi.createXtbOptimizationJob).toHaveBeenCalledWith({
      name: 'Reactant optimization',
      charge: 0,
      multiplicity: 1,
      method: 'gfn2',
      maxSteps: 250,
      optLevel: 'tight',
      moleculeRevisionId: 'rev-new',
    })
    expect(workflowsApi.updateWorkflow).toHaveBeenCalledWith('workflow-1', {
      name: 'TS preparation',
      jobIds: ['job-new', 'job-next'],
      references: [{
        targetJobId: 'job-next',
        targetInputName: 'structure',
        sourceJobId: 'job-new',
        sourceKind: 'artifact',
        sourceName: 'optimized.xyz',
      }],
    })
    expect(result.replacementJob.id).toBe('job-new')
  })

  it('rejects jobs outside the workflow before creating a replacement', async () => {
    const jobsApi = {
      getJob: vi.fn().mockResolvedValue(oldJob),
      createXtbOptimizationJob: vi.fn(),
    } as unknown as JobsApi
    const workflowsApi = {
      getWorkflow: vi.fn().mockResolvedValue({ ...workflow, jobIds: ['job-next'] }),
    } as unknown as WorkflowsApi

    await expect(replaceWorkflowJobStructure(jobsApi, workflowsApi, {
      workflowId: 'workflow-1',
      jobId: 'job-old',
      moleculeRevisionId: 'rev-new',
    })).rejects.toThrow('不属于当前工作流')
    expect(jobsApi.createXtbOptimizationJob).not.toHaveBeenCalled()
  })
})
