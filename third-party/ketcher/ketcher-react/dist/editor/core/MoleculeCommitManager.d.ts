import { type MoleculeCanvasCommitResult, type Render, type Struct } from 'ketcher-core';
import type { IHistoryManager } from './HistoryManager';
import type { ISelectionManager } from './SelectionManager';
interface Dependencies {
    getRender(): Render;
    getSelection(): ISelectionManager;
    getHistory(): IHistoryManager;
    getBusyReason(): string | null;
    publish(): void;
}
export declare class MoleculeCommitManager {
    private readonly deps;
    isCommitting: boolean;
    unavailableReason: string | null;
    constructor(deps: Dependencies);
    private capture;
    private install;
    private swap;
    commit(candidate: Struct, expected: Struct, onCommitted: () => void): MoleculeCanvasCommitResult;
}
export {};
