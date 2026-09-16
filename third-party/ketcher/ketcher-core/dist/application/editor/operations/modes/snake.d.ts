import type { Operation } from '../../../../domain/entities/Operation';
import type { RenderersManager } from '../../../render/renderers/RenderersManager';
export declare class RecalculateCanvasMatrixOperation implements Operation {
    private readonly recalculateCanvasMatrixModelChange;
    private readonly invertRecalculateCanvasMatrixModelChange;
    priority: number;
    constructor(recalculateCanvasMatrixModelChange: () => void, invertRecalculateCanvasMatrixModelChange: () => void);
    execute(renderersManager: RenderersManager): void;
    invert(renderersManager: RenderersManager): void;
}
