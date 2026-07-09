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
- New user-facing edit behavior should enter through `lib/builder/commands`, not through direct calls to `BuilderEngine` or `lib/builder/editing` from hooks/store/app code.

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
- Store actions should be thin wrappers over builder commands where possible.
- Store slices should apply command results through shared helpers in `store/slices/helpers.ts` instead of hand-writing `objectsById`, selection, or undo-related patches at each call site.
- `store/slices/editSlice.ts` should stay as an edit action assembly layer; concrete edit action mappings live in focused `*EditActions.ts` files.
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
- `useBuilder.ts` is now a thin hook shell. Builder pointer adapters are split across `builderAtomHandlers.ts`, `builderBondHandlers.ts`, `builderBackgroundHandlers.ts`, and `builderPreviewHandlers.ts`. New work should prefer moving reusable mutation rules down into `lib/builder` and keeping these adapters as dispatchers.
- Hook effects may apply command results to store actions, but they should not encode chemistry mutation rules directly.
- `builder*Handlers.ts` files are routing adapters only. They should call `builder*Effects.ts` helpers instead of importing builder commands directly.
- Hook-side edit command execution should go through `runEditCommand` in `builderEditCommandEffects.ts`; other hook files should not call `applyEditCommandResult` directly.
- `useCanvasPointerRouter.ts` owns DOM pointer routing and transient gesture state only. Object transform and box selection result commits should go through `commitObjectPointerTransform` and `commitBoxSelect` in `useCanvasPointerRouterEffects.ts`.

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
| Change atom replacement behavior | `lib/builder/commands/*` for the interaction contract, `lib/builder/editing/atomOps.ts` for the low-level algorithm, tests |
| Change point/click gesture semantics | `hooks/builderAtomHandlers.ts`, `hooks/builderBondHandlers.ts`, `hooks/builderBackgroundHandlers.ts` |
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

## Automated Boundary Check

Run this before merging boundary-sensitive changes:

```bash
npm run check:boundaries --workspace retainmol
```

The script currently enforces these rules:

- App code must import mol-viewer through explicit public subpaths, not the root barrel.
- App code must import viewer runtime state through `apps/retainmol/src/domain/viewerAdapter.ts`.
- Shared app UI primitives must not depend on mol-viewer.
- `packages/mol-viewer/src/lib/builder/commands` must not import React, app aliases, store, hooks, components, or renderer internals.
- Package code and tests must import focused command files such as `lib/builder/commands/atomClickCommands` instead of the `lib/builder/commands` directory barrel.
- Package code and tests must import focused command modules instead of the `storeCommands` compatibility barrel. `storeCommands.ts` is kept only for legacy barrel compatibility.
- App code and mol-viewer hooks/store/components/public entries must not import `lib/builder/editing`; user-facing edits go through builder commands.
- The root `packages/mol-viewer/src/index.ts` barrel must not import `lib/builder/editing` directly; legacy root APIs should be bridged through command, public, or focused non-editing helper modules.
- `store/slices` must not import low-level builder rules such as `lib/builder/graph`, `lib/builder/valence`, `lib/builder/kernel`, or `lib/builder/editing`; store slices consume command results and shared store helpers only.
- `hooks/builder*Handlers.ts` files must route through `builder*Effects.ts` rather than importing builder commands directly.
- Hook files other than `builderEditCommandEffects.ts` must use `runEditCommand` instead of calling `applyEditCommandResult` directly.
- `hooks/useCanvasPointerRouter.ts` must commit object transforms through `commitObjectPointerTransform` and box selection through `commitBoxSelect`; it should not call `runObjectPointerTransformCommand`, `applyObjectTransformResult`, or `resolveBoxSelectResult` directly.
- Package code and tests must not import `BuilderEngine`; use builder commands or focused builder modules. Only the `BuilderEngine.test.ts` compatibility check may import it.
- `packages/mol-viewer/src/public/viewer.ts` must not export `BuilderEngine` editing algorithms.
- Direct `beginTransaction/endTransaction` calls are limited to `store/slices/editSlice.ts` and `hooks/editSessionFactory.ts`; other code must use edit sessions.

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
