import type { Vec2 } from '../../../../domain/entities/vec2';
import { BaseOperation } from '../../../editor/operations/BaseOperation';
import type { ReStruct } from '../../../render';
export declare class ImageMove extends BaseOperation {
    private readonly id;
    private readonly offset;
    constructor(id: number, offset: Vec2);
    execute(reStruct: ReStruct): void;
    invert(): BaseOperation;
    isDummy(): boolean;
}
