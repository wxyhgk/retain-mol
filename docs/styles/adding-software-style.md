# Adding a Software Style

Use this checklist when adding a style inspired by another chemistry tool.

## Current State vs Target State

Current state:

- You can independently add a theme JSON when the visual differences are element colors, background color, highlight color, or existing theme render tokens.
- You can independently add a style preset JSON when it only combines existing `displayMode`, `themeId`, `renderStyle`, and optional atom-label state.
- You cannot add a new render profile by JSON alone. A new profile id still touches `RenderStyleSchema`, the render profile registry, and any renderer code needed to consume new capability fields.

Target state:

- Most software styles should be described by data: representation, theme, render profile, and optional feature profiles.
- Renderer changes should introduce generic capabilities, not branches named after GaussView, IboView, PyMOL, or another tool.
- A software style doc should distinguish implemented behavior from target behavior.

## 1. Collect References

Capture visual references for:

- Small organic molecule.
- Aromatic molecule.
- Large molecule with many carbon atoms.
- Heteroatom-rich molecule.
- Optional: orbital/surface view if the software style includes it.

Record:

```text
software name
version if known
view mode
background
lighting impression
atom colors
bond colors
depth cueing
outline/shading
aromatic representation
hydrogen visibility
```

## 2. Decide the Layer Changes

Do not start by editing `MoleculeRenderer`.

Classify each visual difference:

| Difference | Layer |
| --- | --- |
| C is black, O is red, N is blue | Theme |
| Bonds are white, gray, silver, or no longer atom-colored | Render profile |
| Bonds are open-ended cylinders, rounded sticks, or another geometry shape | Render profile |
| Fog starts earlier | Render profile |
| Balls are larger relative to bonds | Representation |
| Double bonds are shown as parallel cylinders | Representation |
| Aromatic rings use inner dashed bonds | Render profile |
| Orbitals are shown | Feature profile |

## 3. Add Data First

Prefer adding or updating data:

```text
packages/mol-viewer/src/presets/themes/*.json
packages/mol-viewer/src/styles/presets/*.json
```

Theme JSON can be owned independently when it fits the existing theme schema.

Style preset JSON can be owned independently when it references existing values:

```text
displayMode
themeId
renderStyle
showAtomLabels
```

Only add a render profile when the existing `renderStyle` values cannot express the style. That is a coordinated code change, not a data-only change:

```text
packages/mol-viewer/src/styles/schema.ts
packages/mol-viewer/src/styles/renderProfiles.ts
packages/mol-viewer/src/styles/profiles/*
packages/mol-viewer/src/lib/molRenderer/*
```

If renderer code is needed, first add a generic capability field to the render profile, then make the renderer consume that field.

## 4. Keep Renderer Generic

Good:

```ts
if (profile.bondColorPolicy === 'brighten-neutral') {
  // generic behavior
}

if (profile.bondColorPolicy === 'fixed') {
  // use profile.bondColor
}
```

Avoid:

```ts
if (stylePresetId === 'gaussview-default') {
  // software-specific branch
}
```

## 5. Add Validation

For each new software style:

- Schema validates.
- Preset resolves.
- Viewer can render without console errors.
- Large carbon-rich molecule remains readable.
- Theme is listed in the Style panel if user-facing.

If the change adds a new render profile id or field:

- `RenderStyleSchema` accepts the id.
- `listRenderProfiles()` and `resolveRenderProfile(id)` include it.
- Renderer consumers use the resolved profile field rather than software-name checks.
- Tests or manual checks cover the new behavior in the viewer.

## 6. Document the Style

Each software style should have a short doc:

```text
docs/styles/software/gaussview.md
docs/styles/software/iboview.md
```

Include:

- Goal.
- Reference sources.
- Current implementation status.
- Target behavior if different from current behavior.
- Known deviations.
- Which RetainMol fields implement the style.

## Collaboration Checklist

Before opening a style branch:

- Are you only adding theme JSON? Stay in `packages/mol-viewer/src/presets/themes/` and matching docs.
- Are you only adding a preset that combines existing options? Stay in `packages/mol-viewer/src/styles/presets/` and matching docs.
- Are you adding a new `renderStyle`? Coordinate schema, registry, renderer, tests, and docs as one change.
- Are you touching public exports? Prefer `@retainmol/mol-viewer/styles` for style APIs and keep root-barrel compatibility.
- Are you changing renderer behavior? Use profile capability fields and avoid `stylePresetId` or software-name branches.
