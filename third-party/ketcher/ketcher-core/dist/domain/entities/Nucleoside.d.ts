import type { RNABase } from '../entities/RNABase';
import type { Sugar } from '../entities/Sugar';
import type { SubChainNode } from '../entities/monomer-chains/types';
import { Vec2 } from '../entities/vec2';
import { Command } from '../entities/Command';
import type { BaseMonomer } from '../entities/BaseMonomer';
import type { AmbiguousMonomer } from '../entities/AmbiguousMonomer';
import { RNA_DNA_NON_MODIFIED_PART } from '../constants/monomers';
export declare class Nucleoside {
    readonly sugar: Sugar | AmbiguousMonomer;
    readonly rnaBase: RNABase | AmbiguousMonomer;
    private readonly monomersCache;
    constructor(sugar: Sugar | AmbiguousMonomer, rnaBase: RNABase | AmbiguousMonomer);
    static fromSugar(sugar: Sugar | AmbiguousMonomer, needValidation?: boolean): Nucleoside;
    static createOnCanvas(rnaBaseName: string, position: Vec2, sugarName?: RNA_DNA_NON_MODIFIED_PART, isAntisense?: boolean): {
        modelChanges: Command;
        node: Nucleoside;
    };
    isMonomerTypeDifferentForChaining(monomerToChain: SubChainNode): any;
    get SubChainConstructor(): any;
    get monomer(): Sugar | AmbiguousMonomer;
    get monomers(): BaseMonomer[];
    get firstMonomerInNode(): Sugar | AmbiguousMonomer;
    get lastMonomerInNode(): Sugar | AmbiguousMonomer;
    get renderer(): import("../..").BaseMonomerRenderer | import("../..").BaseSequenceItemRenderer | undefined;
    get modified(): boolean;
}
