import type { CoreEditor } from '../../../editor/Editor';
import { SelectBase } from '../../../editor/tools/select/SelectBase';
import type { SelectionRectangleViewParams } from '../../../render/renderers/TransientView';
declare class SelectRectangle extends SelectBase {
    readonly editor: CoreEditor;
    selectionViewParams: SelectionRectangleViewParams;
    constructor(editor: CoreEditor);
    protected updateSelectionViewParams(): void;
    protected createSelectionView(): void;
    protected onSelectionMove(isShiftPressed: boolean): void;
}
export { SelectRectangle };
