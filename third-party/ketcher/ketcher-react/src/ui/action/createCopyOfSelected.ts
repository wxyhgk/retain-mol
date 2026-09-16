import {
  type Action,
  type ReStruct,
  type Struct,
  type Vec2,
  fromPaste,
} from 'ketcher-core';

export interface CopySelectionContext {
  render: { ctab: ReStruct };
  structSelected(): Struct;
  update(action: Action, ignoreHistory?: boolean): void;
}

export const createCopyOfSelected = (
  editor: CopySelectionContext,
  point: Vec2,
) => {
  const restruct = editor.render.ctab;

  const struct: Struct = editor.structSelected();
  struct.findConnectedComponents();
  struct.setImplicitHydrogen();
  struct.setStereoLabelsToAtoms();
  struct.markFragments();

  const [action, , items] = fromPaste(restruct, struct, point);
  editor.update(action, true);
  return { action, items };
};
