import { DrawingEntity } from '../entities/DrawingEntity';
import { Vec2 } from '../entities/vec2';
import type { Atom } from '../entities/CoreAtom';
import type { BondRenderer } from '../../application/render/renderers/BondRenderer';
import type { BondCIP } from '../entities/types';
export declare enum BondType {
    None = 0,
    Single = 1,
    Double = 2,
    Triple = 3,
    Aromatic = 4,
    SingleDouble = 5,
    SingleAromatic = 6,
    DoubleAromatic = 7,
    Any = 8,
    Dative = 9,
    Hydrogen = 10
}
export declare enum BondStereo {
    None = 0,
    Up = 1,
    Either = 4,
    Down = 6,
    CisTrans = 3
}
export declare class Bond extends DrawingEntity {
    firstAtom: Atom;
    secondAtom: Atom;
    bondIdInMicroMode: number;
    type: BondType;
    stereo: BondStereo;
    cip: BondCIP | null;
    endPosition: Vec2;
    renderer: BondRenderer | undefined;
    constructor(firstAtom: Atom, secondAtom: Atom, bondIdInMicroMode: number, type?: BondType, stereo?: BondStereo, cip?: BondCIP | null);
    setRenderer(renderer: BondRenderer): void;
    get startPosition(): Vec2;
    get center(): Vec2;
    moveBondStartAbsolute(x: any, y: any): void;
    moveBondEndAbsolute(x: any, y: any): void;
    moveToLinkedAtoms(): void;
    moveToLinkedEntities(): void;
}
