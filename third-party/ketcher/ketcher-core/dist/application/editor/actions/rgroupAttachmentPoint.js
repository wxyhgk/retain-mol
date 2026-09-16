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
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('../../../utilities/runAsyncAction.js');
require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
var assert = require('../../../utilities/assert.js');
var atom = require('../../../domain/entities/atom.js');
require('../operations/atom/index.js');
require('../operations/bond/index.js');
require('../operations/CanvasLoad.js');
require('../operations/descriptors.js');
require('../operations/EnhancedFlagMove.js');
require('../operations/EnhancedFlagClear.js');
require('../operations/ifThen.js');
require('../operations/fragment.js');
require('../operations/fragmentStereoAtom.js');
require('../operations/FragmentStereoFlag.js');
require('../operations/calcimplicitH.js');
require('../operations/LoopMove.js');
require('../operations/OperationType.js');
require('../operations/image/imageMove.js');
require('../operations/image/imageResize.js');
require('../operations/image/imageUpsertDelete.js');
require('../operations/multitailArrow/multitailArrowAddRemoveTail.js');
require('../operations/multitailArrow/multitailArrowMove.js');
require('../operations/multitailArrow/multitailArrowMoveHeadTail.js');
require('../operations/multitailArrow/multitailArrowResizeTailHead.js');
require('../operations/multitailArrow/multitailArrowUpsertDelete.js');
require('../operations/rgroup/RGroupAttr.js');
require('../operations/rgroup/RGroupFragment.js');
require('../operations/rgroupAttachmentPoint/index.js');
require('../operations/rxn/index.js');
require('../operations/simpleObject.js');
require('../operations/sgroup/index.js');
require('../operations/Text/TextCreateDelete.js');
require('../operations/Text/TextUpdate.js');
require('../operations/Text/TextMove.js');
require('../operations/monomer/AttachmentPointHoverOperation.js');
require('../operations/monomer/FlipMonomerOperation.js');
require('../operations/monomer/MonomerAddOperation.js');
require('../operations/monomer/MonomerDeleteOperation.js');
require('../../../domain/entities/AmbiguousMonomer.js');
require('../../../domain/helpers/monomers.js');
require('../../render/renderers/AmbiguousMonomerRenderer.js');
require('@babel/runtime/helpers/slicedToArray');
require('@babel/runtime/helpers/toConsumableArray');
require('../../../domain/entities/atomList.js');
require('../../../domain/entities/bond.js');
require('../../../domain/entities/fixedPrecision.js');
require('../../../domain/entities/fragment.js');
require('../../../domain/entities/functionalGroup.js');
require('../../../domain/entities/halfBond.js');
require('../../../domain/entities/loop.js');
require('../../../domain/entities/rgroup.js');
require('../../../domain/entities/rgroupAttachmentPoint.js');
require('../../../domain/entities/rxnArrow.js');
require('../../../domain/entities/rxnPlus.js');
require('../../../domain/entities/sgroup.js');
require('../../../domain/entities/sgroupForest.js');
require('../../../domain/entities/simpleObject.js');
require('../../../domain/entities/struct.js');
require('../../../domain/entities/text.js');
require('../../../domain/entities/pile.js');
require('../../../domain/entities/vec2.js');
require('../../../domain/entities/box2Abs.js');
require('../../../domain/entities/pool.js');
require('../../../domain/entities/image.js');
require('../../../domain/entities/multitailArrow.js');
require('../../../domain/entities/highlight.js');
require('../../../domain/entities/sGroupAttachmentPoint.js');
require('../../../domain/entities/monomerMicromolecule.js');
require('../../../domain/entities/Peptide.js');
require('../../../domain/entities/BaseMonomer.js');
require('../../../domain/entities/Chem.js');
require('../../../domain/entities/Sugar.js');
require('../../../domain/entities/RNABase.js');
require('../../../domain/entities/Phosphate.js');
require('../../../domain/entities/Axis.js');
require('../../../domain/entities/Nucleoside.js');
require('../../../domain/entities/Nucleotide.js');
require('../../../domain/entities/monomer-chains/types.js');
require('../../../domain/entities/monomer-chains/Chain.js');
require('../../../domain/entities/monomer-chains/ChainsCollection.js');
require('../../../domain/entities/MonomerSequenceNode.js');
require('../../../domain/entities/EmptySequenceNode.js');
require('../../../domain/entities/LinkerSequenceNode.js');
require('../../../domain/entities/UnresolvedMonomer.js');
require('../../../domain/entities/UnsplitNucleotide.js');
require('../../../domain/entities/PolymerBond.js');
require('../../../domain/entities/MonomerToAtomBond.js');
require('../../../domain/entities/HydrogenBond.js');
require('../../../domain/entities/SGroupDrawingEntity.js');
require('../../../domain/entities/BackBoneSequenceNode.js');
require('../../../domain/entities/Command.js');
require('../../../domain/entities/CoreAtom.js');
require('../../../domain/entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/defineProperty');
require('@babel/runtime/helpers/typeof');
require('../../../domain/constants/elements.js');
require('../../../domain/constants/element.types.js');
require('../../../domain/constants/generics.js');
require('../../../domain/constants/chains.js');
require('../../../domain/constants/monomers.js');
require('../../render/renderers/ChemRenderer.js');
require('../../render/renderers/PeptideRenderer.js');
require('../../render/renderers/PhosphateRenderer.js');
require('../../render/renderers/RNABaseRenderer.js');
require('../../render/renderers/SugarRenderer.js');
require('../../render/renderers/UnresolvedMonomerRenderer.js');
require('../../render/renderers/UnsplitNucleotideRenderer.js');
require('../operations/monomer/MonomerHoverOperation.js');
require('../operations/monomer/MonomerItemModifyOperation.js');
require('../operations/monomer/MonomerMoveOperation.js');
require('../operations/monomer/RotateMonomerOperation.js');
require('../operations/monomer/ShiftMonomerOperation.js');
require('../operations/modes/index.js');
require('../operations/monomerCreation/AssignAttachmentAtomOperation.js');
require('../operations/monomerCreation/AssignLeavingGroupAtomOperation.js');
require('../operations/monomerCreation/MarkAsRnaComponentOperation.js');
require('../operations/monomerCreation/ReassignAttachmentPointOperation.js');
require('../operations/monomerCreation/ReassignLeavingAtomOperation.js');
var action = require('./action.js');
var atom$1 = require('./atom.js');
var RGroupAttachmentPointAdd = require('../operations/rgroupAttachmentPoint/RGroupAttachmentPointAdd.js');
var RGroupAttachmentPointRemove = require('../operations/rgroupAttachmentPoint/RGroupAttachmentPointRemove.js');

