# Implementation Design

This document maps the target style system to the current codebase.

## Existing Data Flow

Current state lives in:

```text
packages/mol-viewer/src/store/editorStore.ts
```

Current fields:

```ts
displayMode: DisplayMode
renderStyle: 'realistic' | 'publication' | 'iboview'
themeId: string
theme: ResolvedTheme
```

Current UI:

```text
apps/retainmol/src/features/style/components/StylePanel.tsx
```

Current renderer binding:

```text
packages/mol-viewer/src/hooks/useRendererBinding.ts
```

Current theme loading:

```text
packages/mol-viewer/src/presets/schema.ts
packages/mol-viewer/src/presets/loader.ts
packages/mol-viewer/src/presets/themes/*.json
```

## Minimal First Implementation

Add a new preset layer without removing current fields.

### New Types

Add to a new module, not to `ThemeSchema` directly:

```text
packages/mol-viewer/src/styles/schema.ts
packages/mol-viewer/src/styles/loader.ts
packages/mol-viewer/src/styles/presets/*.json
```

Initial schema can be intentionally small:

```ts
type StylePresetV1 = {
  $schemaVersion: '1'
  kind: 'molecular-style-preset'
  metadata: Metadata
  extends?: string
  displayMode: DisplayMode
  themeId: string
  renderStyle: 'realistic' | 'publication' | 'iboview'
  showAtomLabels?: boolean
}
```

This gives us a unified user-facing entry point without blocking on full render-profile extraction.

### Editor Store

Add:

```ts
stylePresetId: string
setStylePreset: (id: string) => void
```

`setStylePreset(id)` should resolve a preset and atomically set:

```ts
{
  stylePresetId: id,
  displayMode,
  renderStyle,
  themeId,
  theme: resolveTheme(themeId),
  showAtomLabels?
}
```

Manual overrides should keep working. If the user changes `displayMode`, `renderStyle`, or `themeId` manually, either:

- keep `stylePresetId` and treat those fields as overrides, or
- clear `stylePresetId` to a custom state.

Preferred first version:

```text
manual override keeps stylePresetId but UI indicates "customized"
```

### Public API

Define the public style contract from:

```text
packages/mol-viewer/src/public/styles.ts
```

Suggested exports:

```ts
export { listStylePresets, resolveStylePreset } from '../styles/loader'
export type { StylePreset, ResolvedStylePreset } from '../styles/schema'
```

Mirror through `packages/mol-viewer/src/index.ts` only when root-barrel compatibility is needed.

Do not require app code to deep-import from `packages/mol-viewer/src/styles/...`.

### Style Panel

Add a new top section:

```text
软件风格
  RetainMol
  GaussView
  PyMOL
  IboView
  Avogadro
```

Clicking a preset calls:

```ts
setStylePreset(id)
```

Keep the current lower controls:

```text
渲染模式
渲染风格
标注
主题
```

These become advanced overrides.

## Second Implementation: Render Profiles

Once preset selection works, extract `renderStyle` into `renderProfileId`.

Target store fields:

```ts
stylePresetId: string
displayMode: DisplayMode
themeId: string
renderProfileId: string
resolvedStyle: ResolvedMolecularStyle
```

Target renderer binding:

```ts
r.style = resolvedStyle
```

Instead of:

```ts
r.theme = theme
r.renderStyle = renderStyle
```

## Renderer Refactor Targets

Avoid adding more style branches in these locations:

```text
packages/mol-viewer/src/lib/molRenderer/MoleculeRenderer.ts
packages/mol-viewer/src/lib/molRenderer/MolRenderer.ts
packages/mol-viewer/src/lib/molRenderer/sceneRig.ts
```

Known hot spots:

- Material creation currently branches on `publication`.
- Outline behavior is tied to `publication`.
- Fog and lighting are global config, not profile data.
- Bond neutral color policy is currently implemented inside `MoleculeRenderer`.
- Aromatic dash geometry and color are global config.
- Mesh cache keys currently do not include profile identity.

When introducing render profiles, cache keys should include the profile id or profile shape signature.

## Compatibility Strategy

Current APIs should continue to work:

```tsx
<MolViewer displayMode="ball-stick" theme="default" />
```

New APIs can be added later:

```tsx
<MolViewer stylePreset="gaussview-default" />
<MolViewer renderProfile="iboview-realistic" />
```

Define precedence explicitly:

```text
explicit component props
  > editor store manual overrides
  > selected style preset
  > built-in defaults
```
