# Molecular Style System

RetainMol will support visual styles inspired by multiple chemistry tools, such as GaussView, IboView, PyMOL, Avogadro, and publication renderers. These styles should enter the codebase through one consistent system instead of scattered renderer conditionals.

The style system has four layers:

```text
Style Preset
  -> Representation
  -> Theme
  -> Render Profile
  -> Optional Feature Profiles
```

## Current State vs Target State

Current state:

- The app still stores and renders `displayMode`, `themeId`, `theme`, and `renderStyle`.
- `stylePresetId` exists as a user-facing grouping layer, but resolved presets currently map back to `displayMode + themeId + renderStyle`.
- Theme files under `packages/mol-viewer/src/presets/themes/*.json` are auto-loaded and can be added independently when they fit the existing theme schema.
- Style preset files under `packages/mol-viewer/src/styles/presets/*.json` are auto-loaded and can be added independently when they reference existing `displayMode`, `themeId`, and `renderStyle` values.
- Render profiles are TypeScript-backed. New render profile ids or capabilities still require schema, registry, and renderer changes.

Target state:

- `stylePresetId` resolves to representation, theme, render profile, and optional feature profiles.
- Renderer code consumes resolved style objects and profile capability fields instead of checking software names.
- Theme JSON remains semantic color/display-token data; render profile data owns lighting, material, depth cue, bond geometry, grid, camera, and aromatic style.
- Adding most software styles should be a data task. Adding a new renderer capability remains a coordinated code task.

## Documents

- [Concepts](./concepts.md): shared vocabulary and layer definitions.
- [Preset Schema](./preset-schema.md): proposed data contract for style presets.
- [Adding a Software Style](./adding-software-style.md): checklist for adding GaussView, IboView, PyMOL, or another tool style.
- [Style Extension Quickstart](./style-extension-quickstart.md): shortest path for registering a theme, style preset, or render profile.
- [Molecule Themes](./molecule-themes.md): current theme schema and where theme data belongs.
- [Renderer Profiles](./renderer-profiles.md): what belongs in renderer configuration versus theme data.
- [Render Profile Registry](./render-profile-registry.md): current code entry for material model, lighting, grid, camera, and aromatic style.
- [Style Panel](./style-panel.md): user-facing style control ownership and future preset UI.
- [Migration Plan](./migration-plan.md): how to evolve the current `displayMode + renderStyle + themeId` model.
- [Implementation Design](./implementation-design.md): concrete codebase migration path.
- [Software Style Template](./software-template.md): template for documenting a new software-inspired style.

Related rendering docs:

- [Rendering README](../rendering/README.md): Three.js renderer ownership and style-profile boundary.

## Current Code Mapping

Current state:

```text
displayMode  -> representation
themeId      -> theme
renderStyle  -> partial render profile
render.config.ts -> global renderer defaults
```

Target state:

```text
stylePresetId -> resolves to representation + theme + renderProfile + feature profiles
```

The UI may still expose representation, theme, and render profile as advanced overrides. The important rule is that software-specific style names should resolve through a preset registry.

## Parallel Work Rule

People can independently add:

- Theme JSON, if it only uses the existing theme schema.
- Style preset JSON, if it only references existing `displayMode`, `themeId`, and `renderStyle` values.
- Software style docs, if they do not claim unsupported renderer behavior is implemented.

Coordinate before adding:

- A new `renderStyle` value.
- A new render profile field.
- A new material, bond geometry, depth cue, lighting mode, camera behavior, aromatic style, or renderer branch.
- A new public API export from the root barrel or a package sub-entry.

## Style Work Ownership Matrix

| Work type | Can edit | Must not edit without coordination | Minimum validation |
| --- | --- | --- | --- |
| Theme-only | `packages/mol-viewer/src/presets/themes/*.json`, theme docs | renderer, store, public exports | `npm run build --workspace @retainmol/mol-viewer` |
| Preset-only | `packages/mol-viewer/src/styles/presets/*.json`, preset docs | renderer, `styles/schema.ts`, `styles/renderProfiles.ts` | `npm run build --workspace @retainmol/mol-viewer` |
| New `renderStyle` id | `styles/schema.ts`, `styles/renderProfiles.ts`, renderer consumers, docs/tests | unrelated UI/layout files | app build plus focused renderer smoke |
| New render profile field | `styles/renderProfiles.ts`, renderer consumer, docs/tests | preset/theme files unrelated to the field | app build plus a visual smoke case |
| Renderer behavior | `lib/molRenderer/*`, render config/profile files | builder/store chemistry logic | app build plus browser smoke |
| StylePanel UI | `apps/retainmol/src/features/style/*` | package renderer internals | `npm run check:boundaries --workspace retainmol` and app build |
| Public API | `src/public/*`, `package.json` exports, docs | root barrel removals in the same PR | subpath runtime import smoke plus app build |

## Public Style API Export Policy

New style APIs should first belong to `@retainmol/mol-viewer/styles`. The root barrel may mirror a symbol only for compatibility, and removal of root exports should happen in a separate documented breaking-change window.

Do:

```ts
import { listStylePresets, resolveRenderProfile } from '@retainmol/mol-viewer/styles'
```

Avoid for new code:

```ts
import { listStylePresets } from '@retainmol/mol-viewer'
```

## Design Goals

- Adding a new software style should usually mean adding data files, not editing renderer branches.
- Renderer code should consume resolved style objects and avoid knowing about software names.
- Theme colors, renderer behavior, and representation geometry should stay separate.
- Scientific editing should remain readable; visual effects must not interfere with picking or geometry editing.
