import type { ResolvedRenderProfile } from '../renderProfiles'

/**
 * IboView-inspired molecule renderer profile.
 *
 * This profile intentionally groups every non-theme visual decision that makes
 * the IboView style distinct: material model, shader response, source-style
 * atom radii, half-bond geometry, depth cueing, and background-grid behavior.
 * Keep element colors in `presets/themes/iboview.json`.
 */
const atomAndBondShader = {
  shaderReg0: 0.04,
  shaderReg1: 0.46,
  shaderReg2: 0.34,
  shaderReg3: 0.8,
}

const orbitalShader = {
  shaderReg0: 0.04,
  shaderReg1: 0.5,
  shaderReg2: 0.34,
  shaderReg3: 0.78,
}

const BOHR_TO_ANGSTROM = 0.529177210903
const IBOVIEW_ATOM_SCALE = 0.4

export const iboviewRendererProfile = {
  id: 'iboview',
  name: 'IBO',
  description: 'IboView',
  materialModel: 'iboview-shader',
  bondColorPolicy: 'element',
  bondGeometry: 'cylinder',
  bondOpenEnded: true,
  bondTaper: 0.8,
  bondStartOffsetFactor: 0.3,
  multiBondRadiusScale: 1.8,
  multiBondOffsetFactor: 1.45,
  fullBondThreshold: 0.2,
  aromaticBondStyle: 'kekule',
  outline: false,
  backgroundGrid: false,
  cameraFov: 12,
  cameraFitMultiplier: 2.65,
  // IboView's source default is fragment-depth cueing with fadeWidth=9.
  // Keep the capability in the profile model, but leave it off until the
  // renderer can also switch this profile to IboView's orthographic camera.
  depthCue: { mode: 'none', fadeWidth: 9, fadeBias: 0, color: 0xffffff },
  atomRadiusMode: 'iboview-draw-radius',
  atomRadiusScale: IBOVIEW_ATOM_SCALE * BOHR_TO_ANGSTROM,
  lighting: {
    ambient: { color: 0xffffff, intensity: 0.42 },
    key: { color: 0xffffff, intensity: 1.15, position: [7, 7, 10] },
    fill: { color: 0xffffff, intensity: 0.7, position: [-7, -4, 12] },
    rim: { color: 0xffffff, intensity: 0.45, position: [6, -7, 12] },
  },
  atomLabels: {
    mode: 'element-symbol',
    includeCarbon: true,
    includeHydrogen: false,
    colorPolicy: 'element-brightness',
    brightness: -0.15,
    shadowColor: 'rgba(255, 255, 255, 0.58)',
    fontScale: 0.38,
    sourceSize: 85,
    minFontSize: 15,
    maxFontSize: 34,
  },
  iboviewMaterial: {
    atom: atomAndBondShader,
    bond: atomAndBondShader,
    orbital: orbitalShader,
  },
} satisfies ResolvedRenderProfile
