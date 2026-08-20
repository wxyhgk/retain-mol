/**
 * Mutable editor state entry point.
 *
 * Keep store access isolated from renderer, editing, and runtime facades so
 * consumers can make the stateful dependency explicit.
 */
export {
  useMoleculeStore,
  useMoleculeTemporal,
  selectActiveMolecule,
  selectActiveMoleculeOrEmpty,
} from '../store/moleculeStore'
export { useEditorStore } from '../store/editorStore'
export { useViewportStore } from '../store/viewportStore'
export type { ViewportUiState } from '../store/viewportStore'
export type { Molecule } from '../lib/molecule'
export type { Atom, Bond } from '../lib/molecule'
export type { SceneObject } from '../lib/sceneObject'
export type {
  CoordinationSite,
  CoordinationSiteAssignment,
  CoordinationBondOrder,
  ClipboardAtom,
  ClipboardBond,
  DisplayMode,
  MeasureStyle,
  MeasureType,
  Measurement,
  MolClipboard,
  Tool,
} from '../lib/types'
export type { RenderStyle } from '../styles/schema'
export type { ElementStyle, ResolvedTheme, Theme } from '../presets'
export type { EditCommandResult } from '../lib/builder/commands/shared'
export type {
  AlignBondPairDiagnostics,
  AlignBondPairFailureCode,
  AlignBondPairInput,
} from '../lib/builder/geometry/bondPairAlignment'
export type { UndoTransactionHandle } from '../store/contracts/transaction'
export type {
  SelectorStoreApi,
  SelectorSubscribe,
} from '../store/contracts/selectorStore'
export type { EditorState, EditorStoreApi } from '../store/editorStore'
export type { MoleculeStoreApi } from '../store/moleculeStore'
export type {
  EditSlice,
  MoleculeState,
  SceneSlice,
  SelectionSlice,
} from '../store/slices/types'
