import { SelectBase } from '../../../editor/tools/select/SelectBase';
import type { CoreEditor } from '../../../editor/Editor';
import type { BaseRenderer } from '../../../render';
export declare class SelectFragment extends SelectBase {
    readonly editor: CoreEditor;
    constructor(editor: CoreEditor);
    protected createSelectionView(): void;
    protected onSelectionMove(): void;
    protected updateSelectionViewParams(): void;
    protected mousedownEntity(renderer: BaseRenderer, shiftKey?: boolean, modKey?: boolean, altKey?: boolean): void;
    mouseOverDrawingEntity(event: any): void;
    mouseLeaveDrawingEntity(event: any): void;
}
