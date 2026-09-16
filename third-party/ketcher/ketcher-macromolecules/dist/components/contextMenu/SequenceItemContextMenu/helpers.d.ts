import { LabeledNodesWithPositionInSequence, NodesSelection, SequenceNode } from 'ketcher-core';
export declare const generateSequenceContextMenuProps: (selections?: NodesSelection) => {
    title: string;
    selectedSequenceLabeledNodes: LabeledNodesWithPositionInSequence[];
    isSelectedOnlyNucleoelements: boolean;
    isSelectedAtLeastOneNucleoelement: boolean;
    isSequenceFirstsOnlyNucleoelementsSelected: boolean;
    hasAntisense: boolean;
} | undefined;
export declare function isEstablishHydrogenBondDisabled(selections?: NodesSelection): boolean;
export declare function isNodeContainHydrogenBonds(node: SequenceNode | undefined): boolean | undefined;
