# PyMOL Style Notes

Status: implemented as a first-pass style preset using the existing PyMOL-inspired theme.

## Style ID

```text
pymol-default
```

## Goal

Provide a PyMOL-inspired viewport style for users who expect the classic dark-background molecular visualization look: black background, bright green carbon, high-contrast heteroatoms, and readable ball-stick geometry.

## Reference

```text
software: PyMOL
version: general PyMOL color references
view mode: ball-and-stick for small molecules; stick/cartoon modes are future extensions
screenshots:
  - https://pymolwiki.org/index.php/Color_Values
  - https://pymol.org/
sample molecules:
  - water
  - benzene
  - large carbon-rich ligand
  - heteroatom-rich molecule
```

Notes from references:

- PyMOL has a large named-color system.
- The current RetainMol approximation emphasizes the familiar green-carbon, black-background look rather than full PyMOL command-language compatibility.

## Visual Characteristics

### Representation

```text
default display mode: ball-stick
atom size: current RetainMol default
bond thickness: current RetainMol default
hydrogen visibility: visible by default
bond order display: current RetainMol multi-bond behavior
aromatic display: current RetainMol aromatic behavior
```

### Theme

```text
background: black
element colors: green carbon, white hydrogen, bright red oxygen, bright blue nitrogen
bond colors: inherit from atom endpoints
highlight colors: yellow
```

Implemented theme:

```text
theme id: pymol
file: packages/mol-viewer/src/presets/themes/pymol.json
```

### Render Profile

```text
material: current realistic renderer
lighting: current RetainMol lighting
fog/depth cueing: not exposed in current schema
outline: current renderer behavior
postprocessing: current renderer behavior
grid: none
```

## RetainMol Mapping

```text
style preset: pymol-default
representation: ball-stick
theme: pymol
render profile: realistic
feature profiles: cartoon/ribbon/stick presets are future work
```

## Known Deviations

- PyMOL's full representation system is not implemented.
- Cartoon, ribbon, surface, and selection-language color workflows are outside the current molecule-display scope.
- The current theme uses a small element-color subset over RetainMol's default CPK fallback.

## Test Molecules

Use at least:

- water or methane
- benzene
- a large carbon-rich molecule
- heteroatom-rich molecule
- optional protein/ligand case if polymer rendering is introduced

## StylePanel Verification

Expected behavior:

```text
click preset: PyMOL
stylePresetId: pymol-default
displayMode: ball-stick
themeId: pymol
renderStyle: realistic
```

