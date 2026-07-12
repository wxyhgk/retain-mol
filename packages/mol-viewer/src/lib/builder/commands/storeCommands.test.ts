import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '../../molecule'
import {
  runAddAtomCommand,
  getAddOneHydrogenAvailabilityCommand,
  getAddOneHydrogensAvailabilityCommand,
  runAddHydrogensCommand,
  runAddOneHydrogenCommand,
  runAddOneHydrogensCommand,
  runGrowFromHydrogenCommand,
  runRemoveAtomCommand,
  runRemoveAtomsCommand,
  runReplaceAtomCommand,
  runReplaceAtomsCommand,
  runSetAtomChargeCommand,
} from './atom'
import {
  runAddBondCommand,
  runAutoInferBondsCommand,
  runBondViaHydrogenCommand,
  runCycleBondOrderCommand,
  runRemoveBondCommand,
} from './bond'
import { runCopySelectionCommand, runPasteAtomsCommand } from './clipboard'
import { runMoveAtomCommand, runSetBondLengthCommand } from './geometry'
import {
  runAddSceneObjectCommand,
  runCenterMoleculeCommand,
  runClearMoleculeCommand,
  runRemoveSceneObjectCommand,
  runRenameSceneObjectCommand,
  runSetActiveSceneObjectCommand,
  runSetSceneObjectLockedCommand,
  runSetSceneObjectVisibleCommand,
  runSplitSceneObjectCommand,
  runResetSceneToMoleculeCommand,
  runSetMoleculeInSceneCommand,
  runSetMoleculeCommand,
  runSetSceneObjectAtomPositionsCommand,
} from './scene'
import { runRemoveSelectedCommand } from './interaction'

