import { describe, expect, it, vi } from 'vitest'
import type { Atom } from '@retainmol/mol-viewer/core'
import type { GeometryEditActions } from './geometryEditModel'
import { selectGeometryEditActions, selectLiveGeometry } from './geometryEditModel'

const atoms: Atom[] = [
  { id: 'a', symbol: 'H', x: 1, y: 0, z: 0 },
  { id: 'b', symbol: 'C', x: 0, y: 0, z: 0 },
  { id: 'c', symbol: 'C', x: 0, y: 1, z: 0 },
  { id: 'd', symbol: 'H', x: 0, y: 1, z: 1 },
]

function createActions(): GeometryEditActions & {
  setBondLength: ReturnType<typeof vi.fn>
  setBondAngle: ReturnType<typeof vi.fn>
  setDihedralAngle: ReturnType<typeof vi.fn>
} {
  return {
    setBondLength: vi.fn(() => ({ ok: true })),
    setBondAngle: vi.fn(() => ({ ok: true })),
    setDihedralAngle: vi.fn(() => ({ ok: true })),
  }
}

describe('selectLiveGeometry', () => {
  it('selects stable geometry edit action references', () => {
    const actions = createActions()

    expect(selectGeometryEditActions(actions)).toEqual({
      setBondLength: actions.setBondLength,
      setBondAngle: actions.setBondAngle,
      setDihedralAngle: actions.setDihedralAngle,
    })
  })

  it('returns null outside the editable selection sizes', () => {
    const actions = createActions()

    expect(selectLiveGeometry([], actions)).toBeNull()
    expect(selectLiveGeometry([atoms[0]], actions)).toBeNull()
    expect(selectLiveGeometry([...atoms, atoms[0]], actions)).toBeNull()
  })

  it('builds distance geometry and forwards its edit', () => {
    const actions = createActions()
    const geometry = selectLiveGeometry(atoms.slice(0, 2), actions)

    expect(geometry).toMatchObject({
      kind: 'distance',
      label: 'H—C',
      value: 1,
      unit: 'Å',
    })
    expect(geometry?.commit(1.4)).toEqual({ ok: true })
    expect(actions.setBondLength).toHaveBeenCalledWith('a', 'b', 1.4)
  })

  it('builds angle geometry in selection order and forwards its edit', () => {
    const actions = createActions()
    const geometry = selectLiveGeometry(atoms.slice(0, 3), actions)

    expect(geometry).toMatchObject({ kind: 'angle', label: 'H—C—C', value: 90, unit: '°' })
    geometry?.commit(109.5)
    expect(actions.setBondAngle).toHaveBeenCalledWith('a', 'b', 'c', 109.5)
  })

  it('builds dihedral geometry in selection order and forwards its edit', () => {
    const actions = createActions()
    const geometry = selectLiveGeometry(atoms, actions)

    expect(geometry?.kind).toBe('dihedral')
    expect(Math.abs(geometry?.value ?? 0)).toBeCloseTo(90)
    geometry?.commit(120)
    expect(actions.setDihedralAngle).toHaveBeenCalledWith('a', 'b', 'c', 'd', 120)
  })
})
