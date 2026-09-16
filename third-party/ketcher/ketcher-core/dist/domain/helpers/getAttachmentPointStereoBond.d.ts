import type { SGroup } from '../entities/sgroup';
import type { SGroupAttachmentPoint } from '../entities/sGroupAttachmentPoint';
/**
 * Helper function to find stereo bond information for an attachment point
 * by looking at the monomer's internal structure.
 * Returns the stereo value (UP or DOWN) if the bond between LGA and AA has stereo
 * and the narrow end is at the AA (attachment atom), otherwise returns null
 */
export declare function getAttachmentPointStereoBond(sGroup: SGroup, sGroupAttachmentPoint: SGroupAttachmentPoint): number | null;
