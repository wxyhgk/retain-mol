import type { RefObject } from 'react'
import type { ThreeRendererPort } from '../lib/molRenderer'
import type { SceneObject } from '../lib/sceneObject'
import type { DisplayMode, Measurement, MeasureStyle, Tool } from '../lib/types'
import type { ResolvedTheme } from '../presets'
import type { RenderStyle } from '../styles'

export interface SketchPlane {
  readonly origin: [number, number, number]
  readonly normal: [number, number, number]
}

export interface RendererSceneBindingOptions {
  readonly containerRef: RefObject<HTMLDivElement | null>
  readonly rendererRef: RefObject<ThreeRendererPort | null>
  readonly activeTool: Tool
  readonly sceneObjects: SceneObject[]
  readonly activeObjectId: string | null
  readonly selectedAtomIds: Set<string>
  readonly selectedBondIds: Set<string>
  readonly displayMode: DisplayMode
  readonly renderStyle: RenderStyle
  readonly theme: ResolvedTheme
  readonly appearance: 'day' | 'night'
  readonly measurements: Measurement[]
  readonly pendingAtomIds: string[]
  readonly measureStyle: MeasureStyle
  readonly sketchPlane: SketchPlane | null
}

export type RendererSceneStateBindingOptions = Pick<
  RendererSceneBindingOptions,
  | 'rendererRef'
  | 'sceneObjects'
  | 'activeObjectId'
  | 'selectedAtomIds'
  | 'selectedBondIds'
  | 'displayMode'
  | 'renderStyle'
  | 'theme'
  | 'appearance'
>

export type RendererCameraBindingOptions = Pick<
  RendererSceneBindingOptions,
  'rendererRef' | 'activeTool' | 'sceneObjects' | 'activeObjectId'
>

export type RendererMeasurementBindingOptions = Pick<
  RendererSceneBindingOptions,
  'rendererRef' | 'sceneObjects' | 'measurements' | 'pendingAtomIds' | 'measureStyle'
>

export type RendererSceneLifecycleBindingOptions = Pick<
  RendererSceneBindingOptions,
  'containerRef' | 'rendererRef' | 'sketchPlane'
>
