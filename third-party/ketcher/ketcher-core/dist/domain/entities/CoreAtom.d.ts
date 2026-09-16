import { DrawingEntity } from '../entities/DrawingEntity';
import type { Vec2 } from '../entities/vec2';
import type { BaseMonomer } from '../entities/BaseMonomer';
import { type Bond } from '../entities/CoreBond';
import { type CoreAtomLabel } from '../constants';
import type { AtomRenderer } from '../../application/render/renderers/AtomRenderer';
import { MonomerToAtomBond } from './MonomerToAtomBond';
import type { AtomCIP } from './types';
import type { AtomList } from '../entities/atomList';
export declare enum AtomRadical {
    None = 0,
    Single = 1,
    Doublet = 2,
    Triplet = 3
}
export interface AtomProperties {
    charge?: number | null;
    explicitValence?: number;
    isotope?: number | null;
    radical?: AtomRadical;
    alias?: string | null;
    cip?: AtomCIP | null;
    stereoLabel?: string | null;
    atomList?: AtomList | null;
}
export declare class Atom extends DrawingEntity {
    monomer: BaseMonomer;
    atomIdInMicroMode: number;
    label: CoreAtomLabel;
    properties: AtomProperties;
    bonds: Array<Bond | MonomerToAtomBond>;
    renderer: AtomRenderer | undefined;
    constructor(position: Vec2, monomer: BaseMonomer, atomIdInMicroMode: number, label: CoreAtomLabel, properties?: AtomProperties);
    get center(): Vec2;
    addBond(bond: Bond | MonomerToAtomBond): void;
    deleteBond(bondId: number): void;
    setRenderer(renderer: AtomRenderer): void;
    get isCarbon(): boolean;
    private calculateConnections;
    get hasAlias(): boolean;
    get hasRadical(): boolean;
    get hasCharge(): boolean;
    get hasExplicitValence(): boolean;
    get hasExplicitIsotope(): boolean;
    get hasBadValence(): boolean;
    get hasStereoLabel(): boolean;
    private get radicalAmount();
    private get valenceWithoutHydrogen();
    calculateValence(): {
        valence: number;
        hydrogenAmount: number;
    };
}
