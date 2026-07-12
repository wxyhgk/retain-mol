import { describe, expect, it } from 'vitest'
import {
  coordinationSitePickerReducer,
  initialCoordinationSitePickerState,
  type CoordinationSitePickerEvent,
  type CoordinationSitePickerState,
} from './useCoordinationSitePickerMachine'

const geometry = { classId: 'square-planar', fragmentId: 'pt-square-planar' }

function reduce(events: readonly CoordinationSitePickerEvent[]): CoordinationSitePickerState {
  return events.reduce(coordinationSitePickerReducer, initialCoordinationSitePickerState)
}

describe('coordination site picker machine', () => {
  it('moves from the catalog to an armed site through the happy path', () => {
    expect(reduce([
      { type: 'SELECT_GEOMETRY', ...geometry },
      { type: 'HOVER_SITE', siteId: 'site-2' },
      { type: 'SELECT_SITE', siteId: 'site-2' },
      { type: 'SUCCESS' },
    ])).toEqual({
      status: 'armed',
      ...geometry,
      siteId: 'site-2',
    })
  })

  it('keeps hover transient until selecting a site starts compilation', () => {
    const state = reduce([
      { type: 'SELECT_GEOMETRY', ...geometry },
      { type: 'HOVER_SITE', siteId: 'site-1' },
      { type: 'HOVER_SITE', siteId: 'site-3' },
      { type: 'SELECT_SITE', siteId: 'site-3' },
    ])

    expect(state).toEqual({
      status: 'compiling',
      ...geometry,
      siteId: 'site-3',
    })
  })

  it('returns a failed compilation to the selected state for retry', () => {
    const state = reduce([
      { type: 'SELECT_GEOMETRY', ...geometry },
      { type: 'SELECT_SITE', siteId: 'site-4' },
      { type: 'FAILURE', error: 'compile failed' },
    ])

    expect(state).toEqual({
      status: 'inspecting',
      ...geometry,
      hoveredSiteId: 'site-4',
      error: 'compile failed',
    })
    expect(coordinationSitePickerReducer(state, { type: 'SELECT_SITE', siteId: 'site-4' })).toEqual({
      status: 'compiling',
      ...geometry,
      siteId: 'site-4',
    })
  })

  it('backs out of inspection and ignores BACK while compiling', () => {
    const inspecting = reduce([
      { type: 'SELECT_GEOMETRY', ...geometry },
    ])
    expect(coordinationSitePickerReducer(inspecting, { type: 'BACK' })).toBe(initialCoordinationSitePickerState)

    const compiling = coordinationSitePickerReducer(inspecting, { type: 'SELECT_SITE', siteId: 'site-1' })
    expect(coordinationSitePickerReducer(compiling, { type: 'BACK' })).toBe(compiling)
  })

  it('cancels active steps and treats terminal states as immutable', () => {
    const inspecting = reduce([{ type: 'SELECT_GEOMETRY', ...geometry }])
    const cancelled = coordinationSitePickerReducer(inspecting, { type: 'CANCEL' })
    expect(cancelled).toEqual({ status: 'cancelled' })
    expect(coordinationSitePickerReducer(cancelled, { type: 'SELECT_GEOMETRY', ...geometry })).toBe(cancelled)

    const armed = reduce([
      { type: 'SELECT_GEOMETRY', ...geometry },
      { type: 'SELECT_SITE', siteId: 'site-1' },
      { type: 'SUCCESS' },
    ])
    expect(coordinationSitePickerReducer(armed, { type: 'CANCEL' })).toBe(armed)
  })

  it('ignores events that are invalid for the current state', () => {
    expect(coordinationSitePickerReducer(initialCoordinationSitePickerState, { type: 'SELECT_SITE', siteId: 'site-1' }))
      .toBe(initialCoordinationSitePickerState)
  })
})
