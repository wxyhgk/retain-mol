import { PLACEMENT } from '../../../../config/interaction.config'
import type { Molecule } from '../../../molecule'
import { shiftMolecule } from '../../../molecule'
import { createSceneObject, type SceneObject } from '../../../sceneObject'
import { genId } from '../../../utils'
import { splitConnectedComponents } from '../../analysis/fragments'
import { avoidMoleculePlacementClashes } from '../../geometry/placementPlanner'
import { runSetAtomPositionsCommand } from '../geometry'

export type AddSceneObjectCommandResult = {
  readonly ok: true
  readonly changed: true
  readonly object: SceneObject
}

export type ResetSceneToMoleculeCommandResult = {
  readonly ok: true
  readonly changed: true
  readonly object: SceneObject
}

export type SetMoleculeInSceneCommandResult = {
  readonly ok: true
  readonly changed: true
  readonly objectsById: Record<string, SceneObject>
  readonly objectOrder: string[]
  readonly activeObjectId: string
  readonly clearSelection: true
}

export type RemoveSceneObjectCommandResult =
  | {
      readonly ok: true
      readonly changed: true
      readonly objectsById: Record<string, SceneObject>
      readonly objectOrder: string[]
      readonly activeObjectId: string | null
      readonly clearSelection: boolean
    }
  | { readonly ok: true; readonly changed: false }

export type SetActiveSceneObjectCommandResult =
  | {
      readonly ok: true
      readonly changed: true
      readonly activeObjectId: string | null
      readonly clearSelection: boolean
    }
  | { readonly ok: true; readonly changed: false }

export type SceneObjectUpdatedCommandResult =
  | {
      readonly ok: true
      readonly changed: true
      readonly objectsById: Record<string, SceneObject>
    }
  | { readonly ok: true; readonly changed: false }

export type SplitSceneObjectCommandResult =
  | {
      readonly ok: true
      readonly changed: true
      readonly objectsById: Record<string, SceneObject>
      readonly objectOrder: string[]
      readonly activeObjectId: string | null
      readonly clearSelection: true
    }
  | { readonly ok: true; readonly changed: false }

export function runAddSceneObjectCommand(
  molecule: Molecule,
  existingObjects: readonly SceneObject[],
  options: {
    readonly objectId: string
    readonly autoOffset?: boolean
  },
): AddSceneObjectCommandResult {
  let finalMolecule = molecule
  if (options.autoOffset !== false && existingObjects.length > 0) {
    const offset = computeSceneAutoOffset(existingObjects)
    finalMolecule = shiftMolecule(molecule, offset.x, offset.y, offset.z)
    finalMolecule = avoidMoleculePlacementClashes(
      existingObjects.flatMap(object => object.molecule.atoms),
      finalMolecule,
      { orientation: { x: 0, y: 0, z: 1 } },
    )
  }
  finalMolecule = withSceneUniqueIds(finalMolecule, moleculeIdsInScene(existingObjects))
  return {
    ok: true,
    changed: true,
    object: { ...createSceneObject(finalMolecule), id: options.objectId },
  }
}

export function runResetSceneToMoleculeCommand(molecule: Molecule): ResetSceneToMoleculeCommandResult {
  return {
    ok: true,
    changed: true,
    object: createSceneObject(molecule),
  }
}

export function runSetMoleculeInSceneCommand(
  objectsById: Readonly<Record<string, SceneObject>>,
  objectOrder: readonly string[],
  activeObjectId: string | null,
  molecule: Molecule,
): SetMoleculeInSceneCommandResult {
  const reservedObjects = Object.values(objectsById).filter(
    object => object.id !== activeObjectId,
  )
  const finalMolecule = withSceneUniqueIds(
    molecule,
    moleculeIdsInScene(reservedObjects),
  )

  if (activeObjectId && objectsById[activeObjectId]) {
    const object = objectsById[activeObjectId]
    return {
      ok: true,
      changed: true,
      objectsById: {
        ...objectsById,
        [activeObjectId]: {
          ...object,
          molecule: finalMolecule,
          name: finalMolecule.name ?? object.name,
        },
      },
      objectOrder: [...objectOrder],
      activeObjectId,
      clearSelection: true,
    }
  }

  const object = createSceneObject(finalMolecule)
  return {
    ok: true,
    changed: true,
    objectsById: { ...objectsById, [object.id]: object },
    objectOrder: [...objectOrder, object.id],
    activeObjectId: object.id,
    clearSelection: true,
  }
}

