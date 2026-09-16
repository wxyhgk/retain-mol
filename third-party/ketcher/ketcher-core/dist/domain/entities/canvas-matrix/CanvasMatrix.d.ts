import type { ChainsCollection } from '../../entities/monomer-chains/ChainsCollection';
import { Matrix } from '../../entities/canvas-matrix/Matrix';
import type { PolymerBond } from '../../entities/PolymerBond';
import { Connection } from '../../entities/canvas-matrix/Connection';
import { Cell } from '../../entities/canvas-matrix/Cell';
interface MatrixConfig {
    initialMatrix: Matrix<Cell>;
}
export declare class CanvasMatrix {
    chainsCollection: ChainsCollection;
    private readonly matrixConfig;
    private readonly matrix;
    private readonly initialMatrixWidth;
    private readonly monomerToCell;
    polymerBondToCells: Map<PolymerBond, Cell[]>;
    polymerBondToConnections: Map<PolymerBond, Connection[]>;
    constructor(chainsCollection: ChainsCollection, matrixConfig?: MatrixConfig);
    private fillConnectionsOffset;
    private fillRightConnectionsOffset;
    private fillCells;
}
export {};
