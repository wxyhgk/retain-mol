import { Command } from '../../../domain/entities/Command';
import type { BaseMonomer } from '../../../domain/entities/BaseMonomer';
import type { AttachmentPointName } from '../../../domain/types';
import type { DrawingEntitiesManager } from '../../../domain/entities/DrawingEntitiesManager';
/**
 * In Flex mode, after a drag-drop bond is established, reposition the
 * dropped monomer (and all monomers in its preset group) so that the new bond
 * has the standard bond length and follows the target AP direction.
 *
 * Formula (all values in model space / Å):
 *   droppedCenter = targetCenter + unitVector(apOutward) * (targetBodyRadius + bondLength + droppedBodyRadius)
 *
 * The offset delta is applied uniformly to all monomers in `addedMonomers`
 * so that a preset group moves as a rigid body.
 */
export declare function computeAndApplyFlexDropRepositioning(drawingEntitiesManager: DrawingEntitiesManager, droppedMonomer: BaseMonomer, addedMonomers: BaseMonomer[], targetMonomer: BaseMonomer, targetAttachmentPoint: AttachmentPointName): Command;
/**
 * Mirror the dropped preset horizontally around the bond insertion point
 * when both bonded ends are on the same topology side (req. 3.3.1).
 *
 * A monomer is "first" in its chain when it has no R2→R1 predecessor
 * (getPreviousMonomerInChain returns undefined). It is "last" when it
 * has no R2 successor (getNextMonomerInChain returns undefined).
 *
 * If both `droppedMonomer` and `targetMonomer` are first, or both are last,
 * the preset is mirrored by negating the x-offset of each preset monomer
 * relative to `droppedMonomer`'s current position (set by repositioning).
 */
export declare function applyPresetMirroringIfNeeded(drawingEntitiesManager: DrawingEntitiesManager, droppedMonomer: BaseMonomer, addedMonomers: BaseMonomer[], targetMonomer: BaseMonomer): Command;
/**
 * In Flex mode, after a replacement, shifts all monomers downstream of
 * `anchorMonomer` (connected via the R2→R1 backbone chain) by
 * `cellDelta * SnakeLayoutCellWidth` pixels converted to model-space Angstroms.
 *
 * `cellDelta` is `droppedMonomerCount - replacedMonomerCount`:
 *   - monomer → monomer:  (1 - 1) = 0  → no shift
 *   - preset  → monomer:  (3 - 1) = 2  → shift right by 2 × SnakeLayoutCellWidth
 *
 * Only the direct backbone chain (R2→R1 traversal) is shifted.
 * Monomers in other chains and non-backbone branches are not touched.
 *
 * The shift operations are merged into the returned `Command` so they form
 * part of the same atomic undo step as the replacement itself.
 *
 * @param drawingEntitiesManager  The active DEM instance.
 * @param anchorMonomer           The first newly placed monomer/sugar.
 *                                Traversal starts from its R2 successor.
 * @param cellDelta               droppedMonomerCount − replacedMonomerCount.
 */
export declare function shiftDownstreamChainMonomers(drawingEntitiesManager: DrawingEntitiesManager, anchorMonomer: BaseMonomer, cellDelta: number): Command;
