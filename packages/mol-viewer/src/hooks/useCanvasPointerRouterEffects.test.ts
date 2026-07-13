import { describe, expect, it } from 'vitest'
import { newAtom } from '../lib/molecule'
import {
  applyObjectTransformResult,
  cancelObjectTransform,
  finishObjectTransform,
  collectBoxSelectedAtomIds,
  commitBoxSelect,
  commitObjectPointerTransform,
  resolveBoxSelectBounds,
  resolveBoxSelectMode,
  resolveBoxSelectResult,
  resolveObjectTransformTarget,
  runObjectPointerTransformCommand,
  shouldStartBoxSelect,
} from './useCanvasPointerRouterEffects'

describe('canvas pointer router effects', () => {
  it('starts box selection only from right-click or shift-left on empty canvas', () => {
    const empty = { pickedAtomId: null, pickedBondId: null }

    expect(shouldStartBoxSelect({ button: 2, shiftKey: false, ...empty })).toBe(true)
    expect(shouldStartBoxSelect({ button: 0, shiftKey: true, ...empty })).toBe(true)
    expect(shouldStartBoxSelect({ button: 0, shiftKey: false, ...empty })).toBe(false)
    expect(shouldStartBoxSelect({
      button: 2,
      shiftKey: false,
      pickedAtomId: 'a1',
      pickedBondId: null,
    })).toBe(false)
    expect(shouldStartBoxSelect({
      button: 2,
      shiftKey: false,
      pickedAtomId: null,
      pickedBondId: 'b1',
    })).toBe(false)
    expect(shouldStartBoxSelect({
      button: 0,
      shiftKey: true,
      pickedAtomId: 'a1',
      pickedBondId: null,
    })).toBe(false)
  })

  it('resolves box select bounds and mode', () => {
    expect(resolveBoxSelectBounds(10, 20, 2, 30)).toEqual({
      minX: 2,
      maxX: 10,
      minY: 20,
      maxY: 30,
    })
    expect(resolveBoxSelectMode({ shift: true, alt: true })).toBe('add')
    expect(resolveBoxSelectMode({ shift: false, alt: true })).toBe('subtract')
    expect(resolveBoxSelectMode({ shift: false, alt: false })).toBe('replace')
  })

  it('collects atoms projected inside the selection box', () => {
    const c = newAtom('C', 1, 2, 0)
    const h = newAtom('H', 10, 10, 0)
    const hit = collectBoxSelectedAtomIds(
      { atoms: [c, h], bonds: [] },
      { minX: 0, maxX: 5, minY: 0, maxY: 5 },
      atom => ({ x: atom.x, y: atom.y }),
    )

    expect(hit).toEqual([c.id])
  })

  it('resolves box selection result with min-size and modifier semantics', () => {
    const c = newAtom('C', 1, 2, 0)
    const h = newAtom('H', 10, 10, 0)

    expect(resolveBoxSelectResult(
      { shift: false, alt: false },
      { atoms: [c, h], bonds: [] },
      { minX: 0, maxX: 2, minY: 0, maxY: 2 },
      4,
      atom => ({ x: atom.x, y: atom.y }),
    )).toBeNull()

    expect(resolveBoxSelectResult(
      { shift: false, alt: true },
      { atoms: [c, h], bonds: [] },
      { minX: 0, maxX: 5, minY: 0, maxY: 5 },
      4,
      atom => ({ x: atom.x, y: atom.y }),
    )).toEqual({ atomIds: [c.id], mode: 'subtract' })
  })

  it('commits box select through one effect entry', () => {
    const c = newAtom('C', 1, 2, 0)
    const h = newAtom('H', 10, 10, 0)
    const calls: string[] = []

    commitBoxSelect({
      state: { shift: true, alt: false },
      molecule: { atoms: [c, h], bonds: [] },
      bounds: { minX: 0, maxX: 5, minY: 0, maxY: 5 },
      minSize: 4,
      projectAtom: atom => ({ x: atom.x, y: atom.y }),
      selectAtoms: (atomIds, mode) => calls.push(`${mode}:${atomIds.join(',')}`),
    })

    commitBoxSelect({
      state: { shift: false, alt: false },
      molecule: { atoms: [c, h], bonds: [] },
      bounds: { minX: 0, maxX: 1, minY: 0, maxY: 1 },
      minSize: 4,
      projectAtom: atom => ({ x: atom.x, y: atom.y }),
      selectAtoms: () => calls.push('too-small'),
    })

    expect(calls).toEqual([`add:${c.id}`])
  })

  it('resolves object transform target from a picked atom', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1, 0, 0)
    const molecule = { atoms: [c1, c2], bonds: [{ id: 'b1', atomId1: c1.id, atomId2: c2.id, order: 1 as const }] }
    let activatedAtomId: string | null = null

    const target = resolveObjectTransformTarget(c1.id, false, {
      activateObjectContainingAtom: atomId => {
        activatedAtomId = atomId
        return true
      },
      getActiveObjectId: () => 'obj-1',
      getActiveMolecule: () => molecule,
    })

    expect(activatedAtomId).toBe(c1.id)
    expect(target?.targetObjectId).toBe('obj-1')
    expect([...target!.fragmentIds].sort()).toEqual([c1.id, c2.id].sort())
  })

  it('resolves object transform target from the active object for alt-drag', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1, 0, 0)
    const target = resolveObjectTransformTarget(null, true, {
      activateObjectContainingAtom: () => {
        throw new Error('should not activate without a picked atom')
      },
      getActiveObjectId: () => 'obj-1',
      getActiveMolecule: () => ({ atoms: [c, h], bonds: [] }),
    })

    expect(target).toEqual({
      targetObjectId: 'obj-1',
      fragmentIds: new Set([c.id, h.id]),
    })
  })

  it('does not resolve object transform target without an atom or active alt target', () => {
    expect(resolveObjectTransformTarget(null, false, {
      activateObjectContainingAtom: () => true,
      getActiveObjectId: () => 'obj-1',
      getActiveMolecule: () => ({ atoms: [], bonds: [] }),
    })).toBeNull()

    expect(resolveObjectTransformTarget('a1', false, {
      activateObjectContainingAtom: () => false,
      getActiveObjectId: () => 'obj-1',
      getActiveMolecule: () => ({ atoms: [], bonds: [] }),
    })).toBeNull()
  })

  it('runs object pointer translation through a command result', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1, 0, 0)
    const result = runObjectPointerTransformCommand({
      molecule: { atoms: [c, h], bonds: [] },
      fragmentIds: new Set([c.id]),
      dx: 10,
      dy: 2,
      rotate: false,
      minDisplacement: 0.5,
      rotateSpeedFactor: 0.01,
      screenDeltaToModelLocal: (dx, dy) => ({ x: dx / 10, y: dy / 10, z: 0 }),
      getModelWorldQuaternion: () => ({ x: 0, y: 0, z: 0, w: 1 }),
    })

    expect(result.changed).toBe(true)
    if (!result.changed) throw new Error('expected changed result')
    expect(result.positions.get(c.id)).toEqual({ x: 1, y: 0.2, z: 0 })
    expect(result.positions.get(h.id)).toEqual({ x: 1, y: 0, z: 0 })
  })

  it('runs object pointer rotation through a command result', () => {
    const a = newAtom('C', 0, 1, 0)
    const b = newAtom('C', 0, -1, 0)
    const result = runObjectPointerTransformCommand({
      molecule: { atoms: [a, b], bonds: [] },
      fragmentIds: new Set([a.id, b.id]),
      dx: 0,
      dy: 10,
      rotate: true,
      minDisplacement: 0.5,
      rotateSpeedFactor: Math.PI / 20,
      screenDeltaToModelLocal: () => ({ x: 0, y: 0, z: 0 }),
      getModelWorldQuaternion: () => ({ x: 0, y: 0, z: 0, w: 1 }),
    })

    expect(result.changed).toBe(true)
    if (!result.changed) throw new Error('expected changed result')
    expect(result.positions.get(a.id)?.y).toBeCloseTo(0, 6)
    expect(result.positions.get(a.id)?.z).toBeCloseTo(1, 6)
    expect(result.positions.get(b.id)?.y).toBeCloseTo(0, 6)
    expect(result.positions.get(b.id)?.z).toBeCloseTo(-1, 6)
  })

  it('ignores tiny object pointer movement', () => {
    const c = newAtom('C', 0, 0, 0)
    const result = runObjectPointerTransformCommand({
      molecule: { atoms: [c], bonds: [] },
      fragmentIds: new Set([c.id]),
      dx: 0.1,
      dy: 0.2,
      rotate: false,
      minDisplacement: 0.5,
      rotateSpeedFactor: 0.01,
      screenDeltaToModelLocal: () => {
        throw new Error('tiny moves should not resolve renderer deltas')
      },
      getModelWorldQuaternion: () => ({ x: 0, y: 0, z: 0, w: 1 }),
    })

    expect(result).toEqual({ ok: true, changed: false })
  })

  it('applies object transform positions only when changed', () => {
    const calls: string[] = []
    const positions = new Map([['a1', { x: 1, y: 2, z: 3 }]])

    applyObjectTransformResult('obj-1', { ok: true, changed: false }, (objectId, nextPositions) => {
      calls.push(`${objectId}:${nextPositions.size}`)
    })
    applyObjectTransformResult('obj-1', { ok: true, changed: true, positions }, (objectId, nextPositions) => {
      calls.push(`${objectId}:${nextPositions.get('a1')?.x}`)
    })

    expect(calls).toEqual(['obj-1:1'])
  })

  it('commits object pointer transform through one effect entry', () => {
    const c = newAtom('C', 0, 0, 0)
    const calls: string[] = []

    commitObjectPointerTransform({
      objectId: 'obj-1',
      molecule: { atoms: [c], bonds: [] },
      fragmentIds: new Set([c.id]),
      dx: 10,
      dy: 0,
      rotate: false,
      minDisplacement: 0.5,
      rotateSpeedFactor: 0.01,
      screenDeltaToModelLocal: dx => ({ x: dx / 10, y: 0, z: 0 }),
      getModelWorldQuaternion: () => ({ x: 0, y: 0, z: 0, w: 1 }),
      setObjectAtomPositions: (objectId, positions) => {
        calls.push(`${objectId}:${positions.get(c.id)?.x}`)
      },
    })

    expect(calls).toEqual(['obj-1:1'])
  })

  it('cancels an active object transform exactly once and clears its target', () => {
    const calls: string[] = []
    const state = {
      dragging: true,
      fragmentIds: new Set(['a1']),
      targetObjectId: 'obj-1',
    }
    const session = {
      end: () => calls.push('end'),
      cancel: () => calls.push('cancel'),
    }

    cancelObjectTransform(state, session)
    cancelObjectTransform(state, session)

    expect(calls).toEqual(['cancel'])
    expect(state).toEqual({
      dragging: false,
      fragmentIds: null,
      targetObjectId: null,
    })
  })

  it('commits a completed object transform exactly once', () => {
    const calls: string[] = []
    const state = {
      dragging: true,
      fragmentIds: new Set(['a1']),
      targetObjectId: 'obj-1',
    }
    const session = {
      end: () => calls.push('end'),
      cancel: () => calls.push('cancel'),
    }

    finishObjectTransform(state, session)
    finishObjectTransform(state, session)

    expect(calls).toEqual(['end'])
  })
})
