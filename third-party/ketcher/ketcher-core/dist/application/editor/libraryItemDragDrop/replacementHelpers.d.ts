/**
 * Helpers for the monomer-replacement drag-drop feature.
 *
 * These pure functions handle:
 *  - Preset geometry equality comparison (presetsHaveSameGeometry)
 *  - Bond collection from an existing monomer (collectMonomerBonds)
 *  - Re-establishment plan computation (computeReestablishableBonds)
 *  - Preset-level bond mapping (mapPresetBonds)
 */
import type { IRnaPreset } from '../../editor/tools/Tool';
import type { BaseMonomer } from '../../../domain/entities/BaseMonomer';
import { AttachmentPointName } from '../../../domain/types';
import { PolymerBond } from '../../../domain/entities/PolymerBond';
import type { HydrogenBond } from '../../../domain/entities/HydrogenBond';
import { MonomerToAtomBond } from '../../../domain/entities/MonomerToAtomBond';
/**
 * The subset of an RNA preset that describes its geometry (which structural
 * slots are filled and where the phosphate sits). Used to drive canvas preset
 * detection from the dragged library item.
 */
export type PresetGeometry = Pick<IRnaPreset, 'base' | 'phosphate' | 'phosphatePosition'>;
export type BondRecord = {
    /** The attachment point name on the original monomer */
    attachmentPointName: AttachmentPointName;
    bond: PolymerBond | HydrogenBond | MonomerToAtomBond;
    /** The other entity involved in the bond */
    otherEntity: BaseMonomer;
    /**
     * For polymer bonds: the AP name on the *other* monomer that the bond
     * connects to. Used when re-establishing bonds on the replacement monomer.
     */
    otherAttachmentPointName: AttachmentPointName | null;
};
export type BondReestablishmentPlan = {
    /** Bonds that can be re-established on the new monomer */
    reestablishable: BondRecord[];
    /** Bonds that cannot be re-established (AP absent on new monomer) */
    lost: BondRecord[];
};
/**
 * Returns true when two RNA presets have the same component types (sugar,
 * base, and phosphate presence) and the same phosphate position (5′/3′).
 *
 * "Same geometry" means the external bonding topology is identical, so the
 * whole-preset replacement can reuse the same inter-preset APs.
 *
 * Note: This intentionally does NOT compare monomer identities (names/types).
 * It only compares which structural slots are filled and the phosphate
 * orientation.
 */
export declare function presetsHaveSameGeometry(presetA: IRnaPreset, presetB: IRnaPreset): boolean;
/**
 * Returns all bonds attached to `monomer`, keyed by attachment-point name.
 *
 * Includes:
 *  - Polymer bonds (on named Rn APs)
 *  - Monomer-to-atom bonds (on named Rn APs)
 *  - Hydrogen bonds (collected under the special HYDROGEN key)
 */
export declare function collectMonomerBonds(monomer: BaseMonomer): BondRecord[];
/**
 * Given the bonds collected from an original monomer and a new replacement
 * monomer, returns two lists:
 *
 * - `reestablishable`: bonds whose attachment point exists and is free on
 *   `newMonomer`
 * - `lost`: bonds that cannot be re-established
 */
export declare function computeReestablishableBonds(originalBonds: BondRecord[], newMonomer: BaseMonomer): BondReestablishmentPlan;
/**
 * For a whole-preset replacement, maps each original preset component's
 * external bonds to the corresponding new preset component's APs.
 *
 * A "corresponding" component means: sugar↔sugar, base↔base,
 * phosphate↔phosphate. Internal intra-preset bonds are excluded since they
 * will be re-created by `addRnaPreset`.
 *
 * Returns the combined reestablishable / lost-bond lists across all preset
 * components.
 */
export declare function mapPresetBonds(originalComponents: BaseMonomer[], newComponents: BaseMonomer[]): BondReestablishmentPlan;
/**
 * Finds the phosphate that belongs to `sugar`'s RNA preset on the requested
 * side, matching the RNA backbone convention:
 *
 *  - 'right' (3′): sugar.R2 ↔ phosphate.R1
 *  - 'left'  (5′): sugar.R1 ↔ phosphate.R2
 *
 * Returns null when no phosphate is attached on that side. The AP on the
 * phosphate is verified so that a *neighbouring* nucleotide's phosphate (which
 * connects to the opposite AP) is not mistaken for this preset's phosphate.
 */
export declare function getPresetPhosphateFromSugar(sugar: BaseMonomer, position: 'left' | 'right'): BaseMonomer | null;
/**
 * Resolves the sugar anchor of the RNA preset that `monomer` belongs to,
 * using the dragged `libraryPreset` to disambiguate which side a phosphate
 * belongs to. Returns null if no sugar anchor can be resolved.
 *
 * Unlike a plain "is this a preset?" check, this does NOT require the sugar to
 * carry a base — a preset may legitimately be sugar+phosphate (no base) or
 * sugar+base (no phosphate). Whether the canvas preset actually matches the
 * dragged preset is decided later by getMatchingPresetComponents.
 */
export declare function getPresetSugarForMonomer(monomer: BaseMonomer, libraryPreset: PresetGeometry): BaseMonomer | null;
/**
 * Given a sugar anchor and the dragged `libraryPreset`, returns the canvas
 * monomers that structurally correspond to the library preset's components
 * (sugar, base if the library preset has one, phosphate on the library
 * preset's side if it has one).
 *
 * Returns null when the canvas preset does not contain every component the
 * library preset provides — i.e. the geometries differ — so the caller can
 * fall back to single-monomer replacement.
 *
 * Note: components the library preset does NOT provide (e.g. a base when the
 * dragged preset is sugar+phosphate) are intentionally excluded even if the
 * sugar carries them, so only the parts that exist in the dragged preset are
 * highlighted and replaced.
 */
export declare function getMatchingPresetComponents(sugar: BaseMonomer, libraryPreset: PresetGeometry): BaseMonomer[] | null;
export type PresetComponentRole = 'sugar' | 'base' | 'phosphate';
/**
 * Returns the structural role of a monomer within an RNA preset, or null when
 * it is not a recognised RNA component type.
 */
export declare function getPresetComponentRole(monomer: BaseMonomer): PresetComponentRole | null;
/**
 * Computes which of `oldMonomer`'s existing bonds would be LOST if it were
 * replaced by a monomer whose free attachment points are `newFreeAPs`.
 *
 * A bond is lost when its attachment point does not exist (or is not free) on
 * the replacement monomer. Hydrogen bonds are never lost (they don't route
 * through named Rn attachment points).
 */
export declare function computeLostBondsForMonomerReplacement(oldMonomer: BaseMonomer, newFreeAPs: Set<AttachmentPointName>): BondRecord[];
/**
 * Computes which EXTERNAL bonds would be LOST when replacing the given preset
 * components with a new preset whose per-role free attachment points are
 * `newFreeAPsByRole`. `rolePresent` indicates which roles the new preset
 * provides.
 *
 * Internal intra-preset bonds are ignored (they are recreated by the new
 * preset). Bonds to monomers that remain on the canvas (e.g. a base kept when
 * dropping a sugar+phosphate preset) are external and preserved when the
 * corresponding new component still exposes the attachment point.
 */
export declare function computeLostBondsForPresetReplacement(originalComponents: BaseMonomer[], newFreeAPsByRole: Record<PresetComponentRole, Set<AttachmentPointName>>, rolePresent: Record<PresetComponentRole, boolean>): BondRecord[];
