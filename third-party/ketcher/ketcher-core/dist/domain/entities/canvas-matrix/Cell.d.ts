import type { BaseMonomer } from '../../entities/BaseMonomer';
import type { SubChainNode } from '../../entities/monomer-chains/types';
import type { Connection } from '../../entities/canvas-matrix/Connection';
export declare class Cell {
    node: SubChainNode | null | undefined;
    connections: Connection[];
    x: number;
    y: number;
    monomer?: BaseMonomer | undefined;
    constructor(node: SubChainNode | null | undefined, connections: Connection[], x: number, y: number, monomer?: BaseMonomer | undefined);
}
