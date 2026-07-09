import type { Molecule } from '../../molecule'
import type { FragmentDef } from '../fragmentLibrary'
import { avoidMoleculePlacementClashes } from '../geometry/placementPlanner'
import {
  attachFragmentToAtom,
  fuseFragmentOnBond,
  placeFragmentStandalone,
  placeHybridPrototype,
} from '../editing/fragment'
import { editChanged, editFailed, type EditCommandResult } from './commandResult'
import { runAddAtomCommand } from './moleculeStoreCommands'
import type { PlacementCommandInput, ResolvePlacementCommandInput } from './placementCommandResolver'
import { resolvePlacementCommandInput } from './placementCommandResolver'

export type {
  PlacementCommandInput,
  ResolvePlacementCommandInput,
} from './placementCommandResolver'
export {
  resolvePlacementCommandInput,
  resolveHybridPlacementPartner,
  resolvePlacementOrientation,
} from './placementCommandResolver'

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

export type PlacementPreviewCommandResult =
  | { ok: true; preview: Molecule }
  | { ok: false; reason: string }

export class PlacementCommandSession {
  resolve(input: ResolvePlacementCommandInput): PlacementCommandInput {
    return resolvePlacementCommandInput(input)
  }

  preview(
    baseMolecule: Molecule,
    input: PlacementCommandInput,
  ): PlacementPreviewCommandResult {
    return runPlacementPreviewCommand(baseMolecule, input)
  }

  commit(
    molecule: Molecule,
    input: PlacementCommandInput,
  ): EditCommandResult {
    return runPlacementCommand(molecule, input)
  }
}

export function runPlacementPreviewCommand(
  baseMolecule: Molecule,
  input: PlacementCommandInput,
): PlacementPreviewCommandResult {
  const result = createPlacementMolecule(input)
  if (result.ok === false) return { ok: false, reason: result.reason }
  if (!result.changed) return { ok: true, preview: { name: 'Placement Preview', atoms: [], bonds: [] } }
  return {
    ok: true,
    preview: resolvePlacementClashes(baseMolecule, result.molecule, input),
  }
}

export function runPlacementCommand(
  molecule: Molecule,
  input: PlacementCommandInput,
): EditCommandResult {
  const previewResult = runPlacementPreviewCommand(molecule, input)
  if (previewResult.ok === false) return editFailed(previewResult.reason)
  return editChanged({
      ...molecule,
      atoms: [...molecule.atoms, ...previewResult.preview.atoms],
      bonds: [...molecule.bonds, ...previewResult.preview.bonds],
    })
}

function createPlacementMolecule(input: PlacementCommandInput): EditCommandResult {
  const empty: Molecule = { name: 'Placement Preview', atoms: [], bonds: [] }
  if (input.fragment) {
    const order = input.fragment.attachOrder ?? 1
    if (order > 1 && input.hybridPartner) {
      return editChanged(
        placeHybridPrototype(
          empty,
          input.fragment,
          input.hybridPartner,
          input.position,
          input.orientation,
        ),
      )
    }
    return editChanged(
      placeFragmentStandalone(
        empty,
        input.fragment,
        input.position,
        input.orientation,
      ),
    )
  }

  const result = runAddAtomCommand(
    empty,
    input.activeElement,
    input.position.x,
    input.position.y,
    input.position.z,
  )
  return editChanged(result.molecule)
}

function resolvePlacementClashes(
  baseMolecule: Molecule,
  placement: Molecule,
  input: PlacementCommandInput,
): Molecule {
  return avoidMoleculePlacementClashes(baseMolecule.atoms, placement, {
    avoidClashes: input.avoidClashes,
    orientation: input.orientation,
  })
}