describe('store basic molecule commands', () => {
  it('wraps scene object creation with auto-offset and unique molecule ids', () => {
    const existingC = newAtom('C', 0, 0, 0)
    const existingH = newAtom('H', 1, 0, 0)
    const existingBond = newBond(existingC.id, existingH.id)
    const incoming = {
      atoms: [
        { ...existingC, x: 0, y: 0, z: 0 },
        { ...existingH, x: 1, y: 0, z: 0 },
      ],
      bonds: [
        { ...existingBond },
      ],
      name: 'Incoming',
    }

    const result = runAddSceneObjectCommand(incoming, [{
      id: 'existing',
      molecule: { atoms: [existingC, existingH], bonds: [existingBond], name: 'Existing' },
      name: 'Existing',
      visible: true,
      locked: false,
      offset: { x: 0, y: 0, z: 0 },
      createdAt: 1,
    }], { objectId: 'new-object' })

    expect(result.object.id).toBe('new-object')
    expect(result.object.name).toBe('Incoming')
    expect(result.object.molecule.atoms[0].x).toBeGreaterThan(incoming.atoms[0].x)
    expect(result.object.molecule.atoms.map(atom => atom.id)).not.toContain(existingC.id)
    expect(result.object.molecule.atoms.map(atom => atom.id)).not.toContain(existingH.id)
    expect(result.object.molecule.bonds.map(bond => bond.id)).not.toContain(existingBond.id)
    expect(result.object.molecule.bonds[0].atomId1).toBe(result.object.molecule.atoms[0].id)
    expect(result.object.molecule.bonds[0].atomId2).toBe(result.object.molecule.atoms[1].id)
  })

  it('keeps auto-offset scene additions clear of existing atoms', () => {
    const existingC = newAtom('C', 0, 0, 0)
    const incoming = {
      atoms: [newAtom('C', -5, 0, 0)],
      bonds: [],
      name: 'Incoming',
    }

    const result = runAddSceneObjectCommand(incoming, [{
      id: 'existing',
      molecule: { atoms: [existingC], bonds: [], name: 'Existing' },
      name: 'Existing',
      visible: true,
      locked: false,
      offset: { x: 0, y: 0, z: 0 },
      createdAt: 1,
    }], { objectId: 'new-object' })

    const placed = result.object.molecule.atoms[0]
    expect(Math.hypot(placed.x - existingC.x, placed.y - existingC.y, placed.z - existingC.z))
      .toBeGreaterThan(0.5)
  })

  it('wraps resetting a scene to a single molecule object', () => {
    const c = newAtom('C', 0, 0, 0)
    const molecule = { atoms: [c], bonds: [], name: 'Single' }

    const result = runResetSceneToMoleculeCommand(molecule)

    expect(result.object.molecule).toBe(molecule)
    expect(result.object.name).toBe('Single')
    expect(result.object.id).toBeTruthy()
  })

  it('sets a molecule into the active scene object or creates a replacement scene', () => {
    const oldAtom = newAtom('C', 0, 0, 0)
    const nextAtom = newAtom('O', 1, 0, 0)
    const object = {
      id: 'active',
      molecule: { atoms: [oldAtom], bonds: [], name: 'Old' },
      name: 'Old',
      visible: true,
      locked: false,
      offset: { x: 0, y: 0, z: 0 },
      createdAt: 1,
    }

    const activeResult = runSetMoleculeInSceneCommand(
      { active: object },
      ['active'],
      'active',
      { atoms: [nextAtom], bonds: [], name: 'Next' },
    )

    expect(activeResult.objectsById.active.molecule.atoms).toEqual([nextAtom])
    expect(activeResult.objectsById.active.name).toBe('Next')
    expect(activeResult.objectOrder).toEqual(['active'])
    expect(activeResult.activeObjectId).toBe('active')
    expect(activeResult.clearSelection).toBe(true)

    const resetResult = runSetMoleculeInSceneCommand({}, [], null, {
      atoms: [nextAtom],
      bonds: [],
      name: 'Reset',
    })

    expect(resetResult.objectOrder).toEqual([resetResult.activeObjectId])
    expect(resetResult.objectsById[resetResult.activeObjectId].name).toBe('Reset')
    expect(resetResult.clearSelection).toBe(true)

    const appendedResult = runSetMoleculeInSceneCommand(
      { active: object },
      ['active'],
      null,
      { atoms: [nextAtom], bonds: [], name: 'Appended' },
    )

    expect(appendedResult.objectOrder).toEqual(['active', appendedResult.activeObjectId])
    expect(appendedResult.objectsById.active).toBe(object)
    expect(appendedResult.objectsById[appendedResult.activeObjectId].name).toBe('Appended')
  })

  it('rewrites setMolecule ids that collide with other scene objects', () => {
    const occupied = {
      id: 'occupied',
      molecule: {
        atoms: [
          { id: 'a1', symbol: 'C', x: 0, y: 0, z: 0 },
          { id: 'a2', symbol: 'C', x: 1.4, y: 0, z: 0 },
        ],
        bonds: [{ id: 'b1', atomId1: 'a1', atomId2: 'a2', order: 1 as const }],
      },
      name: 'Occupied',
      visible: true,
      locked: false,
      offset: { x: 0, y: 0, z: 0 },
      createdAt: 1,
    }
    const active = {
      ...occupied,
      id: 'active',
      molecule: { atoms: [], bonds: [] },
      name: 'Active',
      createdAt: 2,
    }
    const incoming = occupied.molecule

    const result = runSetMoleculeInSceneCommand(
      { occupied, active },
      ['occupied', 'active'],
      'active',
      incoming,
    )

    const replaced = result.objectsById.active.molecule
    expect(replaced.atoms.map(atom => atom.id)).not.toEqual(['a1', 'a2'])
    expect(replaced.bonds[0].id).not.toBe('b1')
    expect(replaced.bonds[0].atomId1).toBe(replaced.atoms[0].id)
    expect(replaced.bonds[0].atomId2).toBe(replaced.atoms[1].id)
    expect(result.objectsById.occupied).toBe(occupied)
  })

  it('updates atom positions for a specific scene object', () => {
    const c = newAtom('C', 0, 0, 0)
    const object = {
      id: 'obj',
      molecule: { atoms: [c], bonds: [], name: 'Object' },
      name: 'Object',
      visible: true,
      locked: false,
      offset: { x: 0, y: 0, z: 0 },
      createdAt: 1,
    }

    const result = runSetSceneObjectAtomPositionsCommand(
      { obj: object },
      'obj',
      new Map([[c.id, { x: 2, y: 3, z: 4 }]]),
    )

    expect(result.changed).toBe(true)
    if (!result.changed) return
    expect(result.objectsById.obj.molecule.atoms[0]).toMatchObject({ x: 2, y: 3, z: 4 })
    expect(runSetSceneObjectAtomPositionsCommand({ obj: object }, 'missing', new Map()).changed).toBe(false)
  })

  it('wraps scene object removal and reports when selection must be cleared', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1, 0, 0)
    const objectA = {
      id: 'a',
      molecule: { atoms: [c1], bonds: [], name: 'A' },
      name: 'A',
      visible: true,
      locked: false,
      offset: { x: 0, y: 0, z: 0 },
      createdAt: 1,
    }
    const objectB = {
      id: 'b',
      molecule: { atoms: [c2], bonds: [], name: 'B' },
      name: 'B',
      visible: true,
      locked: false,
      offset: { x: 0, y: 0, z: 0 },
      createdAt: 2,
    }

    const result = runRemoveSceneObjectCommand({ a: objectA, b: objectB }, ['a', 'b'], 'b', 'b')

    expect(result.changed).toBe(true)
    if (!result.changed) return
    expect(result.objectsById).toEqual({ a: objectA })
    expect(result.objectOrder).toEqual(['a'])
    expect(result.activeObjectId).toBe('a')
    expect(result.clearSelection).toBe(true)
    expect(runRemoveSceneObjectCommand({ a: objectA }, ['a'], 'a', 'missing').changed).toBe(false)
  })

  it('wraps scene object split as one scene command', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const h1 = newAtom('H', 1, 0, 0)
    const c2 = newAtom('C', 4, 0, 0)
    const h2 = newAtom('H', 5, 0, 0)
    const object = {
      id: 'mixed',
      molecule: {
        atoms: [c1, h1, c2, h2],
        bonds: [newBond(c1.id, h1.id), newBond(c2.id, h2.id)],
        name: 'Mixed',
      },
      name: 'Mixed',
      visible: false,
      locked: true,
      offset: { x: 0, y: 0, z: 0 },
      createdAt: 1,
    }
    const other = {
      id: 'other',
      molecule: { atoms: [newAtom('O', 0, 0, 0)], bonds: [], name: 'Other' },
      name: 'Other',
      visible: true,
      locked: false,
      offset: { x: 0, y: 0, z: 0 },
      createdAt: 2,
    }

    const result = runSplitSceneObjectCommand({ mixed: object, other }, ['other', 'mixed'], 'mixed', ['part-a', 'part-b'])

    expect(result.changed).toBe(true)
    if (!result.changed) return
    expect(result.objectOrder).toEqual(['other', 'part-a', 'part-b'])
    expect(result.activeObjectId).toBe('part-a')
    expect(result.clearSelection).toBe(true)
    expect(result.objectsById.mixed).toBeUndefined()
    expect(result.objectsById.other).toBe(other)
    expect(result.objectsById['part-a']).toMatchObject({ visible: false, locked: true })
    expect(result.objectsById['part-b']).toMatchObject({ visible: false, locked: true })
    expect(result.objectsById['part-a'].molecule.atoms).toHaveLength(2)
    expect(result.objectsById['part-b'].molecule.atoms).toHaveLength(2)
  })

  it('wraps active scene object and object metadata updates', () => {
    const c = newAtom('C', 0, 0, 0)
    const object = {
      id: 'a',
      molecule: { atoms: [c], bonds: [], name: 'A' },
      name: 'A',
      visible: true,
      locked: false,
      offset: { x: 0, y: 0, z: 0 },
      createdAt: 1,
    }

    const active = runSetActiveSceneObjectCommand({ a: object }, null, 'a')
    expect(active).toEqual({ ok: true, changed: true, activeObjectId: 'a', clearSelection: true })
    expect(runSetActiveSceneObjectCommand({ a: object }, 'a', 'a').changed).toBe(false)
    expect(runSetActiveSceneObjectCommand({ a: object }, 'a', 'missing').changed).toBe(false)

    const hidden = runSetSceneObjectVisibleCommand({ a: object }, 'a', false)
    expect(hidden.changed).toBe(true)
    if (!hidden.changed) return
    expect(hidden.objectsById.a.visible).toBe(false)
    expect(runSetSceneObjectVisibleCommand(hidden.objectsById, 'a', false).changed).toBe(false)

    const locked = runSetSceneObjectLockedCommand({ a: object }, 'a', true)
    expect(locked.changed).toBe(true)
    if (!locked.changed) return
    expect(locked.objectsById.a.locked).toBe(true)

    const renamed = runRenameSceneObjectCommand({ a: object }, 'a', 'Renamed')
    expect(renamed.changed).toBe(true)
    if (!renamed.changed) return
    expect(renamed.objectsById.a.name).toBe('Renamed')
  })

  it('wraps whole-molecule replacement as a command result', () => {
    const c = newAtom('C', 0, 0, 0)
    const molecule = { atoms: [c], bonds: [], name: 'Template' }

    const result = runSetMoleculeCommand(molecule)

    expect(result).toEqual({ ok: true, changed: true, molecule })
  })

  it('adds and moves atoms through command results', () => {
    const added = runAddAtomCommand({ atoms: [], bonds: [] }, 'C', 1, 2, 3)
    expect(added.molecule.atoms).toHaveLength(1)
    expect(added.molecule.atoms[0]).toMatchObject({ id: added.atomId, symbol: 'C', x: 1, y: 2, z: 3 })

    const moved = runMoveAtomCommand(added.molecule, added.atomId, 4, 5, 6)
    expect(moved.ok).toBe(true)
    if (!moved.ok || !moved.changed) return
    expect(moved.molecule.atoms[0]).toMatchObject({ x: 4, y: 5, z: 6 })
  })

  it('cycles bond order and can infer, clear, and center molecules', () => {
    const c1 = newAtom('C', 10, 0, 0)
    const c2 = newAtom('C', 11.54, 0, 0)
    const bond = newBond(c1.id, c2.id, 1)

    const cycled = runCycleBondOrderCommand({ atoms: [c1, c2], bonds: [bond] }, bond.id)
    expect(cycled.ok).toBe(true)
    if (!cycled.ok || !cycled.changed) return
    expect(cycled.molecule.bonds[0].order).toBe(2)

    const inferred = runAutoInferBondsCommand({ atoms: [c1, c2], bonds: [] })
    expect(inferred.ok).toBe(true)
    if (!inferred.ok || !inferred.changed) return
    expect(inferred.molecule.bonds.length).toBeGreaterThan(0)

    const centered = runCenterMoleculeCommand({ atoms: [c1, c2], bonds: [bond] })
    expect(centered.ok).toBe(true)
    if (!centered.ok || !centered.changed) return
    const centerX = centered.molecule.atoms.reduce((sum, atom) => sum + atom.x, 0) / centered.molecule.atoms.length
    expect(centerX).toBeCloseTo(0)

    expect(runClearMoleculeCommand().molecule).toEqual({ atoms: [], bonds: [], name: 'New Molecule' })
  })
})

