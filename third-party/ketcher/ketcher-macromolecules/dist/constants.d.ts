/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
export declare const MONOMER_LIBRARY_FAVORITES = "FAVORITES";
export declare const MONOMER_LIBRARY_PEPTIDES = "PEPTIDE";
export declare const MONOMER_TYPES: {
    readonly PEPTIDE: "PEPTIDE";
    readonly CHEM: "CHEM";
    readonly RNA: "RNA";
};
export type LibraryNameType = typeof MONOMER_LIBRARY_FAVORITES | keyof typeof MONOMER_TYPES;
export declare enum MonomerGroups {
    SUGARS = "Sugars",
    BASES = "Bases",
    PHOSPHATES = "Phosphates",
    PEPTIDES = "Amino Acids",
    NUCLEOTIDES = "Nucleotides"
}
export declare enum MonomerGroupCodes {
    R = "R",
    A = "A",
    C = "C",
    G = "G",
    T = "T",
    U = "U",
    X = "X",
    P = "P"
}
export declare const MonomerCodeToGroup: Record<MonomerGroupCodes, MonomerGroups>;
export declare const AMINO_ACID_ONE_TO_THREE_LETTER_CODE: Record<string, string>;
export declare const FAVORITE_ITEMS_UNIQUE_KEYS = "favoriteItemsUniqueKeys";
export declare const CUSTOM_PRESETS = "ketcher_custom_presets";
export declare const PRESET_PHOSPHATE_FILTER_STORAGE_KEY = "ketcher_preset_phosphate_filter";
export declare const SEQUENCE_TYPE_STORAGE_KEY = "ketcher_polymer_sequence_type";
export declare const NoNaturalAnalogueGroupCode = "Z";
export declare const NoNaturalAnalogueGroupTitle = "No natural analogue";
export declare const DNA_TEMPLATE_NAME_PART = "thymine";
export declare const RNA_TEMPLATE_NAME_PART = "uracil";
export declare const LIBRARY_TAB_INDEX: {
    readonly FAVORITES: 0;
    readonly PEPTIDES: 1;
    readonly RNA: 2;
    readonly CHEM: 3;
};
export declare const FavoriteStarSymbol = "\u2605";
