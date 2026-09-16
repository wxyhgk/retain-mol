import { Vec2 } from 'ketcher-core';
import type { Tool } from './Tool';
import type { IToolContext } from './IToolContext';
type ImageToolContext = Pick<IToolContext, 'errorHandler' | 'findItem' | 'hover' | 'render' | 'selection' | 'update'>;
export declare class ImageTool implements Tool {
    private readonly editor;
    static readonly INPUT_ID = "image-upload";
    private readonly element;
    private dragCtx;
    constructor(editor: ImageToolContext);
    mousedown(event: MouseEvent): void;
    click(event: MouseEvent): void;
    mousemove(event: PointerEvent): void;
    mouseup(): boolean;
    onFileUpload(clickPosition: Vec2): void;
    private createElement;
    private getElement;
    private resetElementValue;
}
export {};
