import type { SceneObject } from '../../lib/sceneObject'

export interface UndoableSceneState {
  readonly objectsById: Record<string, SceneObject>
  readonly objectOrder: string[]
  readonly activeObjectId: string | null
}

export type UndoSnapshot = Pick<
  UndoableSceneState,
  'objectsById' | 'objectOrder' | 'activeObjectId'
>
