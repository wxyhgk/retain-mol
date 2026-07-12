import type { Atom, Bond } from './lib/molecule'

interface ViewportRenderer {
  fitToMolecule(atoms: Atom[]): void
  resetCamera(): void
  setAxesVisible(visible: boolean): void
  setGridVisible(visible: boolean): void
}

interface ViewportStateSnapshot {
  activeObjectId: string | null
  objectsById: Readonly<Record<string, {
    molecule: { atoms: readonly Atom[]; bonds: readonly Bond[] }
  } | undefined>>
  selectedAtomIds: ReadonlySet<string>
  selectedBondIds: ReadonlySet<string>
}

export interface ViewportController {
  fitViewport(): void
  focusViewportSelection(): void
  resetViewport(): void
  setViewportAxesVisible(visible: boolean): void
  setViewportGridVisible(visible: boolean): void
}

export interface ViewportRegistry {
  register(controller: ViewportController): () => void
  invoke(command: (controller: ViewportController) => void): boolean
}

export function createViewportRegistry(): ViewportRegistry {
  let activeViewport: ViewportController | null = null
  return {
    register(controller) {
      activeViewport = controller
      return () => {
        if (activeViewport === controller) activeViewport = null
      }
    },
    invoke(command) {
      const controller = activeViewport
      if (!controller) return false
      command(controller)
      return true
    },
  }
}

export const defaultViewportRegistry = createViewportRegistry()

/** MolViewer internal registration point. The most recently mounted viewport is active. */
export function registerViewport(controller: ViewportController): () => void {
  return defaultViewportRegistry.register(controller)
}

/** Build the narrow command surface without exposing MolRenderer to the app. */
export function createViewportController(
  renderer: ViewportRenderer,
  getState: () => ViewportStateSnapshot,
): ViewportController {
  const getActiveMolecule = (state: ViewportStateSnapshot) => {
    if (!state.activeObjectId) return undefined
    return state.objectsById[state.activeObjectId]?.molecule
  }

  return {
    fitViewport() {
      const molecule = getActiveMolecule(getState())
      if (molecule && molecule.atoms.length > 0) renderer.fitToMolecule([...molecule.atoms])
    },
    focusViewportSelection() {
      const state = getState()
      const molecule = getActiveMolecule(state)
      if (!molecule) return
      const selectedIds = new Set(state.selectedAtomIds)
      for (const bond of molecule.bonds) {
        if (!state.selectedBondIds.has(bond.id)) continue
        selectedIds.add(bond.atomId1)
        selectedIds.add(bond.atomId2)
      }
      const atoms = molecule.atoms.filter(atom => selectedIds.has(atom.id))
      if (atoms.length > 0) renderer.fitToMolecule(atoms)
    },
    resetViewport() {
      renderer.resetCamera()
    },
    setViewportAxesVisible(visible) {
      renderer.setAxesVisible(visible)
    },
    setViewportGridVisible(visible) {
      renderer.setGridVisible(visible)
    },
  }
}

function invokeViewport(command: (controller: ViewportController) => void): boolean {
  return defaultViewportRegistry.invoke(command)
}

export function fitViewport(): boolean {
  return invokeViewport(controller => controller.fitViewport())
}

export function focusViewportSelection(): boolean {
  return invokeViewport(controller => controller.focusViewportSelection())
}

export function resetViewport(): boolean {
  return invokeViewport(controller => controller.resetViewport())
}

export function setViewportAxesVisible(visible: boolean): boolean {
  return invokeViewport(controller => controller.setViewportAxesVisible(visible))
}

export function setViewportGridVisible(visible: boolean): boolean {
  return invokeViewport(controller => controller.setViewportGridVisible(visible))
}
