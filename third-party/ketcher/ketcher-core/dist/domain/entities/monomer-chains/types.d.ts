import type { Nucleoside } from '../../entities/Nucleoside';
import type { Nucleotide } from '../../entities/Nucleotide';
import type { MonomerSequenceNode } from '../../entities/MonomerSequenceNode';
import type { EmptySequenceNode } from '../../entities/EmptySequenceNode';
import type { LinkerSequenceNode } from '../../entities/LinkerSequenceNode';
import type { BackBoneSequenceNode } from '../../entities/BackBoneSequenceNode';
export type SubChainNode = MonomerSequenceNode | Nucleoside | Nucleotide | EmptySequenceNode | LinkerSequenceNode;
export type SequenceNode = SubChainNode | BackBoneSequenceNode;
export declare enum SequenceType {
    RNA = "RNA",
    DNA = "DNA",
    PEPTIDE = "PEPTIDE"
}
export declare enum IsChainCycled {
    NOT_CYCLED = 0,
    CYCLED = 1
}
