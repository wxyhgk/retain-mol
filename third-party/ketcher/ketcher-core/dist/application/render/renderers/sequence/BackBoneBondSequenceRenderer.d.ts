import { BaseSequenceRenderer } from '../../../render/renderers/sequence/BaseSequenceRenderer';
import type { PolymerBond } from '../../../../domain/entities/PolymerBond';
export declare class BackBoneBondSequenceRenderer extends BaseSequenceRenderer {
    constructor(polymerBond: PolymerBond);
    get isSnake(): false;
    isMonomersOnSameHorizontalLine(): false;
    moveStart(): void;
    moveEnd(): void;
}
