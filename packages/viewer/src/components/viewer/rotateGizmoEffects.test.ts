import { describe, expect, it } from 'vitest'
import type { MoleculeState } from '../../store/slices/types'
import { createRotateGizmoCallbacks, getActiveMoleculeForGizmo } from './rotateGizmoEffects'

describe('rotate gizmo effects', () => {
  it('creates callbacks that resolve molecule, write positions, and forward edit sessions', () => {
    const calls: string[] = []
    const state = {
      objectsById: {
        obj1: {
          id: 'obj1',
          name: 'Object 1',
          molecule: {
            name: 'Active',
            atoms: [{ id: 'a1', symbol: 'C', x: 0, y: 0, z: 0 }],
            bonds: [],
          },
          visible: true,
          locked: false,
          offset: { x: 0, y: 0, z: 0 },
          createdAt: 1,
        },
      },
      objectOrder: ['obj1'],
      activeObjectId: 'obj1',
      setAtomPositions: positions => calls.push(`positions:${positions.size}`),
    } satisfies Pick<MoleculeState, 'objectsById' | 'objectOrder' | 'activeObjectId' | 'setAtomPositions'>

    const callbacks = createRotateGizmoCallbacks(
      () => state,
      {
        start: () => calls.push('start'),
        end: () => calls.push('end'),
      },
    )

    expect(callbacks.getMolecule().name).toBe('Active')
    callbacks.setAtomPositions(new Map([['a1', { x: 1, y: 2, z: 3 }]]))
    callbacks.startEditSession()
    callbacks.endEditSession()

    expect(calls).toEqual(['positions:1', 'start', 'end'])
  })

  it('returns an empty molecule when the active object is missing', () => {
    const molecule = getActiveMoleculeForGizmo({
      objectsById: {},
      activeObjectId: 'missing',
    })

    expect(molecule).toEqual({ atoms: [], bonds: [], name: 'New Molecule' })
  })
})
