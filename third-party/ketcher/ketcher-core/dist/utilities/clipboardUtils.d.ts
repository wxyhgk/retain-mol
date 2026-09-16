import { ChemicalMimeType } from '../domain/services/struct/structService.types';
type ClipboardTransferData = Pick<DataTransfer, 'getData' | 'setData'> | null | undefined;
export declare const PLAIN_TEXT_MIME_TYPE = "text/plain";
declare const clipboardDataTypes: readonly [ChemicalMimeType.KET, ChemicalMimeType.Mol, ChemicalMimeType.Rxn, "text/plain"];
type ClipboardDataType = typeof clipboardDataTypes[number];
export type ModernClipboardData = ClipboardItem[];
export type LegacyClipboardData = Partial<Record<ClipboardDataType, string>>;
export type ClipboardData = ModernClipboardData | LegacyClipboardData;
/**
 *
 * Legacy browser API doesn't support async operations, so it is not possible
 * to call indigo, when copy/cut/paste
 */
export declare function isClipboardAPIAvailable(): boolean;
export declare function legacyCopy(clipboardData: ClipboardTransferData, data: LegacyClipboardData): void;
export declare function legacyPaste(cb: ClipboardTransferData, formats: ClipboardDataType[]): LegacyClipboardData;
export declare function notifyCopyCut(): void;
export declare function getStructStringFromClipboardData(data: ClipboardData): Promise<string>;
/**
 * Checks whether the system clipboard currently holds any content that can be
 * pasted onto the canvas. Used to enable/disable the "Paste" context-menu item.
 */
export declare function isPasteContentAvailable(): Promise<boolean>;
export declare function safelyGetMimeType(clipboardItem: ClipboardItem, mimeType: string): Promise<Blob | ''>;
export {};
