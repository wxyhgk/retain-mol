# Style Extension Quickstart

This guide is the minimum path for adding a molecule display style without touching unrelated editor code.

## Entry Points

Use the public style subpath for new integration code:

```ts
import {
  registerTheme,
  registerStylePreset,
  registerRenderProfile,
  listThemes,
  listStylePresets,
  listRenderProfiles,
} from '@retainmol/mol-viewer/styles'
```

The root `@retainmol/mol-viewer` barrel still mirrors these exports for compatibility, but new app code and docs should use the `styles` subpath.

## Choose the Smallest Layer

Start with the smallest layer that can express the style:

| Need | Layer | Files |
| --- | --- | --- |
| Element colors, background, highlight color, ball/bond scale tokens | Theme | `packages/mol-viewer/src/presets/themes/*.json` or `registerTheme()` |
| Combine existing display mode, theme, renderer, labels | Style preset | `packages/mol-viewer/src/styles/presets/*.json` or `registerStylePreset()` |
| New material, lighting, bond color policy, bond geometry, aromatic style, depth cue | Render profile | `packages/mol-viewer/src/styles/profiles/*` or `registerRenderProfile()` |
| A new primitive that profiles cannot express | Renderer capability | `packages/mol-viewer/src/lib/molRenderer/*` |

Do not edit builder, store, import/export, or geometry chemistry code for a visual style.

## Data-Only Style

Theme:

```ts
registerTheme({
  $schemaVersion: '1',
  kind: 'theme',
  metadata: {
    id: 'my-tool',
    name: 'My Tool',
    description: 'My Tool inspired colors',
    source: 'internal',
    author: 'RetainMol',
    version: '0.1.0',
  },
  extends: 'default',
  scene: { backgroundColor: '#ffffff' },
  elements: {
    C: { color: '#8f8f8f' },
    N: { color: '#6fc8e8' },
    O: { color: '#ff1f1f' },
  },
})
```

Preset:

```ts
registerStylePreset({
  $schemaVersion: '1',
  kind: 'molecular-style-preset',
  metadata: {
    id: 'my-tool-default',
    name: 'My Tool',
    description: 'Default My Tool visual style',
    source: 'internal',
    author: 'RetainMol',
    version: '0.1.0',
  },
  displayMode: 'ball-stick',
  themeId: 'my-tool',
  renderStyle: 'realistic',
  showAtomLabels: false,
})
```

Inherited presets may override only a subset:

```ts
registerStylePreset({
  $schemaVersion: '1',
  kind: 'molecular-style-preset',
  metadata: {
    id: 'my-tool-labeled',
    name: 'My Tool Labeled',
    description: 'My Tool style with labels',
    version: '0.1.0',
  },
  extends: 'my-tool-default',
  showAtomLabels: true,
})
```

## Render Profile Style

Add a render profile when the style needs renderer behavior, not only colors:

```ts
registerRenderProfile({
  id: 'my-tool-renderer',
  name: 'My Tool',
  description: 'My Tool renderer profile',
  materialModel: 'phong',
  bondColorPolicy: 'brighten-neutral',
  bondGeometry: 'cylinder',
  aromaticBondStyle: 'dashed',
  outline: false,
  backgroundGrid: true,
  cameraFov: 20,
  depthCue: { mode: 'three-fog' },
  lighting: {
    ambient: { color: 0xffffff, intensity: 0.45 },
    key: { color: 0xffffff, intensity: 1, position: [7, 7, 10] },
    fill: { color: 0xffffff, intensity: 0.45, position: [-7, -4, 12] },
    rim: { color: 0xffffff, intensity: 0.25, position: [6, -7, 12] },
  },
})
```

Then reference the profile from a preset:

```json
{
  "$schemaVersion": "1",
  "kind": "molecular-style-preset",
  "metadata": {
    "id": "my-tool-default",
    "name": "My Tool",
    "description": "My Tool style",
    "version": "0.1.0"
  },
  "displayMode": "ball-stick",
  "themeId": "my-tool",
  "renderStyle": "my-tool-renderer"
}
```

## Validation

Run these before handing the style to another person:

```bash
npm run build --workspace @retainmol/mol-viewer
npx vitest run --root packages/mol-viewer
npm run check:boundaries --workspace retainmol
```

For renderer-profile changes, also do a browser smoke:

1. Open the app.
2. Place benzene.
3. Switch to the style preset.
4. Switch display modes.
5. Confirm there are no console errors.

## Coordination Rules

- Theme-only and preset-only work can be parallelized.
- New render profile fields need renderer owner review.
- New material models need renderer owner review and docs in `docs/styles/renderer-profiles.md`.
- Public exports go through `@retainmol/mol-viewer/styles` first.
- Never add software-name branches inside renderer code. Add generic profile fields instead.
