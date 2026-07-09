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
import type { MoleculeStoreApi } from './builderPointerTypes'

export function handleBuilderAtomClick(
  store: MoleculeStoreApi,
  atomId: string,
  event: MouseEvent,
): void {
  const { intent } = readBuilderHandlerSnapshot(store)
  const editorEffects = readBuilderEditorEffects()
  const selectionEffects = readBuilderSelectionEffects(store)

  if (!ensureEditableAtomObject(atomId, readBuilderObjectActivationEffects(store))) return
  const { molecule, editEffects } = readBuilderEditSnapshot(store)

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
  store: MoleculeStoreApi,
  atomId: string,
): void {
  const { intent } = readBuilderHandlerSnapshot(store)
  if (!ensureEditableAtomObject(atomId, readBuilderObjectActivationEffects(store))) return
  const { molecule } = readBuilderEditSnapshot(store)
  const selectionEffects = readBuilderSelectionEffects(store)
  applyAtomDoubleClickForIntent(intent, molecule, atomId, {
    selectAtoms: selectionEffects.selectAtomsReplace,
  })
}
