import { type BaseMonomer, type Bond, SGroup, type Struct, type KetMonomerClass, type SGroupAttachmentPoint, Vec2 } from 'ketcher-core';
type AttachmentPoint = Pick<SGroupAttachmentPoint, 'atomId' | 'attachmentPointNumber'>;
type ExtBond = {
    bond: Bond;
    targetEndpoint: 'begin' | 'end';
    attachmentPointNumber?: number;
};
export interface ISGroupManager {
    getAtomsCenter(s: Struct, a: number[]): Vec2 | null;
    getAttachmentPointForBondEndpoint(p: ReadonlyArray<AttachmentPoint>, a: number, n?: number): AttachmentPoint | undefined;
    updateBondEndpointByAttachmentPoint(b: Bond, e: 'begin' | 'end', s: SGroup): boolean;
    getMonomerExternalBonds(s: Struct, g: SGroup): ExtBond[];
    deleteMonomerStructure(s: Struct, g: SGroup): void;
    setMonomerExpandedState(g: SGroup, e: boolean): void;
    cloneMonomer(m: BaseMonomer): BaseMonomer;
    getOriginalSelectedMonomerExpanded(s: Set<number>): boolean;
    cloneMonomerStructureToPosition(s: Struct, g: SGroup, c: Vec2, p: Vec2 | null, e: boolean): SGroup | undefined;
    reconnectMonomerExternalBonds(s: Struct, g: SGroup, b: ExtBond[]): void;
    replaceMatchingMonomerStructures(s: Struct, m: BaseMonomer, t: KetMonomerClass, sym: string, e: boolean, ids?: number[]): void;
}
type Deps = {
    getOriginalStruct: () => Struct;
};
export declare class SGroupManager implements ISGroupManager {
    private deps;
    constructor(deps: Deps);
    getAtomsCenter(s: Struct, a: number[]): Vec2 | null;
    getAttachmentPointForBondEndpoint(p: ReadonlyArray<AttachmentPoint>, a: number, n?: number): AttachmentPoint | undefined;
    updateBondEndpointByAttachmentPoint(b: Bond, e: 'begin' | 'end', s: SGroup): boolean;
    getMonomerExternalBonds(s: Struct, g: SGroup): ExtBond[];
    deleteMonomerStructure(s: Struct, g: SGroup): void;
    setMonomerExpandedState(g: SGroup, e: boolean): void;
    cloneMonomer(m: BaseMonomer): BaseMonomer;
    getOriginalSelectedMonomerExpanded(s: Set<number>): boolean;
    cloneMonomerStructureToPosition(s: Struct, g: SGroup, c: Vec2, p: Vec2 | null, e: boolean): SGroup | undefined;
    reconnectMonomerExternalBonds(s: Struct, g: SGroup, b: ExtBond[]): void;
    replaceMatchingMonomerStructures(s: Struct, m: BaseMonomer, t: KetMonomerClass, sym: string, e: boolean, ids?: number[]): void;
}
export {};
