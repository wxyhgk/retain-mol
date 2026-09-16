import {
  Action,
  ActionTransaction,
  fromBondAddition,
  fromTemplateOnAtom,
} from 'ketcher-core';
import type { IToolContext } from './IToolContext';

export type AtomHotspotCommand =
  | 'single-bond'
  | 'carbonyl'
  | 'ring'
  | 'gem-dimethyl'
  | 'stereo-gem-dimethyl';

export type AtomHotspotOptions = {
  command: AtomHotspotCommand;
  struct?: unknown;
};

type SproutTemplateMolecule = {
  atoms: {
    forEach: (fn: (atom: { pp: { x: number; y: number } }) => void) => void;
    size: number;
    get: (id: number) => { pp: { x: number; y: number } } | undefined;
  };
  sgroups: {
    get: (id: number) => { getAttachmentAtomId?: () => number } | undefined;
  };
};

function prepareSproutTemplate(struct: unknown) {
  if (!struct || typeof struct !== 'object' || !('atoms' in struct)) {
    return null;
  }

  const molecule = struct as SproutTemplateMolecule;
  const sgroup = molecule.sgroups.get(0);
  let cx = 0;
  let cy = 0;
  molecule.atoms.forEach((atom) => {
    cx += atom.pp.x;
    cy += atom.pp.y;
  });
  const count = molecule.atoms.size || 1;
  const center = { x: cx / count, y: cy / count };
  const aid = sgroup?.getAttachmentAtomId?.() ?? 0;
  const atom = molecule.atoms.get(aid);
  const angle0 = atom
    ? Math.atan2(center.y - atom.pp.y, center.x - atom.pp.x)
    : 0;

  return { molecule: struct, aid, bid: 0, angle0 };
}

export function shouldAddConnectorBeforeRing(atomDegree: number): boolean {
  return atomDegree >= 3;
}

function addBondToAtom(
  ctx: IToolContext,
  atomId: number,
  bond: { type: number; stereo?: number },
  label: 'C' | 'O',
): Action {
  return fromBondAddition(ctx.render.ctab, bond, atomId, { label })[0];
}

function addGemDimethyl(
  ctx: IToolContext,
  atomId: number,
  withStereochemistry: boolean,
) {
  const atom = ctx.render.ctab.atoms.get(atomId)?.a;
  if (atom?.label !== 'C' || atom.neighbors.length !== 2) return;

  const transaction = new ActionTransaction(ctx.render.ctab);
  let updateAttempted = false;

  try {
    const firstBond = transaction.capture(
      addBondToAtom(
        ctx,
        atomId,
        withStereochemistry ? { type: 1, stereo: 1 } : { type: 1 },
        'C',
      ),
    );
    const secondBond = transaction.capture(
      addBondToAtom(
        ctx,
        atomId,
        withStereochemistry ? { type: 1, stereo: 6 } : { type: 1 },
        'C',
      ),
    );

    // Keep history newest-first without mutating either Action captured by the
    // transaction. Mutating a captured Action would make rollback execute the
    // first bond twice if update failed.
    const historyAction = new Action([
      ...secondBond.operations,
      ...firstBond.operations,
    ]);
    updateAttempted = true;
    ctx.update(historyAction);
    transaction.commit();
  } catch (cause) {
    try {
      transaction.rollback(cause);
    } finally {
      if (updateAttempted) ctx.notifyDocumentChange?.('untracked');
    }
  }
}

export function executeAtomHotspotCommand(
  ctx: IToolContext,
  atomId: number,
  options: AtomHotspotOptions,
) {
  switch (options.command) {
    case 'single-bond':
      ctx.update(addBondToAtom(ctx, atomId, { type: 1 }, 'C'));
      return;
    case 'carbonyl':
      ctx.update(addBondToAtom(ctx, atomId, { type: 2 }, 'O'));
      return;
    case 'gem-dimethyl':
      addGemDimethyl(ctx, atomId, false);
      return;
    case 'stereo-gem-dimethyl':
      addGemDimethyl(ctx, atomId, true);
      return;
    case 'ring': {
      const template = prepareSproutTemplate(options.struct);
      if (!template) return;

      const atomDegree =
        ctx.render.ctab.atoms.get(atomId)?.a.neighbors.length ?? 0;
      const [action] = fromTemplateOnAtom(
        ctx.render.ctab,
        template,
        atomId,
        null,
        shouldAddConnectorBeforeRing(atomDegree),
      );
      ctx.update(action);
    }
  }
}
