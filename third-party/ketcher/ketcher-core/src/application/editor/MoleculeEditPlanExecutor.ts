import {
  type MoleculeEditPlanAddAtomCommand,
  type MoleculeEditPlanAddBondCommand,
  type MoleculeEditPlanStep,
  type MoleculeEditPlanV1,
} from '../recognition/moleculeEditPlan.types';
import { Vec2 } from 'domain/entities';
import {
  ActionTransaction,
  fromAtomAddition,
  fromBondAddition,
  type Action,
} from './actions';
import type { Editor } from './editor.types';

const SUPPORTED_MOLECULE_EDIT_PLAN_SCHEMA =
  'retainmol.molecule-edit-plan.v1' as const;

export type MoleculeEditPlanErrorCode =
  | 'schema-mismatch'
  | 'duplicate-reference'
  | 'missing-reference'
  | 'invalid-coordinate'
  | 'invalid-bond'
  | 'unsupported-step-shape'
  | 'count-mismatch'
  | 'playback-in-progress';

export class MoleculeEditPlanError extends Error {
  constructor(readonly code: MoleculeEditPlanErrorCode, message: string) {
    super(message);
    this.name = 'MoleculeEditPlanError';
  }
}

type ExecutionContext = Pick<
  Editor,
  'render' | 'update' | 'notifyDocumentChange'
>;

export type MoleculeEditPlanStepResult = {
  step: MoleculeEditPlanStep;
  stepIndex: number;
  atomIds: ReadonlyMap<string, number>;
  bondIds: ReadonlyMap<string, number>;
};

export type MoleculeEditPlanPlaybackOptions = {
  delayMs?: number;
  signal?: AbortSignal;
  positionOffset?: { x: number; y: number };
  onStep?: (result: MoleculeEditPlanStepResult) => void;
  wait?: (delayMs: number) => Promise<void>;
};

function fail(code: MoleculeEditPlanErrorCode, message: string): never {
  throw new MoleculeEditPlanError(code, message);
}

function isAddAtom(
  command: MoleculeEditPlanStep['commands'][number],
): command is MoleculeEditPlanAddAtomCommand {
  return command.type === 'addAtom';
}

function isAddBond(
  command: MoleculeEditPlanStep['commands'][number],
): command is MoleculeEditPlanAddBondCommand {
  return command.type === 'addBond';
}

export function validateMoleculeEditPlan(plan: MoleculeEditPlanV1): void {
  if (plan.schema !== SUPPORTED_MOLECULE_EDIT_PLAN_SCHEMA) {
    fail('schema-mismatch', `Unsupported molecule edit plan: ${plan.schema}`);
  }
  const atomRefs = new Set<string>();
  const bondRefs = new Set<string>();
  const stepIds = new Set<string>();
  for (const step of plan.steps) {
    if (!step.id || stepIds.has(step.id)) {
      fail(
        'duplicate-reference',
        `Duplicate or empty step reference: ${step.id}`,
      );
    }
    stepIds.add(step.id);
    const atomCommands = step.commands.filter(isAddAtom);
    const bondCommands = step.commands.filter(isAddBond);
    const supportedShape =
      (atomCommands.length === 1 &&
        bondCommands.length === 0 &&
        step.commands.length === 1) ||
      (atomCommands.length === 1 &&
        bondCommands.length === 1 &&
        step.commands.length === 2) ||
      (atomCommands.length === 0 &&
        bondCommands.length === 1 &&
        step.commands.length === 1);
    if (!supportedShape) {
      fail(
        'unsupported-step-shape',
        `Step ${step.id} must place one atom, extend one atom and bond, or add one closing bond`,
      );
    }
    for (const command of atomCommands) {
      const { atom } = command;
      if (!atom.ref || atomRefs.has(atom.ref)) {
        fail(
          'duplicate-reference',
          `Duplicate or empty atom reference: ${atom.ref}`,
        );
      }
      if (
        !atom.element?.trim() ||
        !Number.isFinite(atom.position.x) ||
        !Number.isFinite(atom.position.y)
      ) {
        fail(
          'invalid-coordinate',
          `Atom ${atom.ref} is missing a valid element or position`,
        );
      }
      atomRefs.add(atom.ref);
    }
    for (const command of bondCommands) {
      const { bond } = command;
      if (!bond.ref || bondRefs.has(bond.ref)) {
        fail(
          'duplicate-reference',
          `Duplicate or empty bond reference: ${bond.ref}`,
        );
      }
      if (
        bond.begin === bond.end ||
        !Number.isInteger(bond.order) ||
        bond.order < 1 ||
        !atomRefs.has(bond.begin) ||
        !atomRefs.has(bond.end)
      ) {
        fail('invalid-bond', `Bond ${bond.ref} has invalid endpoints or order`);
      }
      bondRefs.add(bond.ref);
    }
  }
  const declaredAtomRefs = new Set(plan.atoms.map(({ ref }) => ref));
  const declaredBondRefs = new Set(plan.bonds.map(({ ref }) => ref));
  if (
    atomRefs.size !== plan.atomCount ||
    bondRefs.size !== plan.bondCount ||
    declaredAtomRefs.size !== plan.atomCount ||
    declaredBondRefs.size !== plan.bondCount ||
    [...atomRefs].some((ref) => !declaredAtomRefs.has(ref)) ||
    [...bondRefs].some((ref) => !declaredBondRefs.has(ref))
  ) {
    fail(
      'count-mismatch',
      'Molecule edit plan counts or declarations do not match its commands',
    );
  }
}

