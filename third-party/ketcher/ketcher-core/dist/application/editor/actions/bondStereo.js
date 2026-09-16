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

var monomerMicromolecule = require('../../../domain/entities/monomerMicromolecule.js');
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
require('../../../domain/entities/atom.js');
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
require('../../../utilities/runAsyncAction.js');
require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
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
var actionTransaction = require('./actionTransaction.js');
var helpers = require('./helpers.js');
var AtomAttr = require('../operations/atom/AtomAttr.js');
var FragmentDeleteStereoAtom = require('../operations/FragmentDeleteStereoAtom.js');
var FragmentAddStereoAtom = require('../operations/FragmentAddStereoAtom.js');

function fromStereoAtomAttrs(restruct, aid, attrs, withReverse) {
  var action$1 = new action.Action();
  var transaction = new actionTransaction.ActionTransaction(restruct);
  var atom = restruct.molecule.atoms.get(aid);
  var sgroup = restruct.molecule.getGroupFromAtomId(aid);
  try {
    if (atom && !(sgroup instanceof monomerMicromolecule.MonomerMicromolecule)) {
      var frid = atom.fragment;
      if ('stereoParity' in attrs) {
        action$1.addOp(transaction.capture(new AtomAttr.AtomAttr(aid, 'stereoParity', attrs.stereoParity).perform(restruct)));
      }
      if ('stereoLabel' in attrs) {
        action$1.addOp(transaction.capture(new AtomAttr.AtomAttr(aid, 'stereoLabel', attrs.stereoLabel).perform(restruct)));
        if (attrs.stereoLabel === null) {
          action$1.addOp(transaction.capture(new FragmentDeleteStereoAtom.FragmentDeleteStereoAtom(frid, aid).perform(restruct)));
        } else {
          action$1.addOp(transaction.capture(new FragmentAddStereoAtom.FragmentAddStereoAtom(frid, aid).perform(restruct)));
        }
      }
      if (withReverse) action$1.operations.reverse();
    }
    transaction.commit();
    return action$1;
  } catch (cause) {
    return transaction.rollback(cause);
  }
}
function fromBondStereoUpdate(restruct, bond, withReverse) {
  var _struct$atoms$get, _struct$atoms$get2;
  var action$1 = new action.Action();
  var transaction = new actionTransaction.ActionTransaction(restruct);
  var struct = restruct.molecule;
  var beginFrId = (_struct$atoms$get = struct.atoms.get(bond === null || bond === void 0 ? void 0 : bond.begin)) === null || _struct$atoms$get === void 0 ? void 0 : _struct$atoms$get.fragment;
  var endFrId = (_struct$atoms$get2 = struct.atoms.get(bond === null || bond === void 0 ? void 0 : bond.end)) === null || _struct$atoms$get2 === void 0 ? void 0 : _struct$atoms$get2.fragment;
  var fragmentStereoBonds = [];
  struct.bonds.forEach(function (bond) {
    var _struct$atoms$get3, _struct$atoms$get4;
    if (((_struct$atoms$get3 = struct.atoms.get(bond.begin)) === null || _struct$atoms$get3 === void 0 ? void 0 : _struct$atoms$get3.fragment) === beginFrId) {
      fragmentStereoBonds.push(bond);
    }
    if (beginFrId !== endFrId && ((_struct$atoms$get4 = struct.atoms.get(bond.begin)) === null || _struct$atoms$get4 === void 0 ? void 0 : _struct$atoms$get4.fragment) === endFrId) {
      fragmentStereoBonds.push(bond);
    }
  });
  var stereoAtomsMap = helpers.getStereoAtomsMap(struct, fragmentStereoBonds, bond);
  try {
    stereoAtomsMap.forEach(function (stereoProp, aId) {
      var _struct$atoms$get5;
      if (((_struct$atoms$get5 = struct.atoms.get(aId)) === null || _struct$atoms$get5 === void 0 ? void 0 : _struct$atoms$get5.stereoLabel) !== stereoProp.stereoLabel) {
        var stereoAtomAction = fromStereoAtomAttrs(restruct, aId, stereoProp, withReverse);
        transaction.capture(stereoAtomAction);
        action$1.mergeWith(stereoAtomAction);
      }
    });
    transaction.commit();
    return action$1;
  } catch (cause) {
    return transaction.rollback(cause);
  }
}

exports.fromBondStereoUpdate = fromBondStereoUpdate;
exports.fromStereoAtomAttrs = fromStereoAtomAttrs;
//# sourceMappingURL=bondStereo.js.map
