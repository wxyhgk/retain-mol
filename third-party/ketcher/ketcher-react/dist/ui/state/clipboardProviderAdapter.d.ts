import { type ClipboardDependencies, type ClipboardDispatch, type ClipboardGetState } from './clipboard';
export declare function createProviderClipboardDependencies(ketcherId: string): ClipboardDependencies;
export declare function initClipboardForKetcher(ketcherId: string): (dispatch: ClipboardDispatch, getState: ClipboardGetState) => {
    formats: import("ketcher-core").ChemicalMimeType[];
    focused(): boolean;
    onLegacyCopy(): import("./clipboard").ClipboardResult | null;
    onLegacyCut(): import("./clipboard").ClipboardResult | null;
    onCut(): Promise<import("./clipboard").ClipboardResult | null | undefined>;
    onCopy(): Promise<import("./clipboard").ClipboardResult | null | undefined>;
    onPaste(data: import("ketcher-core").ClipboardData, isSmarts?: boolean): Promise<void | undefined>;
    onLegacyPaste(data: import("ketcher-core").LegacyClipboardData, isSmarts?: boolean): void;
};
/**
 * Backward-compatible Redux thunk entry. New composition roots should prefer
 * initClipboardForKetcher so the editor identity is explicit.
 */
export declare function initClipboard(dispatch: ClipboardDispatch, getState: ClipboardGetState): {
    formats: import("ketcher-core").ChemicalMimeType[];
    focused(): boolean;
    onLegacyCopy(): import("./clipboard").ClipboardResult | null;
    onLegacyCut(): import("./clipboard").ClipboardResult | null;
    onCut(): Promise<import("./clipboard").ClipboardResult | null | undefined>;
    onCopy(): Promise<import("./clipboard").ClipboardResult | null | undefined>;
    onPaste(data: import("ketcher-core").ClipboardData, isSmarts?: boolean): Promise<void | undefined>;
    onLegacyPaste(data: import("ketcher-core").LegacyClipboardData, isSmarts?: boolean): void;
};
