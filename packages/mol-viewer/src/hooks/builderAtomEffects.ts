import type { Molecule } from '../lib/molecule'
import {
  routeAtomClickForIntent,
  runAtomClickCommand,
  type AtomClickRoute,
} from '../lib/builder/commands/interaction'
import { runSelectConnectedFragmentCommand } from '../lib/builder/commands/selection'
import {
  shouldSelectFragmentOnAtomDoubleClickForIntent,
  type BuilderIntent,
} from '../lib/builder/commands/interaction'
import {
  runEditCommand,
  type EditCommandEffects,
} from './builderEditCommandEffects'

export interface AtomClickRouteEffects {
  readonly addMeasureAtom: () => void
  readonly selectAtom: (append: boolean) => void
  readonly runCommand: (
    route: Extract<AtomClickRoute, { kind: 'command' }>,
  ) => void
}

export function applyAtomClickRoute(
  route: AtomClickRoute,
  effects: AtomClickRouteEffects,
): void {
  switch (route.kind) {
    case 'measure':
      effects.addMeasureAtom()
      break
    case 'select':
      effects.selectAtom(route.append)
      break
    case 'command':
      effects.runCommand(route)
      break
    case 'noop':
      break
  }
}

export interface AtomClickIntentInput {
  readonly atomId: string
  readonly shiftKey: boolean
}

export interface AtomClickIntentEffects {
  readonly addMeasureAtom: () => void
  readonly selectAtom: (append: boolean) => void
  readonly editEffects: EditCommandEffects
}

export function applyAtomClickForIntent(
  intent: BuilderIntent,
  molecule: Molecule,
  input: AtomClickIntentInput,
  effects: AtomClickIntentEffects,
): void {
  const route = routeAtomClickForIntent(intent, { shiftKey: input.shiftKey })
  applyAtomClickRoute(route, {
    addMeasureAtom: effects.addMeasureAtom,
    selectAtom: effects.selectAtom,
    runCommand: (commandRoute) => {
      runEditCommand(
        molecule,
        (mol) =>
          runAtomClickCommand(mol, {
            atomId: input.atomId,
            activeElement: intent.activeElement,
            atomClickMode: intent.atomClickMode,
            fragment: commandRoute.fragment,
          }),
        effects.editEffects,
      )
    },
  })
}

export interface SelectConnectedFragmentResult {
  readonly ok: boolean
  readonly atomIds?: ReadonlySet<string>
}

export interface AtomDoubleClickEffects {
  readonly selectAtoms: (atomIds: ReadonlySet<string>) => void
}

export function applyAtomDoubleClickFragmentSelection(
  result: SelectConnectedFragmentResult,
  effects: AtomDoubleClickEffects,
): void {
  if (result.ok && result.atomIds) effects.selectAtoms(result.atomIds)
}

export function applyAtomDoubleClickForIntent(
  intent: BuilderIntent,
  molecule: Molecule,
  atomId: string,
  effects: AtomDoubleClickEffects,
): void {
  if (!shouldSelectFragmentOnAtomDoubleClickForIntent(intent)) return
  applyAtomDoubleClickFragmentSelection(
    runSelectConnectedFragmentCommand(molecule, { atomId }),
    effects,
  )
}
