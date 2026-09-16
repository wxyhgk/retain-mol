import { type AtomPropertiesInContextMenu, type AtomQueryProperties, type ReStruct, Action, Atom } from 'ketcher-core';
export interface SelectedAtomsEditorContext {
    render: {
        ctab: ReStruct;
    };
    update(action: Action): void;
}
export declare function isAtomsArray(selectedElements: Atom | Atom[]): boolean;
export declare function updateSelectedAtoms({ atoms, changeAtomPromise, editor, }: {
    atoms: number[];
    editor: SelectedAtomsEditorContext;
    changeAtomPromise: Promise<Atom> | PromiseLike<AtomPropertiesInContextMenu | AtomQueryProperties>;
}): void;
