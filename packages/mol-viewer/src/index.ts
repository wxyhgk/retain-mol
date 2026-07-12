// ── 组件 ─────────────────────────────────────────────────────────────────────
export { default as MolViewer } from './components/viewer/MolViewer'
export type { MolViewerProps } from './components/viewer/MolViewer'

// ── 分子数据类型 & 工具函数 ────────────────────────────────────────────────────
export type { Molecule, Atom, Bond } from './lib/molecule'
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
export type { DisplayMode, Tool, MeasureType, MeasureStyle, Measurement, MolClipboard } from './lib/types'
export { DEFAULT_MEASURE_STYLE, MEASURE_ATOM_COUNT } from './lib/types'

// ── IO ────────────────────────────────────────────────────────────────────────
export { parseMol, parseSdf, exportMol, exportSdf, is2D,
         minimizeGeometry, generate3D, registerForceFieldFromUrl, markForceFieldReady } from './lib/io/molFormat'
export type { OptimizeResult } from './lib/io/molFormat'
export { GeometryRelaxer } from './lib/geometry/relax'
export type { RelaxOptions } from './lib/geometry/relax'
export { parseClipboard, exportGJF } from './lib/io'
export type { GJFOptions } from './lib/io/pasteParser'

// ── 视口截图 ──────────────────────────────────────────────────────────────────
export { captureViewportImage } from './capture'

// ── 主题 ─────────────────────────────────────────────────────────────────────
export { registerTheme, resolveTheme, listThemes, hexToInt } from './presets'
export type { ResolvedTheme, ThemeMetadata } from './presets'

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
} from './styles'

// ── 元素配置 ──────────────────────────────────────────────────────────────────
export { getElementConfig, COMMON_ELEMENT_SYMBOLS, PERIODIC_TABLE_LAYOUT } from './config/elements.config'
export type { ElementConfig, Hybridization } from './config/elements.config'
export { calculateMolecularWeight, getMolecularFormula } from './lib/chemistry'

// ── 只读片段库 ────────────────────────────────────────────────────────────────
export {
  listFragments,
  listFragmentSummaries,
  getFragment,
  getFragment as getReadonlyFragment,
  getFragmentSummary,
} from './public/fragments'
export type { PublicFragmentDef, FragmentSummary } from './public/fragments'

// ── PubChem ───────────────────────────────────────────────────────────────────
export { fetchCompoundSdf } from './public/pubchem'

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
