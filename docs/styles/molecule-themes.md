# Molecule Themes

Molecule themes define semantic colors and a small set of display-size tokens. They are not full renderer profiles.

## Current Location

Theme files:

```text
packages/mol-viewer/src/presets/themes/*.json
```

Schema and loader:

```text
packages/mol-viewer/src/presets/schema.ts
packages/mol-viewer/src/presets/loader.ts
```

Public API:

```ts
resolveTheme(id)
listThemes()
```

## Theme Schema

Themes currently support:

```text
$schemaVersion
kind: "theme"
metadata
extends
scene
render
bonds
fallbackColor
elements
```

## Theme vs ResolvedTheme

Theme JSON may be partial. Runtime code calls `resolveTheme(id)` and receives a complete `ResolvedTheme`.

```text
theme JSON
  -> zod validation
  -> extends chain merge
  -> ResolvedTheme
```

## What Belongs in Theme

Put these in themes:

- Element colors.
- Background color.
- Selection/highlight color.
- Selection/highlight opacity.
- Fallback element color.
- Basic ball/stick/spacefill size tokens.
- Bond default color policy if it is semantic.

## What Does Not Belong in Theme

Do not put these in themes:

- Lighting.
- Fog/depth cueing.
- Material model.
- Outline.
- Shader choices.
- Aromatic dash geometry.
- RAF or animation behavior.
- Picker radius.
- Overlay label layout.
- Chemistry editing policy.

These belong in render profiles, config, renderer internals, or builder logic depending on ownership.

## Adding a New Theme

1. Add a JSON file under:

```text
packages/mol-viewer/src/presets/themes/
```

2. Set a stable `metadata.id`. The id is the registry key, not the file name.

3. Use `extends` when only overriding part of an existing theme.

4. Run tests/build so schema validation catches invalid theme data.

5. If the theme is part of a software style, also add or update a style preset doc.

## Naming

Prefer names that distinguish theme from preset:

```text
theme: gaussview-cpk
style preset: gaussview-default
render profile: gaussview-realistic
```

Avoid using one id for multiple layers.

