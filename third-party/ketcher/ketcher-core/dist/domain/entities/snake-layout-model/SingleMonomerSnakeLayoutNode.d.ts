import type { BaseMonomer } from '../../entities/BaseMonomer';
import type { ISnakeLayoutMonomersNode } from './types';
export declare class SingleMonomerSnakeLayoutNode implements ISnakeLayoutMonomersNode {
    monomer: BaseMonomer;
    constructor(monomer: BaseMonomer);
    get monomers(): BaseMonomer[];
}
