import * as THREE from 'three'
import type { Molecule } from '../molecule'
import type { DisplayMode } from '../types'
import type { ResolvedTheme } from '../../presets'
import { resolveRenderProfile, type RenderStyle, type ResolvedRenderProfile } from '../../styles'
import { MoleculeAtomRenderer } from './MoleculeAtomRenderer'
import { MoleculeBondRenderer } from './MoleculeBondRenderer'
import { applyObjectVisualState, type ObjectVisualState } from './moleculeObjectVisualState'

/** Coordinates atom and bond renderers for a single molecule object. */
export class MoleculeRenderer {
  private readonly atomRenderer: MoleculeAtomRenderer
  private readonly bondRenderer: MoleculeBondRenderer
  private renderStyle: RenderStyle = 'realistic'
  private profile: ResolvedRenderProfile = resolveRenderProfile('realistic')

  constructor(
    private readonly modelGroup: THREE.Group,
    private readonly getTheme: () => ResolvedTheme,
    invalidate?: () => void,
  ) {
    this.atomRenderer = new MoleculeAtomRenderer(
      modelGroup,
      getTheme,
      () => this.profile,
      invalidate,
    )
    this.bondRenderer = new MoleculeBondRenderer(
      modelGroup,
      getTheme,
      () => this.profile,
    )
  }

  get atomMeshes() {
    return this.atomRenderer.meshes
  }

  get bondMeshes() {
    return this.bondRenderer.meshes
  }

  render(
    molecule: Molecule,
    displayMode: DisplayMode,
    selectedAtoms: Set<string>,
    selectedBonds: Set<string>,
    aromaticBonds: Map<string, THREE.Vector3> = new Map(),
    renderStyle: RenderStyle = 'realistic',
    visualState: ObjectVisualState = {},
  ) {
    if (this.renderStyle !== renderStyle) this.clearStyleDependentMeshes()
    this.renderStyle = renderStyle
    this.profile = resolveRenderProfile(renderStyle)

    const atomById = new Map(molecule.atoms.map(atom => [atom.id, atom]))
    this.atomRenderer.render(molecule.atoms, displayMode, selectedAtoms)
    this.bondRenderer.render(
      molecule.bonds,
      atomById,
      displayMode,
      selectedBonds,
      aromaticBonds,
    )
    applyObjectVisualState(this.modelGroup, visualState)
  }

  setDragHover(atomId: string) {
    this.atomRenderer.setDragHover(atomId)
  }

  clearDragHover() {
    this.atomRenderer.clearDragHover()
  }

  dispose() {
    this.atomRenderer.dispose()
    this.bondRenderer.dispose()
  }

  private clearStyleDependentMeshes() {
    this.atomRenderer.clearStyleDependentMeshes()
    this.bondRenderer.clear()
  }
}
