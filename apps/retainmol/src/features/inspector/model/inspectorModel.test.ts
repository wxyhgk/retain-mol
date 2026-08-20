import { describe, expect, it } from 'vitest'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { buildInspectorModel } from './inspectorModel'

const molecule: Molecule = {
  name: 'formaldehyde fragment',
  atoms: [
    { id: 'c', symbol: 'C', x: 0, y: 0, z: 0, charge: 1, radical: 1 },
    { id: 'o', symbol: 'O', x: 1.2, y: 0, z: 0 },
    { id: 'h1', symbol: 'H', x: 0, y: 1, z: 0 },
    { id: 'h2', symbol: 'H', x: 0, y: 1, z: 1 },
  ],
  bonds: [
    { id: 'co', atomId1: 'c', atomId2: 'o', order: 2, aromatic: true },
    { id: 'ch', atomId1: 'c', atomId2: 'h1', order: 1 },
  ],
}

describe('buildInspectorModel', () => {
  it('builds a molecule summary when selection is empty', () => {
    const model = buildInspectorModel(molecule, [], [])

    expect(model).toMatchObject({
      mode: 'molecule',
      formula: 'CH2O',
      atomCount: 4,
      bondCount: 2,
    })
    expect(model.mode === 'molecule' ? model.molecularWeight : null).toBeCloseTo(30.026, 6)
  })

  it('describes one atom with its number, inferred hybridization and neighbors', () => {
    const model = buildInspectorModel(molecule, ['c'], [])

    expect(model).toMatchObject({
      mode: 'atom',
      hybridization: 'sp2',
      atom: { number: 1, atom: { id: 'c', charge: 1, radical: 1 } },
      neighbors: [
        { atomNumber: 2, atom: { id: 'o' }, bond: { id: 'co' }, length: 1.2 },
        { atomNumber: 3, atom: { id: 'h1' }, bond: { id: 'ch' }, length: 1 },
      ],
    })
  })

  it('describes one bond and both indexed endpoints', () => {
    const model = buildInspectorModel(molecule, [], ['co'])

    expect(model).toMatchObject({
      mode: 'bond',
      bond: { id: 'co', order: 2, aromatic: true },
      first: { number: 1, atom: { id: 'c' } },
      second: { number: 2, atom: { id: 'o' } },
      length: 1.2,
    })
  })

  it('preserves selection order when calculating multi-atom geometry with label and hint', () => {
    const model = buildInspectorModel(molecule, ['h1', 'c', 'o'], ['ch'])

    expect(model).toMatchObject({
      mode: 'multi',
      selectedAtomCount: 3,
      selectedBondCount: 1,
      atoms: [
        { atom: { id: 'h1' } },
        { atom: { id: 'c' } },
        { atom: { id: 'o' } },
      ],
      geometry: {
        kind: 'angle',
        atomIds: ['h1', 'c', 'o'],
        value: 90,
        label: 'H—C—O',
        editHint: '键角顶点 = 第 2 个选中原子 · 转动末端一侧',
      },
    })
  })

  it('builds distance geometry with label and hint', () => {
    const model = buildInspectorModel(molecule, ['c', 'o'], [])
    expect(model.mode === 'multi' ? model.geometry : null).toMatchObject({
      kind: 'distance',
      label: 'C—O',
      unit: 'Å',
      editHint: '修改距离将平移后选原子一侧',
    })
  })

  it('builds dihedral geometry with label and hint', () => {
    const model = buildInspectorModel(molecule, ['c', 'o', 'h1', 'h2'], [])
    const geometry = model.mode === 'multi' ? model.geometry : null
    expect(geometry?.kind).toBe('dihedral')
    expect(geometry).toMatchObject({
      label: 'C—O—H—H',
      editHint: '二面角绕 2–3 号原子轴转动末端一侧',
    })
  })

  it('ignores stale ids instead of exposing missing entities', () => {
    const model = buildInspectorModel(molecule, ['missing'], ['missing'])

    expect(model.mode).toBe('molecule')
  })
})
