import { CoreEditor, IRnaPreset, MonomerOrAmbiguousType } from 'ketcher-core';
export declare const getAutochainErrorMessage: (editor: CoreEditor, libraryItem: MonomerOrAmbiguousType | IRnaPreset) => string;
export declare const cardMouseOverHandler: (editor: CoreEditor, libraryItem: MonomerOrAmbiguousType | IRnaPreset, setAutochainErrorMessage: (message: string) => void) => void;
