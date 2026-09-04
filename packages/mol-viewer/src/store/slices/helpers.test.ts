import { describe, expect, it } from 'vitest'
import { newAtom } from '../../lib/molecule'
import { createSceneObject } from '../../lib/sceneObject'
import type { MoleculeState } from './types'
import {
  applyActiveMoleculeEdit,
  applyActiveMoleculeEditWithMeta,
  applyActiveMoleculeEditWithSelection,
  applyActiveMoleculeSelectionCommand,
  applyActiveMoleculeSelectionResult,
  applyActiveSceneObjectResult,
  applyAddSceneObjectResult,
  applyGeomEdit,
  applyGeomEditWithMeta,
  applySceneGraphResult,
  applySceneObjectUpdatedResult,
  applySelectionResult,
  applySetMoleculeInSceneResult,
} from './helpers'

function makeState(): MoleculeState {
  const molecule = { name: 'mol', atoms: [newAtom('C', 0, 0, 0)], bonds: [] }
  const object = createSceneObject(molecule, 'mol')
  return {
    activeObjectId: object.id,
    objectsById: { [object.id]: object },
    objectOrder: [object.id],
    atomPositionVersion: 0,
    selectedAtomIds: new Set<string>(),
    selectedBondIds: new Set<string>(),
    selectionVersion: 0,
  } as MoleculeState
}

describe('applyActiveMoleculeEdit', () => {
  it('patches the active molecule when the command changes it', () => {
    const state = makeState()
    const result = applyActiveMoleculeEdit(state, mol => ({
      ok: true,
      changed: true,
      molecule: { ...mol, name: 'renamed' },
    }))

    expect(result.objectsById?.[state.activeObjectId!].molecule.name).toBe('renamed')
    expect(result.objectsById?.[state.activeObjectId!].name).toBe('renamed')
  })

  it('can bump atom position version for geometry commands', () => {
    const state = makeState()
    const result = applyActiveMoleculeEdit(state, mol => ({
      ok: true,
      changed: true,
      molecule: {
        ...mol,
        atoms: mol.atoms.map(atom => ({ ...atom, x: atom.x + 1 })),
      },
    }), { bumpAtomPositionVersion: true })

    expect(result.atomPositionVersion).toBe(1)
  })

  it('returns an empty patch for missing active molecule and unchanged commands', () => {
    const state = makeState()
    expect(applyActiveMoleculeEdit({ ...state, activeObjectId: null }, () => ({
      ok: true,
      changed: true,
      molecule: { atoms: [], bonds: [] },
    }))).toEqual({})
    expect(applyActiveMoleculeEdit(state, () => ({ ok: true, changed: false }))).toEqual({})
  })
})

