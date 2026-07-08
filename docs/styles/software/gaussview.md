# GaussView Style Notes

Status: implemented as a first-pass style preset.

## Style ID

```text
gaussview-default
```

## Goal

Provide a GaussView-inspired day-to-day editing style for molecular construction and inspection. The target is not a pixel-perfect clone yet; the current goal is to reproduce the broad working-view impression: compact ball-and-stick geometry, dark carbon atoms, bright CPK heteroatoms, and a light purple-gray workspace background.

## Reference

```text
software: GaussView
version: primarily GaussView 6 references, with older GaussView display notes where useful
view mode: ball-and-stick molecular view
screenshots:
  - https://gaussian.com/wp-content/uploads/dl/gv6.pdf
  - https://mitos.probusco.org/howto/gaussian/GV4Man/molecs.htm
  - https://emleddin.github.io/comp-chem-website/Otherguide-gaussian-images.html
sample molecules:
  - water
  - benzene
  - carbon-rich organic molecule
  - heteroatom-rich molecule
```

Notes from references:

- GaussView exposes molecular display customization through the View / Display Format path.
- Ball-and-stick is the normal first target for molecule inspection and orbital-overlay workflows.
- External teaching notes mention GaussView's default background as purple, even though white is often preferred for publication images.

## Visual Characteristics

### Representation

```text
default display mode: ball-stick
atom size: compact, editing-friendly balls rather than oversized publication balls
bond thickness: slim sticks
hydrogen visibility: visible by default
bond order display: use current RetainMol multi-bond support
aromatic display: use current RetainMol aromatic bond behavior
```

### Theme

```text
background: light purple-gray workspace color
element colors: CPK-like; carbon is dark gray/near black
bond colors: inherit from atom endpoints with current RetainMol bond behavior
highlight colors: warm yellow selection/highlight
```

Implemented theme:

```text
theme id: gaussview
file: packages/mol-viewer/src/presets/themes/gaussview.json
```

### Render Profile

```text
material: current realistic renderer
lighting: current RetainMol lighting until render profiles are formalized
fog/depth cueing: not yet represented in the theme schema
outline: current renderer behavior
postprocessing: current renderer behavior
grid: none
```

## RetainMol Mapping

```text
style preset: gaussview-default
representation: ball-stick
theme: gaussview
render profile: realistic
feature profiles: none yet
```

## Known Deviations

- GaussView-specific display-format options are not modeled yet.
- Exact GaussView element color tables are approximated from common CPK conventions.
- Background is set to a muted purple-gray based on visual documentation, not an exact sampled value.
- Renderer profile fields for depth cueing, material roughness, and lighting are not in the schema yet.

## Test Molecules

Use at least:

- water or methane
- benzene
- a large carbon-rich molecule
- heteroatom-rich molecule
- optional orbital/surface case when volume rendering is introduced

## StylePanel Verification

Expected behavior:

```text
click preset: GaussView
stylePresetId: gaussview-default
displayMode: ball-stick
themeId: gaussview
renderStyle: realistic
```

