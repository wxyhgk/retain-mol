# Render Profile Registry

Render profiles describe how the renderer draws an already chosen molecular representation.

## Current State vs Target State

Current state:

- Render profile ids are constrained by `RenderStyleSchema` in `packages/mol-viewer/src/styles/schema.ts`.
- Built-in profile data lives in TypeScript, primarily `packages/mol-viewer/src/styles/renderProfiles.ts` and profile modules under `packages/mol-viewer/src/styles/profiles/`.
- Style preset JSON can reference only existing `renderStyle` ids.
- Adding a theme JSON or a style preset JSON can be independent work, but adding a new render profile is not data-only.

Target state:

- Render profiles should remain generic capability objects, independent from software names.
- A software style preset should reference a profile id; renderer code should consume the resolved profile object.
- New visual behavior should be expressed as a named profile field first, then implemented in renderer consumers.

They are separate from molecule themes:

```text
theme         -> element colors, background color, ball/stick scale
renderProfile -> material model, lighting/depth cue, geometry policy, grid visibility, camera FOV, aromatic bond style
stylePreset   -> user-facing bundle of displayMode + theme + renderProfile
```

## Code Entry

Current implementation:

```text
packages/mol-viewer/src/styles/renderProfiles.ts
packages/mol-viewer/src/styles/profiles/iboview-renderer-profile.ts
```

Public API:

```ts
listRenderProfiles()
resolveRenderProfile(id)
```

Renderer entry points should depend on the resolved profile object instead of checking software names directly.

Current consumers:

```text
packages/mol-viewer/src/lib/molRenderer/MolRenderer.ts
packages/mol-viewer/src/lib/molRenderer/MoleculeRenderer.ts
packages/mol-viewer/src/lib/molRenderer/sceneRig.ts
apps/retainmol/src/features/style/components/StylePanel.tsx
```

## Current Fields

```ts
materialModel: 'phong' | 'publication-shader' | 'iboview-shader'
bondColorPolicy: 'element' | 'brighten-neutral' | 'fixed'
bondColor?: number
bondGeometry: 'cylinder' | 'capsule'
bondOpenEnded?: boolean
bondTaper?: number
bondStartOffsetFactor?: number
multiBondRadiusScale?: number
multiBondOffsetFactor?: number
fullBondThreshold?: number
aromaticBondStyle: 'dashed' | 'single'
outline: boolean
backgroundGrid: boolean
cameraFov: number
depthCue: {
  mode: 'three-fog' | 'iboview-fragcoord' | 'none'
  fadeWidth?: number
  fadeBias?: number
  color?: number
}
lighting: {
  ambient: { color: number; intensity: number }
  key: { color: number; intensity: number; position: [number, number, number] }
  fill: { color: number; intensity: number; position: [number, number, number] }
  rim: { color: number; intensity: number; position: [number, number, number] }
}
atomRadiusMode?: 'theme-covalent' | 'iboview-draw-radius'
atomRadiusScale?: number
hydrogenBallStickRadiusMultiplier?: number
iboviewMaterial?: {
  atom: { shaderReg0: number; shaderReg1: number; shaderReg2: number; shaderReg3: number }
  bond: { shaderReg0: number; shaderReg1: number; shaderReg2: number; shaderReg3: number }
  orbital?: { shaderReg0: number; shaderReg1: number; shaderReg2: number; shaderReg3: number }
}
```

These fields are deliberately small. Add a field only when a software style cannot be expressed by existing fields, or when at least two styles differ in that behavior.

`bondColorPolicy` owns bond cylinder color:

- `element`: each half of the bond uses the connected atom color.
- `brighten-neutral`: element color, but dark neutral bonds are lifted for readability on light backgrounds.
- `fixed`: each bond line is drawn as one continuous segment using `bondColor`.

`bondGeometry` owns the physical shape of bond segments:

- `cylinder`: straight cylinder segments with flat caps.
- `capsule`: rounded-end segments for styles that deliberately want rounded geometry.

`bondOpenEnded` removes cylinder end caps. `bondTaper` changes the radius from one end of a half-bond to the other. IboView's source `IvMesh::MakeCylinder(1, fBondThinning, ...)` uses open-ended tapered cylinders, and `IvView3D::RenderHalfBond` draws two half-bonds from the connected atoms toward the center. In that style the rounded impression comes mostly from shader response and antialiasing, not capsule end caps.

