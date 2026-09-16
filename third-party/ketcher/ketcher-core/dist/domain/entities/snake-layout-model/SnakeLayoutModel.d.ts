import type { ChainsCollection } from '../../entities/monomer-chains/ChainsCollection';
import { type ITwoStrandedSnakeLayoutNode } from '../../entities/snake-layout-model/types';
import { SnakeLayoutModelChain } from '../../entities/snake-layout-model/SnakeLayoutModelChain';
import type { DrawingEntitiesManager } from '../../entities/DrawingEntitiesManager';
export declare class SnakeLayoutModel {
    private readonly nodes;
    chains: SnakeLayoutModelChain[];
    private readonly monomerToTwoStrandedSnakeLayoutNode;
    constructor(chainsCollection: ChainsCollection, drawingEntitiesManager: DrawingEntitiesManager, needFillMolecules?: boolean);
    private addNode;
    private getSnakeLayoutNodesFromChainNode;
    private fillSenseNodes;
    private fillAntisenseNodes;
    private fillNodes;
    forEachNode(callback: (node: ITwoStrandedSnakeLayoutNode, index: number) => void): void;
    forEachChain(callback: (chain: SnakeLayoutModelChain, index: number) => void): void;
    private fillChains;
    private fillMolecules;
}
