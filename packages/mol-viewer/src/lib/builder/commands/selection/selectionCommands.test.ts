import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../../molecule'
import {
  runClearSelectionCommand,
  runPruneSelectionCommand,
  runRemoveAtomIdsFromSelectionCommand,
  runSelectAtomCommand,
  runSelectAtomsCommand,
  runSelectBondCommand,
  runSelectConnectedFragmentCommand,
  runSyncSelectionToMoleculeCommand,
} from './selectionCommands'

describe('selection state commands', () => {
  it('selects, toggles, batches, and clears atom/bond selections', () => {
    expect(runSelectAtomCommand(new Set(['old']), new Set(['b1']), 'a1'))
      .toMatchObject({ selectedAtomIds: new Set(['a1']), selectedBondIds: new Set() })
    expect(runSelectAtomCommand(new Set(['a1']), new Set(['b1']), 'a1', true))
      .toMatchObject({ selectedAtomIds: new Set(), selectedBondIds: new Set(['b1']) })
    expect(runSelectAtomsCommand(new Set(['a1']), new Set(['b1']), ['a2'], 'add'))
      .toMatchObject({ selectedAtomIds: new Set(['a1', 'a2']) })
    expect(runSelectBondCommand(new Set(['a1']), new Set(['b1']), 'b2'))
      .toMatchObject({ selectedAtomIds: new Set(), selectedBondIds: new Set(['b2']) })
    expect(runClearSelectionCommand(new Set(['a1']), new Set(['b1'])))
      .toMatchObject({ selectedAtomIds: new Set(), selectedBondIds: new Set() })
  })

  it('reports no-op collection transforms accurately', () => {
    expect(runSelectAtomCommand(new Set(['a1']), new Set(), 'a1').selectionChanged).toBe(false)
    expect(runSelectAtomsCommand(new Set(['a1']), new Set(), ['a1'], 'replace').selectionChanged).toBe(false)
    expect(runSelectBondCommand(new Set(), new Set(['b1']), 'b1').selectionChanged).toBe(false)
    expect(runClearSelectionCommand(new Set(), new Set()).selectionChanged).toBe(false)
  })

  it('prunes and syncs selection against molecule membership', () => {
    const c1 = newAtom('C')
    const c2 = newAtom('C', 1.5)
    const bond = newBond(c1.id, c2.id)
    const pruned = runPruneSelectionCommand(
      new Set([c1.id, 'missing']), new Set([bond.id, 'missing']),
      new Set([c1.id]), new Set([bond.id]),
    )
    expect(pruned.selectedAtomIds).toEqual(new Set([c1.id]))
    expect(pruned.selectedBondIds).toEqual(new Set([bond.id]))

    const removed = runRemoveAtomIdsFromSelectionCommand(
      new Set([c1.id, c2.id]), new Set([bond.id]), [c2.id],
    )
    expect(removed.selectedAtomIds).toEqual(new Set([c1.id]))

    const synced = runSyncSelectionToMoleculeCommand({
      selectedAtomIds: new Set([c1.id, c2.id, 'missing']),
      selectedBondIds: new Set([bond.id, 'missing']),
      molecule: { atoms: [c1, c2], bonds: [bond] },
      removeAtomIds: [c2.id],
    })
    expect(synced.selectedAtomIds).toEqual(new Set([c1.id]))
    expect(synced.selectedBondIds).toEqual(new Set([bond.id]))
  })
})

describe('runSelectConnectedFragmentCommand', () => {
  it('returns a connected fragment and rejects missing atoms', () => {
    const c1 = newAtom('C')
    const c2 = newAtom('C', 1.5)
    const o = newAtom('O', 5)
    const molecule = { atoms: [c1, c2, o], bonds: [newBond(c1.id, c2.id)] }
    const result = runSelectConnectedFragmentCommand(molecule, { atomId: c1.id })

    expect(result.ok).toBe(true)
    if (result.ok) expect([...result.atomIds].sort()).toEqual([c1.id, c2.id].sort())
    expect(runSelectConnectedFragmentCommand(molecule, { atomId: 'missing' }))
      .toEqual({ ok: false, reason: '原子不存在' })
  })
})
