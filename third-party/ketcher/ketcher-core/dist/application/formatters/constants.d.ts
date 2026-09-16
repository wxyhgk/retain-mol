import type { Struct } from '../../domain/entities/struct';
export declare const MOLFILE_V2000_ATOM_BOND_LIMIT = 999;
export declare function exceedsMolfileV2000Limit(struct: Struct): boolean;
export declare const macromoleculesFilesInputFormats: {
    ket: string;
    mol: string;
    seq: {
        rna: string;
        dna: string;
        peptide: string;
        peptide3Letter: string;
    };
    fasta: {
        rna: string;
        dna: string;
        peptide: string;
    };
    idt: string;
    'axo-labs': string;
    helm: string;
    biln: string;
};
