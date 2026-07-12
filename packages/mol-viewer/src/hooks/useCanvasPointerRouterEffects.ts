import * as THREE from 'three'
import type { Molecule } from '../lib/molecule'
import {
  runRotateAtomGroupCommand,
  runTranslateAtomGroupCommand,
  type AtomPosition,
  type ObjectTransformCommandResult,
  type QuaternionLike,
} from '../lib/builder/commands/scene'
import { activateAndResolve } from '../lib/builder/queries'

export interface BoxSelectBounds {
  readonly minX: number
  readonly maxX: number
  readonly minY: number
  readonly maxY: number
}

export interface BoxSelectModifierState {
  readonly shift: boolean
  readonly alt: boolean
}

export interface BoxSelectStartInput {
  readonly button: number
  readonly shiftKey: boolean
  readonly pickedAtomId: string | null
  readonly pickedBondId: string | null
}

export type BoxSelectMode = 'replace' | 'add' | 'subtract'

export interface BoxSelectResult {
  readonly atomIds: readonly string[]
  readonly mode: BoxSelectMode
}

export interface CommitBoxSelectInput {
  readonly state: BoxSelectModifierState
  readonly molecule: Molecule
  readonly bounds: BoxSelectBounds
  readonly minSize: number
  readonly projectAtom: (atom: Molecule['atoms'][number]) => { readonly x: number; readonly y: number }
  readonly selectAtoms: (atomIds: readonly string[], mode: BoxSelectMode) => void
}

export interface ObjectTransformTarget {
  readonly fragmentIds: Set<string>
  readonly targetObjectId: string
}

export interface ObjectTransformTargetDeps {
  readonly activateObjectContainingAtom: (atomId: string) => boolean
  readonly getActiveObjectId: () => string | null
  readonly getActiveMolecule: () => Molecule | undefined
}

export interface ObjectPointerTransformInput {
  readonly molecule: Molecule
  readonly fragmentIds: ReadonlySet<string>
  readonly dx: number
  readonly dy: number
  readonly rotate: boolean
  readonly minDisplacement: number
  readonly rotateSpeedFactor: number
  readonly screenDeltaToModelLocal: (dx: number, dy: number) => AtomPosition
  readonly getModelWorldQuaternion: () => QuaternionLike
}

export interface CommitObjectPointerTransformInput extends ObjectPointerTransformInput {
  readonly objectId: string
  readonly setObjectAtomPositions: (
    targetObjectId: string,
    positions: ReadonlyMap<string, AtomPosition>,
  ) => void
}

export interface ObjectTransformLifecycleState {
  dragging: boolean
  fragmentIds: Set<string> | null
  targetObjectId: string | null
}

export interface EndableEditSession {
  readonly end: () => void
}

export function cancelObjectTransform(
  state: ObjectTransformLifecycleState,
  session: EndableEditSession,
): void {
  if (state.dragging) session.end()
  state.dragging = false
  state.fragmentIds = null
  state.targetObjectId = null
}

export function shouldStartBoxSelect(input: BoxSelectStartInput): boolean {
  const isRight = input.button === 2
  const isShiftLeft = input.button === 0 && input.shiftKey
  if (!isRight && !isShiftLeft) return false
  return !input.pickedAtomId && !input.pickedBondId
}

export function resolveBoxSelectBounds(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
): BoxSelectBounds {
  return {
    minX: Math.min(startX, currentX),
    maxX: Math.max(startX, currentX),
    minY: Math.min(startY, currentY),
    maxY: Math.max(startY, currentY),
  }
}

export function resolveBoxSelectMode(state: BoxSelectModifierState): BoxSelectMode {
  return state.shift ? 'add' : state.alt ? 'subtract' : 'replace'
}

export function collectBoxSelectedAtomIds(
  molecule: Molecule,
  bounds: BoxSelectBounds,
  projectAtom: (atom: Molecule['atoms'][number]) => { readonly x: number; readonly y: number },
): string[] {
  const hit: string[] = []
  for (const atom of molecule.atoms) {
    const point = projectAtom(atom)
    if (
      point.x >= bounds.minX &&
      point.x <= bounds.maxX &&
      point.y >= bounds.minY &&
      point.y <= bounds.maxY
    ) {
      hit.push(atom.id)
    }
  }
  return hit
}

