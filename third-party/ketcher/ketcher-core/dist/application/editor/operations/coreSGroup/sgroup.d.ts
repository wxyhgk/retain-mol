import type { RenderersManager } from '../../../render/renderers/RenderersManager';
import type { Operation } from '../../../../domain/entities/Operation';
import type { SGroupDrawingEntity } from '../../../../domain/entities/SGroupDrawingEntity';
export declare class SGroupAddOperation implements Operation {
    addSGroupChangeModel: (sgroupDrawingEntity?: SGroupDrawingEntity) => SGroupDrawingEntity;
    deleteSGroupChangeModel: (sgroupDrawingEntity: SGroupDrawingEntity) => void;
    sgroupDrawingEntity: SGroupDrawingEntity;
    priority: number;
    constructor(addSGroupChangeModel: (sgroupDrawingEntity?: SGroupDrawingEntity) => SGroupDrawingEntity, deleteSGroupChangeModel: (sgroupDrawingEntity: SGroupDrawingEntity) => void);
    execute(renderersManager: RenderersManager): void;
    invert(renderersManager: RenderersManager): void;
}
export declare class SGroupDeleteOperation implements Operation {
    sgroupDrawingEntity: SGroupDrawingEntity;
    deleteSGroupChangeModel: (sgroupDrawingEntity: SGroupDrawingEntity) => void;
    addSGroupChangeModel: (sgroupDrawingEntity: SGroupDrawingEntity) => SGroupDrawingEntity;
    priority: number;
    constructor(sgroupDrawingEntity: SGroupDrawingEntity, deleteSGroupChangeModel: (sgroupDrawingEntity: SGroupDrawingEntity) => void, addSGroupChangeModel: (sgroupDrawingEntity: SGroupDrawingEntity) => SGroupDrawingEntity);
    execute(renderersManager: RenderersManager): void;
    invert(renderersManager: RenderersManager): void;
}
