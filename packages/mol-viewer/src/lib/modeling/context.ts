import { cloneMolecule } from '../model/clone'
import type { SceneObject } from '../sceneObject'
import {
  MODELING_COMMAND_KINDS,
  MODELING_SCHEMA_VERSION,
  type ModelingContext,
  type ModelingEditorIntentContext,
} from './contracts'
import { computeMoleculeRevision } from './revision'

function toObjectContext(object: SceneObject) {
  const molecule = cloneMolecule(object.molecule)
  return {
    objectId: object.id,
    name: object.name,
    visible: object.visible,
    locked: object.locked,
    editable: object.visible && !object.locked,
    offset: { ...object.offset },
    coordinateSpace: 'molecule-local' as const,
    revision: computeMoleculeRevision(molecule),
    molecule,
  }
}

/** Plain snapshot input. Store adapters project their state into this contract. */
export interface ModelingSceneSnapshot {
  readonly activeObjectId: string | null
  readonly objectOrder: readonly string[]
  readonly objectsById: Readonly<Record<string, SceneObject>>
  readonly selectedAtomIds: ReadonlySet<string>
  readonly selectedBondIds: ReadonlySet<string>
}

export function createModelingContext(
  moleculeState: ModelingSceneSnapshot,
  editorIntent: ModelingEditorIntentContext,
): ModelingContext {
  return {
    schemaVersion: MODELING_SCHEMA_VERSION,
    activeObjectId: moleculeState.activeObjectId,
    objects: moleculeState.objectOrder
      .map(objectId => moleculeState.objectsById[objectId])
      .filter((object): object is SceneObject => object !== undefined)
      .map(toObjectContext),
    selection: {
      atomIds: [...moleculeState.selectedAtomIds],
      bondIds: [...moleculeState.selectedBondIds],
    },
    editorIntent: {
      tool: editorIntent.tool,
      brushArmed: editorIntent.brushArmed,
      activeElement: editorIntent.activeElement,
      atomClickMode: editorIntent.atomClickMode,
      activeFragmentId: editorIntent.activeFragmentId,
    },
    capabilities: [...MODELING_COMMAND_KINDS],
  }
}

