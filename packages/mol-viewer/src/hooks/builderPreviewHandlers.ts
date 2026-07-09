import * as THREE from 'three'
import type { GrowGuideSpec } from '../lib/types'
import type { Molecule } from '../lib/molecule'
import {
  getGrowGuideForIntent,
  getGrowPreviewForIntent,
  getPlacementPreviewForIntent,
} from './builderPreviewEffects'
import { readBuilderHandlerSnapshot } from './builderHandlerContext'
import type { MoleculeStoreApi } from './builderPointerTypes'

export function getBuilderGrowPreview(
  store: MoleculeStoreApi,
  sourceId: string,
  cursorLocal: THREE.Vector3,
  freeDirection: boolean,
): { pos: THREE.Vector3; radius: number; color: number } | null {
  const { intent, molecule } = readBuilderHandlerSnapshot(store)
  return getGrowPreviewForIntent(intent, molecule, {
    sourceId,
    cursorLocal,
    freeDirection,
  })
}

export function getBuilderGrowGuide(
  store: MoleculeStoreApi,
  sourceId: string,
): GrowGuideSpec {
  const { intent, molecule } = readBuilderHandlerSnapshot(store)
  return getGrowGuideForIntent(intent, molecule, sourceId)
}

export function getBuilderPlacementPreview(
  store: MoleculeStoreApi,
  worldPos: THREE.Vector3,
  viewDirLocal?: THREE.Vector3,
): Molecule | null {
  const { intent, molecule } = readBuilderHandlerSnapshot(store)
  return getPlacementPreviewForIntent(
    intent,
    molecule,
    worldPos,
    viewDirLocal,
  )
}
