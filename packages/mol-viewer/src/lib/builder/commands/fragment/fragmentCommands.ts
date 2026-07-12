import type { Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import {
  attachFragmentToAtom,
  fuseFragmentOnBond,
} from '../../editing/fragment'
import { editChanged, editFailed, type EditCommandResult } from '../shared'

export interface AttachFragmentToAtomCommandInput {
  readonly atomId: string
  readonly fragment: FragmentDef
}

export function runAttachFragmentToAtomCommand(
  molecule: Molecule,
  input: AttachFragmentToAtomCommandInput,
): EditCommandResult {
  const result = attachFragmentToAtom(molecule, input.fragment, input.atomId)
  return result.ok === false
    ? editFailed(result.reason)
    : editChanged(result.molecule)
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