describe('runAddBondCommand', () => {
  it('adds a bond with the requested order', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.34, 0, 0)

    const result = runAddBondCommand({ atoms: [c1, c2], bonds: [] }, {
      atomId1: c1.id,
      atomId2: c2.id,
      order: 2,
    })

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.bonds[0]).toMatchObject({
      atomId1: c1.id,
      atomId2: c2.id,
      order: 2,
    })
  })

  it('rejects self bonds, duplicate bonds, and over-valence bonds', () => {
    const h1 = newAtom('H', 0, 0, 0)
    const h2 = newAtom('H', 0.75, 0, 0)
    const h3 = newAtom('H', 1.5, 0, 0)
    const existing = newBond(h1.id, h2.id)

    expect(runAddBondCommand({ atoms: [h1, h2, h3], bonds: [] }, {
      atomId1: h1.id,
      atomId2: h1.id,
    }).ok).toBe(false)

    expect(runAddBondCommand({ atoms: [h1, h2, h3], bonds: [existing] }, {
      atomId1: h1.id,
      atomId2: h2.id,
    }).ok).toBe(false)

    expect(runAddBondCommand({ atoms: [h1, h2, h3], bonds: [existing] }, {
      atomId1: h1.id,
      atomId2: h3.id,
    }).ok).toBe(false)
  })
})

