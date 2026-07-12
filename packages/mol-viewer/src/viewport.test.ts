import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Atom } from './lib/molecule'
import {
  fitViewport,
  focusViewportSelection,
  resetViewport,
  setViewportAxesVisible,
  setViewportGridVisible,
} from './public/viewer'
import { createViewportController, registerViewport, type ViewportController } from './viewport'

let unregister: (() => void) | undefined

afterEach(() => {
  unregister?.()
  unregister = undefined
})

function controllerSpies(): ViewportController {
  return {
    fitViewport: vi.fn(),
    focusViewportSelection: vi.fn(),
    resetViewport: vi.fn(),
    setViewportAxesVisible: vi.fn(),
    setViewportGridVisible: vi.fn(),
  }
}

describe('viewport public API', () => {
  it('returns false when no viewport is active', () => {
    expect(fitViewport()).toBe(false)
    expect(focusViewportSelection()).toBe(false)
    expect(resetViewport()).toBe(false)
    expect(setViewportAxesVisible(true)).toBe(false)
    expect(setViewportGridVisible(true)).toBe(false)
  })

  it('delegates every command and returns true for an active viewport', () => {
    const controller = controllerSpies()
    unregister = registerViewport(controller)

    expect(fitViewport()).toBe(true)
    expect(focusViewportSelection()).toBe(true)
    expect(resetViewport()).toBe(true)
    expect(setViewportAxesVisible(true)).toBe(true)
    expect(setViewportGridVisible(false)).toBe(true)

    expect(controller.fitViewport).toHaveBeenCalledOnce()
    expect(controller.focusViewportSelection).toHaveBeenCalledOnce()
    expect(controller.resetViewport).toHaveBeenCalledOnce()
    expect(controller.setViewportAxesVisible).toHaveBeenCalledWith(true)
    expect(controller.setViewportGridVisible).toHaveBeenCalledWith(false)
  })

  it('does not let stale cleanup clear a newer viewport', () => {
    const first = controllerSpies()
    const second = controllerSpies()
    const unregisterFirst = registerViewport(first)
    unregister = registerViewport(second)

    unregisterFirst()

    expect(fitViewport()).toBe(true)
    expect(first.fitViewport).not.toHaveBeenCalled()
    expect(second.fitViewport).toHaveBeenCalledOnce()
  })
})

describe('createViewportController', () => {
  const firstAtoms: Atom[] = [
    { id: 'a1', symbol: 'C', x: 0, y: 0, z: 0 },
    { id: 'a2', symbol: 'O', x: 1, y: 0, z: 0 },
  ]
  const secondAtoms: Atom[] = [
    { id: 'b1', symbol: 'N', x: 4, y: 0, z: 0 },
  ]
  const firstBonds = [
    { id: 'a1-a2', atomId1: 'a1', atomId2: 'a2', order: 1 as const },
  ]

  it('reads the current active object and focuses only selected atoms', () => {
    const renderer = {
      fitToMolecule: vi.fn(),
      resetCamera: vi.fn(),
      setAxesVisible: vi.fn(),
      setGridVisible: vi.fn(),
    }
    const state = {
      activeObjectId: 'first' as string | null,
      objectsById: {
        first: { molecule: { atoms: firstAtoms, bonds: firstBonds } },
        second: { molecule: { atoms: secondAtoms, bonds: [] } },
      },
      selectedAtomIds: new Set(['a2']),
      selectedBondIds: new Set<string>(),
    }
    const controller = createViewportController(renderer, () => state)

    controller.fitViewport()
    controller.focusViewportSelection()
    expect(renderer.fitToMolecule).toHaveBeenNthCalledWith(1, firstAtoms)
    expect(renderer.fitToMolecule).toHaveBeenNthCalledWith(2, [firstAtoms[1]])

    state.activeObjectId = 'second'
    state.selectedAtomIds = new Set(['b1'])
    controller.fitViewport()
    controller.focusViewportSelection()
    expect(renderer.fitToMolecule).toHaveBeenNthCalledWith(3, secondAtoms)
    expect(renderer.fitToMolecule).toHaveBeenNthCalledWith(4, secondAtoms)
  })

  it('keeps focus as a no-op when the current selection is empty', () => {
    const renderer = {
      fitToMolecule: vi.fn(),
      resetCamera: vi.fn(),
      setAxesVisible: vi.fn(),
      setGridVisible: vi.fn(),
    }
    const controller = createViewportController(renderer, () => ({
      activeObjectId: 'first',
      objectsById: { first: { molecule: { atoms: firstAtoms, bonds: firstBonds } } },
      selectedAtomIds: new Set(),
      selectedBondIds: new Set(),
    }))

    controller.focusViewportSelection()

    expect(renderer.fitToMolecule).not.toHaveBeenCalled()
  })

  it('focuses the endpoints of a selected bond', () => {
    const renderer = {
      fitToMolecule: vi.fn(),
      resetCamera: vi.fn(),
      setAxesVisible: vi.fn(),
      setGridVisible: vi.fn(),
    }
    const controller = createViewportController(renderer, () => ({
      activeObjectId: 'first',
      objectsById: { first: { molecule: { atoms: firstAtoms, bonds: firstBonds } } },
      selectedAtomIds: new Set<string>(),
      selectedBondIds: new Set(['a1-a2']),
    }))

    controller.focusViewportSelection()

    expect(renderer.fitToMolecule).toHaveBeenCalledWith(firstAtoms)
  })
})
