# RetainMol Collaboration Boundaries

This document defines ownership boundaries for multi-person work. The goal is to keep UI, chemistry editing logic, state, and rendering from becoming coupled through ad hoc imports.

## Current State vs Target State

Current state:

- `@retainmol/mol-viewer` still exposes most stable consumer APIs through the root barrel at `packages/mol-viewer/src/index.ts`.
- Package sub-entries exist in `packages/mol-viewer/package.json` for `./core`, `./io`, `./viewer`, `./styles`, `./fragments`, `./samples`, `./pubchem`, and `./optimize`.
- App code imports viewer runtime state through `apps/retainmol/src/domain/viewerAdapter.ts`; other app files should not import `@retainmol/mol-viewer/viewer` directly.
- Theme JSON and style preset JSON can be added independently when they use existing schema values and existing render profiles.
- Adding a new render profile id or a new renderer behavior still requires coordinated TypeScript changes in the style schema, render profile registry, and renderer consumers.

Target state:

- Consumer imports should move toward public sub-entries such as `@retainmol/mol-viewer/viewer`, `@retainmol/mol-viewer/io`, `@retainmol/mol-viewer/styles`, and `@retainmol/mol-viewer/fragments`.
- The root barrel remains a compatibility facade during the migration, not the place to grow every new public API by default.
- Software styles should be mostly data-driven: a style preset resolves representation, theme, render profile, and optional feature profiles without software-specific renderer branches.
- Render profile additions should become narrow capability additions with schema, registry, renderer, tests, and docs updated together.

## Package Layers

### `apps/retainmol`

Application shell and product UI.

Owns:
- Top-level layout, toolbar, inspector, build panel, search, file/paste workflows.
- App-only stores such as `apps/retainmol/src/lib/uiStore.ts`.
- Long-running app workflows, for example 2D-to-3D generation and optimization workers.

Must not own:
- Core molecule mutation semantics.
- Three.js scene internals.
- Builder geometry algorithms.

Allowed dependency direction:
- May import public APIs from `@retainmol/mol-viewer`.
- Should not import deep internal files from `packages/mol-viewer/src/lib/...`.

### `packages/mol-viewer/src/index.ts`

Public API surface for the app and future consumers.

Owns:
- Re-export policy.
- Stable component, store, IO, theme, element, fragment, and sample APIs.
- Compatibility re-exports during the sub-entry migration.

Rule:
- Anything exported here is treated as a collaboration contract.
- Anything not exported here is internal unless explicitly documented.
- New public APIs should prefer the relevant sub-entry contract first. Add a root-barrel export only when existing app or downstream compatibility needs it.

Compatibility policy:
- Existing root imports such as `import { MolViewer } from '@retainmol/mol-viewer'` stay valid for the compatibility period.
- New app code should use explicit sub-entries, and app viewer runtime state should go through `apps/retainmol/src/domain/viewerAdapter.ts`.
- Do not remove root exports in the same change that introduces a sub-entry. Deprecation should be documented first, then removed in a later breaking-change window.
- Public sub-entries should never require consumers to deep import from `packages/mol-viewer/src/...`.

### `packages/mol-viewer/src/lib/builder`

Pure molecule editing and analysis logic.

Owns:
- Atom, bond, fragment, ring, geometry, aromaticity, and valence utilities.
- Pure functions that accept molecule data and return molecule data or result objects.

Must not own:
- React state.
- UI hints and labels.
- Three.js meshes or camera state.

Rules:
- Prefer pure functions.
- Keep browser/app concerns out.
- Chemistry editing policy changes need focused tests in this layer.

Current policy:
- Atom replacement is pure element replacement: keep id, coordinates, bonds, and explicit hydrogens.
- Hydrogen addition, bond inference, aromaticity detection, and geometry cleanup are explicit operations, not implicit side effects of replacement.

### `packages/mol-viewer/src/store`

State orchestration and undo boundaries.

Owns:
- Scene object list.
- Active object selection.
- Atom/bond selection.
- Undoable molecule edits.
- Mapping pure builder functions into store actions.

Must not own:
- Heavy chemistry algorithms.
- Three.js rendering details.
- App layout state.

Rules:
- Store actions should be thin wrappers over builder functions where possible.
- Undo scope must be deliberate. Use transactions for multi-step user actions.
- Selection and UI-only state should not pollute undo history.

### `packages/mol-viewer/src/hooks`

Interaction adapters.

