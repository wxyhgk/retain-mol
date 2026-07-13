import {
  applyAtomClickForIntent,
  applyAtomDoubleClickForIntent,
} from './builderAtomEffects'
import {
  ensureEditableAtomObject,
} from './builderActivationEffects'
import {
  readBuilderEditorEffects,
  readBuilderEditSnapshot,
  readBuilderHandlerSnapshot,
  readBuilderObjectActivationEffects,
  readBuilderSelectionEffects,
} from './builderHandlerContext'
import type { BuilderMoleculeStoreApi } from './builderPointerTypes'
import { useEditorStore, type EditorStoreApi } from '../store/editorStore'

export function handleBuilderAtomClick(
  store: BuilderMoleculeStoreApi,
  atomId: string,
  event: MouseEvent,
  editorStore: EditorStoreApi = useEditorStore,
): void {
  const { intent } = readBuilderHandlerSnapshot(store, editorStore)
  const editorEffects = readBuilderEditorEffects(editorStore)
  const selectionEffects = readBuilderSelectionEffects(store)

  if (!ensureEditableAtomObject(atomId, readBuilderObjectActivationEffects(store))) return
  const { molecule, editEffects } = readBuilderEditSnapshot(store, editorStore)

  applyAtomClickForIntent(intent, molecule, {
    atomId,
    shiftKey: event.shiftKey,
  }, {
    addMeasureAtom: () => editorEffects.addMeasureAtom(atomId),
    selectAtom: append => selectionEffects.selectAtom(atomId, append),
    editEffects,
  })
}

export function handleBuilderAtomDoubleClick(
  store: BuilderMoleculeStoreApi,
  atomId: string,
  editorStore: EditorStoreApi = useEditorStore,
): void {
  const { intent } = readBuilderHandlerSnapshot(store, editorStore)
  if (!ensureEditableAtomObject(atomId, readBuilderObjectActivationEffects(store))) return
  const { molecule } = readBuilderEditSnapshot(store, editorStore)
  const selectionEffects = readBuilderSelectionEffects(store)
  applyAtomDoubleClickForIntent(intent, molecule, atomId, {
    selectAtoms: selectionEffects.selectAtomsReplace,
  })
}
