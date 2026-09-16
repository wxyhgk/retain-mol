import type { Atom } from '../entities/CoreAtom';
import type { BaseMonomer } from '../entities/BaseMonomer';
import type { MonomerToAtomBondRenderer } from '../../application/render/renderers/MonomerToAtomBondRenderer';
import type { MonomerToAtomBondSequenceRenderer } from '../../application/render/renderers/sequence/MonomerToAtomBondSequenceRenderer';
import { BaseBond } from './BaseBond';
export declare class MonomerToAtomBond extends BaseBond {
    monomer: BaseMonomer;
    atom: Atom;
    renderer?: MonomerToAtomBondRenderer | MonomerToAtomBondSequenceRenderer;
    constructor(monomer: BaseMonomer, atom: Atom);
    setRenderer(renderer: MonomerToAtomBondRenderer | MonomerToAtomBondSequenceRenderer): void;
    get firstEndEntity(): BaseMonomer;
    get secondEndEntity(): Atom;
    get isHorizontal(): boolean;
    get isVertical(): boolean;
}
