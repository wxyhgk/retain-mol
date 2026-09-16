import type { ReStruct } from '../../../render';
import type { Vec2 } from '../../../../domain/entities/vec2';
import Base from '../BaseOperation';
interface RxnArrowRotateData {
    id: number;
    angle: number;
    center: Vec2;
    noinvalidate?: boolean;
}
export declare class RxnArrowRotate extends Base {
    readonly data: RxnArrowRotateData;
    constructor(id: number, angle: number, center: Vec2, noinvalidate?: boolean);
    execute(reStruct: ReStruct): void;
    invert(): RxnArrowRotate;
    isDummy(): boolean;
}
export {};
