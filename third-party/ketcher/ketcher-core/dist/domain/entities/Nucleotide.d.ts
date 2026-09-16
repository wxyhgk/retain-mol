import type { RNABase } from '../entities/RNABase';
import type { Phosphate } from '../entities/Phosphate';
import { Sugar } from '../entities/Sugar';
import type { SubChainNode } from '../entities/monomer-chains/types';
import { Vec2 } from '../entities/vec2';
import { RNA_DNA_NON_MODIFIED_PART } from '../constants/monomers';
import type { BaseMonomer } from '../entities/BaseMonomer';
import type { AmbiguousMonomer } from '../entities/AmbiguousMonomer';
export declare class Nucleotide {
    readonly sugar: Sugar | AmbiguousMonomer;
    readonly rnaBase: RNABase | AmbiguousMonomer;
    readonly phosphate: Phosphate;
    private readonly monomersCache;
    constructor(sugar: Sugar | AmbiguousMonomer, rnaBase: RNABase | AmbiguousMonomer, phosphate: Phosphate);
    toString(): string;
    static fromSugar(sugar: Sugar | AmbiguousMonomer, needValidation?: boolean): Nucleotide;
    static createOnCanvas(rnaBaseName: string, position: Vec2, sugarName?: RNA_DNA_NON_MODIFIED_PART): {
        modelChanges: import("./Command").Command;
        node: Nucleotide;
    };
    isMonomerTypeDifferentForChaining(monomerToChain: SubChainNode): any;
    get SubChainConstructor(): any;
    get monomer(): Sugar | AmbiguousMonomer | Phosphate;
    get monomers(): BaseMonomer[];
    get firstMonomerInNode(): Sugar | AmbiguousMonomer | Phosphate;
    get lastMonomerInNode(): Sugar | AmbiguousMonomer | Phosphate;
    get renderer(): import("../..").BaseMonomerRenderer | import("../..").BaseSequenceItemRenderer | undefined;
    get modified(): boolean;
    get isFiveEndPhosphate(): boolean;
}
