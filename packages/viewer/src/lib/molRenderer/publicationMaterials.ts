import * as THREE from 'three'
import type { DepthCueProfile, IboViewShaderMaterialProfile } from '../../styles'

// ── 出版/论文渲染（由 MoleculeRenderer._pub 驱动）──────────────
/** inverted-hull 黑描边相对半径的额外量（Å，POC 用固定值；正式版用屏幕空间 pos.w） */
export const OUTLINE_OFFSET = 0.05

// ── 球径向渐变（复刻 xyzrender：左上高光焦点 fx/fy=.33、3 段 stop 0%/40%/100%）──
// 在 HSL 空间由基色算高光/边缘暗色（对齐 xyzrender colors.py 的 lighten/darken 语义）
export function sphereShades(hex: number): { hi: THREE.Color; base: THREE.Color; lo: THREE.Color } {
  const base = new THREE.Color(hex)
  const hsl = { h: 0, s: 0, l: 0 }
  base.getHSL(hsl)
  const hi = new THREE.Color().setHSL(hsl.h, hsl.s, Math.min(1, hsl.l + (1 - hsl.l) * 0.5))
  const lo = new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s + (1 - hsl.s) * 0.18), hsl.l * 0.52)
  return { hi, base, lo }
}
// view-space 法线的 xy = 球在屏幕的投影坐标（中心→0、边缘→单位圆），正好对应 SVG 圆盘
const SPHERE_VERT = /* glsl */`
  #include <fog_pars_vertex>
  varying vec3 vN;
  void main() {
    vN = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`
const SPHERE_FRAG = /* glsl */`
  #include <fog_pars_fragment>
  uniform vec3 uHi; uniform vec3 uBase; uniform vec3 uLo;
  varying vec3 vN;
  void main() {
    float d = clamp(length(vN.xy - vec2(-0.34, 0.34)) / 0.66, 0.0, 1.0);   // 到左上高光焦点的径向距离
    vec3 col = d < 0.4 ? mix(uHi, uBase, d / 0.4) : mix(uBase, uLo, (d - 0.4) / 0.6);
    float rim = 1.0 - abs(vN.z);        // 球 silhouette：法线越垂直视线越靠边缘
    col *= 1.0 - 0.25 * rim * rim;      // 边缘再同心压暗一点，更贴 SVG radialGradient 的边缘
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`
export function makeSphereMat(hex: number): THREE.ShaderMaterial {
  const s = sphereShades(hex)
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      { uHi: { value: s.hi }, uBase: { value: s.base }, uLo: { value: s.lo } },
    ]),
    vertexShader: SPHERE_VERT, fragmentShader: SPHERE_FRAG, fog: true,
  })
}
// 键圆柱：view 法线做左上光的侧向渐变（比 toon 更贴渐变球的风格）
const CYL_FRAG = /* glsl */`
  #include <fog_pars_fragment>
  uniform vec3 uHi; uniform vec3 uBase; uniform vec3 uLo;
  varying vec3 vN;
  void main() {
    float ndl = clamp(dot(normalize(vN), normalize(vec3(-0.4, 0.5, 0.7))) * 0.5 + 0.5, 0.0, 1.0);
    vec3 col = ndl > 0.5 ? mix(uBase, uHi, (ndl - 0.5) * 2.0) : mix(uLo, uBase, ndl * 2.0);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`
export function makeCylinderMat(hex: number): THREE.ShaderMaterial {
  const s = sphereShades(hex)
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      { uHi: { value: s.hi }, uBase: { value: s.base }, uLo: { value: s.lo } },
    ]),
    vertexShader: SPHERE_VERT, fragmentShader: CYL_FRAG, fog: true,
  })
}

// ── IboView-like glossy material ─────────────────────────────────────────────
// IboView's molecule renderer relies on smooth per-pixel lighting: saturated base
// colors, strong white specular highlights, and a darker rim. This shader keeps
// that look separate from RetainMol's publication SVG-style outline material.
const IBOVIEW_FRAG = /* glsl */`
  uniform vec3 uColor;
  uniform float uShaderReg0;
  uniform float uShaderReg1;
  uniform float uShaderReg2;
  uniform float uShaderReg3;
  uniform bool uUseFragDepthCue;
  uniform float uFadeWidth;
  uniform float uFadeBias;
  uniform vec3 uDepthCueColor;
  varying vec3 vN;

  vec3 calcLight(vec3 n, vec3 l, float intensity) {
    float cosAngle = clamp(dot(n, normalize(l)), 0.0, 1.0);
    vec3 diffuse = uShaderReg1 * pow(cosAngle, uShaderReg0) * uColor;
    vec3 specular = uShaderReg2 * (uShaderReg3 * pow(cosAngle, 16.0) + 1.2 * pow(cosAngle, 64.0)) * vec3(1.0);
    return intensity * (diffuse + specular);
  }

  void main() {
    vec3 n = normalize(vN);
    vec3 col =
      calcLight(n, vec3( 0.50000000,  0.50000000, 0.70710678), 1.0) +
      calcLight(n, vec3(-0.43301270, -0.25000000, 0.86602540), 0.6) +
      calcLight(n, vec3( 0.43301270, -0.25000000, 0.86602540), 0.5);

    if (uUseFragDepthCue) {
      float rz = clamp(uFadeWidth * (gl_FragCoord.z - 0.5) + uFadeBias, 0.0, 1.0);
      col = mix(col, uDepthCueColor, rz);
    }

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`

export function iboviewShaderColor(hex: number): THREE.Color {
  const color = new THREE.Color(hex)
  const hsl = { h: 0, s: 0, l: 0 }
  color.getHSL(hsl)
  if (hsl.s <= 0.18 && hsl.l < 0.45) {
    color.setHSL(hsl.h, hsl.s, 0.6)
  }
  return color
}

export function makeIboViewMat(
  hex: number,
  material: IboViewShaderMaterialProfile,
  depthCue?: DepthCueProfile,
): THREE.ShaderMaterial {
  const useFragDepthCue = depthCue?.mode === 'iboview-fragcoord'
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: iboviewShaderColor(hex) },
      uShaderReg0: { value: material.shaderReg0 },
      uShaderReg1: { value: material.shaderReg1 },
      uShaderReg2: { value: material.shaderReg2 },
      uShaderReg3: { value: material.shaderReg3 },
      uUseFragDepthCue: { value: useFragDepthCue },
      uFadeWidth: { value: depthCue?.fadeWidth ?? 0 },
      uFadeBias: { value: depthCue?.fadeBias ?? 0 },
      uDepthCueColor: { value: new THREE.Color(depthCue?.color ?? 0xffffff) },
    },
    vertexShader: SPHERE_VERT,
    fragmentShader: IBOVIEW_FRAG,
    fog: false,
  })
}
