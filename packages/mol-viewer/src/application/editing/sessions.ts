import {
  AtomDragCommandSession,
  ObjectPositionWriteSession,
  ObjectTransformCommandSession,
  type AtomPosition,
} from '../../lib/builder/commands/scene'
import type { Molecule } from '../../lib/model/types'
import type {
  AlignBondPairDiagnostics,
  AlignBondPairFailureCode,
  AlignBondPairInput,
} from '../../lib/builder/geometry/bondPairAlignment'

/** Only the callbacks used by editing sessions; no Zustand or UI dependencies. */
export interface EditTransactionHandle {
  readonly active: boolean
  commit(): void
  cancel(): void
}

export interface EditSessionPort {
  getMolecule(): Molecule
  getSelectedAtomIds(): ReadonlySet<string>
  setAtomPositions(positions: ReadonlyMap<string, AtomPosition>): void
  setObjectAtomPositions(objectId: string, positions: ReadonlyMap<string, AtomPosition>): void
  alignBondPair(input: AlignBondPairInput): InternalAlignBondPairResult
  openTransaction(owner: string): EditTransactionHandle
  /** Compatibility fallback for legacy transaction adapters. */
  finishLegacyTransaction(): void
}

type TransactionPort = Pick<EditSessionPort, 'openTransaction' | 'finishLegacyTransaction'>
type AtomDragPort = TransactionPort & Pick<EditSessionPort, 'getMolecule' | 'getSelectedAtomIds' | 'setAtomPositions'>
type PositionWritePort = TransactionPort & Pick<EditSessionPort, 'setObjectAtomPositions'>
type BondAlignmentPort = TransactionPort & Pick<EditSessionPort, 'alignBondPair'>

function finishEditTransaction(
  port: TransactionPort,
  transaction: EditTransactionHandle | null,
) {
  if (transaction && typeof transaction.commit === 'function') transaction.commit()
  else port.finishLegacyTransaction()
}

function cancelEditTransaction(
  port: TransactionPort,
  transaction: EditTransactionHandle | null,
) {
  if (transaction && typeof transaction.cancel === 'function') transaction.cancel()
  else port.finishLegacyTransaction()
}

export function createAtomDragEditSession(port: AtomDragPort) {
  let transaction: EditTransactionHandle | null = null
  return new AtomDragCommandSession({
    getMolecule: () => port.getMolecule(),
    getSelectedAtomIds: () => port.getSelectedAtomIds(),
    setAtomPositions: positions => port.setAtomPositions(positions),
    startEditSession: () => { transaction = port.openTransaction('atom-drag') },
    endEditSession: () => { finishEditTransaction(port, transaction); transaction = null },
    cancelEditSession: () => { cancelEditTransaction(port, transaction); transaction = null },
  })
}

export function createObjectTransformEditSession(port: TransactionPort) {
  let transaction: EditTransactionHandle | null = null
  return new ObjectTransformCommandSession({
    startEditSession: () => { transaction = port.openTransaction('object-transform') },
    endEditSession: () => { finishEditTransaction(port, transaction); transaction = null },
    cancelEditSession: () => { cancelEditTransaction(port, transaction); transaction = null },
  })
}

export function createBondLengthEditSession(port: TransactionPort) {
  let transaction: EditTransactionHandle | null = null
  let started = false
  return {
    get active() { return started && (transaction?.active ?? true) },
    start() {
      if (started) return
      started = true
      transaction = port.openTransaction('bond-length-gizmo')
    },
    end() {
      if (!started) return
      finishEditTransaction(port, transaction)
      transaction = null
      started = false
    },
    cancel() {
      if (!started) return
      if (transaction?.cancel) transaction.cancel()
      else port.finishLegacyTransaction()
      transaction = null
      started = false
    },
  }
}

export function createObjectPositionWriteEditSession(
  objectId: string,
  port: PositionWritePort,
) {
  let transaction: EditTransactionHandle | null = null
  return new ObjectPositionWriteSession(objectId, {
    startEditSession: () => { transaction = port.openTransaction(`object-position:${objectId}`) },
    endEditSession: () => { finishEditTransaction(port, transaction); transaction = null },
    cancelEditSession: () => { cancelEditTransaction(port, transaction); transaction = null },
    setObjectAtomPositions: (targetObjectId, positions: ReadonlyMap<string, AtomPosition>) => {
      port.setObjectAtomPositions(targetObjectId, positions)
    },
  })
}

export type InternalAlignBondPairResult =
  | { readonly ok: true; readonly diagnostics: AlignBondPairDiagnostics }
  | { readonly ok: false; readonly code: AlignBondPairFailureCode; readonly reason: string }

export function runBondPairAlignmentEdit(
  input: AlignBondPairInput,
  port: Pick<EditSessionPort, 'alignBondPair'>,
): InternalAlignBondPairResult {
  return port.alignBondPair(input)
}

export interface InternalBondPairAlignmentEditSession {
  readonly isActive: boolean
  start(): void
  update(input: AlignBondPairInput): InternalAlignBondPairResult
  end(): void
  cancel(): void
}

export function createBondPairAlignmentEditSession(
  port: BondAlignmentPort,
): InternalBondPairAlignmentEditSession {
  let transaction: EditTransactionHandle | null = null
  let active = false
  let previousAzimuthDegrees = 0

  return {
    get isActive() {
      return active && Boolean(transaction?.active)
    },
    start() {
      if (active) return
      transaction = port.openTransaction('bond-pair-alignment')
      previousAzimuthDegrees = 0
      active = true
    },
    update(input) {
      if (!active) {
        return {
          ok: false,
          code: 'session-not-started',
          reason: '键对齐编辑会话尚未开始',
        }
      }
      const result = port.alignBondPair({
        ...input,
        azimuthDegrees: input.azimuthDegrees - previousAzimuthDegrees,
      })
      if (result.ok) previousAzimuthDegrees = input.azimuthDegrees
      return result
    },
    end() {
      if (!active) return
      finishEditTransaction(port, transaction)
      transaction = null
      active = false
    },
    cancel() {
      if (!active) return
      cancelEditTransaction(port, transaction)
      transaction = null
      active = false
    },
  }
}
