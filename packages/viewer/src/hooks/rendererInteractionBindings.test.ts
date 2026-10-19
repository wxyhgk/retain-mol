import { describe, expect, it, vi } from 'vitest'
import type { BuilderHandlers } from './useBuilder'
import {
  configureRendererInteractionBindings,
  type RendererInteractionBindingTarget,
  type SelectionInteractionEffects,
} from './rendererInteractionBindings'

function handlers(): BuilderHandlers {
  return {
    onAtomClick: vi.fn(),
    onAtomDoubleClick: vi.fn(),
    onBondClick: vi.fn(),
    onBackgroundClick: vi.fn(),
    onAtomDragStart: vi.fn(),
    onAtomDrag: vi.fn(),
    onAtomDragEnd: vi.fn(),
    onAtomDragCancel: vi.fn(),
    canStartBondDrag: vi.fn(() => true),
    onBondDragStart: vi.fn(() => true),
    onBondDragEnd: vi.fn(),
    getGrowPreview: vi.fn(() => null),
    getGrowGuide: vi.fn(() => null),
    canStartFragmentTorsion: vi.fn(() => true),
    onFragmentTorsionStart: vi.fn(() => true),
    getFragmentTorsionPreview: vi.fn(() => null),
    onFragmentTorsionEnd: vi.fn(),
  }
}

function renderer(): RendererInteractionBindingTarget {
  return {
    idleCursor: 'stale',
    onAtomClick: vi.fn(),
    onAtomDoubleClick: vi.fn(),
    onBondClick: vi.fn(),
    onBackgroundClick: vi.fn(),
    onAtomDragStart: vi.fn(),
    onAtomDrag: vi.fn(),
    onAtomDragEnd: vi.fn(),
    onAtomDragCancel: vi.fn(),
    canDragAtom: vi.fn(() => true),
    canStartBondDrag: vi.fn(() => true),
    onBondDragStart: vi.fn(() => true),
    onBondDragEnd: vi.fn(),
    onBondDragHover: vi.fn(),
    getGrowPreview: vi.fn(() => null),
    getGrowGuide: vi.fn(() => null),
    canStartFragmentTorsion: vi.fn(() => true),
    onFragmentTorsionStart: vi.fn(() => true),
    getFragmentTorsionPreview: vi.fn(() => null),
    onFragmentTorsionEnd: vi.fn(),
    setDragHoverAtom: vi.fn(),
  }
}

function selection(): SelectionInteractionEffects {
  return {
    selectAtom: vi.fn(),
    selectBond: vi.fn(),
    clearSelection: vi.fn(),
    isAtomSelected: vi.fn(() => true),
  }
}

describe('configureRendererInteractionBindings', () => {
  it('selects atoms and bonds, supports shift multi-select, and clears on background', () => {
    const target = renderer()
    const selectionEffects = selection()
    configureRendererInteractionBindings({
      renderer: target,
      interactionMode: 'select',
      activeTool: 'select',
      brushArmed: true,
      handlers: handlers(),
      selection: selectionEffects,
    })

    target.onAtomClick?.('a1', { shiftKey: false } as MouseEvent)
    target.onAtomClick?.('a2', { shiftKey: true } as MouseEvent)
    target.onBondClick?.('b1', { shiftKey: true } as MouseEvent)
    target.onBackgroundClick?.(
      { x: 0, y: 0, z: 0 },
      { shiftKey: false } as MouseEvent,
    )

    expect(selectionEffects.selectAtom).toHaveBeenNthCalledWith(1, 'a1', false)
    expect(selectionEffects.selectAtom).toHaveBeenNthCalledWith(2, 'a2', true)
    expect(selectionEffects.selectBond).toHaveBeenCalledWith('b1', true)
    expect(selectionEffects.clearSelection).toHaveBeenCalledOnce()
  })

  it('removes every editing and double-click binding in select mode', () => {
    const target = renderer()
    configureRendererInteractionBindings({
      renderer: target,
      interactionMode: 'select',
      activeTool: 'select',
      brushArmed: true,
      handlers: handlers(),
      selection: selection(),
    })

    expect(target.onAtomDoubleClick).toBeUndefined()
    expect(target.onAtomDrag).toBeUndefined()
    expect(target.onAtomDragStart).toBeUndefined()
    expect(target.canDragAtom).toBeUndefined()
    expect(target.canStartBondDrag).toBeUndefined()
    expect(target.onBondDragStart).toBeUndefined()
    expect(target.getGrowPreview).toBeUndefined()
    expect(target.canStartFragmentTorsion).toBeUndefined()
  })

  it('removes picking callbacks in read-only mode', () => {
    const target = renderer()
    configureRendererInteractionBindings({
      renderer: target,
      interactionMode: 'read-only',
      activeTool: 'select',
      brushArmed: false,
      handlers: handlers(),
      selection: selection(),
    })

    expect(target.onAtomClick).toBeUndefined()
    expect(target.onBondClick).toBeUndefined()
    expect(target.onBackgroundClick).toBeUndefined()
  })
})
