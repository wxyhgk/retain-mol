import { describe, expect, it } from 'vitest'
import {
  createThreeRenderer,
  listRendererAdapters,
  registerRendererAdapter,
  resolveRendererAdapter,
  resolveThreeRendererAdapter,
  type RendererAdapter,
  type ThreeRendererAdapter,
} from './rendererAdapters'
import type { Ticker } from '../animation'

describe('renderer adapter registry', () => {
  it('keeps the Three.js adapter as the default', () => {
    expect(resolveRendererAdapter().id).toBe('three')
    expect(listRendererAdapters()).toContain('three')
  })

  it('supports registration, conflict rejection, and disposal', () => {
    const adapter: RendererAdapter = {
      id: 'test-adapter',
      create: () => ({
        captureImage: () => '',
        resetCamera: () => undefined,
        fitToMolecule: () => undefined,
        updateOrbitTarget: () => undefined,
        setAxesVisible: () => undefined,
        setGridVisible: () => undefined,
        getViewPlaneLocal: () => ({ origin: [0, 0, 0], normal: [0, 0, 1] }),
      }),
    }
    const dispose = registerRendererAdapter(adapter)
    expect(resolveRendererAdapter(adapter.id)).toBe(adapter)
    expect(() => registerRendererAdapter(adapter)).toThrow(/already registered/)
    dispose()
    expect(() => resolveRendererAdapter(adapter.id)).toThrow(/未找到/)
  })

  it('rejects a viewport-only adapter when the React viewer requests Three capabilities', () => {
    const adapter: RendererAdapter = {
      id: 'viewport-only',
      create: () => ({
        captureImage: () => '',
        resetCamera: () => undefined,
        fitToMolecule: () => undefined,
        updateOrbitTarget: () => undefined,
        setAxesVisible: () => undefined,
        setGridVisible: () => undefined,
        getViewPlaneLocal: () => ({ origin: [0, 0, 0], normal: [0, 0, 1] }),
      }),
    }
    const unregister = registerRendererAdapter(adapter)
    expect(() => resolveThreeRendererAdapter(adapter.id)).toThrow(/three-viewer capability/)
    unregister()
  })

  it('validates a declared Three adapter before binding it to the viewer', () => {
    const adapter: ThreeRendererAdapter = {
      id: 'broken-three',
      capability: 'three-viewer',
      create: () => ({}) as never,
    }
    const unregister = registerRendererAdapter(adapter)
    expect(() => createThreeRenderer(
      adapter.id,
      {} as HTMLCanvasElement,
      {} as Ticker,
    )).toThrow(/missing three-viewer methods/)
    unregister()
  })
})
