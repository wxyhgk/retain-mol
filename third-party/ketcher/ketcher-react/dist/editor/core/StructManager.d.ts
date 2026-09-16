import { type Action, type EditorDocumentChangeReason, type Render, Struct } from 'ketcher-core';
export interface IStructManager {
    clear(): void;
    renderAndRecoordinateStruct(struct: Struct, needToCenterStruct?: boolean, x?: number, y?: number): Struct;
    struct(value?: Struct, needToCenterStruct?: boolean, x?: number, y?: number): Struct;
    structToAddFragment(struct: Struct, x?: number, y?: number): Struct;
}
type Deps = {
    getRender: () => Render;
    getViewManager: () => {
        centerStruct(): void;
        positionStruct(x: number, y: number): void;
        centerViewportAccordingToStruct(s?: Struct): void;
        setRender(r: Render): void;
    };
    getSelectionManager: () => {
        selection(v?: unknown): unknown;
    };
    getHoverIcon: () => {
        create(): void;
    };
    update: (action: Action, isMonomerCreation?: boolean) => void;
    notifyDocumentChange?: (reason: EditorDocumentChangeReason) => void;
    isMonomerCreationWizardActive: () => boolean;
    shouldPreserveStructPosition: (opts: Record<string, unknown> | undefined, struct: Struct) => boolean;
    updateToolAfterOptionsChange: (wasViewOnly: boolean) => void;
};
export declare class StructManager implements IStructManager {
    private deps;
    constructor(deps: Deps);
    clear(): void;
    renderAndRecoordinateStruct(struct: Struct, needToCenterStruct?: boolean, x?: number, y?: number): Struct;
    struct(value?: Struct, needToCenterStruct?: boolean, x?: number, y?: number): Struct;
    structToAddFragment(struct: Struct, x?: number, y?: number): Struct;
}
export {};
