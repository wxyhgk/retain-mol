import { Vec2 } from 'ketcher-core';
import { getDifference } from './rotate-controller.utils';
import type { SelectionRotationContext } from './select/selectionToolContext';
declare class RotateController {
    isRotating: boolean;
    private readonly editor;
    private readonly rotateTool;
    private originalCenter;
    private normalizedCenterInitialHandleVec;
    private handleCenter;
    private initialRadius;
    private isMovingCenter;
    private handle?;
    private boundingRect?;
    private cross?;
    private link?;
    private protractor?;
    private rotateArc?;
    private snapAngleIndicator?;
    constructor(editor: SelectionRotationContext);
    private lastDelta;
    private init;
    private get render();
    private get paper();
    private get center();
    rerender(): void;
    reposition(delta: Vec2): void;
    clean(): void;
    /**
     * Revert rotation by pressing "Escape" key or "Right click" button
     */
    revert(): void;
    private isPartOfFragmentSelected;
    private show;
    private drawCross;
    private drawBoundingRect;
    private drawHandle;
    private drawLink;
    private drawProtractor;
    private drawRotateArc;
    private readonly hoverIn;
    private readonly hoverOut;
    private getProtractorBaseInfo;
    private readonly dragStart;
    private readonly dragMove;
    private readonly dragEnd;
    private readonly hoverCrossIn;
    private readonly hoverCrossOut;
    private readonly dragCrossStart;
    private readonly dragCrossMove;
    private readonly dragCrossEnd;
    private readonly dragCrossEndOUtOfBounding;
    updateFloatingToolsPosition: () => void;
    private updateSnapAngleIndicator;
    private drawSnapAngleIndicator;
}
export default RotateController;
export { getDifference };
