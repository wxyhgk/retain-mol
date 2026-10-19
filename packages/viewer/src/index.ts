// ── 组件 ─────────────────────────────────────────────────────────────────────
export { default as MolViewer } from './components/viewer/MolViewer'
export type {
  BondPairGizmoConfig,
  BondPairGizmoError,
  BondPairGizmoErrorCode,
  BondPairGizmoMode,
  BondPairGizmoPhase,
  BondPairGizmoValue,
  InteractionMode,
  MolViewerProps,
  ReactionHighlight,
  ReactionHighlightKind,
} from './components/viewer/MolViewer'

// ── 分子数据类型 & 工具函数 ────────────────────────────────────────────────────
export type { Molecule, Atom, Bond } from '@retainmol/core'
export type { ClipboardAtom, ClipboardBond } from '@retainmol/core'
export type { CoordinationBondOrder, CoordinationSite, CoordinationSiteAssignment } from '@retainmol/core'
export {
  newAtom, newBond, centerMolecule, shiftMolecule,
  parseXYZ, exportXYZ, inferBonds,
} from '@retainmol/core'

// ── Scene 对象 ────────────────────────────────────────────────────────────────
export type { SceneObject } from '@retainmol/core'
export { createSceneObject } from '@retainmol/core'

// ── Store & Selectors ─────────────────────────────────────────────────────────
export { useMoleculeStore, useMoleculeTemporal, selectActiveMolecule, selectActiveMoleculeOrEmpty } from './store/moleculeStore'
export { useEditorStore } from './store/editorStore'
export type { EditorStoreApi } from './store/editorStore'
export type { MoleculeStoreApi } from './store/moleculeStore'
export type { EditorState } from './store/editorStore'
export type {
  EditSlice,
  MoleculeState,
  SceneSlice,
  SelectionSlice,
} from './store/slices/types'
export type { SelectorStoreApi, SelectorSubscribe } from './store/contracts/selectorStore'
export type { UndoTransactionHandle } from './store/contracts/transaction'
export type { EditCommandResult } from '@retainmol/core'
export {
  alignBondPair,
  createBondPairAlignmentEditSession,
} from './public/editing'
export type {
  AlignBondPairDiagnostics,
  AlignBondPairFailureCode,
  AlignBondPairInput,
  AlignBondPairResult,
  BondPairAlignmentEditSession,
} from './public/editing'
export type { DisplayMode, Tool, MeasureType, MeasureStyle, Measurement } from '@retainmol/core'
export type { MolClipboard } from '@retainmol/core'
export { DEFAULT_MEASURE_STYLE, MEASURE_ATOM_COUNT } from '@retainmol/core'

// ── IO ────────────────────────────────────────────────────────────────────────
export { parseMol, parseSdf, exportMol, exportSdf, is2D,
         minimizeGeometry, generate3D, registerForceFieldFromUrl, markForceFieldReady } from '@retainmol/core/io'
export type { OptimizeResult } from '@retainmol/core/io'
export { GeometryRelaxer } from '@retainmol/core/io'
export type { RelaxOptions } from '@retainmol/core/io'
export { parseClipboard, exportGJF } from '@retainmol/core/io'
export type { GJFOptions, PasteFormat } from '@retainmol/core/io'

// ── 视口截图 ──────────────────────────────────────────────────────────────────
export { captureViewportImage } from './capture'

// ── 主题 ─────────────────────────────────────────────────────────────────────
export { registerTheme, resolveTheme, listThemes, hexToInt } from './presets'
export type { ElementStyle, ResolvedTheme, Theme, ThemeMetadata } from './presets'

// ── 分子显示风格 ─────────────────────────────────────────────────────────────
export {
  registerStylePreset,
  listStylePresets,
  resolveStylePreset,
  registerRenderProfile,
  listRenderProfiles,
  resolveRenderProfile,
} from './styles'
export type {
  StylePreset,
  StylePresetMetadata,
  ResolvedStylePreset,
  RenderStyle,
  ResolvedRenderProfile,
  AmbientLightProfile,
  AromaticBondStyle,
  AtomLabelMode,
  AtomLabelProfile,
  AtomRadiusMode,
  BondColorPolicy,
  BondGeometryStyle,
  DepthCueProfile,
  DepthCueMode,
  DirectionalLightProfile,
  IboViewShaderMaterialProfile,
  LightingProfile,
  MaterialModel,
} from './styles'

// ── 元素配置 ──────────────────────────────────────────────────────────────────
export { getElementConfig, COMMON_ELEMENT_SYMBOLS, PERIODIC_TABLE_LAYOUT } from '@retainmol/core'
export type { ElementConfig, Hybridization } from '@retainmol/core'
export { calculateMolecularWeight, getMolecularFormula } from '@retainmol/core'
export type { ElementLike } from '@retainmol/core'

// ── 只读片段库 ────────────────────────────────────────────────────────────────
export {
  listFragments,
  listFragmentSummaries,
  getFragment,
  getFragment as getReadonlyFragment,
  getFragmentSummary,
} from '@retainmol/core/fragments'
export type {
  FragmentSummary,
  PublicCoordinationSite,
  PublicFragmentAtom,
  PublicFragmentBond,
  PublicFragmentBondOrder,
  PublicFragmentBridgeAttachment,
  PublicFragmentCoordination,
  PublicFragmentDef,
  PublicFragmentDirection,
  PublicFragmentGroup,
} from '@retainmol/core/fragments'

// ── PubChem ───────────────────────────────────────────────────────────────────
export { fetchCompoundSdf } from '@retainmol/core/pubchem'
export type { PubChemResult } from '@retainmol/core/pubchem'

// ── 兼容入口中的 Viewer 类型；新代码请使用 /viewer 与 /runtime ─────────────
export type {
  RendererCapturePort,
  RendererPort,
  RendererViewportPort,
} from './lib/molRenderer/rendererPorts'
export type { ViewerRuntime } from './runtime/ViewerRuntime'

// ── 示例分子 ──────────────────────────────────────────────────────────────────
export { SAMPLE_MOLECULES } from '@retainmol/core/samples'

// ── 模板分子 ──────────────────────────────────────────────────────────────────
export {
  MOLECULE_TEMPLATES,
  createCenteredMoleculeFromTemplate,
  createMoleculeFromTemplate,
  getMoleculeTemplate,
  listMoleculeTemplateSummaries,
  listMoleculeTemplates,
  validateMoleculeTemplate,
} from '@retainmol/core/templates'
export type {
  MoleculeTemplateCategory,
  MoleculeTemplateDef,
  MoleculeTemplateSummary,
} from '@retainmol/core/templates'
