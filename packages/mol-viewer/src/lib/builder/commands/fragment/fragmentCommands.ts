import type { Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import {
  attachFragmentToAtom,
  bridgeFragmentBetweenAtoms,
  fuseFragmentOnBond,
} from '../../editing/fragment'
import { editChanged, editFailed, type EditCommandResult } from '../shared'
import type { FragmentTorsionPreview } from '../../../types'

export interface AttachFragmentToAtomCommandInput {
  readonly atomId: string
  readonly fragment: FragmentDef
  readonly torsionAngleDegrees?: number
}

export function runAttachFragmentToAtomCommand(
  molecule: Molecule,
  input: AttachFragmentToAtomCommandInput,
): EditCommandResult {
  const result = attachFragmentToAtom(molecule, input.fragment, input.atomId, {
    ...(input.torsionAngleDegrees === undefined
      ? {}
      : { torsionAngleDegrees: input.torsionAngleDegrees }),
  })
  return result.ok === false
    ? editFailed(result.reason)
    : editChanged(result.molecule)
}

export function canPrepareFragmentTorsion(
  fragment: FragmentDef | undefined,
  molecule: Molecule,
  targetId: string,
): boolean {
  if (!fragment || (fragment.attachOrder ?? 1) !== 1) return false
  return attachFragmentToAtom(molecule, fragment, targetId, { torsionAngleDegrees: 0 }).ok
}

export function createFragmentTorsionPreviewCommand(
  fragment: FragmentDef | undefined,
  molecule: Molecule,
  targetId: string,
  angleDegrees: number,
): FragmentTorsionPreview | null {
  if (!fragment) return null
  const result = attachFragmentToAtom(molecule, fragment, targetId, { torsionAngleDegrees: angleDegrees })
  if (!result.ok) return null
  const existingIds = new Set(molecule.atoms.map(atom => atom.id))
  const newIds = new Set(result.molecule.atoms.filter(atom => !existingIds.has(atom.id)).map(atom => atom.id))
  const atomById = new Map(result.molecule.atoms.map(atom => [atom.id, atom]))
  return {
    atoms: result.molecule.atoms
      .filter(atom => newIds.has(atom.id))
      .map(atom => ({ symbol: atom.symbol, position: [atom.x, atom.y, atom.z] })),
    bonds: result.molecule.bonds.flatMap(bond => {
      if (!newIds.has(bond.atomId1) && !newIds.has(bond.atomId2)) return []
      const first = atomById.get(bond.atomId1)
      const second = atomById.get(bond.atomId2)
      return first && second ? [{
        start: [first.x, first.y, first.z] as const,
        end: [second.x, second.y, second.z] as const,
        order: bond.order,
      }] : []
    }),
  }
}

export interface FuseFragmentOnBondCommandInput {
  readonly bondId: string
  readonly fragment: FragmentDef
}

export function runFuseFragmentOnBondCommand(
  molecule: Molecule,
  input: FuseFragmentOnBondCommandInput,
): EditCommandResult {
  const result = fuseFragmentOnBond(molecule, input.fragment, input.bondId)
  return result.ok === false
    ? editFailed(result.reason)
    : editChanged(result.molecule)
}

export interface BridgeFragmentBetweenAtomsCommandInput {
  readonly atomId1: string
  readonly atomId2: string
  readonly fragment: FragmentDef
  readonly orientationDegrees?: number
}

export function runBridgeFragmentBetweenAtomsCommand(
  molecule: Molecule,
  input: BridgeFragmentBetweenAtomsCommandInput,
): EditCommandResult {
  const result = bridgeFragmentBetweenAtoms(
    molecule,
    input.fragment,
    input.atomId1,
    input.atomId2,
    input.orientationDegrees === undefined
      ? {}
      : { orientationDegrees: input.orientationDegrees },
  )
  return result.ok === false
    ? editFailed(result.reason)
    : editChanged(result.molecule)
}
