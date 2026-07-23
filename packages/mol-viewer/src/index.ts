// ── 组件 ─────────────────────────────────────────────────────────────────────
export { default as MolViewer } from './components/viewer/MolViewer'
export type { InteractionMode, MolViewerProps } from './components/viewer/MolViewer'

// ── 分子数据类型 & 工具函数 ────────────────────────────────────────────────────
export type { Molecule, Atom, Bond } from './lib/molecule'
export type {
  ClipboardAtom,
  ClipboardBond,
  CoordinationBondOrder,
  CoordinationSite,
  CoordinationSiteAssignment,
} from './lib/types'
export {
  newAtom, newBond, centerMolecule, shiftMolecule,
  parseXYZ, exportXYZ, inferBonds,
} from './lib/molecule'

// ── Scene 对象 ────────────────────────────────────────────────────────────────
export type { SceneObject } from './lib/sceneObject'
export { createSceneObject } from './lib/sceneObject'

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
export type { EditCommandResult } from './lib/builder/commands/shared'
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
export type { DisplayMode, Tool, MeasureType, MeasureStyle, Measurement, MolClipboard } from './lib/types'
export { DEFAULT_MEASURE_STYLE, MEASURE_ATOM_COUNT } from './lib/types'

// ── IO ────────────────────────────────────────────────────────────────────────
export { parseMol, parseSdf, exportMol, exportSdf, is2D,
         minimizeGeometry, generate3D, registerForceFieldFromUrl, markForceFieldReady } from './lib/io/molFormat'
export type { OptimizeResult } from './lib/io/molFormat'
export { GeometryRelaxer } from './lib/geometry/relax'
export type { RelaxOptions } from './lib/geometry/relax'
export { parseClipboard, exportGJF } from './lib/io'
export type { GJFOptions, PasteFormat } from './lib/io/pasteParser'

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
export { getElementConfig, COMMON_ELEMENT_SYMBOLS, PERIODIC_TABLE_LAYOUT } from './config/elements.config'
export type { ElementConfig, Hybridization } from './config/elements.config'
export { calculateMolecularWeight, getMolecularFormula } from './lib/chemistry'
export type { ElementLike } from './lib/chemistry'

// ── 只读片段库 ────────────────────────────────────────────────────────────────
export {
  listFragments,
  listFragmentSummaries,
  getFragment,
  getFragment as getReadonlyFragment,
  getFragmentSummary,
} from './public/fragments'
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
} from './public/fragments'

// ── PubChem ───────────────────────────────────────────────────────────────────
export { fetchCompoundSdf } from './public/pubchem'
export type { PubChemResult } from './public/pubchem'

// ── 兼容入口中的 Viewer 类型；新代码请使用 /viewer 与 /runtime ─────────────
export type {
  RendererCapturePort,
  RendererPort,
  RendererViewportPort,
} from './lib/molRenderer/rendererPorts'
export type { ViewerRuntime } from './runtime/ViewerRuntime'

// ── 示例分子 ──────────────────────────────────────────────────────────────────
export { SAMPLE_MOLECULES } from './public/samples'

// ── 模板分子 ──────────────────────────────────────────────────────────────────
export {
  MOLECULE_TEMPLATES,
  createCenteredMoleculeFromTemplate,
  createMoleculeFromTemplate,
  getMoleculeTemplate,
  listMoleculeTemplateSummaries,
  listMoleculeTemplates,
  validateMoleculeTemplate,
} from './public/templates'
export type {
  MoleculeTemplateCategory,
  MoleculeTemplateDef,
  MoleculeTemplateSummary,
} from './public/templates'
