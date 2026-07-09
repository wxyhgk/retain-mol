import { describe, expect, it } from 'vitest'
import {
  applyAtomClickForIntent,
  applyAtomClickRoute,
  applyAtomDoubleClickForIntent,
  applyBackgroundClickForIntent,
  applyAtomDoubleClickFragmentSelection,
  applyBackgroundClickRoute,
  applyBackgroundDoubleClickPlacement,
  applyBondClickForIntent,
  applyBondClickRoute,
  applyBondDragEndCommand,
  applyEditCommandResult,
  runEditCommand,
  ensureEditableAtomObject,
  ensureEditableBondObject,
  getGrowGuideForIntent,
  getGrowPreviewForIntent,
  getPlacementPreviewForIntent,
  shouldAttemptBondDragForIntent,
  shouldHandleBondClickForIntent,
  shouldStartBondDragForIntent,
} from './builderCommandEffects'
import { newAtom, newBond } from '../lib/molecule'
import type { Molecule } from '../lib/molecule'
import { resolveBuilderIntent } from '../lib/builder/commands/builderIntent'

describe('builder command effects', () => {
  const selectIntent = resolveBuilderIntent({
    activeTool: 'select',
    activeElement: 'C',
    atomClickMode: 'grow',
    activeFragmentId: null,
    brushArmed: false,
  })

  const buildIntent = resolveBuilderIntent({
    activeTool: 'select',
    activeElement: 'C',
    atomClickMode: 'grow',
    activeFragmentId: null,
    brushArmed: true,
  })

  const measureIntent = resolveBuilderIntent({
    activeTool: 'measure',
    activeElement: 'C',
    atomClickMode: 'grow',
    activeFragmentId: null,
    brushArmed: true,
  })

  const moveObjectIntent = resolveBuilderIntent({
    activeTool: 'move-object',
    activeElement: 'C',
    atomClickMode: 'grow',
    activeFragmentId: null,
    brushArmed: false,
  })

  it('applies edit command results through injected effects', () => {
    const molecule: Molecule = { atoms: [], bonds: [], name: 'Edited' }
    const calls: string[] = []

    applyEditCommandResult(
      { ok: true, changed: true, molecule, message: 'done' },
      {
        setMolecule: (next) => calls.push(`set:${next.name}`),
        flashHint: (message) => calls.push(`hint:${message}`),
      },
    )
    applyEditCommandResult(
      { ok: false, reason: 'bad' },
      {
        setMolecule: (next) => calls.push(`set:${next.name}`),
        flashHint: (message) => calls.push(`hint:${message}`),
      },
    )

    expect(calls).toEqual(['set:Edited', 'hint:done', 'hint:bad'])
  })

  it('runs hook edit commands through a single injected effect boundary', () => {
    const molecule: Molecule = { atoms: [], bonds: [], name: 'Before' }
    const edited: Molecule = { atoms: [], bonds: [], name: 'After' }
    const calls: string[] = []

    const result = runEditCommand(
      molecule,
      (input) => ({
        ok: true,
        changed: true,
        molecule: { ...edited, atoms: input.atoms },
        message: 'done',
      }),
      {
        setMolecule: (next) => calls.push(`set:${next.name}`),
        flashHint: (message) => calls.push(`hint:${message}`),
      },
    )

    expect(result.ok).toBe(true)
    expect(calls).toEqual(['set:After', 'hint:done'])
  })

  it('applies background click routes through injected effects', () => {
    const calls: string[] = []
    const effects = {
      commitPendingMeasure: () => calls.push('commitMeasure'),
      clearSelection: () => calls.push('clearSelection'),
    }

    applyBackgroundClickRoute({ kind: 'commitMeasure' }, effects)
    applyBackgroundClickRoute({ kind: 'clearSelection' }, effects)
    applyBackgroundClickRoute({ kind: 'noop' }, effects)

    expect(calls).toEqual(['commitMeasure', 'clearSelection'])
  })

  it('applies background click intent through the command/effect boundary', () => {
    const calls: string[] = []
    const effects = {
      commitPendingMeasure: () => calls.push('commitMeasure'),
      clearSelection: () => calls.push('clearSelection'),
    }

    applyBackgroundClickForIntent(
      measureIntent,
      {
        shiftKey: false,
        altKey: false,
      },
      effects,
    )
    applyBackgroundClickForIntent(
      buildIntent,
      {
        shiftKey: false,
        altKey: false,
      },
      effects,
    )
    applyBackgroundClickForIntent(
      buildIntent,
      {
        shiftKey: true,
        altKey: false,
      },
      effects,
    )

    expect(calls).toEqual(['commitMeasure', 'clearSelection'])
  })

  it('applies background double-click placement only for build intents', () => {
    const calls: string[] = []
    const molecule: Molecule = { atoms: [], bonds: [], name: 'Base' }
    const effects = {
      setMolecule: (next: Molecule) =>
        calls.push(`set:${next.atoms.length}:${next.atoms[0]?.symbol ?? ''}`),
      flashHint: (message: string) => calls.push(`hint:${message}`),
    }

    applyBackgroundDoubleClickPlacement(
      selectIntent,
      molecule,
      { x: 1, y: 2, z: 3 },
      undefined,
      effects,
    )
    applyBackgroundDoubleClickPlacement(
      buildIntent,
      molecule,
      { x: 1, y: 2, z: 3 },
      undefined,
      effects,
    )

    expect(calls).toEqual(['set:1:C'])
  })

  it('resolves placement preview only for build intents', () => {
    const molecule: Molecule = { atoms: [], bonds: [], name: 'Base' }

    expect(
      getPlacementPreviewForIntent(selectIntent, molecule, {
        x: 1,
        y: 2,
        z: 3,
      }),
    ).toBeNull()
    const preview = getPlacementPreviewForIntent(buildIntent, molecule, {
      x: 1,
      y: 2,
      z: 3,
    })

    expect(preview?.atoms).toHaveLength(1)
    expect(preview?.atoms[0]).toMatchObject({ symbol: 'C', x: 1, y: 2, z: 3 })
  })

  it('resolves grow preview and guide only for editable intents', () => {
    const c = newAtom('C', 0, 0, 0)
    const molecule: Molecule = { atoms: [c], bonds: [], name: 'Base' }

    expect(
      getGrowPreviewForIntent(moveObjectIntent, molecule, {
        sourceId: c.id,
        cursorLocal: { x: 1, y: 0, z: 0 },
        freeDirection: false,
      }),
    ).toBeNull()

    const preview = getGrowPreviewForIntent(buildIntent, molecule, {
      sourceId: c.id,
      cursorLocal: { x: 1, y: 0, z: 0 },
      freeDirection: false,
    })
    expect(preview?.pos.x).toBeGreaterThan(0)

    expect(getGrowGuideForIntent(moveObjectIntent, molecule, c.id)).toBeNull()
    expect(
      getGrowGuideForIntent(buildIntent, molecule, c.id),
    ).not.toBeUndefined()
  })

  it('gates object activation for atom and bond editing', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1, 0, 0)
    const bond = newBond(c1.id, c2.id)
    const calls: string[] = []

    expect(
      ensureEditableAtomObject(c1.id, {
        activateObjectContainingAtom: (atomId) => {
          calls.push(`atom:${atomId}`)
          return true
        },
      }),
    ).toBe(true)
    expect(
      ensureEditableBondObject(
        bond.id,
        { atoms: [c1, c2], bonds: [bond] },
        {
          activateObjectContainingBond: (bondId) => {
            calls.push(`bond:${bondId}`)
            return true
          },
        },
      ),
    ).toBe(true)
    expect(
      ensureEditableBondObject(
        'missing-bond',
        { atoms: [c1, c2], bonds: [bond] },
        {
          activateObjectContainingBond: (bondId) => {
            calls.push(`bond:${bondId}`)
            return false
          },
        },
      ),
    ).toBe(false)

    expect(calls).toEqual([`atom:${c1.id}`, 'bond:missing-bond'])
  })

  it('applies atom click routes through injected effects', () => {
    const calls: string[] = []
    const effects = {
      addMeasureAtom: () => calls.push('measure'),
      selectAtom: (append: boolean) => calls.push(`select:${append}`),
      runCommand: () => calls.push('command'),
    }

    applyAtomClickRoute({ kind: 'measure' }, effects)
    applyAtomClickRoute({ kind: 'select', append: true }, effects)
    applyAtomClickRoute({ kind: 'command' }, effects)
    applyAtomClickRoute({ kind: 'noop' }, effects)

    expect(calls).toEqual(['measure', 'select:true', 'command'])
  })

  it('applies atom click intent as a single command/effect boundary', () => {
    const c = newAtom('C', 0, 0, 0)
    const calls: string[] = []

    applyAtomClickForIntent(
      selectIntent,
      { atoms: [c], bonds: [] },
      {
        atomId: c.id,
        shiftKey: false,
      },
      {
        addMeasureAtom: () => calls.push('measure'),
        selectAtom: (append) => calls.push(`select:${append}`),
        editEffects: {
          setMolecule: (next) => calls.push(`set:${next.atoms[0]?.symbol}`),
          flashHint: (message) => calls.push(`hint:${message}`),
        },
      },
    )

    const oxygenIntent = resolveBuilderIntent({
      activeTool: 'select',
      activeElement: 'O',
      atomClickMode: 'replace',
      activeFragmentId: null,
      brushArmed: true,
    })
    applyAtomClickForIntent(
      oxygenIntent,
      { atoms: [c], bonds: [] },
      {
        atomId: c.id,
        shiftKey: false,
      },
      {
        addMeasureAtom: () => calls.push('measure'),
        selectAtom: (append) => calls.push(`select:${append}`),
        editEffects: {
          setMolecule: (next) => calls.push(`set:${next.atoms[0]?.symbol}`),
          flashHint: (message) => calls.push(`hint:${message}`),
        },
      },
    )

    expect(calls).toEqual(['select:false', 'set:O'])
  })

  it('applies atom double-click fragment selection results through injected effects', () => {
    const calls: string[] = []
    const atomIds = new Set(['a1', 'a2'])

    applyAtomDoubleClickFragmentSelection(
      { ok: true, atomIds },
      {
        selectAtoms: (ids) => calls.push([...ids].join(',')),
      },
    )
    applyAtomDoubleClickFragmentSelection(
      { ok: false },
      {
        selectAtoms: (ids) => calls.push([...ids].join(',')),
      },
    )

    expect(calls).toEqual(['a1,a2'])
  })

  it('applies atom double-click intent through the command/effect boundary', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1, 0, 0)
    const bond = newBond(c1.id, c2.id)
    const calls: string[] = []

    applyAtomDoubleClickForIntent(
      selectIntent,
      { atoms: [c1, c2], bonds: [bond] },
      c1.id,
      {
        selectAtoms: (atomIds) => calls.push([...atomIds].sort().join(',')),
      },
    )
    applyAtomDoubleClickForIntent(
      measureIntent,
      { atoms: [c1, c2], bonds: [bond] },
      c1.id,
      {
        selectAtoms: (atomIds) => calls.push([...atomIds].sort().join(',')),
      },
    )

    expect(calls).toEqual([[c1.id, c2.id].sort().join(',')])
  })

  it('applies bond click routes through injected effects', () => {
    const calls: string[] = []
    const effects = {
      selectBond: (includeAtoms: boolean) =>
        calls.push(`select:${includeAtoms}`),
      runCommand: () => calls.push('command'),
    }

    applyBondClickRoute({ kind: 'select', includeAtoms: true }, effects)
    applyBondClickRoute({ kind: 'command', cycleLength: false }, effects)
    applyBondClickRoute({ kind: 'noop' }, effects)

    expect(calls).toEqual(['select:true', 'command'])
  })

  it('applies bond click intent through the command/effect boundary', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1, 0, 0)
    const bond = newBond(c1.id, c2.id, 1)
    const calls: string[] = []

    applyBondClickForIntent(
      buildIntent,
      { atoms: [c1, c2], bonds: [bond] },
      {
        bondId: bond.id,
        shiftKey: false,
        altKey: true,
      },
      {
        selectBond: (includeAtoms) => calls.push(`select:${includeAtoms}`),
        editEffects: {
          setMolecule: (next) => calls.push(`set:${next.bonds[0]?.order}`),
          flashHint: (message) => calls.push(`hint:${message}`),
        },
      },
    )

    applyBondClickForIntent(
      buildIntent,
      { atoms: [c1, c2], bonds: [bond] },
      {
        bondId: bond.id,
        shiftKey: true,
        altKey: false,
      },
      {
        selectBond: (includeAtoms) => calls.push(`select:${includeAtoms}`),
        editEffects: {
          setMolecule: (next) => calls.push(`set:${next.bonds[0]?.order}`),
          flashHint: (message) => calls.push(`hint:${message}`),
        },
      },
    )

    expect(calls).toEqual(['select:true', 'set:2'])
  })

  it('exposes bond click noop gating before object activation', () => {
    expect(
      shouldHandleBondClickForIntent(moveObjectIntent, {
        shiftKey: false,
        altKey: false,
      }),
    ).toBe(false)
    expect(
      shouldHandleBondClickForIntent(buildIntent, {
        shiftKey: false,
        altKey: false,
      }),
    ).toBe(true)
  })

  it('applies bond drag end commands only for editable intents', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.54, 0, 0)
    const molecule: Molecule = { atoms: [c1, c2], bonds: [], name: 'Base' }
    const calls: string[] = []
    const effects = {
      setMolecule: (next: Molecule) => calls.push(`set:${next.bonds.length}`),
      flashHint: (message: string) => calls.push(`hint:${message}`),
    }

    applyBondDragEndCommand(
      measureIntent,
      molecule,
      {
        sourceId: c1.id,
        targetId: c2.id,
        dropLocal: null,
      },
      effects,
    )
    applyBondDragEndCommand(
      buildIntent,
      molecule,
      {
        sourceId: c1.id,
        targetId: c2.id,
        dropLocal: null,
      },
      effects,
    )

    expect(calls).toEqual(['set:1'])
  })

  it('gates bond drag start before and after object activation', () => {
    const c1 = newAtom('C', 0, 0, 0)
    const c2 = newAtom('C', 1.54, 0, 0)
    const molecule: Molecule = { atoms: [c1, c2], bonds: [], name: 'Base' }

    expect(
      shouldAttemptBondDragForIntent(buildIntent, {
        sourceId: c1.id,
        selectedAtomIds: new Set([c1.id]),
      }),
    ).toBe(false)
    expect(
      shouldAttemptBondDragForIntent(buildIntent, {
        sourceId: c1.id,
        selectedAtomIds: new Set(),
      }),
    ).toBe(true)

    expect(
      shouldStartBondDragForIntent(buildIntent, molecule, {
        sourceId: c1.id,
        selectedAtomIds: new Set(),
      }),
    ).toBe(true)
    expect(
      shouldStartBondDragForIntent(buildIntent, molecule, {
        sourceId: 'missing',
        selectedAtomIds: new Set(),
      }),
    ).toBe(false)
    expect(
      shouldStartBondDragForIntent(
        resolveBuilderIntent({
          activeTool: 'select',
          activeElement: 'C',
          atomClickMode: 'grow',
          activeFragmentId: 'benzene',
          brushArmed: true,
        }),
        molecule,
        {
          sourceId: c1.id,
          selectedAtomIds: new Set(),
        },
      ),
    ).toBe(false)
  })
})