`bondStartOffsetFactor` shortens each half-bond from the atom side. IboView starts a half-bond at `0.3 * atomDrawRadius`, not at the atom center.

`multiBondRadiusScale` and `multiBondOffsetFactor` describe software-specific multi-bond geometry without a software-specific branch. IboView defaults are `multiBondRadiusScale = 1.4` and `multiBondOffsetFactor = 0.7`, so a double bond uses cylinders of radius `bondRadius * 1.4 / 2` and offsets them by `+-0.7 * bondRadius`.

`atomRadiusMode` exists because some tools draw atom balls from a visual radius table instead of chemical covalent radii. IboView uses `AtomicRadii[element] * 0.4` for molecule display.

`depthCue.mode = 'iboview-fragcoord'` means depth cueing is implemented in the material shader as `mix(color, white, clamp(fadeWidth * (gl_FragCoord.z - 0.5) + fadeBias, 0, 1))`. It is not equivalent to Three.js scene fog.

Do not enable IboView's source default `fadeWidth = 9, fadeBias = 0` unless the camera/projection profile is also IboView-like. With RetainMol's current PerspectiveCamera depth range, that formula can wash the entire molecule toward white.

## IboView Shiny Presets

IboView ships shader preset scripts in `resources/preset_*.js`. These are material variants, not molecule themes. They should map to `iboviewMaterial` or a future material-variant selector under the render profile layer.

| IboView preset | atom shader regs `(a0,a1,a2,a3)` | orbital shader regs `(o0,o1,o2,o3)` | geometry changes |
| --- | --- | --- | --- |
| `not very shiny :/` | `(0.28, 0.52, 0.20, -0.5)` | `(0.26, 0.52, 0.40, -0.5)` | default bond scale/thinning/multibond |
| `reasonably shiny` | `(0.80, 0.70, 0.40, -0.5)` | `(0.80, 0.70, 0.70, -0.5)` | default bond scale/thinning/multibond |
| `extra shiny \o/` | `(0.80, 0.70, 0.70, -0.5)` | `(0.80, 0.70, 1.22, -0.5)` | default bond scale/thinning/multibond |
| `sooooo shiny 8]` | `(0.20, 0.50, 2.92, -0.5)` | `(0.20, 0.42, 2.90, -0.5)` | default bond scale/thinning/multibond |
| `cgk's shiny chic '21` | `(0.04, 0.46, 0.34, 0.80)` | `(0.04, 0.50, 0.34, 0.78)` | `bond_scale=52`, `bond_thinning=0.8`, `multi_bond_scale=180`, `multi_bond_pos=145` |

## Adding A Profile

Adding a profile is a coordinated code change. Do not treat it like adding theme JSON.

1. Add the render style id to `RenderStyleSchema` in `packages/mol-viewer/src/styles/schema.ts`.
2. Add a profile object in `packages/mol-viewer/src/styles/renderProfiles.ts`, or a dedicated file under `packages/mol-viewer/src/styles/profiles/` when the profile has enough parameters to tune independently.
3. If the existing fields cannot express the behavior, add a generic capability field to the profile type and implement it in renderer consumers.
4. Reference the profile id from a style preset in `packages/mol-viewer/src/styles/presets/*.json`.
5. Update docs for current behavior and target behavior.
6. Build the package and app.

Required checks:

```bash
npm run build --workspace @retainmol/mol-viewer
npm test --workspace retainmol -- --run
npm run build --workspace retainmol
```

## Rule

Do not add new software-specific renderer branches:

```ts
if (stylePresetId === 'gaussview-default') {}
```

Prefer profile capability checks:

```ts
const profile = resolveRenderProfile(renderStyle)
if (profile.outline) {}
```

If the profile cannot express a renderer behavior, add a named capability field to the profile first, then have renderer code consume that field.

## Collaboration Checklist

- Theme-only work belongs in theme JSON and should not touch this registry.
- Preset-only work can reference an existing `renderStyle` and should not add schema values.
- New profile ids must update schema, registry, preset references, renderer consumers if needed, and docs together.
- Public style APIs should be exported through the `@retainmol/mol-viewer/styles` sub-entry and kept compatible through the root barrel during the migration.
