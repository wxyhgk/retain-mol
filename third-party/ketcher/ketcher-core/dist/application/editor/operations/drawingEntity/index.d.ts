import type { RenderersManager } from '../../../render/renderers/RenderersManager';
import type { Operation } from '../../../../domain/entities/Operation';
import type { DrawingEntity } from '../../../../domain/entities/DrawingEntity';
export declare class DrawingEntityHoverOperation implements Operation {
    private readonly drawingEntity;
    constructor(drawingEntity: DrawingEntity);
    execute(renderersManager: RenderersManager): void;
    invert(): void;
}
export declare class DrawingEntitySelectOperation implements Operation {
    private readonly drawingEntity;
    private readonly selectDrawingEntitiesModelChange?;
    constructor(drawingEntity: DrawingEntity, selectDrawingEntitiesModelChange?: (() => void) | undefined);
    execute(): void;
    executeAfterAllOperations(renderersManager: RenderersManager): void;
    invert(): void;
}
export declare class DrawingEntityMoveOperation implements Operation {
    private readonly moveDrawingEntityChangeModel;
    private readonly invertMoveDrawingEntityChangeModel;
    private readonly redoDrawingEntityChangeModel;
    private readonly drawingEntity;
    private wasInverted;
    constructor(moveDrawingEntityChangeModel: () => void, invertMoveDrawingEntityChangeModel: () => void, redoDrawingEntityChangeModel: () => void, drawingEntity: DrawingEntity);
    execute(): void;
    invert(): void;
    executeAfterAllOperations(renderersManager: RenderersManager): void;
    invertAfterAllOperations(renderersManager: RenderersManager): void;
}
export declare class DrawingEntityRedrawOperation implements Operation {
    private readonly drawingEntityRedrawModelChange;
    private readonly invertDrawingEntityRedrawModelChange;
    constructor(drawingEntityRedrawModelChange: () => DrawingEntity, invertDrawingEntityRedrawModelChange: () => DrawingEntity);
    execute(renderersManager: RenderersManager): void;
    invert(renderersManager: RenderersManager): void;
}
