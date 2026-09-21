import type * as THREE from 'three'
import type { MolControls } from '../controls/MolControls'
import type { Atom } from '../molecule'
import type { SceneObject } from '../sceneObject'
import type { DisplayMode, MeasureStyle, MeasureType } from '../presentation/types'
import type { ResolvedTheme } from '../../presets'
import type { RenderStyle } from '../../styles'
import type { InteractionBindingsPort } from '../interaction/contracts'
import type { MeasureLabel } from './MeasurementVisualBuilder'
import type { SketchPlane } from './ViewportGuides'
import type { ReactionHighlight } from '../reactionHighlights'

export interface RendererLifecyclePort {
  resize(width: number, height: number): void
  dispose(): void
}

export interface RendererCapturePort {
  captureImage(scale?: number): string
}

export interface RendererScenePort {
  setTheme(theme: ResolvedTheme): void
  setRenderStyle(renderStyle: RenderStyle): void
  renderScene(
    objects: readonly SceneObject[],
    activeObjectId: string | null,
    displayMode: DisplayMode,
    selectedAtoms: Set<string>,
    selectedBonds: Set<string>,
  ): void
  setSketchPlane(plane: SketchPlane | null): void
  alignViewToPlane(normal: [number, number, number]): void
}

export interface RendererViewportPort {
  resetCamera(): void
  fitToMolecule(atoms: Atom[]): void
  updateOrbitTarget(atoms: readonly Atom[]): void
  setAxesVisible(visible: boolean): void
  setGridVisible(visible: boolean): void
  getViewPlaneLocal(): { origin: [number, number, number]; normal: [number, number, number] }
  /** Fit the viewport to the currently resolvable reaction-highlight endpoints. */
  focusReactionHighlights(): boolean
  /** Imperatively remove current reaction-highlight visuals and definitions. */
  clearReactionHighlights(): void
}

export interface RendererReactionHighlightPort {
  setReactionHighlights(highlights: readonly ReactionHighlight[]): void
}

export interface RendererMeasurementPort {
  measureStyle: MeasureStyle
  readonly measureLabelPositions: readonly MeasureLabel[]
  updateMeasureVisuals(
    committed: Array<{ type: MeasureType; atoms: Atom[] }>,
    pending: Atom[],
  ): void
}

export interface RendererInteractionPort extends InteractionBindingsPort {
  idleCursor: string
  cancelActiveInteraction(): void
  setDragHoverAtom(atomId: string | null): void
}

export interface ThreeRendererOverlayPort {
  readonly scene: THREE.Scene
  readonly camera: THREE.PerspectiveCamera
  readonly controls: MolControls
  readonly rotationGroup: THREE.Group
  readonly modelGroup: THREE.Group
  readonly canvas: HTMLCanvasElement
  readonly theme: ResolvedTheme
  readonly renderStyle: RenderStyle
  projectToScreen(worldPos: THREE.Vector3, width: number, height: number): { x: number; y: number }
  projectLocalToScreen(localPos: THREE.Vector3, width: number, height: number): { x: number; y: number }
  projectAtomToScreen(atomId: string, width: number, height: number): { x: number; y: number } | null
  screenDeltaToModelLocal(dxPx: number, dyPx: number): THREE.Vector3
  pickAtomIdAt(clientX: number, clientY: number): string | null
  pickBondIdAt(clientX: number, clientY: number): string | null
}

export interface RendererPort
  extends RendererCapturePort,
    RendererViewportPort {}

/** Internal port used by the Three.js-backed viewer implementation. */
export interface ThreeRendererPort
  extends RendererPort,
    RendererLifecyclePort,
    RendererScenePort,
    RendererReactionHighlightPort,
    RendererMeasurementPort,
    RendererInteractionPort,
    ThreeRendererOverlayPort {}

export type RotateGizmoRendererPort = Pick<
  ThreeRendererPort,
  'scene' | 'camera' | 'controls' | 'modelGroup' | 'canvas' | 'canDragAtom'
>
