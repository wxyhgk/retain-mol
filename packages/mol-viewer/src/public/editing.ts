import {
  createBondPairAlignmentEditSession as createInternalBondPairAlignmentSession,
  createObjectPositionWriteEditSession as createInternalSession,
  runBondPairAlignmentEdit,
} from '../hooks/editSessionFactory'
import {
  defaultViewerRuntime,
  getViewerRuntimeServices,
} from '../runtime/ViewerRuntime'
import type { ViewerRuntime } from '../runtime/ViewerRuntime'
import type {
  AlignBondPairDiagnostics,
  AlignBondPairFailureCode,
  AlignBondPairInput,
} from '../lib/builder/geometry/bondPairAlignment'

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

export type {
  AlignBondPairDiagnostics,
  AlignBondPairFailureCode,
  AlignBondPairInput,
} from '../lib/builder/geometry/bondPairAlignment'

export type AlignBondPairResult =
  | { readonly ok: true; readonly diagnostics: AlignBondPairDiagnostics }
  | { readonly ok: false; readonly code: AlignBondPairFailureCode; readonly reason: string }

/**
 * Align two disconnected bonds while rigidly moving the complete fragment that
 * contains `movingBondId`. The scene mutation is committed as one undo record.
 */
export function alignBondPair(
  input: AlignBondPairInput,
  runtime: ViewerRuntime = defaultViewerRuntime,
): AlignBondPairResult {
  return runBondPairAlignmentEdit(
    input,
    getViewerRuntimeServices(runtime).moleculeStore,
  )
}

export interface BondPairAlignmentEditSession {
  readonly isActive: boolean
  start(): void
  update(input: AlignBondPairInput): AlignBondPairResult
  end(): void
  cancel(): void
}

/**
 * Transactional variant for numeric controls and pointer-driven rotation rings.
 * Within a session `azimuthDegrees` is absolute relative to the session start;
 * every successful update between `start()` and `end()` becomes one undo record.
 */
export function createBondPairAlignmentEditSession(
  runtime: ViewerRuntime = defaultViewerRuntime,
): BondPairAlignmentEditSession {
  return createInternalBondPairAlignmentSession(
    getViewerRuntimeServices(runtime).moleculeStore,
  )
}
