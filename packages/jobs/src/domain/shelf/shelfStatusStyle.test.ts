import { describe, expect, it } from 'vitest'
import type { JobStatus } from '../jobTypes'
import { shelfStatusStyle } from './shelfStatusStyle'

const ALL_STATUSES: JobStatus[] = ['created', 'queued', 'running', 'succeeded', 'failed', 'cancelled', 'interrupted']

describe('shelfStatusStyle', () => {
  it('returns a complete style for every status in both themes', () => {
    for (const status of ALL_STATUSES) {
      for (const theme of ['day', 'night'] as const) {
        const style = shelfStatusStyle(status, theme)
        expect(style.glassOpacity).toBeGreaterThan(0)
        expect(style.glassOpacity).toBeLessThan(1)
        expect(style.edgeOpacity).toBeGreaterThan(0)
        expect(style.moleculeOpacity).toBeGreaterThan(0)
        expect(Number.isInteger(style.glassColor)).toBe(true)
        expect(Number.isInteger(style.edgeColor)).toBe(true)
      }
    }
  })

  it('pulses only while running', () => {
    for (const status of ALL_STATUSES) {
      expect(shelfStatusStyle(status, 'day').pulse).toBe(status === 'running')
    }
  })

  it('dims the interior of attention states and frosts pending ones', () => {
    expect(shelfStatusStyle('failed', 'day').moleculeOpacity).toBeLessThan(0.5)
    expect(shelfStatusStyle('queued', 'day').glassOpacity).toBeGreaterThan(shelfStatusStyle('succeeded', 'day').glassOpacity)
  })
})
