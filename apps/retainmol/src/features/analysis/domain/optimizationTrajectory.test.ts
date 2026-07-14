import { describe, expect, it } from 'vitest'
import { parseOptimizationTrajectory } from './optimizationTrajectory'

describe('parseOptimizationTrajectory', () => {
  it('accepts a real xTB trajectory payload', () => {
    expect(parseOptimizationTrajectory({
      schemaVersion: 1,
      engine: 'xtb',
      frames: [{
        step: 1,
        energy: -40.123,
        gradient: 0.014,
        atoms: [{ symbol: 'C', x: 0, y: 0, z: 0 }],
      }],
    }).frames).toHaveLength(1)
  })

  it.each([
    ['empty data', { schemaVersion: 1, engine: 'xtb', frames: [] }],
    ['missing gradient', { schemaVersion: 1, engine: 'xtb', frames: [{ step: 1, energy: -1, atoms: [] }] }],
    ['unknown schema', { schemaVersion: 2, engine: 'xtb', frames: [{}] }],
  ])('rejects %s instead of drawing invented values', (_name, payload) => {
    expect(() => parseOptimizationTrajectory(payload)).toThrow()
  })
})
