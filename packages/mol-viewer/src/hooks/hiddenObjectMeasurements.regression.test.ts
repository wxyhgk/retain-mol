/**
 * 回归：隐藏场景对象后，其测量线/标签不得继续悬浮渲染
 * （2026-07-26 审查 store-undo 维度）。
 *
 * 分子本体按 SceneObject.visible 隐藏（MoleculeSceneLayer），测量解析
 * （resolveMeasurementAtoms）此前不看 visible，隐藏对象的测量成了孤儿图元。
 */
import { describe, it, expect } from 'vitest'
import { resolveMeasurementAtoms } from './useRendererMeasurementBinding'
import type { SceneObject } from '../lib/sceneObject'
import type { Measurement } from '../lib/types'
import type { Molecule } from '../lib/molecule'

function makeObject(idPrefix: string, visible: boolean): SceneObject {
  const molecule: Molecule = {
    name: idPrefix,
    atoms: [
      { id: `${idPrefix}-a1`, symbol: 'C', x: 0, y: 0, z: 0 },
      { id: `${idPrefix}-a2`, symbol: 'C', x: 1.5, y: 0, z: 0 },
    ],
    bonds: [{ id: `${idPrefix}-b1`, atomId1: `${idPrefix}-a1`, atomId2: `${idPrefix}-a2`, order: 1 }],
  }
  return {
    id: idPrefix,
    molecule,
    name: idPrefix,
    visible,
    locked: false,
    offset: { x: 0, y: 0, z: 0 },
    createdAt: 0,
  }
}

const distance = (id: string, atomIds: string[]): Measurement => ({
  id,
  type: 'distance',
  atomIds,
})

describe('隐藏对象的测量解析', () => {
  it('隐藏对象的 committed 测量不参与渲染，可见对象的保留', () => {
    const shown = makeObject('shown', true)
    const hidden = makeObject('hidden', false)
    const measurements = [
      distance('m-shown', ['shown-a1', 'shown-a2']),
      distance('m-hidden', ['hidden-a1', 'hidden-a2']),
    ]

    const { committed } = resolveMeasurementAtoms([shown, hidden], measurements, [])

    expect(committed).toHaveLength(1)
    expect(committed[0]!.atoms.map(a => a.id)).toEqual(['shown-a1', 'shown-a2'])
  })

  it('隐藏对象的 pending 测量原子同样被过滤', () => {
    const shown = makeObject('shown', true)
    const hidden = makeObject('hidden', false)

    const { pending } = resolveMeasurementAtoms(
      [shown, hidden],
      [],
      ['shown-a1', 'hidden-a1'],
    )

    expect(pending.map(a => a.id)).toEqual(['shown-a1'])
  })

  it('重新显示对象后测量恢复参与渲染', () => {
    const hidden = makeObject('obj', false)
    const measurements = [distance('m1', ['obj-a1', 'obj-a2'])]

    expect(resolveMeasurementAtoms([hidden], measurements, []).committed).toHaveLength(0)

    const shown: SceneObject = { ...hidden, visible: true }
    expect(resolveMeasurementAtoms([shown], measurements, []).committed).toHaveLength(1)
  })
})
