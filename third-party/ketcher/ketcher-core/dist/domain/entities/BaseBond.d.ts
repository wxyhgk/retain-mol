import { DrawingEntity } from './DrawingEntity';
import { Vec2 } from '../entities/vec2';
export declare abstract class BaseBond extends DrawingEntity {
    endPosition: Vec2;
    private _isOverlappedByMonomer;
    abstract get firstEndEntity(): DrawingEntity;
    abstract get secondEndEntity(): DrawingEntity | undefined;
    abstract get isHorizontal(): boolean;
    abstract get isVertical(): boolean;
    get finished(): boolean;
    get center(): Vec2;
    moveToLinkedEntities(): void;
    moveBondStartAbsolute(x: any, y: any): void;
    moveBondEndAbsolute(x: any, y: any): void;
    get startPosition(): Vec2;
    getAnotherEntity(monomer: DrawingEntity): DrawingEntity | undefined;
    get isOverlappedByMonomer(): boolean;
    set isOverlappedByMonomer(value: boolean);
}
