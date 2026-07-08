# Rendering Documentation

Rendering docs cover Three.js scene setup, molecule mesh rendering, frame loop, and visual profile implementation.

See also:

- [Molecule Renderer Boundary](./mol-renderer-boundary.md): current file-level ownership for `MolRenderer`, `MoleculeRenderer`, style primitives, and selection visuals.

Primary code:

```text
packages/mol-viewer/src/lib/molRenderer
packages/mol-viewer/src/lib/animation
packages/mol-viewer/src/config/render.config.ts
packages/mol-viewer/src/hooks/useRendererBinding.ts
```

## Boundary

Renderer owns:

- Scene setup.
- Camera, lights, fog, grid.
- Atom and bond meshes.
- Material and shader selection.
- Render-time overlays that require Three.js.
- Picking geometry.

Renderer must not own:

- Molecule mutation semantics.
- Hydrogen/valence policy.
- File import/export policy.
- App panel layout.
- Zustand store mutation.

## Current Data Flow

```text
Zustand scene/editor state
  -> useRendererBinding
  -> MolRenderer.renderScene()
  -> MoleculeRenderer.render()
  -> Three.js scene graph
```

Pointer events flow back through injected callbacks:

```text
pointer event
  -> InteractionHandler
  -> useBuilder callbacks
  -> store actions
```

## Style System Relationship

Renderer should consume resolved style data:

```text
representation
theme
renderProfile
feature profiles
```

Renderer should not branch on software names such as:

```text
gaussview
iboview
pymol
```

If a software style needs new visual behavior, first add a generic render-profile field. Only then add renderer implementation for that field.
