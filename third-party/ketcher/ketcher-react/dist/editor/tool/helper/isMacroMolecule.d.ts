import type { IToolContext } from '../IToolContext';
import type { DragContext } from '../select/select.types';
type MacroMoleculeContext = Pick<IToolContext, 'findItem' | 'struct'>;
declare const isMacroMolecule: (editor: MacroMoleculeContext, id: number) => boolean;
declare const isMergingToMacroMolecule: (editor: MacroMoleculeContext, dragCtx: DragContext) => boolean;
declare const isBondingWithMacroMolecule: (editor: MacroMoleculeContext, event: MouseEvent) => boolean | null | undefined;
export { isBondingWithMacroMolecule, isMacroMolecule, isMergingToMacroMolecule, };
