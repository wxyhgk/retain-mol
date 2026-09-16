import type { ITwoStrandedChainItem } from '../../../../../domain/entities/monomer-chains/ChainsCollection';
export interface ISequenceViewModelRow {
    sequenceViewModelItems: ITwoStrandedChainItem[];
}
export declare class SequenceViewModelChain {
    private readonly rows;
    get lastRow(): ISequenceViewModelRow;
    get lastNode(): ITwoStrandedChainItem;
    get firstRow(): ISequenceViewModelRow;
    get firstNode(): ITwoStrandedChainItem;
    get nodes(): ITwoStrandedChainItem[];
    get length(): number;
    get hasAntisense(): boolean;
    get isNewSequenceChain(): boolean;
    addRow(row: ISequenceViewModelRow): void;
    forEachNode(callback: (node: ITwoStrandedChainItem, nodeIndex: number) => void): void;
    forEachRow(callback: (row: ISequenceViewModelRow, rowIndex: number) => void): void;
}
