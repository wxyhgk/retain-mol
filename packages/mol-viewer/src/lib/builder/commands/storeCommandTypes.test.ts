import { describe, expect, it } from 'vitest'
import { editWithSelection, editWithSelectionSets } from './storeCommandTypes'
import type { Molecule } from '../../molecule'

describe('store command result helpers', () => {
  const molecule: Molecule = { atoms: [], bonds: [], name: 'M' }

  it('creates selection-aware edit results from selection state', () => {
    const selectedAtomIds = new Set(['a1'])
    const selectedBondIds = new Set(['b1'])
    const result = editWithSelection(
      molecule,
      { selectedAtomIds, selectedBondIds },
      { changed: false, selectionChanged: true },
    )

    expect(result).toEqual({
      ok: true,
      changed: false,
      molecule,
      selectedAtomIds: new Set(['a1']),
      selectedBondIds: new Set(['b1']),
      selectionChanged: true,
    })
    expect(result.selectedAtomIds).not.toBe(selectedAtomIds)
    expect(result.selectedBondIds).not.toBe(selectedBondIds)
  })

  it('creates selection-aware edit results from iterables', () => {
    expect(editWithSelectionSets(molecule, ['a1', 'a2'], ['b1'], {
      changed: true,
    })).toEqual({
      ok: true,
      changed: true,
      molecule,
      selectedAtomIds: new Set(['a1', 'a2']),
      selectedBondIds: new Set(['b1']),
      selectionChanged: undefined,
    })
  })
})
