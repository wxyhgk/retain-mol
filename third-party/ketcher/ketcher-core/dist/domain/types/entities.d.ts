import type { PolymerBond } from '../entities/PolymerBond';
import type { MonomerToAtomBond } from '../entities/MonomerToAtomBond';
import type { HydrogenBond } from '../entities/HydrogenBond';
export declare enum Entities {
    Nucleotide = "Nucleotide",
    Nucleoside = "Nucleoside",
    Phosphate = "Phosphate"
}
export type MonomerBond = PolymerBond | MonomerToAtomBond | HydrogenBond;
