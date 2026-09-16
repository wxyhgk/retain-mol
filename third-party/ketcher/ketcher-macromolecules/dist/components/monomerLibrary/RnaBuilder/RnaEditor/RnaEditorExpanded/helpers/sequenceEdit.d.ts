import { LabeledNodesWithPositionInSequence } from 'ketcher-core';
export declare const generateSequenceSelectionGroupNames: (labeledNucleotides?: LabeledNodesWithPositionInSequence[]) => {
    Sugars: string;
    Bases: string;
    Phosphates: string;
} | undefined;
export declare const generateSequenceSelectionName: (labeledNucleoelements: LabeledNodesWithPositionInSequence[]) => string;
