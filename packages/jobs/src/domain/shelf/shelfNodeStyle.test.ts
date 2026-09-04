import { describe, expect, it } from 'vitest'
import { shelfNodeStatusStyle, workflowNodeStateLabel, type WorkflowNodeVisualState } from './shelfNodeStyle'

const ALL_STATES: WorkflowNodeVisualState[] = ['waiting', 'ready', 'queued', 'running', 'succeeded', 'failed', 'cancelled', 'blocked']

describe('shelfNodeStyle', () => {
  it('provides a label and a complete style for every node state in both themes', () => {
    for (const state of ALL_STATES) {
      expect(workflowNodeStateLabel(state).length).toBeGreaterThan(0)
      for (const theme of ['day', 'night'] as const) {
        const style = shelfNodeStatusStyle(state, theme)
        expect(style.glassOpacity).toBeGreaterThan(0)
        expect(style.moleculeOpacity).toBeGreaterThan(0)
      }
    }
  })

  it('pulses only while running and dims blocked interiors hardest', () => {
    for (const state of ALL_STATES) {
      expect(shelfNodeStatusStyle(state, 'day').pulse).toBe(state === 'running')
    }
    expect(shelfNodeStatusStyle('blocked', 'day').moleculeOpacity).toBeLessThan(shelfNodeStatusStyle('failed', 'day').moleculeOpacity)
  })

  it('distinguishes ready from waiting by the brighter edge', () => {
    expect(shelfNodeStatusStyle('ready', 'day').edgeColor).not.toBe(shelfNodeStatusStyle('waiting', 'day').edgeColor)
  })
})
