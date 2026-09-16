import { BaseOperation } from '../../../editor/operations/BaseOperation';
import type { ImageReferenceName } from '../../../../domain/entities/image';
import { Vec2 } from '../../../../domain/entities/vec2';
import type { ReStruct } from '../../../render';
export declare class ImageResize extends BaseOperation {
    private readonly id;
    private readonly position;
    private readonly referencePositionName;
    private previousPosition;
    constructor(id: number, position: Vec2, referencePositionName: ImageReferenceName);
    execute(reStruct: ReStruct): void;
    invert(): BaseOperation;
    isDummy(restruct?: ReStruct): boolean;
}
