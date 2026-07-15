import { describe, expect, it } from 'vitest'
import {
  isWorkflowReferenceWire,
  isWorkflowWire,
  projectWorkflowListWire,
  projectWorkflowWire,
} from './workflowWireProjector'

describe('workflowWireProjector', () => {
  it('projects a snake_case workflow and its references', () => {
    const workflow = projectWorkflowWire({
      workflow_id: 'workflow-1',
      name: 'Optimization chain',
      created_at: '2026-07-14T00:00:00Z',
      updated_at: '2026-07-14T00:02:00Z',
      job_ids: ['prepare', 'optimize'],
      references: [{
        reference_id: 'reference-1',
        workflow_id: 'workflow-1',
        target_job_id: 'optimize',
        target_input_name: 'structure',
        source_job_id: 'prepare',
        source_kind: 'artifact',
        source_name: 'geometry.xyz',
        created_at: '2026-07-14T00:01:00Z',
      }],
    })

    expect(workflow).toEqual({
      workflowId: 'workflow-1',
      name: 'Optimization chain',
      createdAt: '2026-07-14T00:00:00Z',
      updatedAt: '2026-07-14T00:02:00Z',
      jobIds: ['prepare', 'optimize'],
      references: [{
        referenceId: 'reference-1',
        workflowId: 'workflow-1',
        targetJobId: 'optimize',
        targetInputName: 'structure',
        sourceJobId: 'prepare',
        sourceKind: 'artifact',
        sourceName: 'geometry.xyz',
        createdAt: '2026-07-14T00:01:00Z',
      }],
    })
  })

  it('accepts camelCase workflows and defaults omitted references', () => {
    const wire = {
      workflowId: 'workflow-2',
      name: 'Single job',
      createdAt: '2026-07-14T00:00:00Z',
      updatedAt: '2026-07-14T00:00:00Z',
      jobIds: ['job-1'],
    }

    expect(isWorkflowWire(wire)).toBe(true)
    expect(projectWorkflowWire(wire).references).toEqual([])
  })

  it('projects array and envelope collection forms', () => {
    const workflow = {
      id: 'workflow-3', name: 'Envelope',
      created_at: '2026-07-14T00:00:00Z', updatedAt: '2026-07-14T00:00:00Z',
      job_ids: [], references: [],
    }
    expect(projectWorkflowListWire([workflow])).toHaveLength(1)
    expect(projectWorkflowListWire({ workflows: [workflow] })[0].workflowId).toBe('workflow-3')
  })

  it('rejects invalid source kinds and malformed nested data', () => {
    const invalidReference = {
      referenceId: 'reference-1', workflowId: 'workflow-1',
      targetJobId: 'job-2', targetInputName: 'structure',
      sourceJobId: 'job-1', sourceKind: 'url', sourceName: 'geometry.xyz',
      createdAt: '2026-07-14T00:00:00Z',
    }
    expect(isWorkflowReferenceWire(invalidReference)).toBe(false)
    expect(() => projectWorkflowWire({
      workflowId: 'workflow-1', name: 'Bad reference',
      createdAt: '2026-07-14T00:00:00Z', updatedAt: '2026-07-14T00:00:00Z',
      jobIds: ['job-1', 'job-2'], references: [invalidReference],
    })).toThrow('workflow.references[0]')
    expect(() => projectWorkflowListWire({ workflows: [null] })).toThrow('workflows[0]')
    expect(() => projectWorkflowListWire({})).toThrow('workflows collection')
  })
})
