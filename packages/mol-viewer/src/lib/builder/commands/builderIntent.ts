import type { Tool } from '../../types'
import type { FragmentDef } from '../fragmentLibrary'
import { getFragment } from '../fragmentLibrary'
import { toolCan } from '../../../config/toolCapabilities.config'

export type AtomClickMode = 'grow' | 'replace'

export interface BuilderIntentSnapshot {
  readonly activeTool: Tool
  readonly activeElement: string
  readonly atomClickMode: AtomClickMode
  readonly activeFragmentId: string | null
  readonly brushArmed: boolean
  readonly sketchPlane?: {
    readonly origin: readonly [number, number, number]
    readonly normal: readonly [number, number, number]
  } | null
}

export type BuilderIntentKind =
  | 'measure'
  | 'move-object'
  | 'select'
  | 'build-atom'
  | 'build-fragment'

export interface BuilderIntent {
  readonly kind: BuilderIntentKind
  readonly activeTool: Tool
  readonly activeElement: string
  readonly atomClickMode: AtomClickMode
  readonly activeFragmentId: string | null
  readonly fragment?: FragmentDef
  readonly brushArmed: boolean
  readonly canEdit: boolean
  readonly canBuild: boolean
  readonly sketchPlane?: {
    readonly origin: readonly [number, number, number]
    readonly normal: readonly [number, number, number]
  } | null
}

export function resolveBuilderIntent(snapshot: BuilderIntentSnapshot): BuilderIntent {
  const canEdit = toolCan(snapshot.activeTool, 'canEdit')
  const fragment = snapshot.brushArmed && snapshot.activeFragmentId
    ? getFragment(snapshot.activeFragmentId)
    : undefined
  const canBuild = canEdit && snapshot.brushArmed
  const kind: BuilderIntentKind = snapshot.activeTool === 'measure'
    ? 'measure'
    : snapshot.activeTool === 'move-object'
      ? 'move-object'
      : !canBuild
        ? 'select'
        : fragment
          ? 'build-fragment'
          : 'build-atom'

  return {
    kind,
    activeTool: snapshot.activeTool,
    activeElement: snapshot.activeElement,
    atomClickMode: snapshot.atomClickMode,
    activeFragmentId: snapshot.activeFragmentId,
    fragment,
    brushArmed: snapshot.brushArmed,
    canEdit,
    canBuild,
    sketchPlane: snapshot.sketchPlane,
  }
}
