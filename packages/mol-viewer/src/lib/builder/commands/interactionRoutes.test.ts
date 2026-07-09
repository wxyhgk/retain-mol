import { describe, expect, it } from 'vitest'
import { resolveBuilderIntent } from './builderIntent'
import { routeAtomClickForIntent } from './atomClickRoute'
import { routeBackgroundClickForIntent, shouldPlaceOnBackgroundDoubleClickForIntent } from './backgroundRoute'
import { routeBondClickForIntent } from './bondClickRoute'
import {
  shouldAttemptBondDragStartForIntent,
  shouldRunEditCommandForIntent,
  shouldSelectFragmentOnAtomDoubleClickForIntent,
  shouldShowGrowGuideForIntent,
  shouldShowGrowPreviewForIntent,
} from './gestureIntentGates'

describe('interaction routes', () => {
  const buildAtom = resolveBuilderIntent({
    activeTool: 'select',
    activeElement: 'C',
    atomClickMode: 'grow',
    activeFragmentId: null,
    brushArmed: true,
  })

  const buildFragment = resolveBuilderIntent({
    activeTool: 'select',
    activeElement: 'C',
    atomClickMode: 'grow',
    activeFragmentId: 'benzene',
    brushArmed: true,
  })

  const select = resolveBuilderIntent({
    activeTool: 'select',
    activeElement: 'C',
    atomClickMode: 'grow',
    activeFragmentId: 'benzene',
    brushArmed: false,
  })

  it('routes atom clicks independently from command execution', () => {
    expect(routeAtomClickForIntent(buildAtom, { shiftKey: false })).toEqual({ kind: 'command' })
    expect(routeAtomClickForIntent(buildAtom, { shiftKey: true })).toEqual({ kind: 'select', append: true })
    expect(routeAtomClickForIntent(select, { shiftKey: false })).toEqual({ kind: 'select', append: false })
  })

  it('routes bond clicks independently from command execution', () => {
    const bondRoute = routeBondClickForIntent(buildFragment, { shiftKey: false, altKey: false })
    expect(bondRoute.kind).toBe('command')
    if (bondRoute.kind !== 'command') return
    expect(bondRoute.fragment?.id).toBe('benzene')
    expect(bondRoute.cycleLength).toBe(false)

    expect(routeBondClickForIntent(select, { shiftKey: true, altKey: false }))
      .toEqual({ kind: 'command', fragment: undefined, cycleLength: true })
    expect(routeBondClickForIntent(select, { shiftKey: false, altKey: true }))
      .toEqual({ kind: 'select', includeAtoms: true })
  })

  it('routes background clicks and double-click placement gates', () => {
    const measure = resolveBuilderIntent({
      activeTool: 'measure',
      activeElement: 'C',
      atomClickMode: 'grow',
      activeFragmentId: null,
      brushArmed: true,
    })
    expect(routeBackgroundClickForIntent(measure, { shiftKey: false, altKey: false }))
      .toEqual({ kind: 'commitMeasure' })
    expect(routeBackgroundClickForIntent(select, { shiftKey: false, altKey: false }))
      .toEqual({ kind: 'clearSelection' })
    expect(routeBackgroundClickForIntent(select, { shiftKey: true, altKey: false }))
      .toEqual({ kind: 'noop' })
    expect(shouldPlaceOnBackgroundDoubleClickForIntent(buildAtom)).toBe(true)
    expect(shouldPlaceOnBackgroundDoubleClickForIntent(select)).toBe(false)
  })

  it('checks gesture gates independently from geometry commands', () => {
    const move = resolveBuilderIntent({
      activeTool: 'move-object',
      activeElement: 'C',
      atomClickMode: 'grow',
      activeFragmentId: null,
      brushArmed: true,
    })
    const measure = resolveBuilderIntent({
      activeTool: 'measure',
      activeElement: 'C',
      atomClickMode: 'grow',
      activeFragmentId: null,
      brushArmed: true,
    })

    expect(shouldAttemptBondDragStartForIntent(buildAtom, { sourceSelected: false })).toBe(true)
    expect(shouldAttemptBondDragStartForIntent(buildAtom, { sourceSelected: true })).toBe(false)
    expect(shouldAttemptBondDragStartForIntent(buildFragment, { sourceSelected: false })).toBe(false)
    expect(shouldRunEditCommandForIntent(buildAtom)).toBe(true)
    expect(shouldRunEditCommandForIntent(measure)).toBe(false)
    expect(shouldSelectFragmentOnAtomDoubleClickForIntent(buildAtom)).toBe(true)
    expect(shouldSelectFragmentOnAtomDoubleClickForIntent(measure)).toBe(false)
    expect(shouldShowGrowPreviewForIntent(buildAtom)).toBe(true)
    expect(shouldShowGrowPreviewForIntent(move)).toBe(false)
    expect(shouldShowGrowGuideForIntent(buildAtom)).toBe(true)
    expect(shouldShowGrowGuideForIntent(move)).toBe(false)
  })
})
