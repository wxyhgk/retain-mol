export declare enum RNA_DNA_NON_MODIFIED_PART {
    SUGAR_RNA = "R",
    SUGAR_DNA = "dR",
    PHOSPHATE = "P"
}
export declare enum RnaDnaNaturalAnaloguesEnum {
    ADENINE = "A",
    THYMINE = "T",
    GUANINE = "G",
    CYTOSINE = "C",
    URACIL = "U"
}
export declare enum RnaDnaBaseNames {
    URACIL = "Uracil",
    THYMINE = "Thymine"
}
export declare enum StandardAmbiguousRnaBase {
    N = "N",
    B = "B",
    V = "V",
    D = "D",
    H = "H",
    K = "K",
    M = "M",
    W = "W",
    Y = "Y",
    R = "R",
    S = "S"
}
export declare enum StandardAmbiguousPeptide {
    B = "B",// Aspartic acid or Asparagine
    J = "J",// Leucine or Isoleucine
    Z = "Z",// Glutamic acid or Glutamine
    X = "X"
}
export declare const rnaDnaNaturalAnalogues: string[];
export declare const rnaDnaAmbiguousSymbols: string[];
export declare const peptideAmbiguousSymbols: string[];
export declare const unknownNaturalAnalogues: string[];
export declare const peptideNaturalAnalogues: string[];
export declare const NO_NATURAL_ANALOGUE = "X";
export declare const MONOMER_CONST: {
    AMINO_ACID: string;
    PEPTIDE: string;
    CHEM: string;
    RNA: string;
    DNA: string;
    MODDNA: string;
    R: string;
    P: string;
    SUGAR: string;
    BASE: string;
    PHOSPHATE: string;
};
export declare const CREATE_MONOMER_TOOL_NAME = "create-monomer";
export declare const MonomerSize = 0.75;
export declare const HalfMonomerSize: number;
export declare const StandardBondLength: number;
/**
 * Classifies monomer library items by chemical role.  Defined here (domain
 * layer) so that domain entities and helpers can use it without importing from
 * the application/formatters layer, which would create circular dependencies.
 */
export declare enum KetMonomerClass {
    AminoAcid = "AminoAcid",
    Sugar = "Sugar",
    Phosphate = "Phosphate",
    Base = "Base",
    Terminator = "Terminator",
    Linker = "Linker",
    Unknown = "Unknown",
    CHEM = "CHEM",
    RNA = "RNA",
    DNA = "DNA"
}