describe('store atom commands', () => {
  it('replaces atom symbols without changing topology', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)
    const bond = newBond(c.id, h.id)

    const result = runReplaceAtomCommand({ atoms: [c, h], bonds: [bond] }, c.id, 'N')

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms.find(atom => atom.id === c.id)?.symbol).toBe('N')
    expect(result.molecule.bonds).toEqual([bond])
  })

  it('replaces multiple atom symbols in one command without changing topology', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.5, 0, 0)
    const h = newAtom('H', 2.5, 0, 0)
    const b12 = newBond(c1.id, c2.id)
    const b2h = newBond(c2.id, h.id)

    const result = runReplaceAtomsCommand(
      { atoms: [c1, c2, h], bonds: [b12, b2h] },
      [c1.id, c2.id],
      'N',
    )

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms.map(atom => [atom.id, atom.symbol])).toEqual([
      [c1.id, 'N'],
      [c2.id, 'N'],
      [h.id, 'H'],
    ])
    expect(result.molecule.bonds).toEqual([b12, b2h])
  })

  it('adds one hydrogen or saturates hydrogens through command results', () => {
    const c = newAtom('C', 0, 0, 0)

    const one = runAddOneHydrogenCommand({ atoms: [c], bonds: [] }, c.id)
    expect(one.ok).toBe(true)
    if (!one.ok || !one.changed) return
    expect(one.molecule.atoms.filter(atom => atom.symbol === 'H')).toHaveLength(1)

    const saturated = runAddHydrogensCommand({ atoms: [c], bonds: [] }, c.id)
    expect(saturated.ok).toBe(true)
    if (!saturated.ok || !saturated.changed) return
    expect(saturated.molecule.atoms.filter(atom => atom.symbol === 'H')).toHaveLength(4)
  })

  it('reports whether one hydrogen can be added before UI invokes the edit command', () => {
    const c = newAtom('C', 0, 0, 0)
    const h1 = newAtom('H', 1, 0, 0)
    const h2 = newAtom('H', -1, 0, 0)
    const h3 = newAtom('H', 0, 1, 0)
    const h4 = newAtom('H', 0, -1, 0)
    const saturatedCarbon = {
      atoms: [c, h1, h2, h3, h4],
      bonds: [
        newBond(c.id, h1.id),
        newBond(c.id, h2.id),
        newBond(c.id, h3.id),
        newBond(c.id, h4.id),
      ],
    }

    expect(getAddOneHydrogenAvailabilityCommand({ atoms: [c], bonds: [] }, c.id)).toEqual({ ok: true })
    expect(getAddOneHydrogenAvailabilityCommand({ atoms: [c], bonds: [] }, 'missing')).toEqual({
      ok: false,
      reason: '原子不存在',
    })
    expect(getAddOneHydrogenAvailabilityCommand({ atoms: [h1], bonds: [] }, h1.id)).toEqual({
      ok: false,
      reason: 'H 不能继续加 H',
    })
    expect(getAddOneHydrogenAvailabilityCommand(saturatedCarbon, c.id)).toEqual({
      ok: false,
      reason: '已满键，无法加 H',
    })
  })

  it('reports batch hydrogen availability and the allowed subset', () => {
    const c = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1, 0, 0)

    expect(getAddOneHydrogensAvailabilityCommand({ atoms: [c, h], bonds: [] }, [c.id, h.id])).toEqual({
      ok: true,
      allowedAtomIds: [c.id],
    })
    expect(getAddOneHydrogensAvailabilityCommand({ atoms: [h], bonds: [] }, [h.id])).toEqual({
      ok: false,
      allowedAtomIds: [],
      reason: 'H 不能继续加 H',
    })
    expect(getAddOneHydrogensAvailabilityCommand({ atoms: [c], bonds: [] }, [])).toEqual({
      ok: false,
      allowedAtomIds: [],
      reason: '没有选中原子',
    })
  })

  it('adds one hydrogen to multiple atoms in one command', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 2, 0, 0)

    const result = runAddOneHydrogensCommand({ atoms: [c1, c2], bonds: [] }, [c1.id, c2.id])

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms.filter(atom => atom.symbol === 'H')).toHaveLength(2)
    expect(result.molecule.bonds).toHaveLength(2)
    expect(result.molecule.bonds.every(bond => bond.atomId1 === c1.id || bond.atomId1 === c2.id)).toBe(true)
  })

  it('grows from a bonded hydrogen and bonds through a hydrogen slot', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const h = newAtom('H', 1.09, 0, 0)
    const c2 = newAtom('C', 2.5, 0, 0)
    const mol = { atoms: [c1, h, c2], bonds: [newBond(c1.id, h.id)] }

    const grown = runGrowFromHydrogenCommand(mol, h.id, 'C')
    expect(grown.ok).toBe(true)
    if (!grown.ok || !grown.changed) return
    expect(grown.molecule.atoms.find(atom => atom.id === h.id)?.symbol).toBe('C')

    const bonded = runBondViaHydrogenCommand(mol, h.id, c2.id)
    expect(bonded.ok).toBe(true)
    if (!bonded.ok || !bonded.changed) return
    expect(bonded.molecule.atoms.some(atom => atom.id === h.id)).toBe(false)
    expect(bonded.molecule.bonds.some(
      bond => (bond.atomId1 === c1.id && bond.atomId2 === c2.id) ||
              (bond.atomId1 === c2.id && bond.atomId2 === c1.id)
    )).toBe(true)
  })
})

