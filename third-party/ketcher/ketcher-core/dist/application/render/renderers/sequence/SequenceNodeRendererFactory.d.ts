import { Vec2 } from '../../../../domain/entities/vec2';
import type { BaseMonomerRenderer } from '../BaseMonomerRenderer';
import type { BaseSequenceItemRenderer } from './BaseSequenceItemRenderer';
import type { SequenceNode } from '../../../../domain/entities/monomer-chains/types';
import type { Chain } from '../../../../domain/entities/monomer-chains/Chain';
import type { ITwoStrandedChainItem } from '../../../../domain/entities/monomer-chains/ChainsCollection';
export declare class SequenceNodeRendererFactory {
    static fromNode(node: SequenceNode, firstMonomerInChainPosition: Vec2, monomerIndexInChain: number, isLastMonomerInChain: boolean, chain: Chain, nodeIndexOverall: number, editingNodeIndexOverall: number, twoStrandedNode: ITwoStrandedChainItem, renderer?: BaseMonomerRenderer | BaseSequenceItemRenderer, previousRowsWithAntisense?: number): BaseSequenceItemRenderer;
}
