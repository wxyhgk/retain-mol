import type {
  EditorHostPort,
  EditorHostSnapshot,
  Molecule,
} from '@retainmol/mol-viewer/core'
import { useEditorStore } from './editorState'
import { useMoleculeStore } from './moleculeState'

interface EditorHostMoleculeState {
  readonly activeObjectId: string | null
  readonly objectsById: Readonly<Record<string, { readonly molecule: Molecule }>>
  addToScene(molecule: Molecule, autoOffset?: boolean): string
  setMolecule(molecule: Molecule): void
  clearSelection(): void
}

export interface EditorHostAdapterDependencies {
  getMoleculeState(): EditorHostMoleculeState
  subscribe(listener: () => void): () => void
  notify(message: string): void
}

export function createEditorHostPort(
  dependencies: EditorHostAdapterDependencies,
): EditorHostPort {
  let snapshot: EditorHostSnapshot = {
    activeObjectId: null,
    activeMolecule: null,
  }

  const getSnapshot = (): EditorHostSnapshot => {
    const state = dependencies.getMoleculeState()
    const activeMolecule = state.activeObjectId
      ? state.objectsById[state.activeObjectId]?.molecule ?? null
      : null
    if (
      snapshot.activeObjectId === state.activeObjectId
      && snapshot.activeMolecule === activeMolecule
    ) {
      return snapshot
    }
    snapshot = {
      activeObjectId: state.activeObjectId,
      activeMolecule,
    }
    return snapshot
  }

  return {
    getSnapshot,
    subscribe: dependencies.subscribe,
    replaceActiveMolecule: molecule => {
      const state = dependencies.getMoleculeState()
      if (!state.activeObjectId) return state.addToScene(molecule, false)
      state.setMolecule(molecule)
      return state.activeObjectId
    },
    clearSelection: () => dependencies.getMoleculeState().clearSelection(),
    notify: dependencies.notify,
  }
}

export const editorHostPort = createEditorHostPort({
  getMoleculeState: () => useMoleculeStore.getState(),
  subscribe: listener => useMoleculeStore.subscribe(listener),
  notify: message => useEditorStore.getState().flashHint(message),
})
