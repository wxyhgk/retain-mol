import { Vec2 } from '../../../domain/entities/vec2';
import type { Atom } from '../../../domain/entities/CoreAtom';
import type { Bond } from '../../../domain/entities/CoreBond';
export declare class HalfEdge {
    id: number;
    firstAtom: Atom;
    secondAtom: Atom;
    bond: Bond;
    direction: Vec2;
    loopId: number;
    oppositeHalfEdge: HalfEdge | undefined;
    nextHalfEdge: HalfEdge | undefined;
    sinToLeftNeighborHalfEdge: number;
    cosToLeftNeighborHalfEdge: number;
    leftNeighborHalfEdge: HalfEdge | undefined;
    sinToRightNeighborHalfEdge: number;
    cosToRightNeighborHalfEdge: number;
    rightNeighborHalfEdge: HalfEdge | undefined;
    constructor(id: number, firstAtom: Atom, secondAtom: Atom, bond: Bond);
    get leftNormal(): Vec2;
    get angle(): number;
    get position(): Vec2;
}
