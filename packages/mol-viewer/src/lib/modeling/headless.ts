import type { Molecule } from '../molecule'
import {
  MODELING_COMMAND_KINDS,
  MODELING_SCHEMA_VERSION,
  type EditPlan,
  type ModelingContext,
  type ModelingDryRunResult,
  type ModelingEditorIntentContext,
} from './contracts'
import { cloneModelingMolecule } from './context'
import { dryRunEditPlan, dryRunEditPlanWithTrace } from './planExecutor'
import { computeMoleculeRevision } from './revision'

export const HEADLESS_MODELING_OBJECT_ID = 'headless-modeling-object'

export interface HeadlessModelingOptions {
  readonly objectId?: string
  readonly name?: string
  readonly selection?: {
    readonly atomIds?: readonly string[]
    readonly bondIds?: readonly string[]
  }
  readonly editorIntent?: Partial<ModelingEditorIntentContext>
}

export interface HeadlessModelingTraceStep {
  readonly commandId: string
  readonly commandKind: EditPlan['commands'][number]['kind']
  readonly before: Molecule
  readonly after: Molecule
}

export type HeadlessModelingTraceResult =
  | {
      readonly ok: true
      readonly result: Extract<ModelingDryRunResult, { readonly ok: true }>
      readonly steps: readonly HeadlessModelingTraceStep[]
    }
  | {
      readonly ok: false
      readonly result: Extract<ModelingDryRunResult, { readonly ok: false }>
    }

/**
 * Build the same serializable modeling context used by the viewer without
 * creating stores, a renderer or browser globals.
 */
export function createHeadlessModelingContext(
  input: Molecule,
  options: HeadlessModelingOptions = {},
): ModelingContext {
  const molecule = cloneModelingMolecule(input)
  const objectId = options.objectId ?? HEADLESS_MODELING_OBJECT_ID
  return {
    schemaVersion: MODELING_SCHEMA_VERSION,
    activeObjectId: objectId,
    objects: [{
      objectId,
      name: options.name ?? molecule.name ?? 'Headless molecule',
      visible: true,
      locked: false,
      editable: true,
      offset: { x: 0, y: 0, z: 0 },
      coordinateSpace: 'molecule-local',
      revision: computeMoleculeRevision(molecule),
      molecule,
    }],
    selection: {
      atomIds: [...(options.selection?.atomIds ?? [])],
      bondIds: [...(options.selection?.bondIds ?? [])],
    },
    editorIntent: {
      tool: options.editorIntent?.tool ?? 'select',
      brushArmed: options.editorIntent?.brushArmed ?? false,
      activeElement: options.editorIntent?.activeElement ?? 'C',
      atomClickMode: options.editorIntent?.atomClickMode ?? 'grow',
      activeFragmentId: options.editorIntent?.activeFragmentId ?? null,
    },
    capabilities: [...MODELING_COMMAND_KINDS],
  }
}

/** Execute an EditPlan with the production domain commands but without UI state. */
export function replayEditPlan(
  molecule: Molecule,
  input: EditPlan | unknown,
  options: HeadlessModelingOptions = {},
): ModelingDryRunResult {
  return dryRunEditPlan(createHeadlessModelingContext(molecule, options), input)
}

/**
 * Replay a complete plan and expose the validated state transition produced by
 * each command. Invalid plans never publish a partial trace.
 */
export function replayEditPlanTrace(
  molecule: Molecule,
  input: EditPlan | unknown,
  options: HeadlessModelingOptions = {},
): HeadlessModelingTraceResult {
  const traced = dryRunEditPlanWithTrace(
    createHeadlessModelingContext(molecule, options),
    input,
  )
  const result = traced.result
  if (result.ok === false) return { ok: false, result }
  return { ok: true, result, steps: traced.steps }
}
