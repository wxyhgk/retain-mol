# IboView Style Notes

Status: molecule display is implemented as an IboView-inspired first pass; orbital and surface rendering profiles are documented but not implemented yet.

## Style ID

```text
iboview-default
```

## Goal

Provide an IboView-inspired glossy style for molecular geometry display, and prepare the style model for later orbital, IBO, density, and isosurface rendering. The current implementation targets molecule display only: source-style CPK colors, white background, medium-gray carbon, IboView draw-radius atom balls, two open-ended tapered half-bonds, the `cgk's shiny chic '21` material/bond preset, element-symbol atom labels, a dedicated glossy shader material, and no background grid.

## Reference

```text
software: IboView
version: public IboView site and KoehnLab/iboview source snapshot
view mode: ball-and-stick molecule display, orbital overlay display
screenshots:
  - https://www.iboview.org/
  - https://www.iboview.org/_bldUPAt.html
  - /Users/wxyhgk/Code/iboview/docs/molecule-display-exploration/README.md
  - /Users/wxyhgk/Code/iboview/docs/orbital-display-exploration/README.md
sample molecules:
  - water
  - benzene
  - carbon-rich organic molecule
  - heteroatom-rich molecule
  - orbital or IBO example when volume rendering lands
```

Notes from source exploration:

- Molecule rendering uses shared sphere and cylinder primitives.
- Bonds are rendered as two half-bonds, allowing each end to inherit the adjacent atom color.
- Half-bonds start at `0.3 * atomDrawRadius` from the atom center.
- Source-default bond geometry uses open-ended tapered cylinders with `bond_thinning = 0.72`; RetainMol's default IboView profile currently uses the `shiny chic '21` preset with `bond_thinning = 0.8`.
- Source-default bond radius is approximately `0.28 Å`; RetainMol's default IboView profile currently uses approximately `0.15 Å` from `shiny chic '21`.
- Atom balls use IboView's visual `AtomicRadii` table scaled by `0.4`, not RetainMol covalent radii.
- Element labels are enabled for carbon and non-hydrogen atoms by default, matching IboView preset behavior (`label_elements = true`, `label_elements_c = true`) more closely than RetainMol's normal atom-number labels.
- Default camera is orthographic.
- Shader uses three directional lights and strong specular highlights.
- Default fragment depth cue mixes toward white using `gl_FragCoord.z`.
- Transparent orbital surfaces use depth peeling.
- Orbital isosurface normals are recomputed from scalar-field gradients, not just triangle geometry.

## Visual Characteristics

### Representation

```text
default display mode: ball-stick
atom size: IboView visual radius table * 0.4
bond thickness: approximately 0.15 Å in the default RetainMol IboView profile
hydrogen visibility: visible by default
bond order display: offset multi-bonds use IboView radius/offset factors
aromatic display: currently rendered as single bonds in the IboView profile
labels: centered element symbols for carbon and non-H atoms
```

### Theme

```text
background: white
element colors: IboView Rasmol CPKnew table; carbon is medium gray (#999999), hydrogen is white
bond colors: atom-endpoint colors by default; per-element bond color overrides can be added later
highlight colors: cool blue selection/highlight
```

Implemented theme:

```text
theme id: iboview
file: packages/mol-viewer/src/presets/themes/iboview.json
```

### Render Profile