function newPoolId(before: Set<number>, after: Iterable<number>, kind: string) {
  const added = [...after].filter((id) => !before.has(id));
  if (added.length !== 1) {
    fail(
      'count-mismatch',
      `Expected one new ${kind}, received ${added.length}`,
    );
  }
  return added[0];
}

function offsetPosition(
  position: { x: number; y: number },
  offset: { x: number; y: number },
) {
  return new Vec2(position.x + offset.x, position.y + offset.y);
}

export class MoleculeEditPlanExecutor {
  readonly atomIds = new Map<string, number>();
  readonly bondIds = new Map<string, number>();
  #nextStepIndex = 0;
  #playing = false;

  constructor(
    private readonly context: ExecutionContext,
    readonly plan: MoleculeEditPlanV1,
    private readonly positionOffset = { x: 0, y: 0 },
  ) {
    validateMoleculeEditPlan(plan);
  }

  get nextStepIndex() {
    return this.#nextStepIndex;
  }

  get isComplete() {
    return this.#nextStepIndex >= this.plan.steps.length;
  }

  applyNextStep(): MoleculeEditPlanStepResult | null {
    if (this.isComplete) return null;
    const stepIndex = this.#nextStepIndex;
    const step = this.plan.steps[stepIndex];
    const atomCommand = step.commands.find(isAddAtom);
    const bondCommand = step.commands.find(isAddBond);
    const transaction = new ActionTransaction(this.context.render.ctab);
    const previousAtomIds = new Map(this.atomIds);
    const previousBondIds = new Map(this.bondIds);
    let updateAttempted = false;

    try {
      let rollback: Action;

      if (atomCommand && !bondCommand) {
        const before = new Set(this.context.render.ctab.molecule.atoms.keys());
        rollback = fromAtomAddition(
          this.context.render.ctab,
          offsetPosition(atomCommand.atom.position, this.positionOffset),
          {
            label: atomCommand.atom.element,
            charge: atomCommand.atom.charge,
            isotope: atomCommand.atom.isotope,
          },
        );
        transaction.capture(rollback);
        this.atomIds.set(
          atomCommand.atom.ref,
          newPoolId(
            before,
            this.context.render.ctab.molecule.atoms.keys(),
            'atom',
          ),
        );
      } else if (atomCommand && bondCommand) {
        const { atom } = atomCommand;
        const { bond } = bondCommand;
        const newAtomIsBegin = bond.begin === atom.ref;
        const existingRef = newAtomIsBegin ? bond.end : bond.begin;
        const existingId = this.atomIds.get(existingRef);
        if (existingId === undefined) {
          fail(
            'missing-reference',
            `Atom ${existingRef} is not available at ${step.id}`,
          );
        }
        const atomAttributes = {
          label: atom.element,
          charge: atom.charge,
          isotope: atom.isotope,
        };
        const position = offsetPosition(atom.position, this.positionOffset);
        const [action, beginId, endId, bondId] = newAtomIsBegin
          ? fromBondAddition(
              this.context.render.ctab,
              { type: bond.order, stereo: bond.stereo },
              atomAttributes,
              existingId,
              position,
            )
          : fromBondAddition(
              this.context.render.ctab,
              { type: bond.order, stereo: bond.stereo },
              existingId,
              atomAttributes,
              undefined,
              position,
            );
        rollback = action;
        transaction.capture(rollback);
        this.atomIds.set(atom.ref, newAtomIsBegin ? beginId : endId);
        this.bondIds.set(bond.ref, bondId);
      } else if (bondCommand) {
        const { bond } = bondCommand;
        const beginId = this.atomIds.get(bond.begin);
        const endId = this.atomIds.get(bond.end);
        if (beginId === undefined || endId === undefined) {
          fail(
            'missing-reference',
            `Bond ${bond.ref} references an unavailable atom`,
          );
        }
        const [action, , , bondId] = fromBondAddition(
          this.context.render.ctab,
          { type: bond.order, stereo: bond.stereo },
          beginId,
          endId,
        );
        rollback = action;
        transaction.capture(rollback);
        this.bondIds.set(bond.ref, bondId);
      } else {
        fail(
          'unsupported-step-shape',
          `Step ${step.id} has no executable command`,
        );
      }

      updateAttempted = true;
      this.context.update(rollback);
      this.#nextStepIndex += 1;
      transaction.commit();
      return {
        step,
        stepIndex,
        atomIds: new Map(this.atomIds),
        bondIds: new Map(this.bondIds),
      };
    } catch (cause) {
      this.atomIds.clear();
      previousAtomIds.forEach((id, ref) => this.atomIds.set(ref, id));
      this.bondIds.clear();
      previousBondIds.forEach((id, ref) => this.bondIds.set(ref, id));
      try {
        return transaction.rollback(cause);
      } finally {
        // update may have published the candidate before a legacy listener or
        // renderer threw. Refresh observers after compensation, including a
        // partial rollback; never leave a cached successful candidate behind.
        if (updateAttempted) this.context.notifyDocumentChange?.('untracked');
      }
    }
  }

  async play(options: MoleculeEditPlanPlaybackOptions = {}): Promise<void> {
    if (this.#playing) {
      fail(
        'playback-in-progress',
        'Molecule edit plan playback is already running',
      );
    }
    this.#playing = true;
    const delayMs = Math.max(0, options.delayMs ?? 500);
    const wait =
      options.wait ??
      ((duration) => new Promise((resolve) => setTimeout(resolve, duration)));
    try {
      while (!this.isComplete && !options.signal?.aborted) {
        const result = this.applyNextStep();
        if (result) options.onStep?.(result);
        if (!this.isComplete && delayMs > 0 && !options.signal?.aborted) {
          await wait(delayMs);
        }
      }
    } finally {
      this.#playing = false;
    }
  }
}
