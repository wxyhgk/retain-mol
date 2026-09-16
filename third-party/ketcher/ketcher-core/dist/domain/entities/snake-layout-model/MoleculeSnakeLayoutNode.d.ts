import type { Atom } from '../../entities/CoreAtom';
import type { Bond } from '../../entities/CoreBond';
export declare class MoleculeSnakeLayoutNode {
    molecule: (Atom | Bond)[];
    constructor(molecule: (Atom | Bond)[]);
}
