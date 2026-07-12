import type { Molecule } from '@retainmol/mol-viewer/core'
import { moleculePositionWriter } from '@/domain/moleculePositionWriter'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import { relaxAnimate } from '@/features/molecule-animation'

let sceneRevision = 0
let animationWriteDepth = 0
const activeAnimations = new Map<string, AbortController>()

useMoleculeStore.subscribe((state, previous) => {
  const sceneChanged = state.objectsById !== previous.objectsById
    || state.objectOrder !== previous.objectOrder
    || state.activeObjectId !== previous.activeObjectId
  if (!sceneChanged || animationWriteDepth > 0) return
  sceneRevision++
  for (const controller of activeAnimations.values()) controller.abort()
})

export function getPlacementSceneRevision() {
  return sceneRevision
}

export function abortPlacementAnimation(objectId: string) {
  activeAnimations.get(objectId)?.abort()
}

function createAnimationGuard(objectId: string, isLatestRequest: () => boolean) {
  let expectedRevision = useMoleculeStore.getState().objectsById[objectId]?.molecule
  let cancelled = !expectedRevision
  const canContinue = () => {
    if (cancelled || !isLatestRequest()) return false
    return useMoleculeStore.getState().objectsById[objectId]?.molecule === expectedRevision
  }

  return {
    writer: {
      setObjectAtomPositions: (
        targetObjectId: string,
        positions: ReadonlyMap<string, { x: number; y: number; z: number }>,
      ) => {
        if (targetObjectId !== objectId || !canContinue()) {
          cancelled = true
          return
        }
        animationWriteDepth++
        try {
          moleculePositionWriter.setObjectAtomPositions(objectId, positions)
        } finally {
          animationWriteDepth--
        }
        expectedRevision = useMoleculeStore.getState().objectsById[objectId]?.molecule
        if (!expectedRevision) cancelled = true
      },
    },
    canContinue,
  }
}

export async function animatePlacement(
  objectId: string,
  from: Molecule,
  target: Molecule,
  isLatestRequest: () => boolean,
) {
  abortPlacementAnimation(objectId)
  const controller = new AbortController()
  activeAnimations.set(objectId, controller)
  const animation = createAnimationGuard(objectId, isLatestRequest)
  try {
    await relaxAnimate(objectId, from, {
      target,
      writer: animation.writer,
      shouldContinue: animation.canContinue,
      signal: controller.signal,
    })
  } finally {
    if (activeAnimations.get(objectId) === controller) activeAnimations.delete(objectId)
  }
}
