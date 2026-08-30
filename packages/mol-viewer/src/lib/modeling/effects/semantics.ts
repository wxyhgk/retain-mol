import type { Atom, Molecule } from '../../molecule'
import { validateAtomCreationInput, validateElementSymbol } from '../../chemistry/policies/atomPolicy'
import {
  planBondOrderChange,
  planBondTopologyOrderChange,
  validateBondAddition,
  validateBondTopologyAddition,
} from '../../chemistry/policies/bondPolicy'
import {
  MODELING_COMMAND_KINDS,
  type ModelingCommandKind,
} from '../contracts'
import {
  EXPECTED_EFFECT_SUPPORTED_COMMAND_KINDS,
  type ExpectedEffectIndeterminateReason,
  type ExpectedEffectSemanticsSupport,
  type ExpectedEffectSupportedCommand,
} from './contracts'

const supportedKinds = new Set<ModelingCommandKind>(EXPECTED_EFFECT_SUPPORTED_COMMAND_KINDS)

export const EXPECTED_EFFECT_SEMANTICS = Object.freeze(
  Object.fromEntries(MODELING_COMMAND_KINDS.map(kind => [
    kind,
    supportedKinds.has(kind) ? 'supported' : 'unsupported',
  ])) as Record<ModelingCommandKind, ExpectedEffectSemanticsSupport>,
)

export function isExpectedEffectCommandSupported(
  kind: ModelingCommandKind,
): kind is ExpectedEffectSupportedCommand['kind'] {
  return EXPECTED_EFFECT_SEMANTICS[kind] === 'supported'
}

export type ApplyExpectedEffectCommandResult =
  | { readonly ok: true; readonly molecule: Molecule }
  | {
      readonly ok: false
      readonly reason: string
      readonly indeterminateReason: ExpectedEffectIndeterminateReason
    }

function invalidInput(reason: string): ApplyExpectedEffectCommandResult {
  return { ok: false, reason, indeterminateReason: 'invalid-effect-input' }
}

function unsupportedSemantics(reason: string): ApplyExpectedEffectCommandResult {
  return { ok: false, reason, indeterminateReason: 'unsupported-effect-semantics' }
}

function replaceAtom(atom: Atom, symbol: string): Atom {
  const {
    coordinationGeometry: _coordinationGeometry,
    coordinationDirections: _coordinationDirections,
    coordinationSites: _coordinationSites,
    coordinationNumber: _coordinationNumber,
    ...plainAtom
  } = atom
  return { ...plainAtom, symbol }
}

function bondRuleFailure(
  result: { readonly category: 'invalid-input' | 'unsupported-order'; readonly reason: string },
): ApplyExpectedEffectCommandResult {
  return result.category === 'unsupported-order'
    ? unsupportedSemantics(result.reason)
    : invalidInput(result.reason)
}

type ExpectedEffectBondPolicy = {
  readonly validateAddition: typeof validateBondAddition
  readonly planOrderChange: typeof planBondOrderChange
}

const strictBondPolicy: ExpectedEffectBondPolicy = {
  validateAddition: validateBondAddition,
  planOrderChange: planBondOrderChange,
}

const transactionBondPolicy: ExpectedEffectBondPolicy = {
  validateAddition: validateBondTopologyAddition,
  planOrderChange: planBondTopologyOrderChange,
}

function applyCommandWithBondPolicy(
  molecule: Molecule,
  command: ExpectedEffectSupportedCommand,
  bondPolicy: ExpectedEffectBondPolicy,
): ApplyExpectedEffectCommandResult {
  switch (command.kind) {
    case 'atom.add':
      if (molecule.atoms.some(atom => atom.id === command.atomId)) {
        return invalidInput(`Atom id already exists: ${command.atomId}`)
      }
      {
        const validation = validateAtomCreationInput(
          command.symbol,
          command.position.x,
          command.position.y,
          command.position.z,
        )
        if (validation.ok === false) return invalidInput(validation.reason)
      }
      return {
        ok: true,
        molecule: {
          ...molecule,
          atoms: [...molecule.atoms, {
            id: command.atomId,
            symbol: command.symbol,
            x: command.position.x,
            y: command.position.y,
            z: command.position.z,
          }],
        },
      }

    case 'atom.replace':
      if (!molecule.atoms.some(atom => atom.id === command.atomId)) {
        return invalidInput(`Atom does not exist: ${command.atomId}`)
      }
      {
        const validation = validateElementSymbol(command.symbol)
        if (validation.ok === false) return invalidInput(validation.reason)
      }
      return {
        ok: true,
        molecule: {
          ...molecule,
          atoms: molecule.atoms.map(atom =>
            atom.id === command.atomId && atom.symbol !== command.symbol
              ? replaceAtom(atom, command.symbol)
              : atom),
        },
      }

    case 'atom.remove': {
      if (!molecule.atoms.some(atom => atom.id === command.atomId)) {
        return invalidInput(`Atom does not exist: ${command.atomId}`)
      }
      return {
        ok: true,
        molecule: {
          ...molecule,
          atoms: molecule.atoms.filter(atom => atom.id !== command.atomId),
          bonds: molecule.bonds.filter(
            bond => bond.atomId1 !== command.atomId && bond.atomId2 !== command.atomId,
          ),
        },
      }
    }

    case 'atom.move':
      if (!molecule.atoms.some(atom => atom.id === command.atomId)) {
        return invalidInput(`Atom does not exist: ${command.atomId}`)
      }
      return {
        ok: true,
        molecule: {
          ...molecule,
          atoms: molecule.atoms.map(atom => atom.id === command.atomId
            ? { ...atom, ...command.position }
            : atom),
        },
      }

    case 'bond.add': {
      if (molecule.bonds.some(bond => bond.id === command.bondId)) {
        return invalidInput(`Bond id already exists: ${command.bondId}`)
      }
      const validation = bondPolicy.validateAddition(molecule, command)
      if (validation.ok === false) return bondRuleFailure(validation)
      return {
        ok: true,
        molecule: {
          ...molecule,
          bonds: [...molecule.bonds, {
            id: command.bondId,
            atomId1: command.atomId1,
            atomId2: command.atomId2,
            order: command.order,
          }],
        },
      }
    }

    case 'bond.remove':
      if (!molecule.bonds.some(bond => bond.id === command.bondId)) {
        return invalidInput(`Bond does not exist: ${command.bondId}`)
      }
      return {
        ok: true,
        molecule: {
          ...molecule,
          bonds: molecule.bonds.filter(bond => bond.id !== command.bondId),
        },
      }

    case 'bond.setOrder': {
      const result = bondPolicy.planOrderChange(molecule, command.bondId, command.order)
      if (result.ok === false) return bondRuleFailure(result)
      return {
        ok: true,
        molecule: result.changed ? result.molecule : molecule,
      }
    }
  }
}

/** Pure single-command semantics aligned with production chemistry checks. */
export function applyExpectedEffectCommand(
  molecule: Molecule,
  command: ExpectedEffectSupportedCommand,
): ApplyExpectedEffectCommandResult {
  return applyCommandWithBondPolicy(molecule, command, strictBondPolicy)
}

/** Plan-internal semantics that permit temporary valence excess within one transaction. */
export function applyExpectedEffectTransactionCommand(
  molecule: Molecule,
  command: ExpectedEffectSupportedCommand,
): ApplyExpectedEffectCommandResult {
  return applyCommandWithBondPolicy(molecule, command, transactionBondPolicy)
}
