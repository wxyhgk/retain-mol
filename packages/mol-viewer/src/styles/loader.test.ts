import { describe, expect, it } from 'vitest'
import { registerTheme, listThemes, resolveTheme } from '../presets'
import {
  listStylePresets,
  registerStylePreset,
  resolveRenderProfile,
  resolveStylePreset,
  registerRenderProfile,
} from './index'

describe('style public registries', () => {
  it('registers themes and exposes complete metadata', () => {
    registerTheme({
      $schemaVersion: '1',
      kind: 'theme',
      metadata: {
        id: 'test-theme-runtime',
        name: 'Runtime Theme',
      },
      extends: 'default',
      scene: {
        backgroundColor: '#010203',
      },
    })

    const metadata = listThemes().find(theme => theme.id === 'test-theme-runtime')
    expect(metadata).toEqual({
      id: 'test-theme-runtime',
      name: 'Runtime Theme',
      description: '',
      source: '',
      author: '',
      version: '1.0.0',
    })
    expect(resolveTheme('test-theme-runtime').scene.backgroundColor).toBe('#010203')
  })

  it('allows extending style presets with partial overrides', () => {
    registerStylePreset({
      $schemaVersion: '1',
      kind: 'molecular-style-preset',
      metadata: {
        id: 'test-style-runtime',
        name: 'Runtime Style',
        author: 'RetainMol',
      },
      extends: 'retainmol-default',
      themeId: 'test-theme-runtime',
    })

    const preset = resolveStylePreset('test-style-runtime')
    expect(preset.displayMode).toBe('ball-stick')
    expect(preset.themeId).toBe('test-theme-runtime')
    expect(preset.renderStyle).toBe('realistic')

    const metadata = listStylePresets().find(item => item.id === 'test-style-runtime')
    expect(metadata).toEqual({
      id: 'test-style-runtime',
      name: 'Runtime Style',
      description: '',
      source: '',
      author: 'RetainMol',
      version: '1.0.0',
    })
  })

  it('registers render profiles by runtime id', () => {
    const base = resolveRenderProfile('realistic')
    registerRenderProfile({
      ...base,
      id: 'test-render-runtime',
      name: 'Runtime Render',
      description: 'Runtime render profile',
      outline: true,
    })

    const profile = resolveRenderProfile('test-render-runtime')
    expect(profile.name).toBe('Runtime Render')
    expect(profile.outline).toBe(true)
  })
})
