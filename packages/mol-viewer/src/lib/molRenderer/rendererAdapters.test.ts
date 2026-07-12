import { describe, expect, it } from 'vitest'
import type { MolRenderer } from './MolRenderer'
import {
  listRendererAdapters,
  registerRendererAdapter,
  resolveRendererAdapter,
  type RendererAdapter,
} from './rendererAdapters'

describe('renderer adapter registry', () => {
  it('keeps the Three.js adapter as the default', () => {
    expect(resolveRendererAdapter().id).toBe('three')
    expect(listRendererAdapters()).toContain('three')
  })

  it('supports registration, conflict rejection, and disposal', () => {
    const adapter: RendererAdapter = {
      id: 'test-adapter',
      create: () => ({}) as MolRenderer,
    }
    const dispose = registerRendererAdapter(adapter)
    expect(resolveRendererAdapter(adapter.id)).toBe(adapter)
    expect(() => registerRendererAdapter(adapter)).toThrow(/already registered/)
    dispose()
    expect(() => resolveRendererAdapter(adapter.id)).toThrow(/未找到/)
  })
})
