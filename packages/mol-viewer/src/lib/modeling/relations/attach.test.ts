import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Molecule } from '../../molecule'
import {
  MODELING_COMMAND_KINDS,
  MODELING_SCHEMA_VERSION,
  type EditPlan,
  type ModelingContext,
} from '../contracts'
import { dryRunEditPlan } from '../planExecutor'
import { computeMoleculeRevision } from '../revision'
import { registerFragment, unregisterFragment } from '../../builder/fragment/registry'
import type { FragmentDef } from '../../builder/fragment/model'
import type { FragmentAttachCommand } from './attachContracts'
import { compileFragmentAttachRelation, verifyFragmentAttachRelation } from './index'

const FRAGMENT_ID = 'relation-c-sp3'

const fragment: FragmentDef = {
  id: FRAGMENT_ID,
  name: 'Relation tetrahedral carbon',
  short: 'RC',
  formula: 'CH4',
  atoms: [
    { symbol: 'C', x: 0, y: 0, z: 0 },
    { symbol: 'H', x: 1.09, y: 0, z: 0 },
    { symbol: 'H', x: -0.3633333333, y: 1.0276618553, z: 0 },
    { symbol: 'H', x: -0.3633333333, y: -0.5138309277, z: 0.8899812732 },
    { symbol: 'H', x: -0.3633333333, y: -0.5138309277, z: -0.8899812732 },
  ],
  bonds: [
    { a: 0, b: 1, order: 1 },
    { a: 0, b: 2, order: 1 },
    { a: 0, b: 3, order: 1 },
    { a: 0, b: 4, order: 1 },
  ],
  attachIndex: 0,
  attachHIndex: 1,
  attachOrder: 1,
  group: 'sp3',
}

function hostMolecule(includeSecondHydrogen = false): Molecule {
  return {
    name: 'methane-host',
    atoms: [
      { id: 'host-c', symbol: 'C', x: 0, y: 0, z: 0, label: 'fixed host' },
      { id: 'target-h', symbol: 'H', x: 1.09, y: 0, z: 0 },
      ...(includeSecondHydrogen
        ? [{ id: 'other-h', symbol: 'H', x: -1.09, y: 0, z: 0 }]
        : []),
    ],
    bonds: [
      { id: 'host-target', atomId1: 'host-c', atomId2: 'target-h', order: 1 },
      ...(includeSecondHydrogen
        ? [{ id: 'host-other', atomId1: 'host-c', atomId2: 'other-h', order: 1 as const }]
        : []),
    ],
  }
}

function command(torsionAngleDegrees: number | undefined = 60): FragmentAttachCommand {
  return {
    commandId: 'attach-cert',
    kind: 'fragment.attach',
    atomId: 'target-h',
    fragmentId: FRAGMENT_ID,
    ...(torsionAngleDegrees === undefined ? {} : { torsionAngleDegrees }),
  }
}

function context(molecule: Molecule): ModelingContext {
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
      revision: computeMoleculeRevision(molecule),
      molecule,
    }],
    selection: { atomIds: ['target-h'], bondIds: [] },
    editorIntent: {
      tool: 'select',
      brushArmed: false,
      activeElement: 'C',
      atomClickMode: 'grow',
      activeFragmentId: FRAGMENT_ID,
    },
    capabilities: MODELING_COMMAND_KINDS,
  }
}

function plan(molecule: Molecule, attachCommand = command()): EditPlan {
  return {
    schemaVersion: MODELING_SCHEMA_VERSION,
    planId: 'attach-relation-plan',
    source: 'ai',
    targetObjectId: 'object-1',
    expectedRevision: computeMoleculeRevision(molecule),
    commands: [attachCommand],
  }
}

function dryRun(molecule = hostMolecule()): Molecule {
  const result = dryRunEditPlan(context(molecule), plan(molecule))
  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error(result.issues.map(issue => issue.message).join('; '))
  return result.molecule
}

beforeAll(() => {
  registerFragment(fragment)
})

afterAll(() => {
  unregisterFragment(FRAGMENT_ID)
})