```text
material: IboView glossy renderer using the `shiny chic '21` atom/bond registers
profile file: packages/mol-viewer/src/styles/profiles/iboview-renderer-profile.ts
lighting: shader contains the original three-direction light formula
fog/depth cueing: Three.js scene fog disabled; IboView fragment depth cue capability exists but is off by default until true OrthographicCamera support is implemented
outline: none for molecule primitives
postprocessing: target supports supersampling/FXAA; current renderer behavior applies
grid: none
```

Implemented renderer-profile fields used by IboView:

```text
materialModel: iboview-shader
bondColorPolicy: element
bondGeometry: cylinder
bondOpenEnded: true
bondTaper: 0.8
bondStartOffsetFactor: 0.3
multiBondRadiusScale: 1.8
multiBondOffsetFactor: 1.45
fullBondThreshold: 0.2
atomRadiusMode: iboview-draw-radius
atomRadiusScale: 0.4
atomLabels.mode: element-symbol
cameraFov: 12
cameraFitMultiplier: 2.25
depthCue.mode: none for current default; iboview-fragcoord is implemented but gated until orthographic projection
iboviewMaterial.atom/bond/orbital: shader_reg values
```

Future renderer-profile fields still needed for closer IboView matching:

```text
camera.projection: true orthographic camera
enable source default depthCue.mode: iboview-fragcoord with fadeWidth=9, fadeBias=0 after true OrthographicCamera support lands
transparency.mode: depth-peeling
bonds.partialBondStyle: dotted-weighted
antialias.mode: supersample/fxaa
label occlusion/depth sorting against atoms
```

## IboView Shiny Presets

IboView's built-in shiny presets live in source files under `resources/preset_*.js`. They are material variants: they change `shader_reg_a*` for atoms/bonds and `shader_reg_o*` for orbitals. They are not element-color themes.

| Preset | Atom/bond regs | Orbital regs | Notes |
| --- | --- | --- | --- |
| `not very shiny :/` | `(0.28, 0.52, 0.20, -0.5)` | `(0.26, 0.52, 0.40, -0.5)` | softest highlight |
| `reasonably shiny` | `(0.80, 0.70, 0.40, -0.5)` | `(0.80, 0.70, 0.70, -0.5)` | IboView source default |
| `extra shiny \o/` | `(0.80, 0.70, 0.70, -0.5)` | `(0.80, 0.70, 1.22, -0.5)` | stronger specular |
| `sooooo shiny 8]` | `(0.20, 0.50, 2.92, -0.5)` | `(0.20, 0.42, 2.90, -0.5)` | extreme specular, labels off |
| `cgk's shiny chic '21` | `(0.04, 0.46, 0.34, 0.80)` | `(0.04, 0.50, 0.34, 0.78)` | RetainMol default for molecule display; also changes bond scale and multibond geometry |

RetainMol should expose these later as an IboView material variant selector under render profile controls. Do not create separate molecule themes for these presets unless element colors also change.

## RetainMol Mapping

```text
style preset: iboview-default
representation: ball-stick
theme: iboview
render profile: iboview
feature profiles:
  orbitalProfile: iboview-orbital (future)
  surfaceProfile: iboview-surface (future)
```

## Known Deviations

- RetainMol does not yet expose a true OrthographicCamera as part of the style preset. The current IboView profile uses a narrow perspective FOV plus a larger fit multiplier, then refits the active molecule when the render style changes. This gives a flatter view without breaking editing controls.
- Three-point IboView lighting and shader parameters are now centralized in `iboview-renderer-profile.ts`, but exact antialiasing and true orthographic projection still differ.
- IboView molecule bonds are rendered as two open-ended half-cylinders, each colored from the source atom's bond color. The apparent roundness comes mostly from shader response and antialiasing rather than capsule geometry.
- The IBO render profile is treated as paired with the IboView theme. The stock IboView shader assumes medium-gray carbon (`#999999`); pairing it with black-carbon themes produces harsh dark artifacts because `shader_reg_a3 = -0.5` creates a negative specular lobe.
- RetainMol protects this at multiple layers: store actions switch IBO to the IboView theme, renderer binding normalizes external prop combinations, and the IboView shader material lifts very dark neutral colors before shading.
- Partial/dotted fractional bonds are not implemented yet.
- Orbital, density, IBO, and surface profile domains are not implemented yet.
- Depth peeling for transparent orbital surfaces is future work.
- Current style only covers molecule display.

## Test Molecules

Use at least:

- water or methane
- benzene
- a large carbon-rich molecule
- heteroatom-rich molecule
- orbital/surface case after volume rendering exists

## StylePanel Verification

Expected behavior:

```text
click preset: IboView
stylePresetId: iboview-default
displayMode: ball-stick
themeId: iboview
renderStyle: iboview
```
