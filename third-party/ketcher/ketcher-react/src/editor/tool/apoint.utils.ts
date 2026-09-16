import {
  AttachmentPoints,
  type Atom,
  fromAtomsAttrs,
  fromRGroupAttachmentPointUpdate,
  KetcherLogger,
} from 'ketcher-core';
import type { IToolContext } from './IToolContext';

type APointEditContext = Pick<IToolContext, 'event' | 'render' | 'update'>;

function isAttachmentPoints(value: unknown): value is AttachmentPoints | null {
  return (
    value === null ||
    (typeof value === 'number' &&
      Object.values(AttachmentPoints).includes(value as AttachmentPoints))
  );
}

export async function editRGroupAttachmentPoint(
  editor: APointEditContext,
  atom: Atom,
  atomId: number,
) {
  try {
    const newAtom = await editor.event.elementEdit.dispatch({
      attachmentPoints: atom.attachmentPoints,
    });

    const previousAttachmentPoints = atom?.attachmentPoints;
    const currentAttachmentPoints = newAtom.attachmentPoints;
    if (!isAttachmentPoints(currentAttachmentPoints)) {
      throw new Error('Invalid R-group attachment points');
    }
    if (previousAttachmentPoints !== currentAttachmentPoints) {
      const actionFromAtomsAttrs = fromAtomsAttrs(
        editor.render.ctab,
        atomId,
        newAtom,
        null,
      );
      const actionFromRGroupAttachmentPointUpdate =
        fromRGroupAttachmentPointUpdate(
          editor.render.ctab,
          atomId,
          currentAttachmentPoints,
        );
      const action = actionFromAtomsAttrs.mergeWith(
        actionFromRGroupAttachmentPointUpdate,
      );
      editor.update(action);
    }
  } catch (e) {
    KetcherLogger.error('apoint.utils.ts::editRGroupAttachmentPoint', e);
    // close modal without any operations
  }
}
