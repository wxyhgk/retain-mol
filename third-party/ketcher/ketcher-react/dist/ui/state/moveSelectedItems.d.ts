import type { IToolContext } from '../../editor/tool/IToolContext';
type ArrowKey = 'ArrowUp' | 'ArrowDown' | 'ArrowRight' | 'ArrowLeft';
export declare function isArrowKey(key: string): key is ArrowKey;
export declare function moveSelectedItems(ctx: IToolContext, key: ArrowKey, isShiftPressed: boolean): void;
export {};
