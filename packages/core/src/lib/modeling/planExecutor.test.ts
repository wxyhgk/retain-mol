import { describe, expect, it } from 'vitest'
import type { Molecule } from '../molecule'
import {
  MODELING_COMMAND_KINDS,
  MODELING_SCHEMA_VERSION,
  type EditPlan,
  type ModelingContext,
} from './contracts'
import { dryRunEditPlan } from './planExecutor'
import { computeMoleculeRevision } from './revision'

function molecule(): Molecule {
  return {
    name: 'ethane-skeleton',
    atoms: [
      { id: 'c-1', symbol: 'C', x: 0, y: 0, z: 0 },
      { id: 'c-2', symbol: 'C', x: 1.54, y: 0, z: 0 },
    ],
    bonds: [{ id: 'b-1', atomId1: 'c-1', atomId2: 'c-2', order: 1 }],
  }
}

function context(mol = molecule()): ModelingContext {
  return {
    schemaVersion: MODELING_SCHEMA_VERSION,
    activeObjectId: 'object-1',
    objects: [{
      objectId: 'object-1',
      name: 'Molecule',
      visible: true,
      locked: false,
      editable: true,
      offset: { x: 0, y: 0, z: 0 },
      coordinateSpace: 'molecule-local',
      revision: computeMoleculeRevision(mol),
      molecule: mol,
    }],
    selection: { atomIds: ['c-1'], bondIds: [] },
    editorIntent: {
      tool: 'select',
      brushArmed: false,
      activeElement: 'C',
      atomClickMode: 'grow',
      activeFragmentId: null,
    },
    capabilities: MODELING_COMMAND_KINDS,
  }
}

function plan(commands: EditPlan['commands'], mol = molecule()): EditPlan {
  const ctx = context(mol)
  return {
    schemaVersion: 1,
    planId: 'plan-1',
    source: 'ai',
    targetObjectId: 'object-1',
    expectedRevision: ctx.objects[0]?.revision,
    commands,
  }
}

