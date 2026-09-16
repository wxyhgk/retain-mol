import { BaseSequenceRenderer } from '../../../render/renderers/sequence/BaseSequenceRenderer';
import type { MonomerToAtomBond } from '../../../../domain/entities/MonomerToAtomBond';
import type { SubChainNode } from '../../../../domain/entities/monomer-chains/types';
import { Vec2 } from '../../../../domain/entities/vec2';
export declare class MonomerToAtomBondSequenceRenderer extends BaseSequenceRenderer {
    monomerToAtomBond: MonomerToAtomBond;
    private readonly monomerNode;
    constructor(monomerToAtomBond: MonomerToAtomBond, monomerNode: SubChainNode);
    private get monomer();
    private get atom();
    get scaledPosition(): {
        startPosition: Vec2;
        endPosition: Vec2;
    };
    get center(): Vec2;
    private get mainLineY();
    show(): void;
    private getBondPath;
    moveStart(): void;
    moveEnd(): void;
    get isSnake(): false;
    isMonomersOnSameHorizontalLine(): false;
}
