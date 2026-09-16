import { type BaseMonomer, type FunctionalGroup, type MonomerCreationInitialValues, MonomerMicromolecule } from 'ketcher-core';
export declare const getEditInstanceInitialValues: (monomer: BaseMonomer) => MonomerCreationInitialValues;
type MonomersLibraryParsedJson = {
    root?: {
        templates?: Array<{
            $ref?: string;
        }>;
    };
    [templateRef: string]: unknown;
};
export declare const getEditAllInstancesInitialValues: (monomer: BaseMonomer, monomersLibraryParsedJson?: MonomersLibraryParsedJson | null) => MonomerCreationInitialValues;
/**
 * Extracts the sgroup IDs from a list of functional groups that match the
 * primary monomer's type and symbol. Returns `undefined` when fewer than two
 * matching groups are found (no restriction needed in that case).
 *
 * Use this when the user has multiple monomers of the same type selected and
 * "Edit All Instances" should be scoped to only those selections.
 */
export declare const getSelectedSGroupIdsForEditAll: (functionalGroups: FunctionalGroup[], primaryMonomer: BaseMonomer) => number[] | undefined;
/**
 * Returns true when the given `MonomerMicromolecule` sgroup represents the
 * same monomer type and symbol as `primaryMonomer`.
 *
 * Use this to filter a plain list of sgroup IDs (e.g. from a dialog that
 * receives raw IDs rather than `FunctionalGroup` objects).
 */
export declare const isSameMonomerType: (sgroup: MonomerMicromolecule, primaryMonomer: BaseMonomer) => boolean;
export {};
