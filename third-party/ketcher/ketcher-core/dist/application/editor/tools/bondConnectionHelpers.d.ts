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
import type { BaseMonomer } from '../../../domain/entities/BaseMonomer';
import { AttachmentPointName } from '../../../domain/types';
/**
 * Determines whether the "Select Attachment Points" modal should be shown
 * when connecting `firstMonomer` to `secondMonomer`.
 *
 * Returns `true` (show modal), `false` (auto-connect, no modal), or
 * `undefined` (hydrogen bond — modal not applicable).
 *
 * @param firstMonomer  The source monomer (the one initiating the bond).
 * @param secondMonomer The target monomer.
 * @param checkForPotentialBonds  When `true`, returns `true` if either monomer
 *   has no potential bonds pre-computed (i.e. `hasPotentialBonds()` is false).
 *   Set to `false` on the drag-drop path where potential bonds are not
 *   pre-computed.
 * @param isHydrogenBond  When `true`, returns `undefined` immediately (no modal
 *   for hydrogen bonds).
 */
export declare function shouldInvokeConnectionModal(firstMonomer: BaseMonomer, secondMonomer: BaseMonomer, checkForPotentialBonds?: boolean, isHydrogenBond?: boolean): boolean | undefined;
/**
 * Returns true when the two attachment point names belong to the same group
 * (e.g. both are "R1", both are "R2", etc.) — i.e. a non-standard same-group
 * bond is being formed.
 */
export declare function isNonStandardSameGroupBond(sourceAP: AttachmentPointName, targetAP: AttachmentPointName): boolean;
/**
 * For a preset (RNA nucleotide: sugar + optional base + optional phosphate) being
 * dropped onto a target attachment point, find the best component within the preset
 * to form the bond.
 *
 * Implements requirements 3.1–3.3 from drag-drop-bond-establishment:
 * - R1 target → preset component with free R2
 * - R2 target → preset component with free R1
 * - Otherwise (Rn, n>2) → sugar if it has any free AP, then phosphate, then base
 * - All exhausted → `undefined` (bond is silently skipped; preset is placed without bonding)
 *
 * @param addedMonomers  The monomers that were just added to the canvas as part of the preset.
 * @param targetAP       The attachment point name on the canvas monomer that is being targeted.
 * @returns The preset component to bond, or `undefined` if none can be resolved.
 */
export declare function findPresetMonomerForBonding(addedMonomers: BaseMonomer[], targetAP: AttachmentPointName): BaseMonomer | undefined;
