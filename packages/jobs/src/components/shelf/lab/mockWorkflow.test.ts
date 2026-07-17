import { describe, expect, it } from 'vitest'
import {
  MOCK_FAIL_NODE,
  advanceMock,
  initialNodeStates,
  mockEdgeStates,
  mockFinished,
  mockJobs,
  mockMolecules,
} from './mockWorkflow'

function runToEnd(failNode: string | null) {
  let states = initialNodeStates()
  for (let tick = 0; tick < 20 && !mockFinished(states); tick++) {
    states = advanceMock(states, failNode)
  }
  return states
}

describe('mockWorkflow', () => {
  it('provides molecules for every mock node', () => {
    const molecules = mockMolecules()
    for (const job of mockJobs()) {
      expect(molecules.get(job.id)?.state).toBe('ready')
    }
  })

  it('starts with sources ready and downstream waiting', () => {
    const states = initialNodeStates()
    expect(states.get('mock-reactant')).toBe('ready')
    expect(states.get('mock-product')).toBe('ready')
    expect(states.get('mock-ts-guess')).toBe('waiting')
    expect(states.get('mock-irc')).toBe('waiting')
  })

  it('runs the whole chain to success without a fail node', () => {
    const states = runToEnd(null)
    expect([...states.values()].every(state => state === 'succeeded')).toBe(true)
  })

  it('blocks all descendants of a failed node', () => {
    const states = runToEnd(MOCK_FAIL_NODE)
    expect(states.get('mock-ts-refine')).toBe('failed')
    expect(states.get('mock-frequency')).toBe('blocked')
    expect(states.get('mock-irc')).toBe('blocked')
    expect(states.get('mock-reactant')).toBe('succeeded')
  })

  it('marks edges flowing while the target consumes a finished upstream', () => {
    let states = initialNodeStates()
    states = advanceMock(states, null) // sources running
    states = advanceMock(states, null) // sources succeeded, guess ready
    const edges = mockEdgeStates(states)
    expect(edges.get('e-reactant-guess')).toBe('flowing')
    expect(edges.get('e-guess-refine')).toBe('pending')

    const final = runToEnd(MOCK_FAIL_NODE)
    const finalEdges = mockEdgeStates(final)
    expect(finalEdges.get('e-refine-freq')).toBe('blocked')
    expect(finalEdges.get('e-guess-refine')).toBe('done')
  })
})
