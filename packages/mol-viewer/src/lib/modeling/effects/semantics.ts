import type { Atom, Bond, Molecule } from '../../molecule'
import { lookupBondLengthByOrder } from '../../../config/geometry.config'
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

function clearAtomCoordinationAssignments(bond: Bond, atomId: string): Bond {
  const assignments = bond.coordinationSites?.filter(site => site.atomId !== atomId)
  if (assignments?.length === bond.coordinationSites?.length) return bond
  const { coordinationSites: _coordinationSites, ...plainBond } = bond
  return assignments && assignments.length > 0
    ? { ...plainBond, coordinationSites: assignments }
    : plainBond
}

function setBondOrder(bond: Bond, order: Bond['order']): Bond {
  const { aromatic: _aromatic, ...plainBond } = bond
  return { ...plainBond, order }
}

function isBondOrderSupported(atom1: Atom, atom2: Atom, order: Bond['order']): boolean {
  return lookupBondLengthByOrder(atom1.symbol, atom2.symbol, order) !== null
}

/** Pure V1 command semantics; this module has no dependency on the production builder. */
export function applyExpectedEffectCommand(
  molecule: Molecule,
  command: ExpectedEffectSupportedCommand,
): ApplyExpectedEffectCommandResult {
  switch (command.kind) {
    case 'atom.add':
      if (molecule.atoms.some(atom => atom.id === command.atomId)) {
        return invalidInput(`Atom id already exists: ${command.atomId}`)
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

    case 'atom.replace': {
      const target = molecule.atoms.find(atom => atom.id === command.atomId)
      if (!target) {
        return invalidInput(`Atom does not exist: ${command.atomId}`)
      }
      if (target.symbol === command.symbol) return { ok: true, molecule }
      return {
        ok: true,
        molecule: {
          ...molecule,
          atoms: molecule.atoms.map(atom =>
            atom.id === command.atomId && atom.symbol !== command.symbol
              ? replaceAtom(atom, command.symbol)
              : atom),
          bonds: molecule.bonds.map(bond =>
            clearAtomCoordinationAssignments(bond, command.atomId)),
        },
      }
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
      const atom1 = molecule.atoms.find(atom => atom.id === command.atomId1)
      if (!atom1) {
        return invalidInput(`Atom does not exist: ${command.atomId1}`)
      }
      const atom2 = molecule.atoms.find(atom => atom.id === command.atomId2)
      if (!atom2) {
        return invalidInput(`Atom does not exist: ${command.atomId2}`)
      }
      if (!isBondOrderSupported(atom1, atom2, command.order)) {
        return unsupportedSemantics(
          `ExpectedEffect cannot compile unsupported ${atom1.symbol}-${atom2.symbol} bond order ${command.order}`,
        )
      }
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
      const bond = molecule.bonds.find(candidate => candidate.id === command.bondId)
      if (!bond) {
        return invalidInput(`Bond does not exist: ${command.bondId}`)
      }
      const atom1 = molecule.atoms.find(atom => atom.id === bond.atomId1)
      const atom2 = molecule.atoms.find(atom => atom.id === bond.atomId2)
      if (!atom1 || !atom2) {
        return invalidInput(`Bond endpoint does not exist: ${command.bondId}`)
      }
      if (!isBondOrderSupported(atom1, atom2, command.order)) {
        return unsupportedSemantics(
          `ExpectedEffect cannot compile unsupported ${atom1.symbol}-${atom2.symbol} bond order ${command.order}`,
        )
      }
      return {
        ok: true,
        molecule: {
          ...molecule,
          bonds: molecule.bonds.map(bond =>
            bond.id === command.bondId && (bond.order !== command.order || bond.aromatic === true)
              ? setBondOrder(bond, command.order)
              : bond),
        },
      }
    }
  }
}
