import type { ISnakeLayoutModelRow, ITwoStrandedSnakeLayoutNode } from '../../entities/snake-layout-model/types';
import type { EmptySnakeLayoutNode } from '../../entities/snake-layout-model/EmptySnakeLayoutNode';
import type { MoleculeSnakeLayoutNode } from '../../entities/snake-layout-model/MoleculeSnakeLayoutNode';
export declare class SnakeLayoutModelChain {
    private readonly rows;
    get lastRow(): ISnakeLayoutModelRow;
    get lastNode(): MoleculeSnakeLayoutNode | EmptySnakeLayoutNode | ITwoStrandedSnakeLayoutNode;
    get firstRow(): ISnakeLayoutModelRow;
    get firstNode(): MoleculeSnakeLayoutNode | EmptySnakeLayoutNode | ITwoStrandedSnakeLayoutNode;
    get nodes(): (MoleculeSnakeLayoutNode | EmptySnakeLayoutNode | ITwoStrandedSnakeLayoutNode)[];
    get length(): number;
    get rowsLength(): number;
    addRow(row: ISnakeLayoutModelRow): void;
    forEachNode(callback: (node: ITwoStrandedSnakeLayoutNode | MoleculeSnakeLayoutNode | EmptySnakeLayoutNode, nodeIndex: number) => void): void;
    forEachRow(callback: (row: ISnakeLayoutModelRow, rowIndex: number) => void): void;
}
