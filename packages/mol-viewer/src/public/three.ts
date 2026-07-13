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
export type { DisplayMode } from '../lib/types'
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
