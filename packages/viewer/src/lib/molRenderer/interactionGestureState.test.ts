import { describe, expect, it } from 'vitest'
import {
  activeAtomDragId,
  advanceInteractionGesture,
  beginAtomPress,
  beginBondPress,
  beginFragmentPress,
  idleInteractionGesture,
  isAtomGesture,
  isBondGesture,
  isFragmentGesture,
  updateFragmentTorsionAngle,
  updateBondDragTarget,
} from './interactionGestureState'

describe('interaction gesture state', () => {
  it('keeps an atom press below the drag threshold', () => {
    const pressed = beginAtomPress('a1', { x: 10, y: 10 })
    expect(advanceInteractionGesture(pressed, { x: 12, y: 12 }, 4)).toBe(pressed)
    expect(isAtomGesture(pressed)).toBe(true)
  })

  it('promotes atom and bond presses to explicit drag states', () => {
    expect(advanceInteractionGesture(
      beginAtomPress('a1', { x: 0, y: 0 }),
      { x: 4, y: 0 },
      4,
    )).toEqual({ kind: 'atom-drag', atomId: 'a1', down: { x: 0, y: 0 } })

    expect(advanceInteractionGesture(
      beginBondPress('a2', { x: 0, y: 0 }),
      { x: 0, y: 5 },
      4,
    )).toEqual({
      kind: 'bond-drag',
      sourceId: 'a2',
      down: { x: 0, y: 0 },
      targetId: null,
      dropPosition: null,
    })
  })

  it('records either a bond target or a free-space drop position', () => {
    const dragging = advanceInteractionGesture(
      beginBondPress('source', { x: 0, y: 0 }),
      { x: 8, y: 0 },
      4,
    )
    const targeted = updateBondDragTarget(dragging, 'target', null)
    expect(targeted).toMatchObject({ kind: 'bond-drag', targetId: 'target', dropPosition: null })

    const free = updateBondDragTarget(targeted, null, { x: 1, y: 2, z: 3 })
    expect(free).toMatchObject({
      kind: 'bond-drag',
      targetId: null,
      dropPosition: { x: 1, y: 2, z: 3 },
    })
    expect(isBondGesture(free)).toBe(true)
    expect(isBondGesture(idleInteractionGesture())).toBe(false)
  })

  it('reports only an active atom drag as an edit session to close', () => {
    const pressed = beginAtomPress('a1', { x: 0, y: 0 })
    const dragging = advanceInteractionGesture(pressed, { x: 5, y: 0 }, 4)

    expect(activeAtomDragId(pressed)).toBeNull()
    expect(activeAtomDragId(dragging)).toBe('a1')
    expect(activeAtomDragId(beginBondPress('a2', { x: 0, y: 0 }))).toBeNull()
  })

  it('promotes fragment press into a continuous torsion gesture', () => {
    const pressed = beginFragmentPress('host', { x: 10, y: 20 })
    expect(advanceInteractionGesture(pressed, { x: 12, y: 20 }, 4)).toBe(pressed)
    const dragging = advanceInteractionGesture(pressed, { x: 14, y: 20 }, 4)
    expect(isFragmentGesture(dragging)).toBe(true)
    expect(updateFragmentTorsionAngle(dragging, 181)).toEqual({
      kind: 'fragment-torsion',
      targetId: 'host',
      down: { x: 10, y: 20 },
      angleDegrees: 181,
    })
  })
})
