import { describe, expect, it } from 'vitest'
import { newAtom } from '../../../molecule'
import {
  AtomDragCommandSession,
  createAtomDragSnapshot,
  ObjectPositionWriteSession,
  ObjectTransformCommandSession,
  runRotateAtomGroupCommand,
  runAtomDragMoveCommand,
  runTranslateAtomGroupCommand,
} from './moveCommands'

describe('createAtomDragSnapshot', () => {
  it('captures only the dragged atom when it is not selected', () => {
    const a1 = newAtom('C', 0, 0, 0)
    const a2 = newAtom('C', 1, 2, 3)

    const snapshot = createAtomDragSnapshot(
      { atoms: [a1, a2], bonds: [] },
      a1.id,
      new Set([a2.id]),
    )

    expect([...snapshot.keys()]).toEqual([a1.id])
    expect(snapshot.get(a1.id)).toEqual({ x: 0, y: 0, z: 0 })
  })

  it('captures the selected atom group when dragging a selected atom', () => {
    const a1 = newAtom('C', 0, 0, 0)
    const a2 = newAtom('C', 1, 2, 3)
    const a3 = newAtom('H', 4, 5, 6)

    const snapshot = createAtomDragSnapshot(
      { atoms: [a1, a2, a3], bonds: [] },
      a1.id,
      new Set([a1.id, a2.id]),
    )

    expect(new Set(snapshot.keys())).toEqual(new Set([a1.id, a2.id]))
    expect(snapshot.has(a3.id)).toBe(false)
  })
})

describe('object transform commands', () => {
  it('translates an atom group while preserving untouched atom positions', () => {
    const a1 = newAtom('C', 0, 0, 0)
    const a2 = newAtom('C', 1, 0, 0)
    const a3 = newAtom('H', 5, 0, 0)

    const result = runTranslateAtomGroupCommand(
      { atoms: [a1, a2, a3], bonds: [] },
      new Set([a1.id, a2.id]),
      { x: 2, y: -1, z: 0.5 },
    )

    expect(result.ok).toBe(true)
    if (!result.changed) return
    expect(result.positions.get(a1.id)).toEqual({ x: 2, y: -1, z: 0.5 })
    expect(result.positions.get(a2.id)).toEqual({ x: 3, y: -1, z: 0.5 })
    expect(result.positions.get(a3.id)).toEqual({ x: 5, y: 0, z: 0 })
  })

  it('rotates an atom group around a pivot using a quaternion', () => {
    const a1 = newAtom('C', 1, 0, 0)
    const a2 = newAtom('H', 0, 1, 0)
    const a3 = newAtom('H', 0, 0, 1)
    const half = Math.sqrt(0.5)

    const result = runRotateAtomGroupCommand(
      { atoms: [a1, a2, a3], bonds: [] },
      new Set([a1.id, a2.id]),
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: half, w: half },
    )

    expect(result.ok).toBe(true)
    if (!result.changed) return
    expect(result.positions.get(a1.id)?.x).toBeCloseTo(0)
    expect(result.positions.get(a1.id)?.y).toBeCloseTo(1)
    expect(result.positions.get(a1.id)?.z).toBeCloseTo(0)
    expect(result.positions.get(a2.id)?.x).toBeCloseTo(-1)
    expect(result.positions.get(a2.id)?.y).toBeCloseTo(0)
    expect(result.positions.get(a2.id)?.z).toBeCloseTo(0)
    expect(result.positions.get(a3.id)).toEqual({ x: 0, y: 0, z: 1 })
  })
})

