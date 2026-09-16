import type { DrawingEntity } from '../entities/DrawingEntity';
export interface StructureBbox {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
}
export declare function getStructureBbox(drawingEntities: DrawingEntity[]): StructureBbox;
