import { describe, expect, it } from 'vitest'
import type { Molecule } from '../../molecule'
import {
  MODELING_COMMAND_KINDS,
  MODELING_SCHEMA_VERSION,
  type EditPlan,
  type ModelingCommand,
  type ModelingContext,
} from '../contracts'
import { dryRunEditPlan } from '../planExecutor'
import {
  computeCanonicalMoleculeDigest,
  createCanonicalMoleculeSnapshot,
} from './canonical'
import { compareExpectedEffect } from './compare'
import { compileExpectedEffect } from './compiler'
import type {
  ExpectedEffect,
  ModelingEffectReceipt,
} from './contracts'
import {
  EXPECTED_EFFECT_SEMANTICS,
  isExpectedEffectCommandSupported,
} from './semantics'
import { sha256Hex } from './sha256'

function baseMolecule(): Molecule {
  return {
    name: 'effect-fixture',
    atoms: [
      {
        id: 'metal',
        symbol: 'Fe',
        x: -0,
        y: 0,
        z: 0,
        charge: 2,
        label: 'center',
        coordinationGeometry: 'linear',
        coordinationDirections: [[1, 0, 0], [-1, 0, 0]],
        coordinationSites: [{
          id: 'site-b',
          label: 'B',
          direction: [1, 0, 0],
          bondOrder: 1,
          equivalenceGroup: 'eq',
        }, {
          id: 'site-a',
          label: 'A',
          direction: [-1, 0, 0],
          bondOrder: 1,
          equivalenceGroup: 'eq',
        }],
        coordinationNumber: 2,
      },
      { id: 'carbon', symbol: 'C', x: 1.5, y: 0, z: 0, radical: 1 },
      { id: 'oxygen', symbol: 'O', x: 3, y: 0, z: 0 },
    ],
    bonds: [
      {
        id: 'metal-carbon',
        atomId1: 'metal',
        atomId2: 'carbon',
        order: 1,
        aromatic: true,
        coordinationSites: [{ atomId: 'metal', siteId: 'site-b' }],
      },
      { id: 'carbon-oxygen', atomId1: 'carbon', atomId2: 'oxygen', order: 1 },
    ],
  }
}

function plan(commands: readonly ModelingCommand[]): Pick<EditPlan, 'planId' | 'commands'> {
  return { planId: 'effect-plan', commands }
}

function requireCompiled(result: ReturnType<typeof compileExpectedEffect>): ExpectedEffect {
  expect(result.status).toBe('compiled')
  if (result.status !== 'compiled') throw new Error(result.message)
  return result
}

function asReceipt(effect: ExpectedEffect): ModelingEffectReceipt {
  return structuredClone({
    schemaVersion: effect.schemaVersion,
    planId: effect.planId,
    baseDigest: effect.baseDigest,
    finalDigest: effect.finalDigest,
    commands: effect.commands,
  })
}

