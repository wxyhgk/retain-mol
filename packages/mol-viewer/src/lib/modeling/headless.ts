import { cloneMolecule } from '../model/clone'
import type { Molecule } from '../molecule'
import {
  MODELING_COMMAND_KINDS,
  MODELING_SCHEMA_VERSION,
  type EditPlan,
  type ModelingContext,
  type ModelingDryRunResult,
  type ModelingEditorIntentContext,
} from './contracts'
import { dryRunEditPlan } from './planExecutor'
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

/**
 * Build the same serializable modeling context used by the viewer without
 * creating stores, a renderer or browser globals.
 */
export function createHeadlessModelingContext(
  input: Molecule,
  options: HeadlessModelingOptions = {},
): ModelingContext {
  const molecule = cloneMolecule(input)
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