describe('scene command result helpers', () => {
  it('applies add scene object results and clears selection', () => {
    const state = {
      ...makeState(),
      selectedAtomIds: new Set(['a1']),
      selectedBondIds: new Set(['b1']),
      selectionVersion: 9,
    } as MoleculeState
    const object = createSceneObject({ name: 'added', atoms: [newAtom('N', 0, 0, 0)], bonds: [] }, 'added')

    const result = applyAddSceneObjectResult(state, {
      ok: true,
      changed: true,
      object,
    })

    expect(result.objectsById).toEqual({ ...state.objectsById, [object.id]: object })
    expect(result.objectOrder).toEqual([...state.objectOrder, object.id])
    expect(result.activeObjectId).toBe(object.id)
    expect(result.selectedAtomIds).toEqual(new Set())
    expect(result.selectedBondIds).toEqual(new Set())
    expect(result.selectionVersion).toBe(10)
  })

  it('applies active scene object results with optional selection clearing', () => {
    const state = {
      ...makeState(),
      selectedAtomIds: new Set(['a1']),
      selectedBondIds: new Set(['b1']),
      selectionVersion: 2,
    } as MoleculeState

    expect(applyActiveSceneObjectResult(state, { ok: true, changed: false })).toEqual({})
    expect(applyActiveSceneObjectResult(state, {
      ok: true,
      changed: true,
      activeObjectId: 'next',
      clearSelection: false,
    })).toEqual({ activeObjectId: 'next' })

    const cleared = applyActiveSceneObjectResult(state, {
      ok: true,
      changed: true,
      activeObjectId: 'next',
      clearSelection: true,
    })
    expect(cleared.activeObjectId).toBe('next')
    expect(cleared.selectedAtomIds).toEqual(new Set())
    expect(cleared.selectedBondIds).toEqual(new Set())
    expect(cleared.selectionVersion).toBe(3)
  })

  it('applies scene graph results and clears selection only when requested', () => {
    const state = {
      ...makeState(),
      selectedAtomIds: new Set(['a1']),
      selectedBondIds: new Set(['b1']),
      selectionVersion: 4,
    } as MoleculeState
    const object = state.objectsById[state.activeObjectId!]
    const nextObjectsById = { [object.id]: { ...object, name: 'next' } }
    const graphResult = {
      ok: true as const,
      changed: true as const,
      objectsById: nextObjectsById,
      objectOrder: [object.id],
      activeObjectId: object.id,
      clearSelection: false,
    }

    expect(applySceneGraphResult(state, { ok: true, changed: false })).toEqual({})
    expect(applySceneGraphResult(state, graphResult)).toEqual({
      objectsById: nextObjectsById,
      objectOrder: [object.id],
      activeObjectId: object.id,
    })

    const cleared = applySceneGraphResult(state, { ...graphResult, clearSelection: true })
    expect(cleared.selectedAtomIds).toEqual(new Set())
    expect(cleared.selectedBondIds).toEqual(new Set())
    expect(cleared.selectionVersion).toBe(5)
  })

  it('applies set molecule scene results and clears selection', () => {
    const state = {
      ...makeState(),
      selectedAtomIds: new Set(['a1']),
      selectedBondIds: new Set(['b1']),
      selectionVersion: 2,
    } as MoleculeState
    const molecule = { name: 'replacement', atoms: [newAtom('O', 0, 0, 0)], bonds: [] }
    const object = createSceneObject(molecule, 'replacement')

    const result = applySetMoleculeInSceneResult(state, {
      ok: true,
      changed: true,
      objectsById: { [object.id]: object },
      objectOrder: [object.id],
      activeObjectId: object.id,
      clearSelection: true,
    })

    expect(result.objectsById).toEqual({ [object.id]: object })
    expect(result.objectOrder).toEqual([object.id])
    expect(result.activeObjectId).toBe(object.id)
    expect(result.selectedAtomIds).toEqual(new Set())
    expect(result.selectedBondIds).toEqual(new Set())
    expect(result.selectionVersion).toBe(3)
  })

  it('applies scene object updates and can bump atom position version', () => {
    const state = makeState()
    const object = state.objectsById[state.activeObjectId!]
    const molecule = {
      ...object.molecule,
      atoms: object.molecule.atoms.map(atom => ({ ...atom, x: atom.x + 1 })),
    }
    const objectsById = {
      ...state.objectsById,
      [object.id]: { ...object, molecule },
    }

    const result = applySceneObjectUpdatedResult(state, {
      ok: true,
      changed: true,
      objectsById,
    }, { bumpAtomPositionVersion: true })

    expect(result.objectsById).toBe(objectsById)
    expect(result.atomPositionVersion).toBe(1)
    expect(applySceneObjectUpdatedResult(state, { ok: true, changed: false })).toEqual({})
  })
})

describe('applySelectionResult', () => {
  it('patches selection sets and bumps selectionVersion', () => {
    const state = {
      ...makeState(),
      selectedAtomIds: new Set(['old-a']),
      selectedBondIds: new Set(['old-b']),
      selectionVersion: 4,
    } as MoleculeState

    const result = applySelectionResult(state, {
      selectionChanged: true,
      selectedAtomIds: new Set(['new-a']),
      selectedBondIds: new Set(['new-b']),
    })

    expect(result.selectedAtomIds).toEqual(new Set(['new-a']))
    expect(result.selectedBondIds).toEqual(new Set(['new-b']))
    expect(result.selectionVersion).toBe(5)
  })
})

describe('applyActiveMoleculeEditWithMeta', () => {
  it('patches active molecule edits and returns command metadata', () => {
    const state = makeState()
    let patch: Partial<MoleculeState> = {}
    const result = applyActiveMoleculeEditWithMeta<{ atomId: string }>(
      () => state,
      fn => { patch = fn(state) },
      mol => ({
        ok: true,
        changed: true,
        molecule: { ...mol, name: 'with atom' },
        atomId: 'a-new',
      }),
      commandResult => ({ atomId: commandResult.atomId }),
    )

    expect(result).toEqual({ ok: true, atomId: 'a-new' })
    expect(patch.objectsById?.[state.activeObjectId!].molecule.name).toBe('with atom')
  })

  it('returns metadata without patching unchanged edits', () => {
    const state = makeState()
    let called = false
    const result = applyActiveMoleculeEditWithMeta<{ newAtomIds: string[] }>(
      () => state,
      () => { called = true },
      () => ({ ok: true, changed: false, newAtomIds: [] }),
      commandResult => ({ newAtomIds: commandResult.newAtomIds ?? [] }),
    )

    expect(result).toEqual({ ok: true, newAtomIds: [] })
    expect(called).toBe(false)
  })
})

