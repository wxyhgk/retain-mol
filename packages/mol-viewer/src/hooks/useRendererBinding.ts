import { resolveRenderProfile } from '../styles'
import { useViewerRuntime } from '../runtime/ViewerRuntime'
import type { RendererBindingOptions } from './rendererBindingTypes'
import { useRendererInteractionBinding } from './useRendererInteractionBinding'
import { useRendererLifecycle } from './useRendererLifecycle'
import { useRendererSceneBinding } from './useRendererSceneBinding'

/** Composes renderer lifetime, interaction callbacks and scene synchronization. */
export function useRendererBinding(options: RendererBindingOptions) {
  const { moleculeStore, ticker } = useViewerRuntime()
  const rendererAdapterId = resolveRenderProfile(options.renderStyle).rendererAdapterId ?? 'three'

  useRendererLifecycle({
    containerRef: options.containerRef,
    rendererRef: options.rendererRef,
    canvasRef: options.canvasRef,
    rendererAdapterId,
    ticker,
    initialHandlers: options.handlers,
    onRendererChange: options.onRendererChange,
  })

  useRendererInteractionBinding({
    rendererRef: options.rendererRef,
    moleculeStore,
    readOnly: options.readOnly,
    activeTool: options.activeTool,
    brushArmed: options.brushArmed,
    handlers: options.handlers,
  })

  useRendererSceneBinding({
    containerRef: options.containerRef,
    rendererRef: options.rendererRef,
    activeTool: options.activeTool,
    sceneObjects: options.sceneObjects,
    activeObjectId: options.activeObjectId,
    selectedAtomIds: options.selectedAtomIds,
    selectedBondIds: options.selectedBondIds,
    displayMode: options.displayMode,
    renderStyle: options.renderStyle,
    theme: options.theme,
    appearance: options.appearance,
    measurements: options.measurements,
    pendingAtomIds: options.pendingAtomIds,
    measureStyle: options.measureStyle,
    sketchPlane: options.sketchPlane,
  })
}