describe('runAtomDragMoveCommand', () => {
  it('moves every atom in the drag snapshot by the dragged atom delta', () => {
    const snapshot = new Map([
      ['a1', { x: 0, y: 0, z: 0 }],
      ['a2', { x: 1, y: 2, z: 3 }],
    ])

    const result = runAtomDragMoveCommand({
      draggedAtomId: 'a1',
      snapshot,
      position: { x: 2, y: -1, z: 0.5 },
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.positions.get('a1')).toEqual({ x: 2, y: -1, z: 0.5 })
    expect(result.positions.get('a2')).toEqual({ x: 3, y: 1, z: 3.5 })
  })

  it('returns unchanged when there is no movement', () => {
    const snapshot = new Map([['a1', { x: 1, y: 2, z: 3 }]])

    expect(runAtomDragMoveCommand({
      draggedAtomId: 'a1',
      snapshot,
      position: { x: 1, y: 2, z: 3 },
    })).toEqual({ ok: true, changed: false })
  })

  it('rejects missing dragged atom snapshots', () => {
    expect(runAtomDragMoveCommand({
      draggedAtomId: 'missing',
      snapshot: new Map([['a1', { x: 1, y: 2, z: 3 }]]),
      position: { x: 2, y: 2, z: 3 },
    })).toEqual({ ok: false, reason: '拖拽起点不存在' })
  })
})

describe('AtomDragCommandSession', () => {
  it('wraps snapshot, move application, and transaction lifetime', () => {
    const a1 = newAtom('C', 0, 0, 0)
    const a2 = newAtom('C', 1, 0, 0)
    const calls: string[] = []
    let appliedPositions: ReadonlyMap<string, { x: number; y: number; z: number }> | null = null
    const session = new AtomDragCommandSession({
      getMolecule: () => ({ atoms: [a1, a2], bonds: [] }),
      getSelectedAtomIds: () => new Set([a1.id, a2.id]),
      setAtomPositions: positions => {
        calls.push('setAtomPositions')
        appliedPositions = positions
      },
      startEditSession: () => calls.push('beginTransaction'),
      endEditSession: () => calls.push('endTransaction'),
    })

    session.start(a1.id)
    session.start(a1.id)
    expect(session.isActive).toBe(true)
    const result = session.move(a1.id, { x: 2, y: 0, z: 0 })
    session.end()
    session.end()

    expect(result.ok).toBe(true)
    expect(session.isActive).toBe(false)
    expect(calls).toEqual(['beginTransaction', 'setAtomPositions', 'endTransaction'])
    expect(appliedPositions?.get(a1.id)).toEqual({ x: 2, y: 0, z: 0 })
    expect(appliedPositions?.get(a2.id)).toEqual({ x: 3, y: 0, z: 0 })
  })

  it('ignores end and rejects move before a drag starts', () => {
    const calls: string[] = []
    const session = new AtomDragCommandSession({
      getMolecule: () => ({ atoms: [], bonds: [] }),
      getSelectedAtomIds: () => new Set(),
      setAtomPositions: () => calls.push('setAtomPositions'),
      startEditSession: () => calls.push('beginTransaction'),
      endEditSession: () => calls.push('endTransaction'),
    })

    expect(session.move('a1', { x: 0, y: 0, z: 0 })).toEqual({
      ok: false,
      reason: '拖拽会话不存在',
    })
    session.end()
    expect(calls).toEqual([])
  })
})

describe('ObjectTransformCommandSession', () => {
  it('wraps object transform transaction lifetime and ignores duplicate calls', () => {
    const calls: string[] = []
    const session = new ObjectTransformCommandSession({
      startEditSession: () => calls.push('beginTransaction'),
      endEditSession: () => calls.push('endTransaction'),
    })

    session.end()
    session.start()
    session.start()
    expect(session.isActive).toBe(true)
    session.end()
    session.end()

    expect(session.isActive).toBe(false)
    expect(calls).toEqual(['beginTransaction', 'endTransaction'])
  })
})

describe('ObjectPositionWriteSession', () => {
  it('wraps object position writes in an explicit transaction session', () => {
    const calls: string[] = []
    const positions = new Map([['a1', { x: 1, y: 2, z: 3 }]])
    const session = new ObjectPositionWriteSession('obj-1', {
      startEditSession: () => calls.push('beginTransaction'),
      endEditSession: () => calls.push('endTransaction'),
      setObjectAtomPositions: (objectId, nextPositions) => {
        calls.push(`write:${objectId}:${nextPositions.get('a1')?.x}`)
      },
    })

    session.start()
    session.write(positions)
    session.end()

    expect(calls).toEqual(['beginTransaction', 'write:obj-1:1', 'endTransaction'])
  })
})
