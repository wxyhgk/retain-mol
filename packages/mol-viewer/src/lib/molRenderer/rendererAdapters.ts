import type { Ticker } from '../animation'
import { MolRenderer } from './MolRenderer'

export interface RendererAdapter {
  readonly id: string
  create(canvas: HTMLCanvasElement, ticker: Ticker): MolRenderer
}

const adapters = new Map<string, RendererAdapter>()
const threeAdapter: RendererAdapter = {
  id: 'three',
  create: (canvas, ticker) => new MolRenderer(canvas, ticker),
}
adapters.set(threeAdapter.id, threeAdapter)

export function registerRendererAdapter(
  adapter: RendererAdapter,
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

export function resolveRendererAdapter(id = 'three'): RendererAdapter {
  const adapter = adapters.get(id)
  if (!adapter) throw new Error(`未找到 renderer adapter: ${id}`)
  return adapter
}

export function listRendererAdapters(): readonly string[] {
  return [...adapters.keys()]
}
