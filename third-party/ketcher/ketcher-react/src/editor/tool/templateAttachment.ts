import {
  Action,
  ActionTransaction,
  fromItemsFuse,
  fromTemplateOnBondAction,
  getItemsToFuse,
  KetcherLogger,
  Vec2,
} from 'ketcher-core';
import { getBondFlipSign, getSign } from './template.helpers';
import type {
  InternalTemplate,
  TemplateAttachmentContext,
  TemplateToolInput,
} from './template.types';

const LOG_TAG = 'templateAttachment.ts::attachTemplateToBond';

export type BondTemplateInput = Pick<
  TemplateToolInput,
  'struct' | 'aid' | 'bid'
>;

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function getExistingId(
  value: string | number | undefined,
  items: { has(id: number): boolean },
): number | undefined {
  const id = Number(value);
  return Number.isInteger(id) && items.has(id) ? id : undefined;
}

function prepareTemplate(input: BondTemplateInput): InternalTemplate {
  const molecule = input?.struct;
  if (!molecule?.atoms || !molecule.bonds || !molecule.sgroups) {
    throw new Error('A valid structure template is required');
  }

  // Explicit attachment ids are honored only when they exist in this template.
  // Built-in ring templates use bond 0, which remains the compatibility fallback.
  const bid = getExistingId(input.bid, molecule.bonds) ?? 0;
  const bond = molecule.bonds.get(bid);
  if (!bond) {
    throw new Error(`Template attachment bond ${bid} was not found`);
  }

  const sgroup = molecule.sgroups.get(0);
  const sgroupAid = sgroup?.getAttachmentAtomId?.();
  const aid =
    getExistingId(input.aid, molecule.atoms) ??
    getExistingId(sgroupAid, molecule.atoms) ??
    0;

  const center = new Vec2();
  let pointCount = 0;
  molecule.atoms.forEach((atom) => {
    if (atom.pp) {
      center.add_(atom.pp); // eslint-disable-line no-underscore-dangle
      pointCount++;
    }
  });

  return {
    molecule,
    aid,
    bid,
    // Keep keyboard attachment orientation identical to TemplateTool.
    sign: pointCount
      ? getSign(molecule, bond, center.scaled(1 / pointCount))
      : 0,
  };
}

/**
 * Attach a structure template along an existing bond as one async transaction.
 * Errors are reported and consumed so keyboard dispatch cannot create an
 * unhandled rejection.
 */
export async function attachTemplateToBond(
  ctx: TemplateAttachmentContext,
  input: BondTemplateInput,
  targetBondId: number,
  flip?: boolean,
): Promise<boolean> {
  let transaction: ActionTransaction | undefined;
  let restruct: TemplateAttachmentContext['render']['ctab'] | undefined;
  let updateAttempted = false;

  try {
    restruct = ctx.render.ctab;
    transaction = new ActionTransaction(restruct);
    const targetBond = restruct.bonds.get(targetBondId)?.b;
    if (!targetBond) {
      throw new Error(`Target bond ${targetBondId} was not found`);
    }

    const template = prepareTemplate(input);
    const shouldFlip =
      flip ??
      getBondFlipSign(restruct.molecule, targetBond) * template.sign > 0;
    const [action, pasteItems] = await fromTemplateOnBondAction(
      restruct,
      template,
      targetBondId,
      ctx.event,
      shouldFlip,
      true,
    );
    transaction.capture(action);
    const mergeItems = getItemsToFuse(
      restruct.molecule,
      ctx.findMerge(pasteItems, ['atoms', 'bonds']),
    );
    const fuseAction = fromItemsFuse(restruct, mergeItems);
    transaction.capture(fuseAction);
    const historyAction = new Action([
      ...fuseAction.operations,
      ...action.operations,
    ]);
    updateAttempted = true;
    ctx.update(historyAction);
    transaction.commit();
    return true;
  } catch (cause) {
    const error = asError(cause);

    if (transaction) {
      try {
        transaction.rollback();
      } catch (rollbackCause) {
        KetcherLogger.error(LOG_TAG, asError(rollbackCause));
      } finally {
        if (updateAttempted) ctx.notifyDocumentChange?.('untracked');
      }
    }
    KetcherLogger.error(LOG_TAG, error);
    ctx.errorHandler?.(error.message);
    return false;
  }
}
