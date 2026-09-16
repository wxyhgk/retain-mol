import type { AmbiguousMonomer } from '../../entities/AmbiguousMonomer';
import type { RNABase } from '../../entities/RNABase';
import type { Sugar } from '../../entities/Sugar';
import type { ISnakeLayoutMonomersNode } from './types';
export declare class SugarWithBaseSnakeLayoutNode implements ISnakeLayoutMonomersNode {
    sugar: Sugar | AmbiguousMonomer;
    base: RNABase | AmbiguousMonomer;
    constructor(sugar: Sugar | AmbiguousMonomer, base: RNABase | AmbiguousMonomer);
    get monomers(): (Sugar | AmbiguousMonomer | RNABase)[];
}
