import type { IToolContext } from '../IToolContext';
import type { DragContext } from '../select/select.types';

type MacroMoleculeContext = Pick<IToolContext, 'findItem' | 'struct'>;

const isMacroMolecule = (editor: MacroMoleculeContext, id: number): boolean => {
  const struct = editor.struct();
  return struct.isFunctionalGroupFromMacromolecule(id);
};

const isMergingToMacroMolecule = (
  editor: MacroMoleculeContext,
  dragCtx: DragContext,
): boolean => {
  const funcGroups = dragCtx?.mergeItems?.atomToFunctionalGroup;
  if (!funcGroups?.size) {
    return false;
  }
  const [[, targetObjectId]] = funcGroups;
  return isMacroMolecule(editor, targetObjectId);
};

const isBondingWithMacroMolecule = (
  editor: MacroMoleculeContext,
  event: MouseEvent,
) => {
  const ci = editor.findItem(event, ['bonds', 'functionalGroups']);
  const struct = editor.struct();

  return struct.isTargetFromMacromolecule(ci);
};

export {
  isBondingWithMacroMolecule,
  isMacroMolecule,
  isMergingToMacroMolecule,
};
