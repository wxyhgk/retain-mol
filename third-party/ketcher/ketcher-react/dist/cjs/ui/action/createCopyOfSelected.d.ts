import { type Action, type ReStruct, type Struct, type Vec2 } from 'ketcher-core';
export interface CopySelectionContext {
    render: {
        ctab: ReStruct;
    };
    structSelected(): Struct;
    update(action: Action, ignoreHistory?: boolean): void;
}
export declare const createCopyOfSelected: (editor: CopySelectionContext, point: Vec2) => {
    action: Action;
    items: import("ketcher-core").CreatedItems;
};
