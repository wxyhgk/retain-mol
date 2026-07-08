# Style System Migration Plan

This plan evolves the current style system without breaking the app.

## Current State

Current editor state:

```ts
displayMode: DisplayMode
renderStyle: 'realistic' | 'publication' | 'iboview'
themeId: string
theme: ResolvedTheme
```

Current renderer inputs:

```text
displayMode
renderStyle
theme
selected atom/bond ids
```

This is enough for the current UI, but it will become hard to scale when adding many software styles.

Current implementation status:

- Initial style preset infrastructure exists under `packages/mol-viewer/src/styles`.
- Style preset JSON files are loaded from `packages/mol-viewer/src/styles/presets/*.json`.
- Theme JSON files are loaded from `packages/mol-viewer/src/presets/themes/*.json`.
- Render profile ids are still enumerated in TypeScript and resolved through the render profile registry.
- Public style helpers belong to the `@retainmol/mol-viewer/styles` sub-entry contract. Root-barrel exports may mirror them only for compatibility.

Target state:

- Style presets become the main user-facing entry point.
- Representation, theme, render profile, and later feature profiles resolve from one preset id.
- Root-barrel exports remain compatible during migration, while docs and new consumers move toward sub-entry imports.
- Render profile expansion is deliberate and coordinated, not an incidental JSON-only change.

## Phase 1: Documentation and Naming

Status: started.

Tasks:

- Define style concepts.
- Document layer ownership.
- Keep current code working.
- Avoid adding more software-specific renderer branches.

## Phase 2: Add Style Registry Types

Add new internal types:

```text
MolecularStylePreset
RepresentationConfig
RenderProfileConfig
ResolvedMolecularStyle
```

Do not remove existing `displayMode`, `renderStyle`, or `themeId` yet.

Status: initial implementation exists under `packages/mol-viewer/src/styles`.

## Phase 3: Resolve Current State Through a Preset

Add a compatibility preset:

```text
retainmol-default
```

It should resolve to the same values the app uses today:

```text
displayMode: ball-stick
theme: default
renderProfile: realistic
```

The Style panel can keep the current controls while internally setting a preset id plus overrides.

Status: initial `retainmol-default` plus placeholder software presets exist, and `StylePanel` exposes a software-style section.

## Phase 4: Move Render Config Into Profiles

Gradually move style-specific constants out of global `render.config.ts`.

Keep truly global defaults in `render.config.ts`; move profile-specific values into profile data:

```text
fog offsets
outline factors
bond neutral color policy
aromatic style
lighting
material model
```

## Phase 5: Add Software Presets

Start with data-only presets:

```text
gaussview-default
pymol-default
avogadro-default
iboview-default
```

Only add renderer capabilities when a profile field cannot be expressed.

Current parallel-work boundary:

- Theme JSON can be added independently if it uses the current theme schema.
- Style preset JSON can be added independently if it references existing `displayMode`, `themeId`, and `renderStyle` values.
- A new render profile id or field requires schema, registry, renderer, test, and doc coordination.

## Phase 6: Advanced Feature Profiles

After the core style registry is stable, add feature profiles:

```text
orbitalProfile
surfaceProfile
densityProfile
labelProfile
measurementProfile
```

This is where IboView-like orbital and localization views should plug in.

## Compatibility Rule

External app code should use public APIs from explicit `@retainmol/mol-viewer/*` sub-entries. Any new public style API must first be exported from:

```text
packages/mol-viewer/src/public/styles.ts
```

Deep imports from `packages/mol-viewer/src/styles/...` should remain internal unless explicitly exported.

During the compatibility period:

- Root-barrel imports stay supported for compatibility:

```ts
import { MolViewer, listStylePresets } from '@retainmol/mol-viewer'
```

- New documentation and app code should prefer the relevant sub-entry:

```ts
import { listStylePresets, resolveStylePreset } from '@retainmol/mol-viewer/styles'
```

- Sub-entries are the target public contracts for new consumers, but they must not require deep source imports.
- Do not remove root exports until a documented breaking-change window.

## Multi-Person Checklist

- Theme-only branch: edit theme JSON and matching style docs only.
- Preset-only branch: edit preset JSON and matching style docs only.
- Render-profile branch: reserve schema, registry, renderer consumers, checks, and docs together.
- Public API branch: prefer sub-entry shape first, then mirror through the root barrel for compatibility.
- UI branch: consume public style APIs; do not deep import from `packages/mol-viewer/src/styles/...`.
