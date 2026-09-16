import type { CoreEditor } from '../../application/editor/Editor';
import { KetMonomerClass, RNA_DNA_NON_MODIFIED_PART } from '../constants/monomers';
import { SequenceType } from '../entities/monomer-chains/types';
export declare function getRnaPartLibraryItem(editor: CoreEditor, libraryItemLabel: string, monomerClass?: KetMonomerClass, isDna?: boolean): import("../types").MonomerItemType | undefined;
export declare function getPeptideLibraryItem(editor: CoreEditor, peptideName: string): import("../types").MonomerItemType | undefined;
export declare function getSugarBySequenceType(sequenceType: SequenceType): RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA | RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA | undefined;
