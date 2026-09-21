import type { FragmentTorsionPreview, GrowGuideSpec } from '../presentation/types'
import type { Vector3Data } from '../model/types'

export interface GrowPreviewSpec {
  readonly pos: Vector3Data
  readonly radius: number
  readonly color: number
}

export type AtomClickHandler = (atomId: string, event: MouseEvent) => void
export type BondClickHandler = (bondId: string, event: MouseEvent) => void
export type BackgroundClickHandler = (
  position: Vector3Data,
  event: MouseEvent,
  viewDirection?: Vector3Data,
) => void
export type AtomDragStartHandler = (atomId: string) => void
export type AtomDragHandler = (atomId: string, x: number, y: number, z: number) => void
export type AtomDragEndHandler = (atomId: string) => void
export type AtomDragCancelHandler = (atomId: string) => void
export type AtomDragEligibility = (atomId: string) => boolean
export type BondDragEligibility = (sourceId: string) => boolean
export type BondDragStartHandler = (sourceId: string) => boolean
export type BondDragEndHandler = (
  sourceId: string,
  targetId: string | null,
  dropPosition: Vector3Data | null,
) => void
export type BondDragHoverHandler = (targetId: string | null) => void
export type GrowPreviewProvider = (
  sourceId: string,
  cursorPosition: Vector3Data,
  freeDirection: boolean,
) => GrowPreviewSpec | null
export type GrowGuideProvider = (sourceId: string) => GrowGuideSpec
export type FragmentTorsionEligibility = (targetId: string) => boolean
export type FragmentTorsionStartHandler = (targetId: string) => boolean
export type FragmentTorsionPreviewProvider = (
  targetId: string,
  angleDegrees: number,
) => FragmentTorsionPreview | null
export type FragmentTorsionEndHandler = (targetId: string, angleDegrees: number) => void

/** Required callbacks produced by the builder application layer. */
export interface BuilderInteractionHandlers {
  readonly onAtomClick: AtomClickHandler
  readonly onAtomDoubleClick: AtomClickHandler
  readonly onBondClick: BondClickHandler
  readonly onBackgroundClick: BackgroundClickHandler
  readonly onAtomDragStart: AtomDragStartHandler
  readonly onAtomDrag: AtomDragHandler
  readonly onAtomDragEnd: AtomDragEndHandler
  readonly onAtomDragCancel: AtomDragCancelHandler
  readonly canStartBondDrag: BondDragEligibility
  readonly onBondDragStart: BondDragStartHandler
  readonly onBondDragEnd: BondDragEndHandler
  readonly getGrowPreview: GrowPreviewProvider
  readonly getGrowGuide: GrowGuideProvider
  readonly canStartFragmentTorsion: FragmentTorsionEligibility
  readonly onFragmentTorsionStart: FragmentTorsionStartHandler
  readonly getFragmentTorsionPreview: FragmentTorsionPreviewProvider
  readonly onFragmentTorsionEnd: FragmentTorsionEndHandler
}

/** Mutable binding surface consumed by a renderer interaction backend. */
export interface InteractionBindingsPort {
  onAtomClick: AtomClickHandler | undefined
  onAtomDoubleClick: AtomClickHandler | undefined
  onBondClick: BondClickHandler | undefined
  onBackgroundClick: BackgroundClickHandler | undefined
  onAtomDragStart: AtomDragStartHandler | undefined
  onAtomDrag: AtomDragHandler | undefined
  onAtomDragEnd: AtomDragEndHandler | undefined
  onAtomDragCancel: AtomDragCancelHandler | undefined
  canDragAtom: AtomDragEligibility | undefined
  canStartBondDrag: BondDragEligibility | undefined
  onBondDragStart: BondDragStartHandler | undefined
  onBondDragEnd: BondDragEndHandler | undefined
  onBondDragHover: BondDragHoverHandler | undefined
  getGrowPreview: GrowPreviewProvider | undefined
  getGrowGuide: GrowGuideProvider | undefined
  canStartFragmentTorsion: FragmentTorsionEligibility | undefined
  onFragmentTorsionStart: FragmentTorsionStartHandler | undefined
  getFragmentTorsionPreview: FragmentTorsionPreviewProvider | undefined
  onFragmentTorsionEnd: FragmentTorsionEndHandler | undefined
}
