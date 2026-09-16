import { ChemicalMimeType, type ClipboardData, type LegacyClipboardData, type Struct } from 'ketcher-core';
import type { IToolContext } from '../../editor/tool/IToolContext';
export interface ClipboardResult {
    'text/plain': string;
    [mimeType: string]: string;
}
export interface ClipboardDependencies {
    runAsyncAction<T>(action: () => Promise<T>): Promise<T | undefined>;
    serializeStructure(struct: Struct): Promise<string>;
}
export type ClipboardDispatch = (action: unknown) => unknown;
export interface ClipboardState {
    editor: IToolContext;
    modal: unknown;
}
export type ClipboardGetState = () => ClipboardState;
export declare function createClipboardController(dispatch: ClipboardDispatch, getState: ClipboardGetState, dependencies: ClipboardDependencies): {
    formats: ChemicalMimeType[];
    focused(): boolean;
    onLegacyCopy(): ClipboardResult | null;
    onLegacyCut(): ClipboardResult | null;
    onCut(): Promise<ClipboardResult | null | undefined>;
    onCopy(): Promise<ClipboardResult | null | undefined>;
    onPaste(data: ClipboardData, isSmarts?: boolean): Promise<void | undefined>;
    onLegacyPaste(data: LegacyClipboardData, isSmarts?: boolean): void;
};