Owns:
- Translating pointer/keyboard gestures into store actions.
- Activating the correct scene object before edits.
- Coordinating current editor mode with builder/store operations.

Must not own:
- Core chemistry mutation rules.
- Renderer mesh construction.
- App-specific panel layout.

Risk area:
- `useBuilder.ts` is currently a high-churn boundary because it mixes interaction policy with chemistry editing intent. New work should prefer moving reusable mutation rules down into `lib/builder` and keeping this hook as a dispatcher.

### `packages/mol-viewer/src/lib/molRenderer`

Three.js rendering and picking internals.

Owns:
- Scene setup, lights, fog, camera, controls.
- Atom/bond mesh construction.
- Visual style implementation.
- Hit testing and render-time overlays that require Three.js objects.

Must not own:
- Molecule mutation semantics.
- Zustand state mutations.
- App UI panels.

Rules:
- Renderer should consume molecule data, selected ids, display mode, theme, and render style.
- Renderer should not decide chemistry validity.
- Visual changes should be controlled through config/theme where practical.

## Feature Ownership Guide

Use this table when deciding where work belongs.

| Work type | Primary owner |
| --- | --- |
| Add a toolbar button or panel control | `apps/retainmol` |
| Add a stable viewer capability for app use | `packages/mol-viewer/src/public/viewer.ts` plus internal implementation, then optional root compatibility |
| Change atom replacement behavior | `lib/builder/editing/atomOps.ts`, store wrapper, tests |
| Change point/click gesture semantics | `hooks/useBuilder.ts` |
| Change undo behavior | `store/slices/*`, `store/moleculeStore.ts` |
| Change fog, lighting, atom/bond materials | `config/render.config.ts`, `lib/molRenderer/*` |
| Add molecule file format support | `lib/io/*` |
| Add force-field or geometry optimization | app worker if app-specific, `lib/io` or `lib/geometry` if library-level |
| Add a theme | `presets/themes/*.json` |
| Add a style preset using existing profiles | `styles/presets/*.json` |
| Add a render profile id | `styles/schema.ts`, `styles/renderProfiles.ts`, renderer consumers, tests/docs |

## Import Rules

Compatibility root import:

```ts
import { MolViewer, useMoleculeStore } from '@retainmol/mol-viewer'
```

Preferred public sub-entry imports for package consumers:

```ts
import { MolViewer } from '@retainmol/mol-viewer/viewer'
import { listStylePresets, resolveStylePreset } from '@retainmol/mol-viewer/styles'
import { parseMol, exportMol } from '@retainmol/mol-viewer/io'
```

Preferred app import for viewer runtime state:

```ts
import { MolViewer, useMoleculeStore } from '@/domain/viewerAdapter'
```

Avoid from `apps/retainmol`:

```ts
import { someInternal } from '../../../packages/mol-viewer/src/lib/...'
```

Inside `packages/mol-viewer`, keep dependencies directional:

```text
components/hooks -> store -> lib/builder
components/hooks -> lib/molRenderer
lib/builder -> lib/molecule/config
lib/molRenderer -> lib/molecule/config/presets
```

Avoid:

```text
lib/builder -> store
lib/builder -> React
lib/builder -> molRenderer
lib/molRenderer -> store
```

## Review Checklist

Before merging a change, check:

- Does this change cross a layer boundary without going through a public or local adapter API?
- Is a chemistry policy encoded in UI or renderer code?
- Is a rendering decision encoded in builder/store code?
- Does an app-specific workflow leak into `packages/mol-viewer`?
- Does a new store action create the right undo history?
- Are pure builder behavior changes covered by tests?
- Are visual changes controlled by config/theme instead of scattered constants?

## Multi-Person Boundary Checklist

Use this before starting parallel work:

- Are you only editing files owned by your task? If not, coordinate before touching shared schema, registry, renderer, store, or root barrel files.
- If you are adding a theme, can it be expressed as JSON under `packages/mol-viewer/src/presets/themes/` without TypeScript changes?
- If you are adding a style preset, can it reference existing `displayMode`, `themeId`, and `renderStyle` values under `packages/mol-viewer/src/styles/presets/`?
- If you need a new `renderStyle` or render profile behavior, have you reserved the schema, registry, renderer, test, and docs changes as one coordinated task?
- Are you changing public API exports? Prefer a sub-entry contract and keep root-barrel compatibility unless the change is an explicit breaking migration.
- Are you avoiding deep imports from `apps/retainmol` into `packages/mol-viewer/src/lib/...`?
- Are you leaving unrelated dirty files untouched?
