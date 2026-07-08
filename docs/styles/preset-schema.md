# Style Preset Schema

This is the proposed schema for a unified style preset system. It is intentionally separate from the current theme schema so we can migrate gradually.

## Current State vs Target State

Current state:

- Runtime style presets are JSON files under `packages/mol-viewer/src/styles/presets/*.json`.
- They are validated by `StylePresetSchema` in `packages/mol-viewer/src/styles/schema.ts`.
- The current schema maps directly to existing editor fields: `displayMode`, `themeId`, `renderStyle`, and optional `showAtomLabels`.
- People can independently add preset JSON when it references existing schema values.
- People cannot add a new `renderStyle` value by JSON alone. That requires schema, render profile registry, and renderer coordination.

Target state:

- Presets will resolve to representation, theme, render profile, and optional feature profiles.
- Preset inheritance should support shared software families such as `gaussview-base`, `gaussview-dark`, and `gaussview-publication`.
- The target schema below describes the intended direction, not the full current runtime contract.

## Current Runtime Preset

Use this shape today for files in `packages/mol-viewer/src/styles/presets/*.json`:

```ts
type StylePreset = {
  $schemaVersion: '1'
  kind: 'molecular-style-preset'
  metadata: {
    id: string
    name: string
    description?: string
    source?: string
    author?: string
    version?: string
  }
  extends?: string
  displayMode: 'ball-stick' | 'spacefill' | 'stick' | 'wireframe' | 'tube' | 'mtube'
  themeId: string
  renderStyle: 'realistic' | 'publication' | 'iboview'
  showAtomLabels?: boolean
}
```

Current example:

```json
{
  "$schemaVersion": "1",
  "kind": "molecular-style-preset",
  "metadata": {
    "id": "gaussview-default",
    "name": "GaussView",
    "description": "GaussView-inspired ball-and-stick editing style.",
    "version": "1.0.0"
  },
  "displayMode": "ball-stick",
  "themeId": "gaussview",
  "renderStyle": "realistic"
}
```

## Target Preset

This is the proposed destination schema:

```ts
type MolecularStylePreset = {
  schemaVersion: 1
  kind: 'molecular-style-preset'
  metadata: {
    id: string
    name: string
    description?: string
    source?: string
    author?: string
    version: string
  }
  extends?: string
  representation: string
  theme: string
  renderProfile: string
  features?: {
    orbitalProfile?: string
    surfaceProfile?: string
    labelProfile?: string
    measurementProfile?: string
  }
  overrides?: {
    representation?: Partial<RepresentationConfig>
    theme?: Partial<ThemeConfig>
    renderProfile?: Partial<RenderProfileConfig>
  }
}
```

## Example

Target example:

```json
{
  "schemaVersion": 1,
  "kind": "molecular-style-preset",
  "metadata": {
    "id": "gaussview-default",
    "name": "GaussView",
    "description": "GaussView-inspired ball-and-stick editing style.",
    "source": "Visual reference from GaussView",
    "author": "RetainMol",
    "version": "1.0.0"
  },
  "representation": "ball-stick",
  "theme": "gaussview-cpk",
  "renderProfile": "gaussview-realistic"
}
```

## Representation Config

Representation config owns geometry-level display decisions:

```ts
type RepresentationConfig = {
  displayMode: 'ball-stick' | 'stick' | 'spacefill' | 'tube' | 'mtube' | 'wireframe'
  atomScale?: number
  bondRadius?: number
  bondGap?: number
  showHydrogens?: boolean
  showBondOrderGeometry?: boolean
}
```

## Theme Config

Theme config owns semantic colors:

```ts
type ThemeConfig = {
  scene: {
    backgroundColor: string
    highlightColor: string
    highlightOpacity: number
  }
  elements: Record<string, { color: string }>
  bonds: {
    defaultColor: 'inherit-from-atoms' | string
  }
  fallbackColor: string
}
```

## Render Profile Config

Render profile config owns rendering behavior:

```ts
type RenderProfileConfig = {
  material: 'phong' | 'toon' | 'publication-shader' | 'matcap'
  lighting: {
    ambient: LightConfig
    key: LightConfig
    fill?: LightConfig
  }
  fog: {
    enabled: boolean
    nearOffset: number
    farOffset: number
  }
  outline: {
    enabled: boolean
    atomFactor: number
    bondFactor: number
  }
  bonds: {
    neutralColorPolicy: 'inherit' | 'lighten-dark-neutral' | 'fixed'
    fixedColor?: string
    aromaticStyle: 'dash-cylinder' | 'inner-line' | 'none'
  }
}
```

## Inheritance Rules

Preset inheritance should be shallow at the preset reference level and deep at the config level:

```text
base preset
  -> child preset references override representation/theme/profile ids
  -> child overrides deep-merge into resolved representation/theme/profile
```

This keeps common families easy:

```text
gaussview-base
gaussview-dark
gaussview-publication
```

## Collaboration Checklist

- Adding preset JSON is safe to do independently only when `displayMode`, `themeId`, and `renderStyle` already exist.
- Adding theme JSON for a preset is separate and can be independent if the existing theme schema is enough.
- Adding a new `renderStyle` or render profile field requires coordinated edits to schema, registry, renderer behavior, validation, and docs.
- Public style helpers should be consumed from `@retainmol/mol-viewer/styles` in new docs, while root-barrel exports remain compatible during migration.