export function runSetSceneObjectAtomPositionsCommand(
  objectsById: Readonly<Record<string, SceneObject>>,
  objectId: string,
  positions: ReadonlyMap<string, { readonly x: number; readonly y: number; readonly z: number }>,
): SceneObjectUpdatedCommandResult {
  const object = objectsById[objectId]
  if (!object) return { ok: true, changed: false }
  const result = runSetAtomPositionsCommand(object.molecule, positions)
  if (!result.ok || !result.changed) return { ok: true, changed: false }
  return {
    ok: true,
    changed: true,
    objectsById: {
      ...objectsById,
      [objectId]: { ...object, molecule: result.molecule, name: result.molecule.name ?? object.name },
    },
  }
}

export function runRemoveSceneObjectCommand(
  objectsById: Readonly<Record<string, SceneObject>>,
  objectOrder: readonly string[],
  activeObjectId: string | null,
  objectId: string,
): RemoveSceneObjectCommandResult {
  if (!objectsById[objectId]) return { ok: true, changed: false }

  const nextObjectsById: Record<string, SceneObject> = {}
  for (const [id, object] of Object.entries(objectsById))
    if (id !== objectId) nextObjectsById[id] = object
  const nextObjectOrder = objectOrder.filter(id => id !== objectId)
  const removedActive = objectId === activeObjectId

  return {
    ok: true,
    changed: true,
    objectsById: nextObjectsById,
    objectOrder: nextObjectOrder,
    activeObjectId: removedActive ? (nextObjectOrder[nextObjectOrder.length - 1] ?? null) : activeObjectId,
    clearSelection: removedActive,
  }
}

export function runSplitSceneObjectCommand(
  objectsById: Readonly<Record<string, SceneObject>>,
  objectOrder: readonly string[],
  objectId: string,
  newObjectIds: readonly string[],
): SplitSceneObjectCommandResult {
  const object = objectsById[objectId]
  if (!object) return { ok: true, changed: false }

  const parts = splitConnectedComponents(object.molecule)
  if (parts.length <= 1) return { ok: true, changed: false }
  if (newObjectIds.length < parts.length) return { ok: true, changed: false }

  const nextObjectsById: Record<string, SceneObject> = {}
  for (const [id, candidate] of Object.entries(objectsById)) {
    if (id !== objectId) nextObjectsById[id] = candidate
  }

  const splitObjects: SceneObject[] = []
  for (const [index, molecule] of parts.entries()) {
    const id = newObjectIds[index]
    if (!id) return { ok: true, changed: false }
    splitObjects.push({
      ...createSceneObject({
        ...molecule,
        name: parts.length === 1 ? object.name : `${object.name} #${index + 1}`,
      }),
      id,
      visible: object.visible,
      locked: object.locked,
    })
  }
  for (const splitObject of splitObjects) {
    nextObjectsById[splitObject.id] = splitObject
  }

  const insertAt = Math.max(0, objectOrder.indexOf(objectId))
  const remainingOrder = objectOrder.filter(id => id !== objectId)
  const nextObjectOrder = [
    ...remainingOrder.slice(0, insertAt),
    ...splitObjects.map(splitObject => splitObject.id),
    ...remainingOrder.slice(insertAt),
  ]

  return {
    ok: true,
    changed: true,
    objectsById: nextObjectsById,
    objectOrder: nextObjectOrder,
    activeObjectId: splitObjects[0]?.id ?? null,
    clearSelection: true,
  }
}