describe('applyActiveMoleculeEditWithSelection', () => {
  it('patches molecule and selection from a command result', () => {
    const state = {
      ...makeState(),
      selectedAtomIds: new Set(['old-a']),
      selectedBondIds: new Set(['old-b']),
      selectionVersion: 3,
    } as MoleculeState

    const result = applyActiveMoleculeEditWithSelection(state, mol => ({
      ok: true,
      moleculeChanged: true,
      selectionChanged: true,
      molecule: { ...mol, name: 'edited' },
      selectedAtomIds: new Set(['new-a']),
      selectedBondIds: new Set(),
    }))

    expect(result.objectsById?.[state.activeObjectId!].molecule.name).toBe('edited')
    expect(result.selectedAtomIds).toEqual(new Set(['new-a']))
    expect(result.selectedBondIds).toEqual(new Set())
    expect(result.selectionVersion).toBe(4)
  })

  it('does not replace selection or bump its version when only the molecule changes', () => {
    const state = {
      ...makeState(),
      selectedAtomIds: new Set(['a1', 'a2']),
      selectedBondIds: new Set(),
      selectionVersion: 3,
    } as MoleculeState
    const commandResult = {
      ok: true as const,
      moleculeChanged: true,
      selectionChanged: false,
      molecule: {
        ...state.objectsById[state.activeObjectId!].molecule,
        name: 'bonded',
      },
      selectedAtomIds: new Set(['a1', 'a2']),
      selectedBondIds: new Set<string>(),
    }

    const result = applyActiveMoleculeSelectionResult(state, commandResult)

    expect(result.objectsById?.[state.activeObjectId!].molecule.name).toBe('bonded')
    expect(result.selectionVersion).toBeUndefined()
  })
})

describe('applyActiveMoleculeSelectionCommand', () => {
  it('applies changed selection commands and returns ok', () => {
    const state = {
      ...makeState(),
      selectedAtomIds: new Set(['old-a']),
      selectedBondIds: new Set(['old-b']),
      selectionVersion: 5,
    } as MoleculeState
    let patch: Partial<MoleculeState> = {}

    const result = applyActiveMoleculeSelectionCommand(
      () => state,
      fn => { patch = fn(state) },
      mol => ({
        ok: true,
        moleculeChanged: true,
        selectionChanged: true,
        molecule: { ...mol, name: 'selected edit' },
        selectedAtomIds: new Set(['new-a']),
        selectedBondIds: new Set(),
      }),
    )

    expect(result).toEqual({ ok: true })
    expect(patch.objectsById?.[state.activeObjectId!].molecule.name).toBe('selected edit')
    expect(patch.selectedAtomIds).toEqual(new Set(['new-a']))
    expect(patch.selectedBondIds).toEqual(new Set())
    expect(patch.selectionVersion).toBe(6)
  })

  it('does not patch failed or unchanged selection commands', () => {
    const state = {
      ...makeState(),
      selectedAtomIds: new Set<string>(),
      selectedBondIds: new Set<string>(),
      selectionVersion: 1,
    } as MoleculeState
    let called = false

    expect(applyActiveMoleculeSelectionCommand(
      () => state,
      () => { called = true },
      () => ({ ok: false, reason: 'bad selection edit' }),
    )).toEqual({ ok: false, reason: 'bad selection edit' })
    expect(called).toBe(false)

    expect(applyActiveMoleculeSelectionCommand(
      () => state,
      () => { called = true },
      mol => ({
        ok: true,
        moleculeChanged: false,
        selectionChanged: false,
        molecule: mol,
        selectedAtomIds: new Set<string>(),
        selectedBondIds: new Set<string>(),
      }),
    )).toEqual({ ok: true })
    expect(called).toBe(false)
  })

  it('preserves selectionVersion for commands that keep selection stable', () => {
    const state = {
      ...makeState(),
      selectedAtomIds: new Set(['a1', 'a2']),
      selectedBondIds: new Set<string>(),
      selectionVersion: 7,
    } as MoleculeState
    let patch: Partial<MoleculeState> = {}

    const result = applyActiveMoleculeSelectionCommand(
      () => state,
      fn => { patch = fn(state) },
      mol => ({
        ok: true,
        moleculeChanged: true,
        selectionChanged: false,
        molecule: { ...mol, name: 'bonded' },
        selectedAtomIds: new Set(['a1', 'a2']),
        selectedBondIds: new Set<string>(),
      }),
    )

    expect(result).toEqual({ ok: true })
    expect(patch.objectsById?.[state.activeObjectId!].molecule.name).toBe('bonded')
    expect(patch.selectionVersion).toBeUndefined()
  })

  it('applies selection-only results without patching the molecule', () => {
    const state = {
      ...makeState(),
      selectedAtomIds: new Set(['missing']),
      selectedBondIds: new Set<string>(),
      selectionVersion: 2,
    } as MoleculeState
    const activeMolecule = state.objectsById[state.activeObjectId!].molecule

    const result = applyActiveMoleculeSelectionResult(state, {
      ok: true,
      moleculeChanged: false,
      selectionChanged: true,
      molecule: activeMolecule,
      selectedAtomIds: new Set(),
      selectedBondIds: new Set(),
    })

    expect(result.objectsById).toBeUndefined()
    expect(result.selectedAtomIds).toEqual(new Set())
    expect(result.selectionVersion).toBe(3)
  })
})

