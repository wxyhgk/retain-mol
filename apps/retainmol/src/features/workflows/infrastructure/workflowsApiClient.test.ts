import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveWorkflowsApiBase, WorkflowsApiClient } from './workflowsApiClient'

afterEach(() => vi.unstubAllGlobals())

describe('WorkflowsApiClient', () => {
  it('matches the xTB backend base URL behavior', () => {
    expect(resolveWorkflowsApiBase(undefined, { protocol: 'http:', hostname: '192.168.0.12' }))
      .toBe('http://192.168.0.12:8000')
    expect(resolveWorkflowsApiBase('https://compute.example.test/', { protocol: 'http:', hostname: 'localhost' }))
      .toBe('https://compute.example.test')
  })

  it('saves workflow nodes and references to the jobs workflow endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      workflowId: 'workflow-1',
      name: 'Optimization chain',
      createdAt: '2026-07-14T00:00:00Z',
      updatedAt: '2026-07-14T00:00:00Z',
      jobIds: ['prepare', 'optimize'],
      references: [],
    }), { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    const client = new WorkflowsApiClient('http://compute.test:8000')

    const workflow = await client.createWorkflow({
      name: 'Optimization chain',
      jobIds: ['prepare', 'optimize'],
      references: [{
        sourceJobId: 'prepare', sourceKind: 'artifact', sourceName: 'geometry.xyz',
        targetJobId: 'optimize', targetInputName: 'structure',
      }],
    })

    expect(workflow.workflowId).toBe('workflow-1')
    expect(fetchMock.mock.calls[0][0]).toBe('http://compute.test:8000/jobs/workflows')
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ jobIds: ['prepare', 'optimize'] })
  })

  it('creates the fixed TS preparation workflow from explicit artifact ids', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      workflow: {
        workflowId: 'workflow-ts',
        name: 'SN2 TS',
        createdAt: '2026-07-15T00:00:00Z',
        updatedAt: '2026-07-15T00:00:00Z',
        jobIds: ['reactant-job', 'product-job', 'ts-job'],
        references: [],
      },
      targetJob: { jobId: 'ts-job', taskType: 'ts-initial-guess', status: 'created' },
    }), { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    const client = new WorkflowsApiClient('http://compute.test:8000')

    const workflow = await client.createTsPreparationWorkflow({
      name: 'SN2 TS',
      reactantJobId: 'reactant-job',
      reactantArtifactId: 'reactant-xyz',
      productJobId: 'product-job',
      productArtifactId: 'product-xyz',
    })

    expect(workflow.workflowId).toBe('workflow-ts')
    expect(fetchMock.mock.calls[0][0]).toBe('http://compute.test:8000/jobs/workflows/ts-preparation')
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      reactantArtifactId: 'reactant-xyz',
      productArtifactId: 'product-xyz',
    })
  })
})
