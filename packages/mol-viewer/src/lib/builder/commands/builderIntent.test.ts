import { describe, expect, it } from 'vitest'
import {
  resolveBuilderIntent,
  routeAtomClickForIntent,
  routeBackgroundClickForIntent,
  routeBondClickForIntent,
  shouldAttemptBondDragStartForIntent,
  shouldPlaceOnBackgroundDoubleClickForIntent,
  shouldRunEditCommandForIntent,
  shouldSelectFragmentOnAtomDoubleClickForIntent,
  shouldShowGrowGuideForIntent,
  shouldShowGrowPreviewForIntent,
} from './index'

describe('resolveBuilderIntent', () => {
  it('resolves measure and move-object before build state', () => {
    expect(resolveBuilderIntent({
      activeTool: 'measure',
      activeElement: 'C',
      atomClickMode: 'grow',
      activeFragmentId: 'benzene',
      brushArmed: true,
    }).kind).toBe('measure')

    expect(resolveBuilderIntent({
      activeTool: 'move-object',
      activeElement: 'C',
      atomClickMode: 'grow',
      activeFragmentId: 'benzene',
      brushArmed: true,
    }).kind).toBe('move-object')
  })

  it('resolves select, atom build, and fragment build intents', () => {
    expect(resolveBuilderIntent({
      activeTool: 'select',
      activeElement: 'C',
      atomClickMode: 'grow',
      activeFragmentId: 'benzene',
      brushArmed: false,
    }).kind).toBe('select')

    const atomIntent = resolveBuilderIntent({
      activeTool: 'select',
      activeElement: 'N',
      atomClickMode: 'replace',
      activeFragmentId: null,
      brushArmed: true,
    })
    expect(atomIntent).toMatchObject({
      kind: 'build-atom',
      activeElement: 'N',
      atomClickMode: 'replace',
      canBuild: true,
    })

    const fragmentIntent = resolveBuilderIntent({
      activeTool: 'select',
      activeElement: 'C',
      atomClickMode: 'grow',
      activeFragmentId: 'benzene',
      brushArmed: true,
    })
    expect(fragmentIntent.kind).toBe('build-fragment')
    expect(fragmentIntent.fragment?.id).toBe('benzene')
  })
})

describe('intent routes', () => {
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

  it('routes atom and bond clicks from intent', () => {
    expect(routeAtomClickForIntent(buildAtom, { shiftKey: false })).toEqual({ kind: 'command' })
    expect(routeAtomClickForIntent(buildAtom, { shiftKey: true })).toEqual({ kind: 'select', append: true })
    expect(routeAtomClickForIntent(select, { shiftKey: false })).toEqual({ kind: 'select', append: false })

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

  it('routes background and gesture gates from intent', () => {
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
    expect(shouldAttemptBondDragStartForIntent(buildAtom, { sourceSelected: false })).toBe(true)
    expect(shouldAttemptBondDragStartForIntent(buildAtom, { sourceSelected: true })).toBe(false)
    expect(shouldAttemptBondDragStartForIntent(buildFragment, { sourceSelected: false })).toBe(false)
  })

  it('checks edit-only gates from intent', () => {
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
