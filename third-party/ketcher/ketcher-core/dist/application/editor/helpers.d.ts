import type { IKetMacromoleculesContent } from '../formatters';
export declare const parseMonomersLibrary: (monomersDataRaw: string | JSON) => {
    monomersLibraryParsedJson: any;
    monomersLibrary: import("../..").MonomerItemType[] & import("../..").AmbiguousMonomerType[];
};
export declare enum MonomerNameValidationErrorType {
    Empty = "empty",
    TooLong = "tooLong",
    InvalidCharacters = "invalidCharacters"
}
export type MonomerNameValidationResult = {
    isValid: true;
} | {
    isValid: false;
    error: MonomerNameValidationErrorType;
};
export declare const validateMonomerName: (monomerName: string) => MonomerNameValidationResult;
export declare const getEmptyMonomersLibraryJson: () => IKetMacromoleculesContent;
