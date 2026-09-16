import type { BaseMonomer } from '../../entities/BaseMonomer';
import type { Chain } from '../../entities/monomer-chains/Chain';
import { MoleculeSnakeLayoutNode } from '../../entities/snake-layout-model/MoleculeSnakeLayoutNode';
import { EmptySnakeLayoutNode } from '../../entities/snake-layout-model/EmptySnakeLayoutNode';
export interface ISnakeLayoutMonomersNode {
    monomers: BaseMonomer[];
}
export interface ITwoStrandedSnakeLayoutNode {
    senseNode?: ISnakeLayoutMonomersNode;
    antisenseNode?: ISnakeLayoutMonomersNode;
    chain: Chain;
}
export interface ISnakeLayoutModelRow {
    snakeLayoutModelItems: (ITwoStrandedSnakeLayoutNode | MoleculeSnakeLayoutNode | EmptySnakeLayoutNode)[];
}
export declare function isTwoStrandedSnakeLayoutNode(node: ITwoStrandedSnakeLayoutNode | MoleculeSnakeLayoutNode | EmptySnakeLayoutNode): node is ITwoStrandedSnakeLayoutNode;
