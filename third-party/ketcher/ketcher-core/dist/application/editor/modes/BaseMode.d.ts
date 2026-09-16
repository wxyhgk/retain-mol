import { Command } from '../../../domain/entities/Command';
import { type LayoutMode } from './types';
import { type ClipboardData } from '../../../utilities';
import { type SequenceType, Vec2 } from '../../../domain/entities';
import type { DrawingEntitiesManager } from '../../../domain/entities/DrawingEntitiesManager';
type KeyboardEventHandler = {
    shortcut: string | string[];
    handler: (event: KeyboardEvent) => void;
};
type KeyboardEventHandlers = Record<string, KeyboardEventHandler>;
export declare abstract class BaseMode {
    modeName: LayoutMode;
    previousMode: LayoutMode;
    private _pasteIsInProgress;
    protected constructor(modeName: LayoutMode, previousMode?: LayoutMode);
    get isAntisenseEditMode(): boolean;
    get isSyncEditMode(): boolean;
    private changeMode;
    initialize(needRemoveSelection?: boolean, _isUndo?: boolean, _needReArrangeChains?: boolean, _forceRecalculateAntisense?: boolean): Command;
    onKeyDown(event: KeyboardEvent): Promise<void>;
    get keyboardEventHandlers(): KeyboardEventHandlers;
    abstract getNewNodePosition(): Vec2;
    abstract applyAdditionalPasteOperations(_drawingEntitiesManager: DrawingEntitiesManager): Command;
    abstract isPasteAllowedByMode(drawingEntitiesManager: DrawingEntitiesManager): boolean;
    abstract isPasteAvailable(drawingEntitiesManager: DrawingEntitiesManager): boolean;
    abstract scrollForView(): void | Promise<void>;
    onCopy(event?: ClipboardEvent): void;
    onCut(event?: ClipboardEvent): void;
    onPaste(event?: ClipboardEvent): Promise<void>;
    pasteFromClipboard(clipboardData: ClipboardData): Promise<void>;
    pasteKetFormatFragment(pastedStr: string): Command | undefined;
    pasteWithIndigoConversion(pastedStr: string, sequenceType: SequenceType): Promise<Command | undefined>;
    private updateEntitiesPosition;
    unsupportedSymbolsError(errorMessage: string): void;
    private checkIfTargetIsInput;
    destroy(): void;
}
export {};
