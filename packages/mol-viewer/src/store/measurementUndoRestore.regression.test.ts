/**
 * 回归：删原子后 undo 恢复原子，测量必须跟着复活（2026-07-26 审查 store-undo 维度）。
 *
 * measurements 在 editorStore、不进 undo 历史；integrity 在原子被删时把
 * 引用失效的测量"停放"到 orphanedMeasurements 而不是销毁，原子恢复
 * （undo）后原样复活。否则「删原子 → Ctrl+Z」这对互逆操作会让测量永久蒸发。
 */
import { describe, it, expect } from 'vitest'
import { createMoleculeStore } from './moleculeStore'
import { createEditorStore } from './editorStore'
import type { Molecule } from '../lib/molecule'

const twoCarbons = (): Molecule => ({
  name: 'c2',
  atoms: [
    { id: 'a1', symbol: 'C', x: 0, y: 0, z: 0 },
    { id: 'a2', symbol: 'C', x: 1.5, y: 0, z: 0 },
  ],
  bonds: [{ id: 'b1', atomId1: 'a1', atomId2: 'a2', order: 1 }],
})

function setup() {
  const molStore = createMoleculeStore()
  const editor = createEditorStore(molStore)
  molStore.getState().setMolecule(twoCarbons())
  editor.getState().setMeasureType('distance')
  editor.getState().addMeasureAtom('a1')
  editor.getState().addMeasureAtom('a2')
  expect(editor.getState().measurements).toHaveLength(1)
  return { molStore, editor }
}

const atomIds = (molStore: ReturnType<typeof createMoleculeStore>) => {
  const s = molStore.getState()
  return s.objectsById[s.activeObjectId!]!.molecule.atoms.map(a => a.id)
}

describe('测量在删原子 → undo 后的存续', () => {
  it('删原子停放测量，undo 恢复原子后测量复活', () => {
    const { molStore, editor } = setup()

    molStore.getState().removeAtom('a2')
    expect(editor.getState().measurements).toHaveLength(0) // 可见列表无僵尸
    expect(editor.getState().orphanedMeasurements).toHaveLength(1) // 但没被销毁

    molStore.temporal.getState().undo()
    expect(atomIds(molStore)).toContain('a2')
    expect(editor.getState().measurements).toHaveLength(1) // 复活
    expect(editor.getState().measurements[0]!.atomIds).toEqual(['a1', 'a2'])
    expect(editor.getState().orphanedMeasurements).toHaveLength(0)
  })

  it('redo 再删原子时测量再次停放（对称往返）', () => {
    const { molStore, editor } = setup()
    molStore.getState().removeAtom('a2')
    molStore.temporal.getState().undo()
    molStore.temporal.getState().redo()

    expect(atomIds(molStore)).not.toContain('a2')
    expect(editor.getState().measurements).toHaveLength(0)
    expect(editor.getState().orphanedMeasurements).toHaveLength(1)
  })

  it('用户显式清除所有测量后，undo 恢复原子不复活旧测量', () => {
    const { molStore, editor } = setup()
    molStore.getState().removeAtom('a2')
    editor.getState().clearMeasurements()

    molStore.temporal.getState().undo()
    expect(atomIds(molStore)).toContain('a2')
    expect(editor.getState().measurements).toHaveLength(0)
    expect(editor.getState().orphanedMeasurements).toHaveLength(0)
  })
})
