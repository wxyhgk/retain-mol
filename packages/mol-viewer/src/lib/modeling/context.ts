import type { Molecule } from '../molecule'
import type { SceneObject } from '../sceneObject'
import type { EditorState } from '../../store/editorStore'
import type { MoleculeState } from '../../store/slices/types'
import {
  MODELING_COMMAND_KINDS,
  MODELING_SCHEMA_VERSION,
  type ModelingContext,
} from './contracts'
import { computeMoleculeRevision } from './revision'

function cloneMolecule(molecule: Molecule): Molecule {
  return {
    ...(molecule.name === undefined ? {} : { name: molecule.name }),
    atoms: molecule.atoms.map(atom => ({
      ...atom,
      ...(atom.coordinationDirections
        ? { coordinationDirections: atom.coordinationDirections.map(direction => [...direction] as const) }
        : {}),
      ...(atom.coordinationSites
        ? { coordinationSites: atom.coordinationSites.map(site => ({ ...site, direction: [...site.direction] as const })) }
        : {}),
    })),
    bonds: molecule.bonds.map(bond => ({
      ...bond,
      ...(bond.coordinationSites
        ? { coordinationSites: bond.coordinationSites.map(site => ({ ...site })) }
        : {}),
    })),
  }
}

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

export function createModelingContext(
  moleculeState: Pick<
    MoleculeState,
    'activeObjectId' | 'objectOrder' | 'objectsById' | 'selectedAtomIds' | 'selectedBondIds'
  >,
  editorState: Pick<
    EditorState,
    'activeTool' | 'brushArmed' | 'activeElement' | 'atomClickMode' | 'activeFragmentId'
  >,
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
      tool: editorState.activeTool,
      brushArmed: editorState.brushArmed,
      activeElement: editorState.activeElement,
      atomClickMode: editorState.atomClickMode,
      activeFragmentId: editorState.activeFragmentId,
    },
    capabilities: [...MODELING_COMMAND_KINDS],
  }
}

