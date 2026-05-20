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
export type { DisplayMode, Tool, MeasureType, MeasureStyle, Measurement } from './lib/types'
export { DEFAULT_MEASURE_STYLE, MEASURE_ATOM_COUNT } from './lib/types'

// ── IO ────────────────────────────────────────────────────────────────────────
export { parseMol, parseSdf, exportMol, exportSdf, is2D } from './lib/io/molFormat'
export { parseClipboard } from './lib/io'

// ── 主题 ─────────────────────────────────────────────────────────────────────
export { resolveTheme, listThemes, hexToInt } from './presets'
export type { ResolvedTheme } from './presets'

// ── 元素配置 ──────────────────────────────────────────────────────────────────
export { getElementConfig, COMMON_ELEMENT_SYMBOLS, PERIODIC_TABLE_LAYOUT } from './config/elements.config'
export type { ElementConfig, Hybridization } from './config/elements.config'

// ── 工具 ─────────────────────────────────────────────────────────────────────
export { cn } from './lib/utils'

// ── Builder ───────────────────────────────────────────────────────────────────
export { useBuilder, bondSelectedAtoms } from './hooks/useBuilder'
export {
  calcDistance, calcAngle, calcDihedral, canBond, calcAddAtomOnExisting,
} from './lib/builder/BuilderEngine'

export { getConnectedFragment, splitConnectedComponents } from './lib/builder/analysis/fragments'

// ── PubChem ───────────────────────────────────────────────────────────────────
export { fetchCompoundSdf } from './lib/pubchem'

// ── 示例分子 ──────────────────────────────────────────────────────────────────
export { SAMPLE_MOLECULES } from './lib/samples'
