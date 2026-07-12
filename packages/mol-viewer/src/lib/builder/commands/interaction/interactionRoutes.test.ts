import { describe, expect, it } from 'vitest'
import { resolveBuilderIntent } from './builderIntent'
import { routeAtomClickForIntent } from './atomClickRoute'
import { routeBackgroundClickForIntent } from './backgroundRoute'
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
      .toEqual({ kind: 'select', multi: true })
    expect(routeBondClickForIntent(select, { shiftKey: false, altKey: true }))
      .toEqual({ kind: 'select', multi: true })
  })

  it('never routes bond edits when building is disabled', () => {
    const modifierCases = [
      { shiftKey: false, altKey: false },
      { shiftKey: true, altKey: false },
      { shiftKey: false, altKey: true },
      { shiftKey: true, altKey: true },
    ] as const

    for (const input of modifierCases) {
      const route = routeBondClickForIntent(select, input)
      expect(route.kind).toBe('select')
    }
  })

  it('routes background clicks by interaction state', () => {
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
    expect(routeBackgroundClickForIntent(buildAtom, { shiftKey: false, altKey: false }))
      .toEqual({ kind: 'place' })
    expect(routeBackgroundClickForIntent(buildFragment, { shiftKey: false, altKey: false }))
      .toEqual({ kind: 'place' })
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
    expect(shouldSelectFragmentOnAtomDoubleClickForIntent(buildAtom)).toBe(false)
    expect(shouldSelectFragmentOnAtomDoubleClickForIntent(select)).toBe(true)
    expect(shouldSelectFragmentOnAtomDoubleClickForIntent(measure)).toBe(false)
    expect(shouldShowGrowPreviewForIntent(buildAtom)).toBe(true)
    expect(shouldShowGrowPreviewForIntent(move)).toBe(false)
    expect(shouldShowGrowGuideForIntent(buildAtom)).toBe(true)
    expect(shouldShowGrowGuideForIntent(move)).toBe(false)
  })
})
