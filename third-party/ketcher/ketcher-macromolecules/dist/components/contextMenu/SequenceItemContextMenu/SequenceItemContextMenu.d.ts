import { NodesSelection } from 'ketcher-core';
import { PointerEvent } from 'react';
type SequenceItemContextMenuType = {
    selections?: NodesSelection;
    contextMenuEvent?: PointerEvent;
    isPasteAvailable?: boolean;
};
export declare enum SequenceItemContextMenuNames {
    title = "sequence_menu_title",
    createRnaAntisenseStrand = "create_antisense_rna_chain",
    createDnaAntisenseStrand = "create_antisense_dna_chain",
    modifyInRnaBuilder = "modify_in_rna_builder",
    modifyAminoAcids = "modify_amino_acids",
    establishHydrogenBond = "establish_hydrogen_bond",
    deleteHydrogenBond = "delete_hydrogen_bond",
    editSequence = "edit_sequence",
    startNewSequence = "start_new_sequence",
    copy = "copy",
    paste = "paste",
    delete = "delete"
}
export declare const SequenceItemContextMenu: ({ selections, contextMenuEvent, isPasteAvailable, }: SequenceItemContextMenuType) => import("react").ReactPortal | null;
export {};
