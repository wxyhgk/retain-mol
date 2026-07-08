# Renderer Profiles

Renderer profiles describe how molecule primitives are drawn. They should be data-driven where possible.

## What Belongs Here

Renderer profile fields:

```text
material model
lighting
fog / depth cueing
outline
bond color policy
atom radius policy
bond geometry policy
aromatic bond style
grid/background reference strength
postprocessing
publication shader settings
```

These fields are currently split across:

```text
packages/mol-viewer/src/config/render.config.ts
packages/mol-viewer/src/lib/molRenderer/*
packages/mol-viewer/src/presets/themes/*.json
```

The long-term goal is to move style-specific renderer parameters into named profiles.

## What Does Not Belong Here

Do not put these in render profiles:

- Atom replacement behavior.
- Valence checks.
- Hydrogen addition policy.
- File import/export policy.
- Undo behavior.
- Panel layout.

## Bond Color Policy

Bond color is one of the most important style dimensions.

Suggested policies:

```text
inherit-from-atoms
fixed-neutral
lighten-dark-neutral
element-at-ends-with-neutral-carbon
```

For editing, `lighten-dark-neutral` is useful because carbon atoms can stay dark while C-C and C-H bonds remain readable.

## Depth Cue Policy

Fog should be treated as depth cueing, not cinematic blur. Some software styles use scene fog; others implement depth cueing inside the material shader.

Recommended fields:

```ts
type DepthCueProfile = {
  mode: 'three-fog' | 'iboview-fragcoord' | 'none'
  nearOffset?: number
  farOffset?: number
  fadeWidth?: number
  fadeBias?: number
  color?: number
}
```

For `three-fog`, near/far offsets are relative to the camera-to-pivot distance. For `iboview-fragcoord`, the material shader mixes toward the cue color using `gl_FragCoord.z`; do not also enable scene fog for that profile.

## Geometry Policy

Renderer profiles may own visual geometry when software styles use different primitive rules:

```ts
type GeometryProfile = {
  atomRadiusMode?: 'theme-covalent' | 'iboview-draw-radius'
  atomRadiusScale?: number
  bondGeometry: 'cylinder' | 'capsule'
  bondOpenEnded?: boolean
  bondTaper?: number
  bondStartOffsetFactor?: number
  multiBondRadiusScale?: number
  multiBondOffsetFactor?: number
}
```

These fields should stay visual. They must not change chemical bond perception, valence, hydrogen policy, or file import semantics.

## Aromatic Bond Policy

Current renderer supports aromatic inner dash cylinders.

Potential profile fields:

```ts
type AromaticStyle = {
  mode: 'dash-cylinder' | 'inner-line' | 'none'
  color: string
  opacity?: number
  radiusFactor?: number
  dashSize?: number
  gapSize?: number
}
```

If a style needs a different aromatic display, add a generic aromatic mode instead of a software-specific branch.

## Outline Policy

Publication rendering uses inverted-hull outlines. Editing styles generally should avoid heavy outlines because they make dense molecules look cluttered.

Suggested fields:

```ts
type OutlineProfile = {
  enabled: boolean
  atomRadialFactor: number
  bondRadialFactor: number
  colorMode: 'auto-background' | 'fixed'
  fixedColor?: string
}
```

## Renderer Rule

Renderer code should consume a resolved profile:

```ts
renderer.renderScene(objects, {
  representation,
  theme,
  renderProfile,
})
```

It should not know that the profile came from GaussView, IboView, PyMOL, or RetainMol.
