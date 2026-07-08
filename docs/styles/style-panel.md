# Style Panel

The Style panel is the user-facing control surface for molecule display.

Current file:

```text
apps/retainmol/src/features/style/components/StylePanel.tsx
```

## Current Controls

The panel currently controls:

```text
displayMode
renderStyle
showAtomLabels
themeId
```

These are stored in:

```text
packages/mol-viewer/src/store/editorStore.ts
```

## Future Controls

Add a top-level software style section:

```text
软件风格
  RetainMol
  GaussView
  IboView
  PyMOL
  Avogadro
```

Clicking one should call:

```ts
setStylePreset(id)
```

Existing controls should remain as advanced overrides:

```text
渲染模式
渲染风格 / render profile
标注
主题
```

## What StylePanel Owns

StylePanel owns:

- User-facing controls.
- Labels and grouping.
- Calling editor-store style actions.
- Showing selected preset/override state.

StylePanel must not own:

- Three.js mesh construction.
- Chemistry editing behavior.
- Theme JSON validation.
- Render profile resolution.

## Override Semantics

When a user picks a software preset and then changes a lower-level option, the app should show that the preset is customized.

Recommended state model:

```text
stylePresetId = "gaussview-default"
overrides = { displayMode: "stick" }
```

Initial implementation may keep current separate fields and only add `stylePresetId`, but the UI should be designed for preset plus overrides.

## Review Checklist

Before changing StylePanel:

- Is this a user-facing style control, or a renderer implementation detail?
- Does it need to be saved as style state?
- Does it belong in a preset, theme, render profile, or one-off UI state?
- Can the renderer consume this through a resolved style instead of a software-specific branch?

