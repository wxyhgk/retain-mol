import type { Molecule } from '../../../molecule'
import { planMoleculePlacement } from '../../geometry/placementPlanner'
import { runAddAtomCommand } from '../atom'
import { runCreateFragmentPlacementCommand } from '../fragment'
import { editMolecule, editFailed, type EditCommandResult } from '../shared'
import type { PlacementCommandInput, ResolvePlacementCommandInput } from './placementCommandResolver'
import { resolvePlacementCommandInput } from './placementCommandResolver'

export class PlacementCommandSession {
  resolve(input: ResolvePlacementCommandInput): PlacementCommandInput {
    return resolvePlacementCommandInput(input)
  }

  commit(molecule: Molecule, input: PlacementCommandInput): EditCommandResult {
    return runPlacementCommand(molecule, input)
  }
}

export function runPlacementCommand(
  molecule: Molecule,
  input: PlacementCommandInput,
): EditCommandResult {
  const placementResult = input.fragment
    ? runCreateFragmentPlacementCommand({
        fragment: input.fragment,
        position: input.position,
        ...(input.hybridPartner === undefined
          ? {}
          : { hybridPartner: input.hybridPartner }),
        ...(input.orientation === undefined
          ? {}
          : { orientation: input.orientation }),
      })
    : runAddAtomCommand(
        { name: 'Placement', atoms: [], bonds: [] },
        input.activeElement,
        input.position.x,
        input.position.y,
        input.position.z,
      )
  if (!placementResult.ok || !placementResult.changed) return placementResult
  const plan = planMoleculePlacement(molecule.atoms, placementResult.molecule, {
    ...(input.avoidClashes === undefined
      ? {}
      : { avoidClashes: input.avoidClashes }),
    ...(input.orientation === undefined
      ? {}
      : { orientation: input.orientation }),
  })
  if (input.avoidClashes !== false && plan.score.overlapPenalty > 1e-9) {
    return editFailed('放置位置空间不足，请在更远处重试')
  }
  const wasNudged = Math.hypot(plan.offset.x, plan.offset.y, plan.offset.z) > 1e-9
  return editMolecule(molecule, {
    ...molecule,
    atoms: [...molecule.atoms, ...plan.molecule.atoms],
    bonds: [...molecule.bonds, ...plan.molecule.bonds],
  }, wasNudged ? '已自动避开碰撞' : undefined)
}
