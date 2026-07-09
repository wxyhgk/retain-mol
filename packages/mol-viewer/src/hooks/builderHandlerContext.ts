import { selectActiveMoleculeOrEmpty } from '../store/moleculeStore'
import { useEditorStore } from '../store/editorStore'
import type { Molecule } from '../lib/molecule'
import type { BuilderIntent } from '../lib/builder/commands/builderIntent'
import type { EditCommandEffects } from './builderEditCommandEffects'
import { readBuilderIntent } from './builderIntentState'
import type { MoleculeStoreApi } from './builderPointerTypes'

export interface BuilderHandlerSnapshot {
  readonly intent: BuilderIntent
  readonly molecule: Molecule
  readonly selectedAtomIds: ReadonlySet<string>
  readonly editEffects: EditCommandEffects
}

export interface BuilderEditSnapshot {
  readonly molecule: Molecule
  readonly selectedAtomIds: ReadonlySet<string>
  readonly editEffects: EditCommandEffects
}

export interface BuilderEditorEffects {
  readonly addMeasureAtom: (atomId: string) => void
  readonly commitPendingMeasure: () => void
  readonly flashHint: (message: string) => void
}

export interface BuilderSelectionEffects {
  readonly selectAtom: (atomId: string, append: boolean) => void
  readonly selectAtomsReplace: (atomIds: ReadonlySet<string>) => void
  readonly selectBond: (bondId: string, includeAtoms: boolean) => void
  readonly clearSelection: () => void
}

export interface BuilderObjectActivationEffects {
  readonly activateObjectContainingAtom: (atomId: string) => boolean
  readonly activateObjectContainingBond: (bondId: string) => boolean
}

export function readBuilderHandlerSnapshot(store: MoleculeStoreApi): BuilderHandlerSnapshot {
  return {
    intent: readBuilderIntent(),
    ...readBuilderEditSnapshot(store),
  }
}

export function readBuilderEditSnapshot(store: MoleculeStoreApi): BuilderEditSnapshot {
  const state = store.getState()
  const { flashHint } = useEditorStore.getState()
  return {
    molecule: selectActiveMoleculeOrEmpty(state),
    selectedAtomIds: state.selectedAtomIds,
    editEffects: {
      setMolecule: state.setMolecule,
      flashHint,
    },
  }
}

export function readBuilderSelectionEffects(store: MoleculeStoreApi): BuilderSelectionEffects {
  const state = store.getState()
  return {
    selectAtom: (atomId, append) => state.selectAtom(atomId, append),
    selectAtomsReplace: atomIds => state.selectAtoms(atomIds, 'replace'),
    selectBond: (bondId, includeAtoms) => state.selectBond(bondId, includeAtoms),
    clearSelection: state.clearSelection,
  }
}

export function readBuilderObjectActivationEffects(store: MoleculeStoreApi): BuilderObjectActivationEffects {
  const state = store.getState()
  return {
    activateObjectContainingAtom: state.activateObjectContainingAtom,
    activateObjectContainingBond: state.activateObjectContainingBond,
  }
}

export function readBuilderEditorEffects(): BuilderEditorEffects {
  const editor = useEditorStore.getState()
  return {
    addMeasureAtom: editor.addMeasureAtom,
    commitPendingMeasure: editor.commitPendingMeasure,
    flashHint: editor.flashHint,
  }
}
