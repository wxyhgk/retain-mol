import * as THREE from 'three'
import {
  ensureEditableAtomObject,
  ensureEditableBondObject,
} from './builderActivationEffects'
import {
  applyBondDragEndCommand,
  applyBondClickForIntent,
  shouldAttemptBondDragForIntent,
  shouldHandleBondClickForIntent,
  shouldStartBondDragForIntent,
} from './builderBondEffects'
import {
  readBuilderEditSnapshot,
  readBuilderHandlerSnapshot,
  readBuilderObjectActivationEffects,
  readBuilderSelectionEffects,
} from './builderHandlerContext'
import type { MoleculeStoreApi } from './builderPointerTypes'

export function handleBuilderBondClick(
  store: MoleculeStoreApi,
  bondId: string,
  event: MouseEvent,
): void {
  const { intent } = readBuilderHandlerSnapshot(store)
  if (!shouldHandleBondClickForIntent(intent, {
    shiftKey: event.shiftKey,
    altKey: event.altKey,
  })) return

  const activeMolecule = readBuilderEditSnapshot(store).molecule
  if (!ensureEditableBondObject(bondId, activeMolecule, readBuilderObjectActivationEffects(store))) return

  const { molecule, editEffects } = readBuilderEditSnapshot(store)
  const selectionEffects = readBuilderSelectionEffects(store)
  applyBondClickForIntent(intent, molecule, {
    bondId,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
  }, {
    selectBond: includeAtoms => selectionEffects.selectBond(bondId, includeAtoms),
    editEffects,
  })
}

export function handleBuilderBondDragStart(
  store: MoleculeStoreApi,
  sourceId: string,
): boolean {
  const { intent, selectedAtomIds } = readBuilderHandlerSnapshot(store)
  const input = { sourceId, selectedAtomIds }
  if (!shouldAttemptBondDragForIntent(intent, input)) return false

  if (!ensureEditableAtomObject(sourceId, readBuilderObjectActivationEffects(store))) return false

  return shouldStartBondDragForIntent(intent, readBuilderEditSnapshot(store).molecule, input)
}

export function handleBuilderBondDragEnd(
  store: MoleculeStoreApi,
  sourceId: string,
  targetId: string | null,
  dropLocal: THREE.Vector3 | null,
): void {
  const { intent, molecule, editEffects } = readBuilderHandlerSnapshot(store)
  applyBondDragEndCommand(intent, molecule, {
    sourceId,
    targetId,
    dropLocal,
  }, editEffects)
}
