import type { Cell } from '../../../../domain/entities/canvas-matrix/Cell';
import type { Connection, ConnectionDirectionInDegrees } from '../../../../domain/entities/canvas-matrix/Connection';
interface CalculatePathPartAndTurnPointParameter {
    readonly cell: Cell;
    readonly connection: Connection;
    readonly direction: ConnectionDirectionInDegrees;
    readonly horizontal: boolean;
    readonly turnPoint: number;
    readonly turnPointIsUsed: boolean;
}
interface CalculatePathPartAndTurnPointResult {
    readonly pathPart: string;
    readonly turnPoint: number;
}
export declare class SideChainConnectionBondRendererUtility {
    static readonly bondEndLength = 15;
    static readonly cellHeight = 40;
    static readonly smoothCornerSize = 5;
    static calculatePathPartAndTurnPoint({ cell, connection, direction, horizontal, turnPoint, turnPointIsUsed, }: CalculatePathPartAndTurnPointParameter): CalculatePathPartAndTurnPointResult;
    static generateBend(dx1: number, dy1: number, dx: number, dy: -1 | 1): string;
}
export {};
