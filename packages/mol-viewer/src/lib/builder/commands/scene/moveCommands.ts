import type { Molecule } from '../../../molecule'

export interface AtomPosition {
  readonly x: number
  readonly y: number
  readonly z: number
}

export type AtomDragSnapshot = ReadonlyMap<string, AtomPosition>

export function createAtomDragSnapshot(
  molecule: Molecule,
  draggedAtomId: string,
  selectedAtomIds: ReadonlySet<string>,
): Map<string, AtomPosition> {
  const group = selectedAtomIds.has(draggedAtomId)
    ? selectedAtomIds
    : new Set([draggedAtomId])
  const snapshot = new Map<string, AtomPosition>()
  for (const atom of molecule.atoms) {
    if (group.has(atom.id)) snapshot.set(atom.id, { x: atom.x, y: atom.y, z: atom.z })
  }
  return snapshot
}

export interface AtomDragMoveCommandInput {
  readonly draggedAtomId: string
  readonly snapshot: AtomDragSnapshot
  readonly position: AtomPosition
}

export type AtomDragMoveCommandResult =
  | { ok: true; changed: true; positions: ReadonlyMap<string, AtomPosition> }
  | { ok: true; changed: false }
  | { ok: false; reason: string }

export function runAtomDragMoveCommand(
  input: AtomDragMoveCommandInput,
): AtomDragMoveCommandResult {
  const origin = input.snapshot.get(input.draggedAtomId)
  if (!origin) return { ok: false, reason: '拖拽起点不存在' }

  const dx = input.position.x - origin.x
  const dy = input.position.y - origin.y
  const dz = input.position.z - origin.z
  if (dx === 0 && dy === 0 && dz === 0) return { ok: true, changed: false }

  const positions = new Map<string, AtomPosition>()
  for (const [atomId, p0] of input.snapshot) {
    positions.set(atomId, {
      x: p0.x + dx,
      y: p0.y + dy,
      z: p0.z + dz,
    })
  }
  return { ok: true, changed: true, positions }
}

export interface AtomDragCommandSessionDeps {
  readonly getMolecule: () => Molecule
  readonly getSelectedAtomIds: () => ReadonlySet<string>
  readonly setAtomPositions: (positions: ReadonlyMap<string, AtomPosition>) => void
  readonly startEditSession: () => void
  readonly endEditSession: () => void
}

export class AtomDragCommandSession {
  private snapshot: AtomDragSnapshot | null = null

  constructor(private readonly deps: AtomDragCommandSessionDeps) {}

  get isActive(): boolean {
    return this.snapshot !== null
  }

  start(draggedAtomId: string): void {
    if (this.snapshot) return
    this.snapshot = createAtomDragSnapshot(
      this.deps.getMolecule(),
      draggedAtomId,
      this.deps.getSelectedAtomIds(),
    )
    this.deps.startEditSession()
  }

  move(draggedAtomId: string, position: AtomPosition): AtomDragMoveCommandResult {
    if (!this.snapshot) return { ok: false, reason: '拖拽会话不存在' }
    const result = runAtomDragMoveCommand({
      draggedAtomId,
      snapshot: this.snapshot,
      position,
    })
    if (result.ok && result.changed) this.deps.setAtomPositions(result.positions)
    return result
  }

  end(): void {
    if (!this.snapshot) return
    this.snapshot = null
    this.deps.endEditSession()
  }
}

export interface ObjectTransformCommandSessionDeps {
  readonly startEditSession: () => void
  readonly endEditSession: () => void
}

export class ObjectTransformCommandSession {
  private active = false

  constructor(private readonly deps: ObjectTransformCommandSessionDeps) {}

  get isActive(): boolean {
    return this.active
  }

  start(): void {
    if (this.active) return
    this.active = true
    this.deps.startEditSession()
  }

  end(): void {
    if (!this.active) return
    this.active = false
    this.deps.endEditSession()
  }
}

export interface ObjectPositionWriteSessionDeps extends ObjectTransformCommandSessionDeps {
  readonly setObjectAtomPositions: (
    objectId: string,
    positions: ReadonlyMap<string, AtomPosition>,
  ) => void
}

export class ObjectPositionWriteSession {
  private readonly transaction: ObjectTransformCommandSession

  constructor(
    private readonly objectId: string,
    private readonly deps: ObjectPositionWriteSessionDeps,
  ) {
    this.transaction = new ObjectTransformCommandSession(deps)
  }

  get isActive(): boolean {
    return this.transaction.isActive
  }

  start(): void {
    this.transaction.start()
  }

  write(positions: ReadonlyMap<string, AtomPosition>): void {
    this.deps.setObjectAtomPositions(this.objectId, positions)
  }

  end(): void {
    this.transaction.end()
  }
}

export interface AtomPositionDelta {
  readonly x: number
  readonly y: number
  readonly z: number
}

export interface QuaternionLike {
  readonly x: number
  readonly y: number
  readonly z: number
  readonly w: number
}

export type ObjectTransformCommandResult =
  | { ok: true; changed: true; positions: ReadonlyMap<string, AtomPosition> }
  | { ok: true; changed: false }

function copyMoleculePositions(molecule: Molecule): Map<string, AtomPosition> {
  return new Map(molecule.atoms.map(atom => [atom.id, { x: atom.x, y: atom.y, z: atom.z }]))
}

export function runTranslateAtomGroupCommand(
  molecule: Molecule,
  atomIds: ReadonlySet<string>,
  delta: AtomPositionDelta,
): ObjectTransformCommandResult {
  if (atomIds.size === 0 || (delta.x === 0 && delta.y === 0 && delta.z === 0)) {
    return { ok: true, changed: false }
  }

  const positions = copyMoleculePositions(molecule)
  let changed = false
  for (const atom of molecule.atoms) {
    if (!atomIds.has(atom.id)) continue
    positions.set(atom.id, {
      x: atom.x + delta.x,
      y: atom.y + delta.y,
      z: atom.z + delta.z,
    })
    changed = true
  }

  return changed
    ? { ok: true, changed: true, positions }
    : { ok: true, changed: false }
}

function rotateVectorByQuaternion(
  x: number,
  y: number,
  z: number,
  q: QuaternionLike,
): AtomPosition {
  const ix = q.w * x + q.y * z - q.z * y
  const iy = q.w * y + q.z * x - q.x * z
  const iz = q.w * z + q.x * y - q.y * x
  const iw = -q.x * x - q.y * y - q.z * z

  return {
    x: ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y,
    y: iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z,
    z: iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x,
  }
}

export function runRotateAtomGroupCommand(
  molecule: Molecule,
  atomIds: ReadonlySet<string>,
  pivot: AtomPosition,
  quaternion: QuaternionLike,
): ObjectTransformCommandResult {
  if (atomIds.size === 0) return { ok: true, changed: false }

  const positions = copyMoleculePositions(molecule)
  let changed = false
  for (const atom of molecule.atoms) {
    if (!atomIds.has(atom.id)) continue
    const rotated = rotateVectorByQuaternion(
      atom.x - pivot.x,
      atom.y - pivot.y,
      atom.z - pivot.z,
      quaternion,
    )
    positions.set(atom.id, {
      x: pivot.x + rotated.x,
      y: pivot.y + rotated.y,
      z: pivot.z + rotated.z,
    })
    changed = true
  }

  return changed
    ? { ok: true, changed: true, positions }
    : { ok: true, changed: false }
}