describe('fragment.attach relation certificate', () => {
  it('returns indeterminate before validating a host beyond the certificate budget', () => {
    const base = hostMolecule()
    const before: Molecule = {
      ...base,
      atoms: [
        ...base.atoms,
        ...Array.from({ length: 315 }, (_value, index) => ({
          id: `spectator-${index}`,
          symbol: 'He',
          x: index + 2,
          y: 0,
          z: 0,
        })),
      ],
    }

    const result = compileFragmentAttachRelation(before, command())
    expect(result.verdict).toBe('indeterminate')
    if (result.verdict !== 'pass') expect(result.diagnostic.code).toBe('resource-limit')
  })

  it('returns indeterminate before validating a template beyond the certificate budget', () => {
    const oversizedId = 'relation-oversized-template'
    const oversized: FragmentDef = {
      ...fragment,
      id: oversizedId,
      atoms: Array.from({ length: 65 }, (_value, index) => ({
        symbol: index === 1 ? 'H' : 'C',
        x: index,
        y: index % 2,
        z: index % 3,
      })),
    }
    registerFragment(oversized)
    try {
      const result = compileFragmentAttachRelation(hostMolecule(), {
        ...command(),
        fragmentId: oversizedId,
      })
      expect(result.verdict).toBe('indeterminate')
      if (result.verdict !== 'pass') expect(result.diagnostic.code).toBe('resource-limit')
    } finally {
      unregisterFragment(oversizedId)
    }
  })

  it('returns indeterminate when individually bounded inputs exceed the combined candidate budget', () => {
    const base = hostMolecule()
    const before: Molecule = {
      ...base,
      atoms: [
        ...base.atoms,
        ...Array.from({ length: 312 }, (_value, index) => ({
          id: `spectator-${index}`,
          symbol: 'He',
          x: index + 2,
          y: 1,
          z: 0,
        })),
      ],
    }

    expect(before.atoms).toHaveLength(314)
    const result = compileFragmentAttachRelation(before, command())
    expect(result.verdict).toBe('indeterminate')
    if (result.verdict !== 'pass') expect(result.diagnostic.code).toBe('resource-limit')
  })

  it('returns indeterminate before validating an actual after graph beyond the candidate budget', () => {
    const before = hostMolecule()
    const attached = dryRun(before)
    const after: Molecule = {
      ...attached,
      atoms: [
        ...attached.atoms,
        ...Array.from({ length: 312 }, (_value, index) => ({
          id: `oversized-after-${index}`,
          symbol: 'He',
          x: index,
          y: 0,
          z: index === 311 ? Number.NaN : 0,
        })),
      ],
    }

    const result = verifyFragmentAttachRelation(before, after, command())
    expect(result.verdict).toBe('indeterminate')
    if (result.verdict !== 'pass') expect(result.diagnostic.code).toBe('resource-limit')
  })

  it('compiles deterministic template mappings and passes a production dry run', () => {
    const before = hostMolecule()
    const after = dryRun(before)
    const compiled = compileFragmentAttachRelation(before, command())

    expect(compiled.verdict).toBe('pass')
    if (compiled.verdict !== 'pass') return
    expect(compiled.relation).toMatchObject({
      kind: 'fragment-attach',
      commandId: 'attach-cert',
      hostAtomId: 'host-c',
      deletedHydrogenAtomId: 'target-h',
      deletedHydrogenBondId: 'host-target',
      linkBondId: 'attach-cert:bond:1',
      fixedAtomIds: ['host-c'],
      fixedBondIds: [],
      addedAtomIds: [
        'attach-cert:atom:1',
        'attach-cert:atom:2',
        'attach-cert:atom:3',
        'attach-cert:atom:4',
      ],
      addedBondIds: [
        'attach-cert:bond:1',
        'attach-cert:bond:2',
        'attach-cert:bond:3',
        'attach-cert:bond:4',
      ],
    })
    expect(compiled.relation.templateAtomIdByIndex).toEqual([
      { templateAtomIndex: 0, atomId: 'attach-cert:atom:1' },
      { templateAtomIndex: 2, atomId: 'attach-cert:atom:2' },
      { templateAtomIndex: 3, atomId: 'attach-cert:atom:3' },
      { templateAtomIndex: 4, atomId: 'attach-cert:atom:4' },
    ])
    expect(compiled.relation.templateBondIdByIndex).toEqual([
      { templateBondIndex: 1, bondId: 'attach-cert:bond:2' },
      { templateBondIndex: 2, bondId: 'attach-cert:bond:3' },
      { templateBondIndex: 3, bondId: 'attach-cert:bond:4' },
    ])
    expect(verifyFragmentAttachRelation(before, after, command()).verdict).toBe('pass')
  })

  it('returns indeterminate for automatic torsion', () => {
    const { torsionAngleDegrees: _torsion, ...automaticCommand } = command()
    const result = compileFragmentAttachRelation(hostMolecule(), automaticCommand)
    expect(result.verdict).toBe('indeterminate')
    if (result.verdict !== 'pass') expect(result.diagnostic.code).toBe('automatic-torsion')
  })

  it('rejects deleting a different host hydrogen', () => {
    const before = hostMolecule(true)
    const attached = dryRun(before)
    const targetHydrogen = before.atoms.find(atom => atom.id === 'target-h')!
    const targetBond = before.bonds.find(bond => bond.id === 'host-target')!
    const after: Molecule = {
      ...attached,
      atoms: [
        ...attached.atoms.filter(atom => atom.id !== 'other-h'),
        targetHydrogen,
      ],
      bonds: [
        ...attached.bonds.filter(bond => bond.id !== 'host-other'),
        targetBond,
      ],
    }
    expect(verifyFragmentAttachRelation(before, after, command()).verdict).toBe('reject')
  })

  it.each([
    ['extra', (after: Molecule): Molecule => ({
      ...after,
      atoms: [...after.atoms, { id: 'extra', symbol: 'He', x: 9, y: 9, z: 9 }],
    })],
    ['missing', (after: Molecule): Molecule => ({
      ...after,
      atoms: after.atoms.filter(atom => atom.id !== 'attach-cert:atom:4'),
      bonds: after.bonds.filter(bond => bond.atomId1 !== 'attach-cert:atom:4' && bond.atomId2 !== 'attach-cert:atom:4'),
    })],
  ])('rejects an %s generated atom', (_label, mutate) => {
    const before = hostMolecule()
    expect(verifyFragmentAttachRelation(before, mutate(dryRun(before)), command()).verdict).toBe('reject')
  })

  it('rejects the wrong link bond order', () => {
    const before = hostMolecule()
    const attached = dryRun(before)
    const after: Molecule = {
      ...attached,
      bonds: attached.bonds.map(bond => bond.id === 'attach-cert:bond:1'
        ? { ...bond, order: 2 }
        : bond),
    }
    const result = verifyFragmentAttachRelation(before, after, command())
    expect(result.verdict).toBe('reject')
    if (result.verdict !== 'pass') expect(result.diagnostic.code).toBe('link-bond-mismatch')
  })

  it('rejects movement of the fixed host', () => {
    const before = hostMolecule()
    const attached = dryRun(before)
    const after: Molecule = {
      ...attached,
      atoms: attached.atoms.map(atom => atom.id === 'host-c' ? { ...atom, z: atom.z + 0.2 } : atom),
    }
    const result = verifyFragmentAttachRelation(before, after, command())
    expect(result.verdict).toBe('reject')
    if (result.verdict !== 'pass') expect(result.diagnostic.code).toBe('fixed-atom-changed')
  })

  it('rejects distortion of the instantiated template', () => {
    const before = hostMolecule()
    const attached = dryRun(before)
    const after: Molecule = {
      ...attached,
      atoms: attached.atoms.map(atom => atom.id === 'attach-cert:atom:2'
        ? { ...atom, y: atom.y + 0.2 }
        : atom),
    }
    const result = verifyFragmentAttachRelation(before, after, command())
    expect(result.verdict).toBe('reject')
    if (result.verdict !== 'pass') expect(result.diagnostic.code).toBe('template-distorted')
  })

  it('rejects a mirrored but distance-preserving template', () => {
    const before = hostMolecule()
    const attached = dryRun(before)
    const after: Molecule = {
      ...attached,
      atoms: attached.atoms.map(atom => atom.id.startsWith('attach-cert:atom:')
        ? { ...atom, y: -atom.y }
        : atom),
    }
    const result = verifyFragmentAttachRelation(before, after, command())
    expect(result.verdict).toBe('reject')
    if (result.verdict !== 'pass') expect(result.diagnostic.code).toBe('template-mirrored')
  })
})
