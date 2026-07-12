import type { Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import {
  placeFragmentStandalone,
  placeHybridPrototype,
} from '../../editing/fragment'
import { editChanged, type EditCommandResult } from '../shared'

export interface CreateFragmentPlacementCommandInput {
  readonly fragment: FragmentDef
  readonly hybridPartner?: FragmentDef
  readonly position: { readonly x: number; readonly y: number; readonly z: number }
  readonly orientation?: { readonly x: number; readonly y: number; readonly z: number }
}

export function runCreateFragmentPlacementCommand(
  input: CreateFragmentPlacementCommandInput,
): EditCommandResult {
  const empty: Molecule = { name: 'Placement', atoms: [], bonds: [] }
  const order = input.fragment.attachOrder ?? 1
  return editChanged(
    order > 1 && input.hybridPartner
      ? placeHybridPrototype(
          empty,
          input.fragment,
          input.hybridPartner,
          input.position,
          input.orientation,
        )
      : placeFragmentStandalone(
          empty,
          input.fragment,
          input.position,
          input.orientation,
        ),
  )
}
