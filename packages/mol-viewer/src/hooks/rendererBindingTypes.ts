import type { RefObject } from 'react'
import type { MolRenderer } from '../lib/molRenderer'
import type { SceneObject } from '../lib/sceneObject'
import type { DisplayMode, Measurement, MeasureStyle, Tool } from '../lib/types'
import type { ResolvedTheme } from '../presets'
import type { RenderStyle } from '../styles'
import type { BuilderHandlers } from './useBuilder'

export interface RendererBindingRefs {
  readonly containerRef: RefObject<HTMLDivElement | null>
  readonly rendererRef: RefObject<MolRenderer | null>
  readonly canvasRef: RefObject<HTMLCanvasElement | null>
}

export interface RendererBindingOptions extends RendererBindingRefs {
  readonly readOnly: boolean
  readonly activeTool: Tool
  readonly brushArmed: boolean
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
  readonly sketchPlane: { origin: [number, number, number]; normal: [number, number, number] } | null
  readonly handlers: BuilderHandlers
  readonly onRendererChange?: (renderer: MolRenderer | null) => void
}