describe('applyGeomEdit', () => {
  it('patches the active molecule and bumps atom position version', () => {
    const state = makeState()
    let patch: Partial<MoleculeState> = {}
    const result = applyGeomEdit(
      () => state,
      fn => { patch = fn(state) },
      mol => ({
        ok: true,
        changed: true,
        molecule: {
          ...mol,
          atoms: mol.atoms.map(atom => ({ ...atom, x: atom.x + 1 })),
        },
      }),
    )

    expect(result).toEqual({ ok: true })
    expect(patch.atomPositionVersion).toBe(1)
    expect(patch.objectsById?.[state.activeObjectId!].molecule.atoms[0].x).toBe(1)
  })

  it('returns failures and unchanged edits without patching state', () => {
    const state = makeState()
    let called = false

    expect(applyGeomEdit(
      () => state,
      () => { called = true },
      () => ({ ok: false, reason: 'bad geometry' }),
    )).toEqual({ ok: false, reason: 'bad geometry' })
    expect(called).toBe(false)

    expect(applyGeomEdit(
      () => state,
      () => { called = true },
      () => ({ ok: true, changed: false }),
    )).toEqual({ ok: true })
    expect(called).toBe(false)
  })
})

describe('applyGeomEditWithMeta', () => {
  it('patches geometry edits, bumps atom position version, and returns metadata', () => {
    const state = makeState()
    let patch: Partial<MoleculeState> = {}
    const result = applyGeomEditWithMeta<{ moved: boolean }>(
      () => state,
      fn => { patch = fn(state) },
      mol => ({
        ok: true,
        changed: true,
        molecule: {
          ...mol,
          atoms: mol.atoms.map(atom => ({ ...atom, x: atom.x + 2 })),
        },
        moved: true,
      }),
      commandResult => ({ moved: commandResult.moved }),
    )

    expect(result).toEqual({ ok: true, moved: true })
    expect(patch.atomPositionVersion).toBe(1)
    expect(patch.objectsById?.[state.activeObjectId!].molecule.atoms[0].x).toBe(2)
  })

  it('returns metadata without patching unchanged geometry edits', () => {
    const state = makeState()
    let called = false
    const result = applyGeomEditWithMeta<{ moved: boolean }>(
      () => state,
      () => { called = true },
      () => ({ ok: true, changed: false, moved: false }),
      commandResult => ({ moved: commandResult.moved }),
    )

    expect(result).toEqual({ ok: true, moved: false })
    expect(called).toBe(false)
  })

  it('returns failures without patching state', () => {
    const state = makeState()
    let called = false
    const result = applyGeomEditWithMeta<{ moved: boolean }>(
      () => state,
      () => { called = true },
      () => ({ ok: false, reason: 'bad geometry' }),
      () => ({ moved: false }),
    )

    expect(result).toEqual({ ok: false, reason: 'bad geometry' })
    expect(called).toBe(false)
  })
})
