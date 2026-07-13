import type { FragmentTorsionPreview } from '../lib/types'
import {
  applyFragmentTorsion,
  canStartFragmentTorsion,
  createFragmentTorsionPreview,
} from './builderFragmentTorsionEffects'
import {
  readBuilderEditSnapshot,
  readEditableMoleculeContainingAtom,
  readBuilderHandlerSnapshot,
  readBuilderObjectActivationEffects,
} from './builderHandlerContext'
import { ensureEditableAtomObject } from './builderActivationEffects'
import type { BuilderMoleculeStoreApi } from './builderPointerTypes'
import { useEditorStore, type EditorStoreApi } from '../store/editorStore'

export function handleBuilderFragmentTorsionStart(
  store: BuilderMoleculeStoreApi,
  targetId: string,
  editorStore: EditorStoreApi = useEditorStore,
): boolean {
  if (!canHandleBuilderFragmentTorsion(store, targetId, editorStore)) return false
  if (!ensureEditableAtomObject(targetId, readBuilderObjectActivationEffects(store))) return false
  const { intent } = readBuilderHandlerSnapshot(store, editorStore)
  return canStartFragmentTorsion(
    intent,
    readBuilderEditSnapshot(store, editorStore).molecule,
    targetId,
  )
}

/** Pure pointer-down eligibility check. It must never activate a scene object. */
export function canHandleBuilderFragmentTorsion(
  store: BuilderMoleculeStoreApi,
  targetId: string,
  editorStore: EditorStoreApi = useEditorStore,
): boolean {
  const { intent } = readBuilderHandlerSnapshot(store, editorStore)
  if (intent.kind !== 'build-fragment' || !intent.fragment || (intent.fragment.attachOrder ?? 1) !== 1) return false
  const molecule = readEditableMoleculeContainingAtom(store, targetId)
  return molecule !== null && canStartFragmentTorsion(intent, molecule, targetId)
}

export function getBuilderFragmentTorsionPreview(
  store: BuilderMoleculeStoreApi,
  targetId: string,
  angleDegrees: number,
  editorStore: EditorStoreApi = useEditorStore,
): FragmentTorsionPreview | null {
  const { intent, molecule } = readBuilderHandlerSnapshot(store, editorStore)
  return createFragmentTorsionPreview(intent, molecule, targetId, angleDegrees)
}

export function handleBuilderFragmentTorsionEnd(
  store: BuilderMoleculeStoreApi,
  targetId: string,
  angleDegrees: number,
  editorStore: EditorStoreApi = useEditorStore,
): void {
  const { intent, molecule, editEffects } = readBuilderHandlerSnapshot(store, editorStore)
  applyFragmentTorsion(intent, molecule, targetId, angleDegrees, editEffects)
}
