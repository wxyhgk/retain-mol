import { describe, expect, it } from 'vitest'
import { validateWorkflowGraph } from './workflowGraph'

const edge = (sourceJobId: string, targetJobId: string) => ({
  sourceJobId,
  sourceKind: 'artifact' as const,
  sourceName: 'optimized.xyz',
  targetJobId,
  targetInputName: 'structure',
})

describe('validateWorkflowGraph', () => {
  it('returns a topological order for a valid workflow', () => {
    expect(validateWorkflowGraph(['prepare', 'optimize', 'analyze'], [edge('prepare', 'optimize'), edge('optimize', 'analyze')])).toMatchObject({ ok: true, order: ['prepare', 'optimize', 'analyze'] })
  })

  it('rejects cycles and duplicate target inputs', () => {
    expect(validateWorkflowGraph(['a', 'b'], [edge('a', 'b'), edge('b', 'a')])).toMatchObject({ ok: false, error: expect.stringContaining('cycle') })
    expect(validateWorkflowGraph(['a', 'b', 'c'], [edge('a', 'c'), edge('b', 'c')])).toMatchObject({ ok: false, error: expect.stringContaining('only one') })
  })
})
