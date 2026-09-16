import { type Atom, type Bond, type ReStruct } from 'ketcher-core';
import type { Selection } from '../../core/SelectionManager';
import type LassoHelper from '../helper/lasso';
import type { SelectionStateContext } from './selectionToolContext';
export declare function selMerge(selection: any, add: any, reversible: boolean): any;
export declare function getSelectedAtoms(selection: any, molecule: any): Atom[];
export declare function getSelectedBonds(selection: any, molecule: any): Bond[];
export declare function mapAtomIdsToAtoms(atomsIds: number[], molecule: any): Atom[];
export declare function mapBondIdsToBonds(bondsIds: number[], molecule: any): Bond[];
type ClosestItem = {
    map: string;
    id: number;
};
type FragSelection = {
    atoms: number[];
    bonds: number[];
};
export declare function getFragSelection(ctab: ReStruct, fragId: number): FragSelection | null;
/**
 * Returns true when the given closest item is part of the current selection.
 *
 * The micro-mode selection model only stores primitive items
 * (`atoms`, `bonds`, `rxnArrows`, `rxnPluses`, `simpleObjects`, `texts`,
 * `enhancedFlags`, images, multitail arrows, `sgroupData`). For composite
 * items (`sgroups`, `functionalGroups`, `rgroups`, `frags`) "selected" is
 * defined as: every atom that the item expands to is already in
 * `selection.atoms`. Without this expansion a multi-selection of
 * sgroup-rendered items (e.g. monomers in molecules mode) collapses to the
 * single clicked item on mousedown, breaking multi-drag.
 */
export declare function isItemSelected(selection: Selection | null | undefined, ci: ClosestItem, restruct: ReStruct): boolean;
export declare function getNewSelectedItems(editor: SelectionStateContext, selectedSgroups: number[]): Record<"atoms" | "bonds", number[]>;
export declare function selectElementsOnCanvas(elements: {
    atoms: number[];
    bonds: number[];
}, editor: SelectionStateContext, lassoHelper: LassoHelper, event: PointerEvent): void;
export declare function onSelectionStart(event: PointerEvent, editor: SelectionStateContext, lassoHelper: LassoHelper): void;
export declare function onSelectionMove(event: PointerEvent, editor: SelectionStateContext, lassoHelper: LassoHelper): boolean;
export declare function onSelectionEnd(event: PointerEvent, editor: SelectionStateContext, lassoHelper: LassoHelper): void;
export declare function onSelectionLeave(editor: SelectionStateContext, lassoHelper: LassoHelper): void;
export {};
