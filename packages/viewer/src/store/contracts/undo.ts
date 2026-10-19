import type { SceneObject } from '@retainmol/core'

export interface UndoableSceneState {
  readonly objectsById: Record<string, SceneObject>
  readonly objectOrder: string[]
  readonly activeObjectId: string | null
}

export type UndoSnapshot = Pick<
  UndoableSceneState,
  'objectsById' | 'objectOrder' | 'activeObjectId'
>