function productionContext(molecule: Molecule): ModelingContext {
  return {
    schemaVersion: MODELING_SCHEMA_VERSION,
    activeObjectId: 'effect-object',
    objects: [{
      objectId: 'effect-object',
      name: molecule.name ?? 'Molecule',
      visible: true,
      locked: false,
      editable: true,
      offset: { x: 0, y: 0, z: 0 },
      coordinateSpace: 'molecule-local',
      revision: 'effect-base',
      molecule,
    }],
    selection: { atomIds: [], bondIds: [] },
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

function productionPlan(commands: readonly ModelingCommand[]): EditPlan {
  return {
    schemaVersion: MODELING_SCHEMA_VERSION,
    planId: 'effect-plan',
    source: 'ai',
    targetObjectId: 'effect-object',
    commands,
  }
}

function legacyFnv1a32(input: string): string {
  let value = 0x811c9dc5
  for (let index = 0; index < input.length; index += 1) {
    value ^= input.charCodeAt(index)
    value = Math.imul(value, 0x01000193)
  }
  return (value >>> 0).toString(16).padStart(8, '0')
}

describe('ExpectedEffect V1 canonical projection', () => {
  it('matches standard SHA-256 vectors without Node-only crypto APIs', () => {
    expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    expect(sha256Hex('分子')).toBe('248b4c7b7f4943ea7a504cc43ca83f01fd02605fb46230e986a92faebafe87e4')
    expect(sha256Hex(
      'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
    )).toBe('248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1')
  })

  it('normalizes fields, endpoint direction, nested ordering and top-level ordering', () => {
    const first = baseMolecule()
    const second: Molecule = {
      name: first.name,
      atoms: [...first.atoms].reverse().map(atom => atom.id === 'metal'
        ? {
            ...atom,
            x: 0,
            coordinationDirections: [...(atom.coordinationDirections ?? [])].reverse(),
            coordinationSites: [...(atom.coordinationSites ?? [])].reverse(),
          }
        : atom),
      bonds: [...first.bonds].reverse().map(bond => ({
        ...bond,
        atomId1: bond.atomId2,
        atomId2: bond.atomId1,
      })),
    }

    expect(createCanonicalMoleculeSnapshot(first)).toEqual(createCanonicalMoleculeSnapshot(second))
    expect(computeCanonicalMoleculeDigest(first)).toBe(computeCanonicalMoleculeDigest(second))
    expect(computeCanonicalMoleculeDigest(first)).toMatch(/^canonical-v3-sha256-[0-9a-f]{64}$/)
  })

  it('separates the concrete coordinate collision accepted by the legacy FNV-1a digest', () => {
    const first: Molecule = {
      atoms: [{ id: 'a', symbol: 'C', x: -3.01216, y: 0, z: 0 }],
      bonds: [],
    }
    const second: Molecule = {
      atoms: [{ id: 'a', symbol: 'C', x: 7.53845, y: 0, z: 0 }],
      bonds: [],
    }
    // Freeze the legacy projection: new stereo fields change its serialized bytes.
    const legacySnapshot = (molecule: Molecule) => {
      const snapshot = createCanonicalMoleculeSnapshot(molecule)
      return { ...snapshot, atoms: snapshot.atoms.map(({ chirality: _chirality, ...atom }) => atom) }
    }
    const firstSnapshot = legacySnapshot(first)
    const secondSnapshot = legacySnapshot(second)

    expect(legacyFnv1a32(JSON.stringify(firstSnapshot))).toBe('909d5405')
    expect(legacyFnv1a32(JSON.stringify(secondSnapshot))).toBe('909d5405')
    expect(computeCanonicalMoleculeDigest(first)).not.toBe(computeCanonicalMoleculeDigest(second))
  })
})

describe('compileExpectedEffect', () => {
  it('independently compiles all seven V1 commands with complete per-command changes', () => {
    const effect = requireCompiled(compileExpectedEffect(baseMolecule(), plan([
      {
        commandId: 'add-n',
        kind: 'atom.add',
        atomId: 'nitrogen',
        symbol: 'N',
        position: { x: 4.4, y: 1, z: -1 },
      },
      { commandId: 'replace-metal', kind: 'atom.replace', atomId: 'metal', symbol: 'N' },
      {
        commandId: 'move-carbon',
        kind: 'atom.move',
        atomId: 'carbon',
        position: { x: 1.4, y: 0.2, z: 0.3 },
      },
      {
        commandId: 'add-bond',
        kind: 'bond.add',
        bondId: 'oxygen-nitrogen',
        atomId1: 'oxygen',
        atomId2: 'nitrogen',
        order: 2,
      },
      { commandId: 'set-order', kind: 'bond.setOrder', bondId: 'metal-carbon', order: 2 },
      { commandId: 'remove-bond', kind: 'bond.remove', bondId: 'carbon-oxygen' },
      { commandId: 'remove-atom', kind: 'atom.remove', atomId: 'nitrogen' },
    ])))

    expect(effect.commands).toHaveLength(7)
    effect.commands.slice(1).forEach((command, index) => {
      expect(command.preDigest).toBe(effect.commands[index]?.postDigest)
    })
    expect(effect.baseDigest).toBe(effect.commands[0]?.preDigest)
    expect(effect.finalDigest).toBe(effect.commands.at(-1)?.postDigest)

    expect(effect.commands[0]?.changes.atoms).toEqual([{
      id: 'nitrogen',
      before: null,
      after: expect.objectContaining({ id: 'nitrogen', symbol: 'N', x: 4.4, y: 1, z: -1 }),
    }])

    const replacement = effect.commands[1]?.changes.atoms[0]
    expect(replacement?.before).toEqual(expect.objectContaining({
      coordinationGeometry: 'linear',
      coordinationNumber: 2,
    }))
    expect(replacement?.after).toEqual(expect.objectContaining({
      id: 'metal',
      symbol: 'N',
      charge: 2,
      label: 'center',
      coordinationGeometry: null,
      coordinationDirections: [],
      coordinationSites: [],
      coordinationNumber: null,
    }))

    expect(effect.commands[2]?.changes.atoms).toEqual([{
      id: 'carbon',
      before: expect.objectContaining({ x: 1.5, y: 0, z: 0, radical: 1 }),
      after: expect.objectContaining({ x: 1.4, y: 0.2, z: 0.3, radical: 1 }),
    }])
    expect(effect.commands[3]?.changes.bonds).toEqual([{
      id: 'oxygen-nitrogen',
      before: null,
      after: expect.objectContaining({ order: 2, aromatic: false }),
    }])

    const orderChange = effect.commands[4]?.changes.bonds[0]
    expect(orderChange?.before).toEqual(expect.objectContaining({
      order: 1,
      aromatic: true,
      coordinationSites: [{ atomId: 'metal', siteId: 'site-b' }],
    }))
    expect(orderChange?.after).toEqual(expect.objectContaining({
      order: 2,
      aromatic: false,
      coordinationSites: [{ atomId: 'metal', siteId: 'site-b' }],
    }))
    expect(effect.commands[5]?.changes.bonds[0]).toEqual(expect.objectContaining({
      id: 'carbon-oxygen',
      after: null,
    }))
    expect(effect.commands[6]?.changes).toEqual({
      atoms: [{
        id: 'nitrogen',
        before: expect.objectContaining({ id: 'nitrogen' }),
        after: null,
      }],
      bonds: [{
        id: 'oxygen-nitrogen',
        before: expect.objectContaining({ id: 'oxygen-nitrogen' }),
        after: null,
      }],
    })
  })

  it('matches the production no-op when replacement keeps the same symbol', () => {
    const commands: ModelingCommand[] = [{
      commandId: 'normalize-metal',
      kind: 'atom.replace',
      atomId: 'metal',
      symbol: 'Fe',
    }]
    const effect = requireCompiled(compileExpectedEffect(baseMolecule(), plan([{
      commandId: 'normalize-metal',
      kind: 'atom.replace',
      atomId: 'metal',
      symbol: 'Fe',
    }])))
    const production = dryRunEditPlan(productionContext(baseMolecule()), productionPlan(commands))

    expect(effect.commands[0]?.changes).toEqual({ atoms: [], bonds: [] })
    expect(effect.commands[0]?.preDigest).toBe(effect.commands[0]?.postDigest)
    expect(effect.baseSnapshot).toEqual(effect.finalSnapshot)
    expect(production).toMatchObject({
      ok: true,
      changed: false,
      molecule: baseMolecule(),
      issues: [expect.objectContaining({ code: 'command-noop', commandId: 'normalize-metal' })],
    })
    if (production.ok) {
      expect(computeCanonicalMoleculeDigest(production.molecule)).toBe(effect.finalDigest)
    }
  })

  it('matches the production no-op when atom.move keeps the same coordinates', () => {
    const commands: ModelingCommand[] = [{
      commandId: 'keep-carbon-position',
      kind: 'atom.move',
      atomId: 'carbon',
      position: { x: 1.5, y: 0, z: 0 },
    }]
    const effect = requireCompiled(compileExpectedEffect(baseMolecule(), plan(commands)))
    const production = dryRunEditPlan(productionContext(baseMolecule()), productionPlan(commands))

    expect(effect.commands[0]?.changes).toEqual({ atoms: [], bonds: [] })
    expect(effect.commands[0]?.preDigest).toBe(effect.commands[0]?.postDigest)
    expect(effect.baseSnapshot).toEqual(effect.finalSnapshot)
    expect(production).toMatchObject({
      ok: true,
      changed: false,
      molecule: baseMolecule(),
      issues: [expect.objectContaining({ code: 'command-noop', commandId: 'keep-carbon-position' })],
    })
  })

  it.each([
    ['B', 'B'],
    ['B', 'N'],
    ['B', 'O'],
  ] as const)('does not compile unsupported %s-%s double-bond add or setOrder', (symbol1, symbol2) => {
    const molecule: Molecule = {
      atoms: [
        { id: 'left', symbol: symbol1, x: 0, y: 0, z: 0 },
        { id: 'right', symbol: symbol2, x: 1.5, y: 0, z: 0 },
      ],
      bonds: [{ id: 'pair', atomId1: 'left', atomId2: 'right', order: 1 }],
    }

    for (const command of [
      {
        commandId: 'unsupported-add',
        kind: 'bond.add',
        bondId: 'new-pair',
        atomId1: 'left',
        atomId2: 'right',
        order: 2,
      },
      {
        commandId: 'unsupported-set-order',
        kind: 'bond.setOrder',
        bondId: 'pair',
        order: 2,
      },
    ] satisfies ModelingCommand[]) {
      const base = command.kind === 'bond.add'
        ? { ...molecule, bonds: [] }
        : molecule
      expect(compileExpectedEffect(base, plan([command]))).toMatchObject({
        status: 'indeterminate',
        reason: 'unsupported-effect-semantics',
        commandIndex: 0,
        commandId: command.commandId,
        commandKind: command.kind,
      })
    }
  })

  it('returns indeterminate when production rejects an unsupported bond order as a no-op', () => {
    const hydrogenMolecule: Molecule = {
      atoms: [
        { id: 'h-1', symbol: 'H', x: 0, y: 0, z: 0 },
        { id: 'h-2', symbol: 'H', x: 0.75, y: 0, z: 0 },
      ],
      bonds: [{ id: 'h-h', atomId1: 'h-1', atomId2: 'h-2', order: 1 }],
    }
    const commands: ModelingCommand[] = [{
      commandId: 'unsupported-h-double-bond',
      kind: 'bond.setOrder',
      bondId: 'h-h',
      order: 2,
    }]

    expect(compileExpectedEffect(hydrogenMolecule, plan(commands))).toMatchObject({
      status: 'indeterminate',
      reason: 'unsupported-effect-semantics',
      commandIndex: 0,
      commandId: 'unsupported-h-double-bond',
      commandKind: 'bond.setOrder',
    })
    expect(dryRunEditPlan(
      productionContext(hydrogenMolecule),
      productionPlan(commands),
    )).toMatchObject({
      ok: true,
      changed: false,
      molecule: hydrogenMolecule,
      issues: [expect.objectContaining({
        code: 'command-noop',
        commandId: 'unsupported-h-double-bond',
      })],
    })
  })

  it('derives removal of every bond incident to a removed atom', () => {
    const effect = requireCompiled(compileExpectedEffect(baseMolecule(), plan([{
      commandId: 'remove-center',
      kind: 'atom.remove',
      atomId: 'carbon',
    }])))

    expect(effect.commands[0]?.changes.bonds.map(change => change.id)).toEqual([
      'carbon-oxygen',
      'metal-carbon',
    ])
    expect(effect.commands[0]?.changes.bonds.every(change =>
      change.before !== null && change.after === null)).toBe(true)
    expect(effect.finalSnapshot.bonds).toEqual([])
  })

  it('registers all 17 command kinds and returns explicit unsupported semantics for ten', () => {
    expect(Object.keys(EXPECTED_EFFECT_SEMANTICS)).toEqual(MODELING_COMMAND_KINDS)
    const supported = MODELING_COMMAND_KINDS.filter(isExpectedEffectCommandSupported)
    const unsupported = MODELING_COMMAND_KINDS.filter(kind => !isExpectedEffectCommandSupported(kind))
    expect(supported).toEqual([
      'atom.add',
      'atom.replace',
      'atom.remove',
      'atom.move',
      'bond.add',
      'bond.remove',
      'bond.setOrder',
    ])
    expect(unsupported).toHaveLength(10)

    unsupported.forEach(kind => {
      const result = compileExpectedEffect(baseMolecule(), plan([
        { commandId: `unsupported-${kind}`, kind } as ModelingCommand,
      ]))
      expect(result).toMatchObject({
        status: 'indeterminate',
        reason: 'unsupported-effect-semantics',
        commandIndex: 0,
        commandKind: kind,
        unsupportedCommandKinds: [kind],
      })
    })
  })
})

describe('compareExpectedEffect', () => {
  function twoCommandEffect(): ExpectedEffect {
    return requireCompiled(compileExpectedEffect(baseMolecule(), plan([
      {
        commandId: 'move',
        kind: 'atom.move',
        atomId: 'carbon',
        position: { x: 2, y: 0, z: 0 },
      },
      { commandId: 'order', kind: 'bond.setOrder', bondId: 'carbon-oxygen', order: 2 },
    ])))
  }

  it('passes an exact per-command receipt', () => {
    const effect = twoCommandEffect()
    expect(compareExpectedEffect(effect, asReceipt(effect))).toEqual({ verdict: 'pass', mismatches: [] })
  })

  it('rejects the alternate structure from the legacy FNV collision pair', () => {
    const first: Molecule = {
      atoms: [{ id: 'a', symbol: 'C', x: -3.01216, y: 0, z: 0 }],
      bonds: [],
    }
    const second: Molecule = {
      atoms: [{ id: 'a', symbol: 'C', x: 7.53845, y: 0, z: 0 }],
      bonds: [],
    }
    const expected = requireCompiled(compileExpectedEffect(first, plan([])))
    const actual: ModelingEffectReceipt = {
      ...asReceipt(expected),
      baseDigest: computeCanonicalMoleculeDigest(second),
      finalDigest: computeCanonicalMoleculeDigest(second),
    }

    expect(compareExpectedEffect(expected, actual).mismatches).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'base-digest-mismatch' }),
      expect.objectContaining({ code: 'final-digest-mismatch' }),
    ]))
  })

  it('does not accept receipts that retain the legacy weak digest prefix', () => {
    const effect = twoCommandEffect()
    const actual: ModelingEffectReceipt = {
      ...asReceipt(effect),
      baseDigest: 'canonical-v1-fnv1a32-909d5405',
      finalDigest: 'canonical-v1-fnv1a32-909d5405',
    }

    expect(compareExpectedEffect(effect, actual).mismatches).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'base-digest-mismatch' }),
      expect.objectContaining({ code: 'final-digest-mismatch' }),
    ]))
  })

  it('rejects a missing change and an extra change', () => {
    const effect = twoCommandEffect()
    const receipt = asReceipt(effect)
    const missing: ModelingEffectReceipt = {
      ...receipt,
      commands: receipt.commands.map((command, index) => index === 0
        ? { ...command, changes: { ...command.changes, atoms: [] } }
        : command),
    }
    expect(compareExpectedEffect(effect, missing)).toMatchObject({
      verdict: 'reject',
      mismatches: [expect.objectContaining({ code: 'atom-changes-mismatch', commandId: 'move' })],
    })

    const extra: ModelingEffectReceipt = {
      ...receipt,
      commands: receipt.commands.map((command, index) => index === 0
        ? {
            ...command,
            changes: {
              ...command.changes,
              bonds: [structuredClone(effect.commands[1]!.changes.bonds[0]!)],
            },
          }
        : command),
    }
    expect(compareExpectedEffect(effect, extra)).toMatchObject({
      verdict: 'reject',
      mismatches: [expect.objectContaining({ code: 'bond-changes-mismatch', commandId: 'move' })],
    })
  })

  it('rejects missing receipts, extra receipts and receipt reordering', () => {
    const effect = twoCommandEffect()
    const receipt = asReceipt(effect)
    const missing: ModelingEffectReceipt = { ...receipt, commands: receipt.commands.slice(1) }
    expect(compareExpectedEffect(effect, missing).mismatches).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'missing-command-receipt', commandId: 'move' }),
    ]))

    const extra: ModelingEffectReceipt = {
      ...receipt,
      commands: [...receipt.commands, {
        commandId: 'extra',
        kind: 'atom.move',
        preDigest: effect.finalDigest,
        postDigest: effect.finalDigest,
        changes: { atoms: [], bonds: [] },
      }],
    }
    expect(compareExpectedEffect(effect, extra).mismatches).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'extra-command-receipt', commandId: 'extra' }),
    ]))

    const duplicate: ModelingEffectReceipt = {
      ...receipt,
      commands: [...receipt.commands, receipt.commands[0]!],
    }
    expect(compareExpectedEffect(effect, duplicate).mismatches).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'extra-command-receipt', commandId: 'move' }),
    ]))

    const reordered: ModelingEffectReceipt = {
      ...receipt,
      commands: [...receipt.commands].reverse(),
    }
    expect(compareExpectedEffect(effect, reordered).mismatches).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'command-order-mismatch' }),
    ]))
  })

  it('rejects wrong digests, kinds and before-after values', () => {
    const effect = twoCommandEffect()
    const receipt = asReceipt(effect)
    const first = receipt.commands[0]!
    const changedAtom = first.changes.atoms[0]!
    const actual: ModelingEffectReceipt = {
      ...receipt,
      finalDigest: 'canonical-v3-sha256-wrong',
      commands: [{
        ...first,
        kind: 'atom.replace',
        postDigest: 'canonical-v3-sha256-wrong',
        changes: {
          ...first.changes,
          atoms: [{
            ...changedAtom,
            after: changedAtom.after ? { ...changedAtom.after, x: 99 } : null,
          }],
        },
      }, ...receipt.commands.slice(1)],
    }

    expect(compareExpectedEffect(effect, actual).mismatches).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'command-kind-mismatch' }),
      expect.objectContaining({ code: 'post-digest-mismatch' }),
      expect.objectContaining({ code: 'atom-changes-mismatch' }),
      expect.objectContaining({ code: 'final-digest-mismatch' }),
    ]))
  })

  it('rejects a receipt from another schema version at runtime', () => {
    const effect = twoCommandEffect()
    const actual = { ...asReceipt(effect), schemaVersion: 1 } as unknown as ModelingEffectReceipt
    expect(compareExpectedEffect(effect, actual).mismatches).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'schema-version-mismatch' }),
    ]))
  })

  it('propagates unsupported compilation as indeterminate', () => {
    const expected = compileExpectedEffect(baseMolecule(), plan([{
      commandId: 'charge',
      kind: 'atom.setCharge',
      atomId: 'carbon',
      charge: 1,
    }]))
    const placeholder = asReceipt(twoCommandEffect())
    expect(compareExpectedEffect(expected, placeholder)).toMatchObject({
      verdict: 'indeterminate',
      reason: 'unsupported-effect-semantics',
      mismatches: [],
    })
  })
})
