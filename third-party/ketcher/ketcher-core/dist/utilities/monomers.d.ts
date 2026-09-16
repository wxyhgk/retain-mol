import type { BaseMonomer } from '../domain/entities/BaseMonomer';
import type { IKetIdtAliases } from '../application/formatters/types/ket';
export declare const HELM_ALIAS_FORMAT_ERROR_MESSAGE = "The HELM alias must consist only of uppercase and lowercase letters, numbers, underscores (_), asterisks (*), square brackets ([]), parentheses (()), dots (.), and hyphens (-), spaces prohibited.";
export declare const BILN_ALIAS_FORMAT_ERROR_MESSAGE = "The BILN alias must consist only of uppercase and lowercase letters, numbers, hyphens (`-`), underscores (`_`), and asterisks (`*`).";
export declare const HELM_ALIAS_MAX_LENGTH = 23;
export declare const HELM_ALIAS_LENGTH_ERROR_MESSAGE = "The HELM alias must be no more than 23 symbols long.";
export declare const IDT_ALIAS_SLASH_ERROR_MESSAGE = "The slashes (`/`) can only be the first and last character of an IDT alias.";
export declare const IDT_ALIAS_LENGTH_MAX = 10;
export declare const IDT_ALIAS_LENGTH_ERROR_MESSAGE = "The maximum number of characters of an IDT alias without slashes (/) is 10.";
export declare const MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH = 200;
export declare const MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH_ERROR_MESSAGE = "The monomer group template name must not exceed 200 characters.";
export declare const DISALLOWED_MONOMER_MODIFICATION_TYPES: readonly ["Ambiguous mixed peptide", "Unknown peptide", "Ambiguous alternative sugar", "Ambiguous mixed sugar", "Unknown sugar", "Ambiguous mixed DNA base", "Ambiguous mixed RNA base", "Ambiguous mixed base", "Unknown base", "Ambiguous alternative phosphate", "Ambiguous mixed phosphate", "Unknown phosphate", "Unknown unsplit nucleotide", "Ambiguous alternative CHEM", "Ambiguous mixed CHEM", "Unknown CHEM", "Unknown monomer", "Molecule", "Micromolecule"];
export declare const DISALLOWED_MODIFICATION_TYPE_ERROR_MESSAGE = "Monomers with an unknown, ambiguous, or molecule modification type cannot be added to the library.";
/**
 * Returns the modification types of a monomer that are not allowed in the
 * library (unknown / ambiguous / molecule markers). Returns an empty array when
 * the monomer has no modification types or all of them are allowed.
 *
 * `modificationTypes` originates from parsed, untrusted library JSON, so it may
 * not actually be an array at runtime (e.g. a caller passing a bare string).
 * The `Array.isArray` guard turns such malformed input into an empty result
 * instead of a `TypeError`, which would otherwise escape the per-monomer loop
 * in `Editor.updateMonomersLibrary` and abort the whole chunk.
 */
export declare function getDisallowedModificationTypes(modificationTypes?: string[]): string[];
/**
 * Validates that slashes in an IDT alias only appear as the first
 * and/or last character. Slashes in the middle are not allowed.
 */
export declare function isValidIdtAlias(alias: string): boolean;
export declare function isValidIdtAliasLength(alias: string): boolean;
export declare function getTooLongIdtAliasEntries(idtAliases: IKetIdtAliases): {
    alias: string;
    value: string;
}[];
export declare function isValidHelmAlias(alias: string): boolean;
export declare function isValidBilnAlias(alias: string): boolean;
export declare function isValidHelmAliasLength(alias: string): boolean;
export declare function isMonomerSgroupWithAttachmentPoints(monomer: BaseMonomer): boolean | undefined;