describe('dryRunEditPlan', () => {
  it('applies deterministic ids and reports an explicit structural change set', () => {
    const input = plan([
      {
        commandId: 'add-n',
        kind: 'atom.add',
        atomId: 'n-3',
        symbol: 'N',
        position: { x: 3.0, y: 0, z: 0 },
      },
      {
        commandId: 'bond-n',
        kind: 'bond.add',
        bondId: 'b-2',
        atomId1: 'c-2',
        atomId2: 'n-3',
        order: 1,
      },
    ])

    const first = dryRunEditPlan(context(), input)
    const second = dryRunEditPlan(context(), input)

    expect(first.ok).toBe(true)
    expect(second.ok).toBe(true)
    if (!first.ok || !second.ok) return
    expect(first.molecule).toEqual(second.molecule)
    expect(first.nextRevision).toBe(second.nextRevision)
    expect(first.changes).toEqual({
      addedAtomIds: ['n-3'],
      removedAtomIds: [],
      updatedAtomIds: [],
      addedBondIds: ['b-2'],
      removedBondIds: [],
      updatedBondIds: [],
    })
  })

  it('rejects stale plans before executing commands', () => {
    const input = { ...plan([{
      commandId: 'move',
      kind: 'atom.move' as const,
      atomId: 'c-1',
      position: { x: 1, y: 2, z: 3 },
    }]), expectedRevision: 'mol-v1-stale' }
    const result = dryRunEditPlan(context(), input)
    expect(result.ok).toBe(false)
    expect(result.issues[0]?.code).toBe('stale-context')
  })

  it('is atomic and returns the failing command identity', () => {
    const input = plan([
      {
        commandId: 'add-o',
        kind: 'atom.add',
        atomId: 'o-3',
        symbol: 'O',
        position: { x: 3, y: 0, z: 0 },
      },
      {
        commandId: 'bad-bond',
        kind: 'bond.add',
        bondId: 'b-2',
        atomId1: 'o-3',
        atomId2: 'missing',
        order: 1,
      },
    ])
    const result = dryRunEditPlan(context(), input)
    expect(result.ok).toBe(false)
    expect(result.changed).toBe(false)
    expect(result.issues.at(-1)).toMatchObject({
      code: 'atom-not-found',
      commandIndex: 1,
      commandId: 'bad-bond',
    })
  })

  it('rejects malformed untrusted model output at the schema boundary', () => {
    const result = dryRunEditPlan(context(), {
      schemaVersion: 1,
      planId: 'unsafe',
      source: 'ai',
      targetObjectId: 'object-1',
      commands: [{ commandId: 'x', kind: 'atom.add', atomId: 'x', symbol: 'carbon' }],
    })
    expect(result.ok).toBe(false)
    expect(result.issues.every(issue => issue.code === 'invalid-plan')).toBe(true)
  })

  it('keeps the constraints schema strict', () => {
    const result = dryRunEditPlan(context(), {
      ...plan([{
        commandId: 'charge',
        kind: 'atom.setCharge',
        atomId: 'c-1',
        charge: 1,
      }]),
      constraints: {
        fixedAtomPositions: ['c-1'],
        allowMovement: true,
      },
    })

    expect(result.ok).toBe(false)
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'invalid-plan', path: 'constraints' }),
    ]))
  })

  it('rejects constraints that reference atoms outside the base molecule', () => {
    const result = dryRunEditPlan(context(), {
      ...plan([{
        commandId: 'charge',
        kind: 'atom.setCharge',
        atomId: 'c-1',
        charge: 1,
      }]),
      constraints: { fixedAtomPositions: ['missing'] },
    })

    expect(result.ok).toBe(false)
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: 'constraint-violation',
        path: 'constraints.fixedAtomPositions.0',
      }),
    ])
  })

  it('rejects a direct move of a fixed atom', () => {
    const result = dryRunEditPlan(context(), {
      ...plan([{
        commandId: 'move-fixed',
        kind: 'atom.move',
        atomId: 'c-1',
        position: { x: 1, y: 2, z: 3 },
      }]),
      constraints: { fixedAtomPositions: ['c-1'] },
    })

    expect(result.ok).toBe(false)
    expect(result.issues.at(-1)).toMatchObject({
      code: 'constraint-violation',
      commandId: 'move-fixed',
      commandIndex: 0,
    })
  })

  it('rejects a geometry command that indirectly moves a fixed atom', () => {
    const chain: Molecule = {
      name: 'three-carbon-chain',
      atoms: [
        { id: 'c-1', symbol: 'C', x: 0, y: 0, z: 0 },
        { id: 'c-2', symbol: 'C', x: 1.54, y: 0, z: 0 },
        { id: 'c-3', symbol: 'C', x: 3.08, y: 0, z: 0 },
      ],
      bonds: [
        { id: 'b-1', atomId1: 'c-1', atomId2: 'c-2', order: 1 },
        { id: 'b-2', atomId1: 'c-2', atomId2: 'c-3', order: 1 },
      ],
    }
    const result = dryRunEditPlan(context(chain), {
      ...plan([{
        commandId: 'stretch-c1-c2',
        kind: 'geometry.setBondLength',
        atomId1: 'c-1',
        atomId2: 'c-2',
        length: 2,
      }], chain),
      constraints: { fixedAtomPositions: ['c-3'] },
    })

    expect(result.ok).toBe(false)
    expect(result.issues.at(-1)).toMatchObject({
      code: 'constraint-violation',
      commandId: 'stretch-c1-c2',
    })
  })

  it('rejects removal and replacement of protected atoms', () => {
    const removed = dryRunEditPlan(context(), {
      ...plan([{
        commandId: 'remove-protected',
        kind: 'atom.remove',
        atomId: 'c-1',
      }]),
      constraints: { protectedAtomIds: ['c-1'] },
    })
    const replaced = dryRunEditPlan(context(), {
      ...plan([{
        commandId: 'replace-protected',
        kind: 'atom.replace',
        atomId: 'c-1',
        symbol: 'N',
      }]),
      constraints: { protectedAtomIds: ['c-1'] },
    })

    expect(removed.ok).toBe(false)
    expect(removed.issues.at(-1)).toMatchObject({
      code: 'constraint-violation',
      commandId: 'remove-protected',
    })
    expect(replaced.ok).toBe(false)
    expect(replaced.issues.at(-1)).toMatchObject({
      code: 'constraint-violation',
      commandId: 'replace-protected',
    })
  })

  it('allows a fixed atom to remain a bond endpoint', () => {
    const result = dryRunEditPlan(context(), {
      ...plan([
        {
          commandId: 'add-n',
          kind: 'atom.add',
          atomId: 'n-3',
          symbol: 'N',
          position: { x: -1.4, y: 0, z: 0 },
        },
        {
          commandId: 'bond-to-fixed',
          kind: 'bond.add',
          bondId: 'b-2',
          atomId1: 'c-1',
          atomId2: 'n-3',
          order: 1,
        },
      ]),
      constraints: { fixedAtomPositions: ['c-1'] },
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.molecule.bonds).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'b-2', atomId1: 'c-1', atomId2: 'n-3' }),
    ]))
    expect(result.molecule.atoms.find(atom => atom.id === 'c-1')).toMatchObject({
      x: 0,
      y: 0,
      z: 0,
    })
  })

  it('enforces selection-scoped modeling while allowing new atoms at an atom anchor', () => {
    const scopedPlan: EditPlan = {
      ...plan([{
        commandId: 'outside',
        kind: 'atom.move',
        atomId: 'c-2',
        position: { x: 9, y: 0, z: 0 },
      }]),
      scope: { kind: 'selection', atomIds: ['c-1'], bondIds: [] },
      anchor: { kind: 'atom', atomId: 'c-1' },
    }
    const rejected = dryRunEditPlan(context(), scopedPlan)
    expect(rejected.ok).toBe(false)
    expect(rejected.issues.at(-1)?.code).toBe('out-of-scope')

    const accepted = dryRunEditPlan(context(), {
      ...scopedPlan,
      commands: [
        {
          commandId: 'new-n',
          kind: 'atom.add',
          atomId: 'n-new',
          symbol: 'N',
          position: { x: -1.4, y: 0, z: 0 },
        },
        {
          commandId: 'attach-n',
          kind: 'bond.add',
          bondId: 'b-new',
          atomId1: 'c-1',
          atomId2: 'n-new',
          order: 1,
        },
      ],
    })
    expect(accepted.ok).toBe(true)
  })

  it('attaches registered templates with deterministic generated ids', () => {
    const host: Molecule = {
      name: 'host',
      atoms: [{ id: 'host-c', symbol: 'C', x: 0, y: 0, z: 0 }],
      bonds: [],
    }
    const input = plan([{
      commandId: 'attach-benzene',
      kind: 'fragment.attach',
      atomId: 'host-c',
      fragmentId: 'benzene',
      torsionAngleDegrees: 45,
    }], host)

    const first = dryRunEditPlan(context(host), input)
    const second = dryRunEditPlan(context(host), input)

    expect(first.ok).toBe(true)
    expect(second.ok).toBe(true)
    if (!first.ok || !second.ok) return
    expect(first.molecule).toEqual(second.molecule)
    expect(first.changes.addedAtomIds.length).toBeGreaterThan(0)
    expect(first.changes.addedAtomIds.every(id => id.startsWith('attach-benzene:atom:'))).toBe(true)
    expect(first.changes.addedBondIds.every(id => id.startsWith('attach-benzene:bond:'))).toBe(true)
  })

  it('attaches rigid fluorene and closes its second C9 site in one replayable plan', () => {
    const host: Molecule = {
      name: 'spiro-host',
      atoms: [
        { id: 'host-left', symbol: 'C', x: 0, y: 0, z: 0 },
        { id: 'host-right', symbol: 'C', x: 4, y: 0, z: 0 },
      ],
      bonds: [],
    }
    const result = dryRunEditPlan(context(host), plan([
      {
        commandId: 'install-fluorene',
        kind: 'fragment.attach',
        atomId: 'host-left',
        fragmentId: 'fluorene-9h-site-a',
        torsionAngleDegrees: 30,
      },
      {
        commandId: 'open-second-c9-site',
        kind: 'atom.remove',
        atomId: 'install-fluorene:atom:18',
      },
      {
        commandId: 'close-spiro-ring',
        kind: 'bond.add',
        bondId: 'spiro-closure',
        atomId1: 'install-fluorene:atom:7',
        atomId2: 'host-right',
        order: 1,
      },
    ], host))

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.molecule.atoms.some(atom => atom.id === 'install-fluorene:atom:18')).toBe(false)
    expect(result.molecule.bonds).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'spiro-closure',
        atomId1: 'install-fluorene:atom:7',
        atomId2: 'host-right',
      }),
    ]))
    expect(result.molecule.atoms.filter(atom => atom.id.startsWith('install-fluorene:atom:')))
      .toHaveLength(21)
  })

  it('bridges a rigid fluorene between two fixed H targets with deterministic ids', () => {
    const half = 1.275
    const height = Math.sqrt(1.54 * 1.54 - half * half)
    const hScale = 1.09 / 1.54
    const host: Molecule = {
      name: 'bridge-host',
      atoms: [
        { id: 'left', symbol: 'C', x: -half, y: 0, z: 0 },
        { id: 'right', symbol: 'C', x: half, y: 0, z: 0 },
        { id: 'left-h', symbol: 'H', x: -half + half * hScale, y: height * hScale, z: 0 },
        { id: 'right-h', symbol: 'H', x: half - half * hScale, y: height * hScale, z: 0 },
      ],
      bonds: [
        { id: 'left-h-bond', atomId1: 'left', atomId2: 'left-h', order: 1 },
        { id: 'right-h-bond', atomId1: 'right', atomId2: 'right-h', order: 1 },
      ],
    }
    const input: EditPlan = {
      ...plan([], host),
      constraints: { fixedAtomPositions: ['left', 'right'] },
      commands: [{
        commandId: 'bridge-fluorene',
        kind: 'fragment.bridge',
        atomId1: 'left-h',
        atomId2: 'right-h',
        fragmentId: 'fluorene-9h-site-a',
      }],
    }
    const first = dryRunEditPlan(context(host), input)
    const second = dryRunEditPlan(context(host), input)

    expect(first.ok).toBe(true)
    expect(second.ok).toBe(true)
    if (!first.ok || !second.ok) return
    expect(first.molecule).toEqual(second.molecule)
    expect(first.molecule.atoms.some(atom => atom.id === 'left-h' || atom.id === 'right-h')).toBe(false)
    expect(first.molecule.atoms.find(atom => atom.id === 'left')).toEqual(host.atoms[0])
    expect(first.molecule.atoms.find(atom => atom.id === 'right')).toEqual(host.atoms[1])
    expect(first.changes.addedAtomIds).toHaveLength(21)
    expect(first.changes.addedAtomIds.every(id => id.startsWith('bridge-fluorene:atom:'))).toBe(true)
    expect(first.changes.removedAtomIds).toEqual(['left-h', 'right-h'])
  })

  it('rejects commands omitted from the context capability handshake', () => {
    const restrictedContext = {
      ...context(),
      capabilities: MODELING_COMMAND_KINDS.filter(kind => kind !== 'fragment.bridge'),
    }
    const result = dryRunEditPlan(restrictedContext, plan([{
      commandId: 'unsupported-bridge',
      kind: 'fragment.bridge',
      atomId1: 'c-1',
      atomId2: 'c-2',
      fragmentId: 'fluorene-9h-site-a',
    }]))
    expect(result.ok).toBe(false)
    expect(result.issues.at(-1)).toMatchObject({
      code: 'unsupported-command',
      commandId: 'unsupported-bridge',
    })
  })

  it('allows later scoped commands to reference entities created by a template command', () => {
    const host: Molecule = {
      name: 'scoped-host',
      atoms: [{ id: 'host-c', symbol: 'C', x: 0, y: 0, z: 0 }],
      bonds: [],
    }
    const scopedContext: ModelingContext = {
      ...context(host),
      selection: { atomIds: ['host-c'], bondIds: [] },
    }
    const result = dryRunEditPlan(scopedContext, {
      ...plan([], host),
      scope: { kind: 'selection', atomIds: ['host-c'], bondIds: [] },
      commands: [
        {
          commandId: 'attach-benzene',
          kind: 'fragment.attach',
          atomId: 'host-c',
          fragmentId: 'benzene',
        },
        {
          commandId: 'adjust-generated-atom',
          kind: 'atom.move',
          atomId: 'attach-benzene:atom:1',
          position: { x: 2, y: 1, z: 0.5 },
        },
      ],
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.molecule.atoms.find(atom => atom.id === 'attach-benzene:atom:1')).toMatchObject({
      x: 2,
      y: 1,
      z: 0.5,
    })
  })

  it('fuses a registered ring template onto a selected bond', () => {
    const edge: Molecule = {
      name: 'edge',
      atoms: [
        { id: 'edge-1', symbol: 'C', x: 0, y: 0, z: 0 },
        { id: 'edge-2', symbol: 'C', x: 1.4, y: 0, z: 0 },
      ],
      bonds: [{ id: 'edge-bond', atomId1: 'edge-1', atomId2: 'edge-2', order: 1 }],
    }
    const result = dryRunEditPlan(context(edge), plan([{
      commandId: 'fuse-benzene',
      kind: 'fragment.fuse',
      bondId: 'edge-bond',
      fragmentId: 'benzene',
    }], edge))

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.molecule.atoms.length).toBeGreaterThan(2)
    expect(result.changes.addedAtomIds.every(id => id.startsWith('fuse-benzene:atom:'))).toBe(true)
  })

  it('rotates one atom group rigidly around an atom-defined axis', () => {
    const geometry: Molecule = {
      name: 'rigid-group',
      atoms: [
        { id: 'axis-1', symbol: 'C', x: 0, y: 0, z: 0 },
        { id: 'axis-2', symbol: 'C', x: 1, y: 0, z: 0 },
        { id: 'moving', symbol: 'C', x: 1, y: 1, z: 0 },
      ],
      bonds: [
        { id: 'axis-bond', atomId1: 'axis-1', atomId2: 'axis-2', order: 1 },
        { id: 'moving-bond', atomId1: 'axis-2', atomId2: 'moving', order: 1 },
      ],
    }
    const result = dryRunEditPlan(context(geometry), plan([{
      commandId: 'rotate-rigid-fragment',
      kind: 'geometry.rotateGroup',
      atomIds: ['moving'],
      axisAtomId1: 'axis-1',
      axisAtomId2: 'axis-2',
      angleDegrees: 90,
    }], geometry))

    expect(result.ok).toBe(true)
    if (!result.ok) return
    const moving = result.molecule.atoms.find(atom => atom.id === 'moving')
    expect(moving?.x).toBeCloseTo(1, 8)
    expect(moving?.y).toBeCloseTo(0, 8)
    expect(moving?.z).toBeCloseTo(1, 8)
    expect(result.molecule.atoms.find(atom => atom.id === 'axis-2')).toEqual(
      geometry.atoms.find(atom => atom.id === 'axis-2'),
    )
  })
})
