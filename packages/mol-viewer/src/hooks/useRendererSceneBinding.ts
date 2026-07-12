import type { RendererSceneBindingOptions } from './rendererSceneBindingTypes'
import { useRendererCameraBinding } from './useRendererCameraBinding'
import { useRendererMeasurementBinding } from './useRendererMeasurementBinding'
import { useRendererSceneLifecycleBinding } from './useRendererSceneLifecycleBinding'
import { useRendererSceneStateBinding } from './useRendererSceneStateBinding'

export function useRendererSceneBinding(options: RendererSceneBindingOptions) {
  useRendererSceneStateBinding(options)
  useRendererCameraBinding(options)
  useRendererMeasurementBinding(options)
  useRendererSceneLifecycleBinding(options)
}
