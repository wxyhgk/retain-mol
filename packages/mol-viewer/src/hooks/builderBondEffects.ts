import type { Molecule } from '../lib/molecule'
import {
  routeBondClickForIntent,
  runBondClickCommand,
  runBondDragEndCommand,
  type BondClickRoute,
} from '../lib/builder/commands/interaction'
import { canStartBondDragCommand } from '../lib/builder/commands/bond'
import {
  shouldAttemptBondDragStartForIntent,
  shouldRunEditCommandForIntent,
  type BuilderIntent,
} from '../lib/builder/commands/interaction'
import {
  runEditCommand,
  type BuilderVector3,
  type EditCommandEffects,
} from './builderEditCommandEffects'

export interface BondClickRouteEffects {
  readonly selectBond: (multi: boolean) => void
  readonly runCommand: (
    route: Extract<BondClickRoute, { kind: 'command' }>,
  ) => void
}

export function applyBondClickRoute(
  route: BondClickRoute,
  effects: BondClickRouteEffects,
): void {
  switch (route.kind) {
    case 'select':
      effects.selectBond(route.multi)
      break
    case 'command':
      effects.runCommand(route)
      break
    case 'noop':
      break
  }
}

export interface BondClickIntentInput {
  readonly bondId: string
  readonly shiftKey: boolean
  readonly altKey: boolean
}

export interface BondClickIntentEffects {
  readonly selectBond: (multi: boolean) => void
  readonly editEffects: EditCommandEffects
}

export function shouldHandleBondClickForIntent(
  intent: BuilderIntent,
  input: Pick<BondClickIntentInput, 'shiftKey' | 'altKey'>,
): boolean {
  return routeBondClickForIntent(intent, input).kind !== 'noop'
}

export function applyBondClickForIntent(
  intent: BuilderIntent,
  molecule: Molecule,
  input: BondClickIntentInput,
  effects: BondClickIntentEffects,
): void {
  const route = routeBondClickForIntent(intent, {
    shiftKey: input.shiftKey,
    altKey: input.altKey,
  })
  applyBondClickRoute(route, {
    selectBond: effects.selectBond,
    runCommand: (commandRoute) => {
      runEditCommand(
        molecule,
        (mol) =>
          runBondClickCommand(mol, {
            bondId: input.bondId,
            ...(commandRoute.fragment !== undefined ? { fragment: commandRoute.fragment } : {}),
            cycleLength: commandRoute.cycleLength,
          }),
        effects.editEffects,
      )
    },
  })
}

export function applyBondDragEndCommand(
  intent: BuilderIntent,
  molecule: Molecule,
  input: {
    readonly sourceId: string
    readonly targetId: string | null
    readonly dropLocal: BuilderVector3 | null
  },
  effects: EditCommandEffects,
): void {
  if (!shouldRunEditCommandForIntent(intent)) return
  runEditCommand(
    molecule,
    (mol) =>
      runBondDragEndCommand(mol, {
        sourceId: input.sourceId,
        targetId: input.targetId,
        dropLocal: input.dropLocal,
        activeElement: intent.activeElement,
      }),
    effects,
  )
}

export interface BondDragStartIntentInput {
  readonly sourceId: string
  readonly selectedAtomIds: ReadonlySet<string>
}

export function shouldAttemptBondDragForIntent(
  intent: BuilderIntent,
  input: BondDragStartIntentInput,
): boolean {
  return shouldAttemptBondDragStartForIntent(intent, {
    sourceSelected: input.selectedAtomIds.has(input.sourceId),
  })
}

export function shouldStartBondDragForIntent(
  intent: BuilderIntent,
  molecule: Molecule,
  input: BondDragStartIntentInput,
): boolean {
  if (!shouldAttemptBondDragForIntent(intent, input)) return false

  return canStartBondDragCommand(molecule, {
    sourceId: input.sourceId,
    selectedAtomIds: input.selectedAtomIds,
    hasActiveFragment: Boolean(intent.fragment),
  })
}
