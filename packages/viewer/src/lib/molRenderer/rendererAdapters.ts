import type { Ticker } from '../animation'
import { MolRenderer } from './MolRenderer'
import type { RendererPort, ThreeRendererPort } from './rendererPorts'

export interface RendererAdapter {
  readonly id: string
  /** Omitted adapters expose only the framework-neutral viewport capability. */
  readonly capability?: 'viewport'
  create(canvas: HTMLCanvasElement, ticker: Ticker): RendererPort
}

export interface ThreeRendererAdapter {
  readonly id: string
  readonly capability: 'three-viewer'
  create(canvas: HTMLCanvasElement, ticker: Ticker): ThreeRendererPort
}

export type RegisteredRendererAdapter = RendererAdapter | ThreeRendererAdapter

const adapters = new Map<string, RegisteredRendererAdapter>()
const threeAdapter: ThreeRendererAdapter = {
  id: 'three',
  capability: 'three-viewer',
  create: (canvas, ticker) => new MolRenderer(canvas, ticker),
}
adapters.set(threeAdapter.id, threeAdapter)

export function registerRendererAdapter(
  adapter: RegisteredRendererAdapter,
  options: { conflict?: 'reject' | 'replace' } = {},
): () => void {
  if (!adapter.id.trim()) throw new Error('renderer adapter id is required')
  if (adapters.has(adapter.id) && options.conflict !== 'replace') {
    throw new Error(`renderer adapter already registered: ${adapter.id}`)
  }
  const previous = adapters.get(adapter.id)
  adapters.set(adapter.id, adapter)
  return () => {
    if (adapters.get(adapter.id) !== adapter) return
    if (previous) adapters.set(adapter.id, previous)
    else adapters.delete(adapter.id)
  }
}

export function resolveRendererAdapter(id = 'three'): RegisteredRendererAdapter {
  const adapter = adapters.get(id)
  if (!adapter) throw new Error(`未找到 renderer adapter: ${id}`)
  return adapter
}

/** Internal resolver for the React viewer, whose overlays require the Three.js capability set. */
export function resolveThreeRendererAdapter(id = 'three'): ThreeRendererAdapter {
  const adapter = resolveRendererAdapter(id)
  if (adapter.capability !== 'three-viewer') {
    throw new Error(`renderer adapter "${id}" does not provide the three-viewer capability`)
  }
  return adapter
}

const REQUIRED_THREE_RENDERER_METHODS = [
  'resize',
  'dispose',
  'captureImage',
  'setTheme',
  'setRenderStyle',
  'renderScene',
  'setSketchPlane',
  'alignViewToPlane',
  'resetCamera',
  'fitToMolecule',
  'updateOrbitTarget',
  'setAxesVisible',
  'setGridVisible',
  'getViewPlaneLocal',
  'updateMeasureVisuals',
  'cancelActiveInteraction',
  'setDragHoverAtom',
  'projectToScreen',
  'projectLocalToScreen',
  'projectAtomToScreen',
  'screenDeltaToModelLocal',
  'pickAtomIdAt',
  'pickBondIdAt',
] as const

function assertThreeRendererPort(value: unknown, adapterId: string): asserts value is ThreeRendererPort {
  if (!value || typeof value !== 'object') {
    throw new Error(`renderer adapter "${adapterId}" returned an invalid renderer instance`)
  }
  const candidate = value as Record<string, unknown>
  const missing = REQUIRED_THREE_RENDERER_METHODS.filter(key => typeof candidate[key] !== 'function')
  if (missing.length > 0) {
    throw new Error(
      `renderer adapter "${adapterId}" is missing three-viewer methods: ${missing.join(', ')}`,
    )
  }
  for (const key of ['scene', 'camera', 'controls', 'rotationGroup', 'modelGroup', 'canvas']) {
    if (candidate[key] == null) {
      throw new Error(`renderer adapter "${adapterId}" is missing three-viewer property: ${key}`)
    }
  }
}

/** Create and validate the renderer before React binds callbacks or overlays. */
export function createThreeRenderer(
  id: string,
  canvas: HTMLCanvasElement,
  ticker: Ticker,
): ThreeRendererPort {
  const renderer = resolveThreeRendererAdapter(id).create(canvas, ticker)
  assertThreeRendererPort(renderer, id)
  return renderer
}

export function listRendererAdapters(): readonly string[] {
  return [...adapters.keys()]
}
