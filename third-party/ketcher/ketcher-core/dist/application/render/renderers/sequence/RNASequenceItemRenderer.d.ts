import { BaseSequenceItemRenderer } from '../../../render/renderers/sequence/BaseSequenceItemRenderer';
import type { Nucleoside } from '../../../../domain/entities/Nucleoside';
import type { Nucleotide } from '../../../../domain/entities/Nucleotide';
import type { Vec2 } from '../../../../domain/entities/vec2';
import type { Chain } from '../../../../domain/entities/monomer-chains/Chain';
import type { ITwoStrandedChainItem } from '../../../../domain/entities/monomer-chains/ChainsCollection';
export declare abstract class RNASequenceItemRenderer extends BaseSequenceItemRenderer {
    node: Nucleoside | Nucleotide;
    monomerSize: {
        width: number;
        height: number;
    };
    scaledMonomerPosition: Vec2;
    constructor(node: Nucleoside | Nucleotide, _firstNodeInChainPosition: Vec2, _monomerIndexInChain: number, _isLastMonomerInChain: boolean, _chain: Chain, _nodeIndexOverall: number, _editingNodeIndexOverall: number, monomerSize: {
        width: number;
        height: number;
    }, scaledMonomerPosition: Vec2, _twoStrandedNode: ITwoStrandedChainItem, _previousRowsWithAntisense?: number);
    get symbolToDisplay(): string;
    protected drawCommonModification(node: Nucleoside | Nucleotide): void;
}
