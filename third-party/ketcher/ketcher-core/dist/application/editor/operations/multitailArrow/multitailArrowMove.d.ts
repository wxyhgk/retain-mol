import type { Vec2 } from '../../../../domain/entities/vec2';
import type { ReStruct } from '../../../render';
import BaseOperation from '../../../editor/operations/BaseOperation';
export declare class MultitailArrowMove extends BaseOperation {
    private readonly id;
    private readonly offset;
    constructor(id: number, offset: Vec2);
    execute(reStruct: ReStruct): void;
    invert(): MultitailArrowMove;
    isDummy(): boolean;
}
