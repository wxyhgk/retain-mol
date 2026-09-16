import type { DrawingEntity } from '../../../domain/entities/DrawingEntity';
export declare function getRenderedStructuresBbox(drawingEntities?: DrawingEntity[]): {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
};
