import { describe, expect, it } from 'vitest'
import type { Atom } from '../lib/molecule'
import type { SceneObject } from '../lib/sceneObject'
import { resolveTheme } from '../presets'
import { resolveMeasurementAtoms } from './useRendererMeasurementBinding'
import { resolveRendererTheme } from './useRendererSceneStateBinding'

function sceneObject(id: string, atoms: Atom[]): SceneObject {
  return {
    id,
    name: id,
    visible: true,
    locked: false,
    offset: { x: 0, y: 0, z: 0 },
    createdAt: 0,
    molecule: { name: id, atoms, bonds: [] },
  }
}

describe('renderer scene binding', () => {
  it('selects the IBOView theme for the IBOView render style', () => {
    const theme = resolveRendererTheme(resolveTheme('default'), 'iboview', 'day')

    expect(theme.metadata.id).toBe('iboview')
  })

  it('forces the dark renderer theme and high-contrast scene colors at night', () => {
    const theme = resolveRendererTheme(resolveTheme('iboview'), 'iboview', 'night')

    expect(theme.metadata.id).toBe('dark')
    expect(theme.scene.backgroundColor).toBe('#000000')
    expect(theme.scene.highlightColor).toBe('#ffffff')
  })

  it('resolves committed and pending measurement atoms across scene objects', () => {
    const atomA: Atom = { id: 'a', symbol: 'C', x: 0, y: 0, z: 0 }
    const atomB: Atom = { id: 'b', symbol: 'O', x: 1, y: 0, z: 0 }
    const result = resolveMeasurementAtoms(
      [sceneObject('first', [atomA]), sceneObject('second', [atomB])],
      [{ id: 'distance', type: 'distance', atomIds: ['a', 'b'] }],
      ['b'],
    )

    expect(result.committed).toEqual([{
      type: 'distance',
      atoms: [atomA, atomB],
      expected: 2,
    }])
    expect(result.pending).toEqual([atomB])
  })

  it('drops committed measurements with missing atoms', () => {
    const atom: Atom = { id: 'a', symbol: 'C', x: 0, y: 0, z: 0 }
    const result = resolveMeasurementAtoms(
      [sceneObject('first', [atom])],
      [{ id: 'distance', type: 'distance', atomIds: ['a', 'missing'] }],
      ['missing'],
    )

    expect(result).toEqual({ committed: [], pending: [] })
  })
})
