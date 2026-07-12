import type { FragmentTorsionPreview } from '../lib/types'
import {
  applyFragmentTorsion,
  canStartFragmentTorsion,
  createFragmentTorsionPreview,
} from './builderFragmentTorsionEffects'
import {
  readBuilderEditSnapshot,
  readBuilderHandlerSnapshot,
  readBuilderObjectActivationEffects,
} from './builderHandlerContext'
import { ensureEditableAtomObject } from './builderActivationEffects'
import type { MoleculeStoreApi } from './builderPointerTypes'
import { useEditorStore, type EditorStoreApi } from '../store/editorStore'

export function handleBuilderFragmentTorsionStart(
  store: MoleculeStoreApi,
  targetId: string,
  editorStore: EditorStoreApi = useEditorStore,
): boolean {
  const { intent } = readBuilderHandlerSnapshot(store, editorStore)
  if (intent.kind !== 'build-fragment' || !intent.fragment || (intent.fragment.attachOrder ?? 1) !== 1) return false
  if (!ensureEditableAtomObject(targetId, readBuilderObjectActivationEffects(store))) return false
  const molecule = readBuilderEditSnapshot(store, editorStore).molecule
  return canStartFragmentTorsion(intent, molecule, targetId)
}

export function getBuilderFragmentTorsionPreview(
  store: MoleculeStoreApi,
  targetId: string,
  angleDegrees: number,
  editorStore: EditorStoreApi = useEditorStore,
): FragmentTorsionPreview | null {
  const { intent, molecule } = readBuilderHandlerSnapshot(store, editorStore)
  return createFragmentTorsionPreview(intent, molecule, targetId, angleDegrees)
}

export function handleBuilderFragmentTorsionEnd(
  store: MoleculeStoreApi,
  targetId: string,
  angleDegrees: number,
  editorStore: EditorStoreApi = useEditorStore,
): void {
  const { intent, molecule, editEffects } = readBuilderHandlerSnapshot(store, editorStore)
  applyFragmentTorsion(intent, molecule, targetId, angleDegrees, editEffects)
}