describe('store deletion and clipboard commands', () => {
  it('removes an atom, attached bonds, and stale selection ids', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.5, 0, 0)
    const bond = newBond(c1.id, c2.id)

    const result = runRemoveAtomCommand(
      { atoms: [c1, c2], bonds: [bond] },
      c1.id,
      { selectedAtomIds: new Set([c1.id, c2.id]), selectedBondIds: new Set([bond.id]) },
    )

    expect(result.moleculeChanged).toBe(true)
    expect(result.molecule.atoms.map(atom => atom.id)).toEqual([c2.id])
    expect(result.molecule.bonds).toHaveLength(0)
    expect(result.selectedAtomIds).toEqual(new Set([c2.id]))
    expect(result.selectedBondIds).toEqual(new Set())
  })

  it('removes multiple atoms, attached bonds, and stale selection ids in one command', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.5, 0, 0)
    const c3 = newAtom('C', 3, 0, 0)
    const c4 = newAtom('C', 4.5, 0, 0)
    const b12 = newBond(c1.id, c2.id)
    const b23 = newBond(c2.id, c3.id)
    const b34 = newBond(c3.id, c4.id)

    const result = runRemoveAtomsCommand(
      { atoms: [c1, c2, c3, c4], bonds: [b12, b23, b34] },
      [c1.id, c3.id],
      { selectedAtomIds: new Set([c1.id, c2.id, c3.id]), selectedBondIds: new Set([b12.id, b23.id, b34.id]) },
    )

    expect(result.moleculeChanged).toBe(true)
    expect(result.molecule.atoms.map(atom => atom.id)).toEqual([c2.id, c4.id])
    expect(result.molecule.bonds).toHaveLength(0)
    expect(result.selectedAtomIds).toEqual(new Set([c2.id]))
    expect(result.selectedBondIds).toEqual(new Set())
  })

  it('removes a selected bond without touching selected atoms', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.5, 0, 0)
    const bond = newBond(c1.id, c2.id)

    const result = runRemoveBondCommand(
      { atoms: [c1, c2], bonds: [bond] },
      bond.id,
      { selectedAtomIds: new Set([c1.id]), selectedBondIds: new Set([bond.id]) },
    )

    expect(result.moleculeChanged).toBe(true)
    expect(result.molecule.bonds).toHaveLength(0)
    expect(result.selectedAtomIds).toEqual(new Set([c1.id]))
    expect(result.selectedBondIds).toEqual(new Set())
  })

  it('removes all selected atoms and explicit selected bonds in one command', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.5, 0, 0)
    const c3 = newAtom('C', 3, 0, 0)
    const b12 = newBond(c1.id, c2.id)
    const b23 = newBond(c2.id, c3.id)

    const result = runRemoveSelectedCommand(
      { atoms: [c1, c2, c3], bonds: [b12, b23] },
      { selectedAtomIds: new Set([c1.id]), selectedBondIds: new Set([b23.id]) },
    )

    expect(result.moleculeChanged).toBe(true)
    expect(result.molecule.atoms.map(atom => atom.id)).toEqual([c2.id, c3.id])
    expect(result.molecule.bonds).toHaveLength(0)
    expect(result.selectedAtomIds).toEqual(new Set())
    expect(result.selectedBondIds).toEqual(new Set())
  })

  it('copies selected atoms and pastes them with an offset', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('O', 1.2, 0, 0)
    const bond = newBond(c1.id, c2.id, 2)
    const mol = { atoms: [c1, c2], bonds: [bond] }

    const copy = runCopySelectionCommand(mol, new Set([c1.id, c2.id])).clipboard
    expect(copy).not.toBeNull()
    if (!copy) return
    expect(copy.atoms.map(atom => atom.symbol)).toEqual(['C', 'O'])
    expect(copy.bonds).toEqual([{ a: 0, b: 1, order: 2, aromatic: undefined }])

    const pasted = runPasteAtomsCommand(mol, copy, 3)
    expect(pasted.changed).toBe(true)
    if (!pasted.changed) return
    expect(pasted.newAtomIds).toHaveLength(2)
    expect(pasted.molecule.atoms).toHaveLength(4)
    expect(pasted.molecule.bonds).toHaveLength(2)
  })

  it('preserves authored coordination metadata through copy and paste', () => {
    const iron = {
      ...newAtom('Fe', 0, 0, 0),
      coordinationGeometry: 'square-planar',
      coordinationNumber: 4,
      coordinationDirections: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]] as const,
    }
    const copy = runCopySelectionCommand({ atoms: [iron], bonds: [] }, new Set([iron.id])).clipboard
    expect(copy).not.toBeNull()
    if (!copy) return

    const pasted = runPasteAtomsCommand({ atoms: [iron], bonds: [] }, copy, 3)
    expect(pasted.changed).toBe(true)
    if (!pasted.changed) return
    const pastedIron = pasted.molecule.atoms.at(-1)
    expect(pastedIron?.coordinationGeometry).toBe('square-planar')
    expect(pastedIron?.coordinationNumber).toBe(4)
    expect(pastedIron?.coordinationDirections).toEqual(iron.coordinationDirections)
    expect(pastedIron?.coordinationDirections).not.toBe(iron.coordinationDirections)
  })
})

describe('store geometry commands', () => {
  it('sets atom charge through resaturation', () => {
    const n = newAtom('N', 0, 0, 0)

    const result = runSetAtomChargeCommand({ atoms: [n], bonds: [] }, n.id, 1)

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    expect(result.molecule.atoms.find(atom => atom.id === n.id)?.charge).toBe(1)
    expect(result.molecule.atoms.filter(atom => atom.symbol === 'H')).toHaveLength(4)
  })

  it('sets bond length through a geometry command', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1, 0, 0)
    const bond = newBond(c1.id, c2.id)

    const result = runSetBondLengthCommand({ atoms: [c1, c2], bonds: [bond] }, c1.id, c2.id, 2)

    expect(result.ok).toBe(true)
    if (!result.ok || !result.changed) return
    const moved = result.molecule.atoms.find(atom => atom.id === c2.id)!
    expect(Math.hypot(moved.x - c1.x, moved.y - c1.y, moved.z - c1.z)).toBeCloseTo(2)
  })
})