function fromRGroupAttachmentPointUpdate(restruct, atomId, attachmentPoints) {
  var action$1 = new action.Action();
  action$1.mergeWith(fromRGroupAttachmentPointsDeletionByAtom(restruct, atomId));
  action$1.mergeWith(fromRGroupAttachmentPointAddition(restruct, attachmentPoints, atomId));
  return action$1;
}
function fromRGroupAttachmentPointAddition(restruct, attachmentPoints, atomId) {
  var action$1 = new action.Action();
  switch (attachmentPoints) {
    case atom.AttachmentPoints.FirstSideOnly:
      action$1.addOp(new RGroupAttachmentPointAdd.RGroupAttachmentPointAdd({
        atomId: atomId,
        attachmentPointType: 'primary'
      }));
      break;
    case atom.AttachmentPoints.SecondSideOnly:
      action$1.addOp(new RGroupAttachmentPointAdd.RGroupAttachmentPointAdd({
        atomId: atomId,
        attachmentPointType: 'secondary'
      }));
      break;
    case atom.AttachmentPoints.BothSides:
      action$1.addOp(new RGroupAttachmentPointAdd.RGroupAttachmentPointAdd({
        atomId: atomId,
        attachmentPointType: 'primary'
      }));
      action$1.addOp(new RGroupAttachmentPointAdd.RGroupAttachmentPointAdd({
        atomId: atomId,
        attachmentPointType: 'secondary'
      }));
      break;
  }
  return action$1.perform(restruct);
}
function fromRGroupAttachmentPointsDeletionByAtom(restruct, atomId) {
  var action$1 = new action.Action();
  var attachmentPointsToDelete = restruct.molecule.getRGroupAttachmentPointsByAtomId(atomId);
  attachmentPointsToDelete.forEach(function (rgroupAttachmentPointId) {
    action$1.addOp(new RGroupAttachmentPointRemove.RGroupAttachmentPointRemove(rgroupAttachmentPointId));
  });
  return action$1.perform(restruct);
}
function fromRGroupAttachmentPointDeletion(restruct, id) {
  var _getNewAtomAttachment = getNewAtomAttachmentPoints(restruct.molecule, id),
    atomId = _getNewAtomAttachment.atomId,
    newAttachmentPoints = _getNewAtomAttachment.newAttachmentPoints;
  var actionToUpdateAtomsAttrs = atom$1.fromAtomsAttrs(restruct, atomId, {
    attachmentPoints: newAttachmentPoints
  }, null);
  var actionToDeletePoint = new action.Action();
  actionToDeletePoint.addOp(new RGroupAttachmentPointRemove.RGroupAttachmentPointRemove(id));
  return actionToDeletePoint.perform(restruct).mergeWith(actionToUpdateAtomsAttrs);
}
function getNewAtomAttachmentPoints(struct, rgroupAttachmentPointToDelete) {
  var pointToDelete = struct.rgroupAttachmentPoints.get(rgroupAttachmentPointToDelete);
  assert.assert(pointToDelete != null);
  var attachedAtomId = pointToDelete.atomId;
  var attachedAtom = struct.atoms.get(attachedAtomId);
  var currentAttachmentPoints = attachedAtom === null || attachedAtom === void 0 ? void 0 : attachedAtom.attachmentPoints;
  var newAttachmentPoints = atom.AttachmentPoints.None;
  if (currentAttachmentPoints === atom.AttachmentPoints.BothSides) {
    var pointToDeleteType = pointToDelete.type;
    if (pointToDeleteType === 'primary') {
      newAttachmentPoints = atom.AttachmentPoints.SecondSideOnly;
    } else if (pointToDeleteType === 'secondary') {
      newAttachmentPoints = atom.AttachmentPoints.FirstSideOnly;
    }
  }
  return {
    atomId: attachedAtomId,
    newAttachmentPoints: newAttachmentPoints
  };
}

exports.fromRGroupAttachmentPointAddition = fromRGroupAttachmentPointAddition;
exports.fromRGroupAttachmentPointDeletion = fromRGroupAttachmentPointDeletion;
exports.fromRGroupAttachmentPointUpdate = fromRGroupAttachmentPointUpdate;
//# sourceMappingURL=rgroupAttachmentPoint.js.map
