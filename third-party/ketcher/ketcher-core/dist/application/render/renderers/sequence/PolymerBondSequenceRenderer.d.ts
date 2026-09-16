import type { PolymerBond } from '../../../../domain/entities/PolymerBond';
import { BaseSequenceRenderer } from '../../../render/renderers/sequence/BaseSequenceRenderer';
import type { SubChainNode } from '../../../../domain/entities/monomer-chains/types';
import { Vec2 } from '../../../../domain/entities/vec2';
export declare class PolymerBondSequenceRenderer extends BaseSequenceRenderer {
    polymerBond: PolymerBond;
    private readonly firstNode?;
    private readonly secondNode?;
    private selectionElement;
    constructor(polymerBond: PolymerBond, firstNode?: SubChainNode | undefined, secondNode?: SubChainNode | undefined);
    private get isHydrogenBond();
    private get firstMonomer();
    private get secondMonomer();
    private get areMonomersOnSameRow();
    get scaledPosition(): {
        startPosition: Vec2;
        endPosition: Vec2;
    };
    get center(): Vec2;
    private get mainLineY();
    show(): void;
    drawSelection(): void;
    private getBondPath;
    moveStart(): void;
    moveEnd(): void;
    get isSnake(): false;
    isMonomersOnSameHorizontalLine(): false;
}
