import { selectActiveMoleculeOrEmpty } from '../store/moleculeStore'
import { useEditorStore, type EditorStoreApi } from '../store/editorStore'
import type { Molecule } from '../lib/molecule'
import type { BuilderIntent } from '../lib/builder/commands/interaction'
import type { EditCommandEffects } from './builderEditCommandEffects'
import { readBuilderIntent } from './builderIntentState'
import type { BuilderMoleculeStoreApi } from './builderPointerTypes'
import { createEditUseCaseExecutor } from '../lib/builder/application/EditUseCaseExecutor'
import { editChanged } from '../lib/builder/commands/shared'

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
  readonly selectBond: (bondId: string, multi: boolean) => void
  readonly clearSelection: () => void
}

export interface BuilderObjectActivationEffects {
  readonly activateObjectContainingAtom: (atomId: string) => boolean
  readonly activateObjectContainingBond: (bondId: string) => boolean
}

export function readBuilderHandlerSnapshot(
  store: BuilderMoleculeStoreApi,
  editorStore: EditorStoreApi = useEditorStore,
): BuilderHandlerSnapshot {
  return {
    intent: readBuilderIntent(editorStore),
    ...readBuilderEditSnapshot(store, editorStore),
  }
}

export function readBuilderEditSnapshot(
  store: BuilderMoleculeStoreApi,
  editorStore: EditorStoreApi = useEditorStore,
): BuilderEditSnapshot {
  const state = store.getState()
  const { flashHint } = editorStore.getState()
  const executor = createEditUseCaseExecutor({
    commitMolecule: (molecule, selectionPolicy) => {
      const current = store.getState()
      if (current.commitEditResult) current.commitEditResult(editChanged(molecule), { selectionPolicy })
      else current.setMolecule(molecule)
    },
    flashHint,
    runTransaction: (owner, operation) => state.runTransaction
      ? state.runTransaction(owner, operation)
      : operation(),
  })
  return {
    molecule: selectActiveMoleculeOrEmpty(state),
    selectedAtomIds: state.selectedAtomIds,
    editEffects: {
      setMolecule: state.setMolecule,
      flashHint,
      executeResult: result => executor.execute(result, {
        owner: 'builder:edit-command',
        selectionPolicy: 'clear',
      }),
    },
  }
}

export function readBuilderSelectionEffects(store: BuilderMoleculeStoreApi): BuilderSelectionEffects {
  const state = store.getState()
  return {
    selectAtom: (atomId, append) => state.selectAtom(atomId, append),
    selectAtomsReplace: atomIds => state.selectAtoms(atomIds, 'replace'),
    selectBond: (bondId, multi) => state.selectBond(bondId, multi),
    clearSelection: state.clearSelection,
  }
}

export function readBuilderObjectActivationEffects(store: BuilderMoleculeStoreApi): BuilderObjectActivationEffects {
  const state = store.getState()
  return {
    activateObjectContainingAtom: state.activateObjectContainingAtom,
    activateObjectContainingBond: state.activateObjectContainingBond,
  }
}

/**
 * Pure editability query used while a pointer gesture is still only a candidate.
 * It mirrors scene activation ordering and guards without changing activeObjectId.
 */
export function readEditableMoleculeContainingAtom(
  store: BuilderMoleculeStoreApi,
  atomId: string,
): Molecule | null {
  const state = store.getState()
  for (const objectId of state.objectOrder) {
    const object = state.objectsById[objectId]
    if (!object || !object.molecule.atoms.some(atom => atom.id === atomId)) continue
    if (object.visible === false || object.locked === true) return null
    return object.molecule
  }
  return null
}

export function readBuilderEditorEffects(
  editorStore: EditorStoreApi = useEditorStore,
): BuilderEditorEffects {
  const editor = editorStore.getState()
  return {
    addMeasureAtom: editor.addMeasureAtom,
    commitPendingMeasure: editor.commitPendingMeasure,
    flashHint: editor.flashHint,
  }
}
