# Style Concepts

## Style Preset

A style preset is the user-facing entry point.

Examples:

```text
retainmol-default
gaussview-default
iboview-default
pymol-default
avogadro-default
publication-soft
```

A preset does not directly render molecules. It selects and configures lower-level style layers.

## Representation

Representation decides what geometry is drawn.

Examples:

```text
ball-stick
stick
spacefill
tube
wireframe
mtube
```

Future examples:

```text
surface
density
orbital
ibo
esp-map
```

Representation should answer:

```text
Which primitives are visible?
How large are atoms and bonds?
Are bond orders shown geometrically?
Are hydrogens visible?
Are labels visible by default?
```

## Theme

Theme decides semantic colors.

Examples:

```text
element colors
background color
highlight color
fallback element color
bond color policy
```

Themes should not decide lighting, fog, outline, or material shaders.

## Render Profile

Render profile decides how primitives are rendered.

Examples:

```text
lighting
fog and depth cueing
material model
specular/shininess
outline
aromatic bond appearance
bond neutral color mapping
postprocessing
grid visibility
```

Render profiles should not decide molecule editing behavior.

## Feature Profiles

Some future styles are not only ball-and-stick settings. IboView-style work may need orbitals, localization views, surfaces, or scalar fields.

Feature profiles should isolate these domains:

```text
orbitalProfile
surfaceProfile
densityProfile
labelProfile
measurementProfile
```

These should be optional and should only affect features that are active.

## Resolved Style

Renderer code should receive a resolved style object. It should not care whether that object came from GaussView, IboView, PyMOL, or a custom user preset.

```ts
type ResolvedMolecularStyle = {
  representation: ResolvedRepresentation
  theme: ResolvedTheme
  renderProfile: ResolvedRenderProfile
  features: ResolvedFeatureProfiles
}
```

The resolver is the only layer that understands preset inheritance and composition.

