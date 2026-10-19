import { describe, expect, it } from 'vitest'
import { newAtom } from '../../../molecule'
import { runMoveAtomCommand } from './atomPositionCommands'

describe('atom position commands', () => {
  it('treats moving an atom to the same coordinates as a no-op', () => {
    const atom = newAtom('C', 1, 2, 3)
    const molecule = { atoms: [atom], bonds: [] }

    expect(runMoveAtomCommand(molecule, atom.id, 1, 2, 3)).toEqual({
      ok: true,
      changed: false,
    })
  })

  it('moves an atom when any coordinate changes', () => {
    const atom = newAtom('C', 1, 2, 3)
    const molecule = { atoms: [atom], bonds: [] }

    const result = runMoveAtomCommand(molecule, atom.id, 1, 2, 4)

    expect(result.ok && result.changed).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms[0]).toMatchObject({ x: 1, y: 2, z: 4 })
  })
})
