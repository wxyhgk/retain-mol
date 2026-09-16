import { type Action, type EditorDocumentChangeReason, type Render } from 'ketcher-core';
import { type FunctionalGroupsTooltipContext } from '../utils/functionalGroupsTooltip';
import type { Tool } from '../tool/Tool';
interface HistoryManagerContext extends FunctionalGroupsTooltipContext {
    render: Render;
    _tool: Tool | null;
    selection(value: null): unknown;
    event: FunctionalGroupsTooltipContext['event'] & {
        change: {
            dispatch(action?: Action): unknown;
        };
    };
}
export interface HistoryManagerDependencies {
    dispatchExternalChange(action?: Action): unknown;
    shouldOmitActionOnHistoryReplay(tool: Tool | null): boolean;
    notifyDocumentChange?(reason: EditorDocumentChangeReason): void;
    publishMoleculeReplay?(): void;
}
export interface IHistoryManager {
    historyStack: Action[];
    historyPtr: number;
    readonly origin: Action | null;
    isDitrty(): boolean;
    isDirty(): boolean;
    setOrigin(): void;
    historySize(): {
        readonly undo: number;
        readonly redo: number;
    };
    update(action: Action | true, ignoreHistory?: boolean): void;
    recordCommittedAction(action: Action): void;
    undo(): void;
    redo(): void;
    clearHistory(): void;
}
export declare class HistoryManager implements IHistoryManager {
    #private;
    static readonly MAX_SIZE = 32;
    private readonly editor;
    private readonly dependencies;
    constructor(editor: HistoryManagerContext, dependencies: HistoryManagerDependencies);
    get historyStack(): Action[];
    set historyStack(value: Action[]);
    get historyPtr(): number;
    set historyPtr(value: number);
    get origin(): Action | null;
    isDitrty(): boolean;
    isDirty(): boolean;
    setOrigin(): void;
    historySize(): {
        readonly undo: number;
        readonly redo: number;
    };
    recordCommittedAction(action: Action): void;
    update(action: Action | true, ignoreHistory?: boolean): void;
    undo(): void;
    redo(): void;
    clearHistory(): void;
}
export {};