export function runSetActiveSceneObjectCommand(
  objectsById: Readonly<Record<string, SceneObject>>,
  activeObjectId: string | null,
  objectId: string | null,
): SetActiveSceneObjectCommandResult {
  if (objectId === activeObjectId) return { ok: true, changed: false }
  if (objectId !== null && !objectsById[objectId]) return { ok: true, changed: false }
  return { ok: true, changed: true, activeObjectId: objectId, clearSelection: objectId !== null }
}

export function runSetSceneObjectVisibleCommand(
  objectsById: Readonly<Record<string, SceneObject>>,
  objectId: string,
  visible: boolean,
): SceneObjectUpdatedCommandResult {
  const object = objectsById[objectId]
  if (!object || object.visible === visible) return { ok: true, changed: false }
  return {
    ok: true,
    changed: true,
    objectsById: { ...objectsById, [objectId]: { ...object, visible } },
  }
}

export function runSetSceneObjectLockedCommand(
  objectsById: Readonly<Record<string, SceneObject>>,
  objectId: string,
  locked: boolean,
): SceneObjectUpdatedCommandResult {
  const object = objectsById[objectId]
  if (!object || object.locked === locked) return { ok: true, changed: false }
  return {
    ok: true,
    changed: true,
    objectsById: { ...objectsById, [objectId]: { ...object, locked } },
  }
}

export function runRenameSceneObjectCommand(
  objectsById: Readonly<Record<string, SceneObject>>,
  objectId: string,
  name: string,
): SceneObjectUpdatedCommandResult {
  const object = objectsById[objectId]
  if (!object || object.name === name) return { ok: true, changed: false }
  return {
    ok: true,
    changed: true,
    objectsById: { ...objectsById, [objectId]: { ...object, name } },
  }
}

export function computeSceneAutoOffset(objects: readonly SceneObject[]): { x: number; y: number; z: number } {
  let maxX = -Infinity
  for (const obj of objects)
    for (const atom of obj.molecule.atoms)
      if (atom.x > maxX) maxX = atom.x
  return { x: isFinite(maxX) ? maxX + PLACEMENT.addObjectOffsetX : 0, y: 0, z: 0 }
}

export function moleculeIdsInScene(objects: Iterable<SceneObject>): Set<string> {
  const ids = new Set<string>()
  for (const obj of objects) {
    for (const atom of obj.molecule.atoms) ids.add(atom.id)
    for (const bond of obj.molecule.bonds) ids.add(bond.id)
  }
  return ids
}

function nextUnusedId(reserved: Set<string>): string {
  let id = genId()
  while (reserved.has(id)) id = genId()
  reserved.add(id)
  return id
}

export function withSceneUniqueIds(molecule: Molecule, reservedIds: Set<string>): Molecule {
  const atomIdMap = new Map<string, string>()
  let changed = false
  const atoms = molecule.atoms.map(atom => {
    if (!reservedIds.has(atom.id)) {
      reservedIds.add(atom.id)
      return atom
    }
    const id = nextUnusedId(reservedIds)
    atomIdMap.set(atom.id, id)
    changed = true
    return { ...atom, id }
  })

  const bonds = molecule.bonds.map(bond => {
    const atomId1 = atomIdMap.get(bond.atomId1) ?? bond.atomId1
    const atomId2 = atomIdMap.get(bond.atomId2) ?? bond.atomId2
    if (!reservedIds.has(bond.id)) {
      reservedIds.add(bond.id)
      if (atomId1 === bond.atomId1 && atomId2 === bond.atomId2) return bond
      changed = true
      return { ...bond, atomId1, atomId2 }
    }
    changed = true
    return { ...bond, id: nextUnusedId(reservedIds), atomId1, atomId2 }
  })

  return changed ? { ...molecule, atoms, bonds } : molecule
}
