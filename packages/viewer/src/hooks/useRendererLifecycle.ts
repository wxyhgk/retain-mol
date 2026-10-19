import { useEffect } from 'react'
import type { Ticker } from '../lib/animation'
import { createThreeRenderer } from '../lib/molRenderer/rendererAdapters'
import type { RendererBindingOptions, RendererBindingRefs } from './rendererBindingTypes'
import type { BuilderHandlers } from './useBuilder'

interface Options extends RendererBindingRefs {
  readonly rendererAdapterId: string
  readonly ticker: Ticker
  readonly initialHandlers: Pick<BuilderHandlers, 'onAtomClick' | 'onBondClick' | 'onBackgroundClick'>
  readonly onRendererChange?: RendererBindingOptions['onRendererChange']
}

export function useRendererLifecycle({
  canvasRef,
  rendererRef,
  rendererAdapterId,
  ticker,
  initialHandlers,
  onRendererChange,
}: Options) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = createThreeRenderer(rendererAdapterId, canvas, ticker)
    rendererRef.current = renderer
    renderer.onAtomClick = initialHandlers.onAtomClick
    renderer.onBondClick = initialHandlers.onBondClick
    renderer.onBackgroundClick = initialHandlers.onBackgroundClick
    onRendererChange?.(renderer)

    return () => {
      renderer.dispose()
      rendererRef.current = null
      onRendererChange?.(null)
    }
  // Handler updates belong to useRendererInteractionBinding; renderer lifetime only follows adapter/ticker.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, rendererAdapterId])
}