export function resolveBoxSelectResult(
  state: BoxSelectModifierState,
  molecule: Molecule,
  bounds: BoxSelectBounds,
  minSize: number,
  projectAtom: (atom: Molecule['atoms'][number]) => { readonly x: number; readonly y: number },
): BoxSelectResult | null {
  if (bounds.maxX - bounds.minX < minSize && bounds.maxY - bounds.minY < minSize) return null
  return {
    atomIds: collectBoxSelectedAtomIds(molecule, bounds, projectAtom),
    mode: resolveBoxSelectMode(state),
  }
}

export function commitBoxSelect(input: CommitBoxSelectInput): void {
  const result = resolveBoxSelectResult(
    input.state,
    input.molecule,
    input.bounds,
    input.minSize,
    input.projectAtom,
  )
  if (result) input.selectAtoms(result.atomIds, result.mode)
}

export function resolveObjectTransformTarget(
  pickedAtomId: string | null,
  useActiveObject: boolean,
  deps: ObjectTransformTargetDeps,
): ObjectTransformTarget | null {
  if (pickedAtomId) {
    const resolved = activateAndResolve(
      pickedAtomId,
      deps.activateObjectContainingAtom,
      deps.getActiveMolecule,
    )
    if (!resolved) return null
    const targetObjectId = deps.getActiveObjectId()
    if (!targetObjectId) return null
    return { fragmentIds: resolved.fragment, targetObjectId }
  }

  if (!useActiveObject) return null
  const targetObjectId = deps.getActiveObjectId()
  const molecule = deps.getActiveMolecule()
  if (!targetObjectId || !molecule || molecule.atoms.length === 0) return null
  return {
    fragmentIds: new Set(molecule.atoms.map(atom => atom.id)),
    targetObjectId,
  }
}

export function runObjectPointerTransformCommand(
  input: ObjectPointerTransformInput,
): ObjectTransformCommandResult {
  const { molecule, fragmentIds, dx, dy } = input
  if (
    Math.abs(dx) < input.minDisplacement &&
    Math.abs(dy) < input.minDisplacement
  ) {
    return { ok: true, changed: false }
  }

  const moving = molecule.atoms.filter(atom => fragmentIds.has(atom.id))
  if (moving.length === 0) return { ok: true, changed: false }

  if (!input.rotate) {
    return runTranslateAtomGroupCommand(
      molecule,
      fragmentIds,
      input.screenDeltaToModelLocal(dx, dy),
    )
  }

  const distance = Math.hypot(dx, dy)
  if (distance === 0) return { ok: true, changed: false }
  const angle = distance * input.rotateSpeedFactor
  const axisWorld = new THREE.Vector3(dy / distance, dx / distance, 0)
  const worldQuaternion = input.getModelWorldQuaternion()
  const axisLocal = axisWorld
    .applyQuaternion(new THREE.Quaternion(
      worldQuaternion.x,
      worldQuaternion.y,
      worldQuaternion.z,
      worldQuaternion.w,
    ).invert())
    .normalize()
  const rotation = new THREE.Quaternion().setFromAxisAngle(axisLocal, angle)

  let cx = 0
  let cy = 0
  let cz = 0
  for (const atom of moving) {
    cx += atom.x
    cy += atom.y
    cz += atom.z
  }
  const pivot = {
    x: cx / moving.length,
    y: cy / moving.length,
    z: cz / moving.length,
  }

  return runRotateAtomGroupCommand(
    molecule,
    fragmentIds,
    pivot,
    { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w },
  )
}

export function applyObjectTransformResult(
  objectId: string,
  result: ObjectTransformCommandResult,
  setObjectAtomPositions: (targetObjectId: string, positions: ReadonlyMap<string, AtomPosition>) => void,
): void {
  if (result.changed) setObjectAtomPositions(objectId, result.positions)
}

export function commitObjectPointerTransform(input: CommitObjectPointerTransformInput): void {
  const result = runObjectPointerTransformCommand(input)
  applyObjectTransformResult(input.objectId, result, input.setObjectAtomPositions)
}
