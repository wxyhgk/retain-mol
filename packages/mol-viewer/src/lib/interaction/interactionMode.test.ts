import { describe, expect, it } from 'vitest'
import {
  canEditInInteractionMode,
  canSelectInInteractionMode,
  resolveInteractionMode,
  shouldEnableCameraControls,
} from './interactionMode'

describe('interactionMode', () => {
  it('keeps the legacy readOnly behavior when interactionMode is omitted', () => {
    expect(resolveInteractionMode(undefined, true)).toBe('read-only')
    expect(resolveInteractionMode(undefined, false)).toBe('edit')
    expect(resolveInteractionMode(undefined, undefined)).toBe('edit')
  })

  it('gives interactionMode precedence over the legacy readOnly prop', () => {
    expect(resolveInteractionMode('select', true)).toBe('select')
    expect(resolveInteractionMode('edit', true)).toBe('edit')
    expect(resolveInteractionMode('read-only', false)).toBe('read-only')
  })

  it('allows selection without granting edit capabilities', () => {
    expect(canSelectInInteractionMode('select')).toBe(true)
    expect(canEditInInteractionMode('select')).toBe(false)
    expect(canSelectInInteractionMode('read-only')).toBe(false)
    expect(canEditInInteractionMode('edit')).toBe(true)
  })

  it('keeps camera controls enabled throughout select mode', () => {
    expect(shouldEnableCameraControls('select', false)).toBe(true)
    expect(shouldEnableCameraControls('select', true)).toBe(true)
    expect(shouldEnableCameraControls('read-only', true)).toBe(true)
    expect(shouldEnableCameraControls('edit', true)).toBe(false)
  })
})
