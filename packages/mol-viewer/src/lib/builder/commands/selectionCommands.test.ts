import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../molecule'
import {
  runClearSelectionCommand,
  runBondSelectedAtomsCommand,
  runBondSelectedAtomsWithSelectionCommand,
  runBondViaHydrogenWithSelectionCommand,
  runClearMoleculeWithSelectionCommand,
  runSelectAtomCommand,
  runSelectAtomsCommand,
  runSelectBondCommand,
  runSelectConnectedFragmentCommand,
  runPruneSelectionCommand,
  runRemoveAtomIdsFromSelectionCommand,
  runSyncSelectionToMoleculeCommand,
} from './selectionCommands'

describe('selection state commands', () => {
  it('selects, toggles, batches, and clears atom/bond selections', () => {
    const a = runSelectAtomCommand(new Set(['old']), new Set(['b1']), 'a1')
    expect(a.selectedAtomIds).toEqual(new Set(['a1']))
    expect(a.selectedBondIds).toEqual(new Set())

    const toggled = runSelectAtomCommand(new Set(['a1']), new Set(['b1']), 'a1', true)
    expect(toggled.selectedAtomIds).toEqual(new Set())
    expect(toggled.selectedBondIds).toEqual(new Set(['b1']))

    const added = runSelectAtomsCommand(new Set(['a1']), new Set(['b1']), ['a2'], 'add')
    expect(added.selectedAtomIds).toEqual(new Set(['a1', 'a2']))
    expect(added.selectedBondIds).toEqual(new Set(['b1']))

    const bond = runSelectBondCommand(new Set(['a1']), new Set(['b1']), 'b2')
    expect(bond.selectedAtomIds).toEqual(new Set())
    expect(bond.selectedBondIds).toEqual(new Set(['b2']))

    const cleared = runClearSelectionCommand()
    expect(cleared.selectedAtomIds).toEqual(new Set())
    expect(cleared.selectedBondIds).toEqual(new Set())

    const pruned = runPruneSelectionCommand(
      new Set(['a1', 'missing-a']),
      new Set(['b1', 'missing-b']),
      new Set(['a1']),
      new Set(['b1']),
    )
    expect(pruned.selectedAtomIds).toEqual(new Set(['a1']))
    expect(pruned.selectedBondIds).toEqual(new Set(['b1']))

    const removed = runRemoveAtomIdsFromSelectionCommand(
      new Set(['a1', 'a2']),
      new Set(['b1']),
      ['a2'],
    )
    expect(removed.selectedAtomIds).toEqual(new Set(['a1']))
    expect(removed.selectedBondIds).toEqual(new Set(['b1']))
  })

  it('syncs selection to edited molecule membership and optional removed atoms', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1, 0, 0)
    const bond = newBond(c1.id, c2.id)

    const synced = runSyncSelectionToMoleculeCommand({
      selectedAtomIds: new Set([c1.id, c2.id, 'missing-a']),
      selectedBondIds: new Set([bond.id, 'missing-b']),
      molecule: { atoms: [c1, c2], bonds: [bond] },
      removeAtomIds: [c2.id],
    })

    expect(synced.selectedAtomIds).toEqual(new Set([c1.id]))
    expect(synced.selectedBondIds).toEqual(new Set([bond.id]))
  })
})

describe('runBondSelectedAtomsCommand', () => {
  it('requires exactly two selected atoms', () => {
    const c = newAtom('C', 0, 0, 0)

    expect(runBondSelectedAtomsCommand({ atoms: [c], bonds: [] }, {
      atomIds: [c.id],
    })).toEqual({ ok: false, reason: '请先选中恰好两个原子' })
  })

  it('adds a bond between two valid atoms', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.54, 0, 0)

    const result = runBondSelectedAtomsCommand({ atoms: [c1, c2], bonds: [] }, {
      atomIds: [c1.id, c2.id],
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.bonds).toHaveLength(1)
    expect(result.molecule.bonds[0]).toMatchObject({ atomId1: c1.id, atomId2: c2.id })
  })

  it('rejects duplicate bonds', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.54, 0, 0)
    const bond = newBond(c1.id, c2.id)

    expect(runBondSelectedAtomsCommand({ atoms: [c1, c2], bonds: [bond] }, {
      atomIds: [c1.id, c2.id],
    })).toEqual({ ok: false, reason: '已经存在键' })
  })

  it('lets a bonded H slot make way when selected with a target atom', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)
    const c2 = newAtom('C', 2.5, 0, 0)
    const mol = { atoms: [c1, h, c2], bonds: [newBond(c1.id, h.id)] }

    const result = runBondSelectedAtomsCommand(mol, {
      atomIds: [h.id, c2.id],
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms.some(atom => atom.id === h.id)).toBe(false)
    expect(result.molecule.bonds.some(
      bond => (bond.atomId1 === c1.id && bond.atomId2 === c2.id) ||
              (bond.atomId1 === c2.id && bond.atomId2 === c1.id)
    )).toBe(true)
  })
})

describe('selection-aware bond commands', () => {
  it('syncs selection after bonding via an H slot', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)
    const c2 = newAtom('C', 2.5, 0, 0)
    const ch = newBond(c1.id, h.id)
    const mol = { atoms: [c1, h, c2], bonds: [ch] }

    const result = runBondViaHydrogenWithSelectionCommand(mol, {
      sourceHId: h.id,
      targetId: c2.id,
    }, {
      selectedAtomIds: new Set([h.id, c2.id]),
      selectedBondIds: new Set([ch.id]),
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.selectedAtomIds).toEqual(new Set())
    expect(result.selectedBondIds).toEqual(new Set())
    expect(result.selectionChanged).toBe(true)
  })

  it('keeps selection version unchanged for plain selected-atom bonding', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.54, 0, 0)

    const result = runBondSelectedAtomsWithSelectionCommand({
      atoms: [c1, c2],
      bonds: [],
    }, {
      selectedAtomIds: new Set([c1.id, c2.id]),
      selectedBondIds: new Set(),
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.selectedAtomIds).toEqual(new Set([c1.id, c2.id]))
    expect(result.selectionChanged).toBe(false)
  })

  it('clears molecule and selection as one command', () => {
    const result = runClearMoleculeWithSelectionCommand()

    expect(result.molecule).toEqual({ atoms: [], bonds: [], name: 'New Molecule' })
    expect(result.selectedAtomIds).toEqual(new Set())
    expect(result.selectedBondIds).toEqual(new Set())
    expect(result.selectionChanged).toBe(true)
  })
})

describe('runSelectConnectedFragmentCommand', () => {
  it('returns the connected atom fragment for a picked atom', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.54, 0, 0)
    const o = newAtom('O', 5, 0, 0)
    const mol = { atoms: [c1, c2, o], bonds: [newBond(c1.id, c2.id)] }

    const result = runSelectConnectedFragmentCommand(mol, { atomId: c1.id })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect([...result.atomIds].sort()).toEqual([c1.id, c2.id].sort())
  })

  it('rejects missing atoms', () => {
    expect(runSelectConnectedFragmentCommand({ atoms: [], bonds: [] }, {
      atomId: 'missing',
    })).toEqual({ ok: false, reason: '原子不存在' })
  })
})
