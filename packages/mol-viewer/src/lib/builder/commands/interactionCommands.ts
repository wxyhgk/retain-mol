import type { Molecule } from '../../molecule'
import { resolveBondDragStartDecision } from './bondDragStartDecision'
export type {
  GrowGuideCommandInput,
  GrowPreviewCommandInput,
  GrowPreviewResult,
} from './growPreviewCommands'
export {
  getGrowGuideCommand,
  getGrowPreviewCommand,
} from './growPreviewCommands'

export interface BondDragStartCommandInput {
  readonly sourceId: string
  readonly selectedAtomIds: ReadonlySet<string>
  readonly hasActiveFragment: boolean
}

export function canStartBondDragCommand(
  molecule: Molecule,
  input: BondDragStartCommandInput,
): boolean {
  return resolveBondDragStartDecision(molecule, input).kind === 'allow'
}
