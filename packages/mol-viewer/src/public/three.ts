/** Three.js-specific extension point. Declarative styles belong in `/styles`. */
export {
  listMaterialFactories,
  registerMaterialFactory,
  resolveMaterialFactory,
} from '../lib/molRenderer/materialFactories'
export type {
  MaterialFactory,
  MaterialFactoryContext,
} from '../lib/molRenderer/materialFactories'
export type { DisplayMode } from '../lib/presentation/types'
export type {
  AmbientLightProfile,
  AromaticBondStyle,
  AtomLabelMode,
  AtomLabelProfile,
  AtomRadiusMode,
  BondColorPolicy,
  BondGeometryStyle,
  DepthCueMode,
  DepthCueProfile,
  DirectionalLightProfile,
  IboViewShaderMaterialProfile,
  LightingProfile,
  MaterialModel,
  ResolvedRenderProfile,
} from '../styles/renderProfiles'
export type { RenderStyle } from '../styles/schema'

// Render layer for hosts that own their own THREE scene (e.g. the app's JobShelf):
// MoleculeRenderer only needs a THREE.Group + theme getter — no canvas/camera coupling.
export { MoleculeRenderer } from '../lib/molRenderer/MoleculeRenderer'
export { AromaticRingCache } from '../lib/molRenderer/aromaticData'
export type { ObjectVisualState } from '../lib/molRenderer/moleculeObjectVisualState'
// Re-exported for API-Extractor's same-entry rule; canonical homes are `/core` and `/styles`.
export type { ResolvedTheme, ElementStyle, Theme } from '../presets'
export type { Atom, Bond, Molecule } from '../lib/molecule'
export type { CoordinationBondOrder, CoordinationSite, CoordinationSiteAssignment } from '../lib/model/types'
