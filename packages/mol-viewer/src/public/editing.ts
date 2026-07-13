import { createObjectPositionWriteEditSession as createInternalSession } from '../hooks/editSessionFactory'
import {
  defaultViewerRuntime,
  getViewerRuntimeServices,
} from '../runtime/ViewerRuntime'
import type { ViewerRuntime } from '../runtime/ViewerRuntime'

export type { ViewerRuntime } from '../runtime/ViewerRuntime'

export interface AtomPosition {
  readonly x: number
  readonly y: number
  readonly z: number
}

/** Narrow write transaction used by animation and optimization clients. */
export interface ObjectPositionWriteEditSession {
  readonly isActive: boolean
  start(): void
  write(positions: ReadonlyMap<string, AtomPosition>): void
  end(): void
  cancel(): void
}

export function createObjectPositionWriteEditSession(
  objectId: string,
  runtime: ViewerRuntime = defaultViewerRuntime,
): ObjectPositionWriteEditSession {
  return createInternalSession(objectId, getViewerRuntimeServices(runtime).moleculeStore)
}
