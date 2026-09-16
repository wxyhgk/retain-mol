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
var calcimplicitH = require('../operations/calcimplicitH.js');
require('../operations/LoopMove.js');
require('../operations/OperationType.js');
require('../operations/image/imageMove.js');
require('../operations/image/imageResize.js');
var imageUpsertDelete = require('../operations/image/imageUpsertDelete.js');
require('../operations/multitailArrow/multitailArrowAddRemoveTail.js');
require('../operations/multitailArrow/multitailArrowMove.js');
require('../operations/multitailArrow/multitailArrowMoveHeadTail.js');
require('../operations/multitailArrow/multitailArrowResizeTailHead.js');
var multitailArrowUpsertDelete = require('../operations/multitailArrow/multitailArrowUpsertDelete.js');
require('../operations/rgroup/RGroupAttr.js');
require('../operations/rgroup/RGroupFragment.js');
require('../operations/rgroupAttachmentPoint/index.js');
var index = require('../operations/rxn/index.js');
var simpleObject = require('../operations/simpleObject.js');
require('../operations/sgroup/index.js');
var TextCreateDelete = require('../operations/Text/TextCreateDelete.js');
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
var rgroup = require('../../../domain/entities/rgroup.js');
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
require('../../../utilities/runAsyncAction.js');
require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
var assert = require('../../../utilities/assert.js');
require('../../../domain/entities/CoreAtom.js');
require('../../../domain/entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/defineProperty');
require('@babel/runtime/helpers/typeof');
require('../../../domain/constants/elements.js');
require('../../../domain/constants/element.types.js');
require('../../../domain/constants/generics.js');
var image = require('../../../domain/constants/image.js');
var multitailArrow = require('../../../domain/constants/multitailArrow.js');
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
var sgroup = require('./sgroup.js');
var action = require('./action.js');
var utils = require('./utils.js');
var bond = require('./bond.js');
var bondStereo = require('./bondStereo.js');
var fragment = require('./fragment.js');
var rgroupAttachmentPoint = require('./rgroupAttachmentPoint.js');
var _ = require('lodash');
var index$1 = require('../operations/rxn/plus/index.js');
var sgroupAtom = require('../operations/sgroup/sgroupAtom.js');
var AtomDelete = require('../operations/atom/AtomDelete.js');
var RGroupAttachmentPointRemove = require('../operations/rgroupAttachmentPoint/RGroupAttachmentPointRemove.js');
var BondDelete = require('../operations/bond/BondDelete.js');

function fromOneAtomDeletion(restruct, atomId) {
  return fromFragmentDeletion(restruct, {
    atoms: [atomId]
  });
}
function fromBondDeletion(restruct, bid) {
  var _restruct$sgroups;
  var skipAtoms = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var action$1 = new action.Action();
  if (((_restruct$sgroups = restruct.sgroups) === null || _restruct$sgroups === void 0 ? void 0 : _restruct$sgroups.size) > 0) {
    restruct.sgroups.forEach(function (sgroup) {
      var _sgroup$item, _sgroup$item2;
      if ((_sgroup$item = sgroup.item) !== null && _sgroup$item !== void 0 && _sgroup$item.type && ((_sgroup$item2 = sgroup.item) === null || _sgroup$item2 === void 0 ? void 0 : _sgroup$item2.type) === 'SUP') {
        var _restruct$bonds$get, _restruct$bonds$get2;
        var beginAtomConnectedToBond = (_restruct$bonds$get = restruct.bonds.get(bid)) === null || _restruct$bonds$get === void 0 ? void 0 : _restruct$bonds$get.b.begin;
        var endAtomConnectedToBond = (_restruct$bonds$get2 = restruct.bonds.get(bid)) === null || _restruct$bonds$get2 === void 0 ? void 0 : _restruct$bonds$get2.b.end;
        bond.removeAttachmentPointFromSuperatom(sgroup, beginAtomConnectedToBond, endAtomConnectedToBond, action$1, restruct);
      }
    });
  }
  var bond$1 = restruct.molecule.bonds.get(bid);
  assert.assert(bond$1 != null);
  var atomsToRemove = [];
  action$1.addOp(new BondDelete.BondDelete(bid));
  if (!skipAtoms.includes(bond$1.begin) && utils.atomGetDegree(restruct, bond$1.begin) === 0) {
    if (sgroup.removeAtomFromSgroupIfNeeded(action$1, restruct, bond$1.begin)) {
      atomsToRemove.push(bond$1.begin);
    }
    action$1.addOp(new AtomDelete.AtomDelete(bond$1.begin));
  }
  if (!skipAtoms.includes(bond$1.end) && utils.atomGetDegree(restruct, bond$1.end) === 0) {
    if (sgroup.removeAtomFromSgroupIfNeeded(action$1, restruct, bond$1.end)) {
      atomsToRemove.push(bond$1.end);
    }
    action$1.addOp(new AtomDelete.AtomDelete(bond$1.end));
  }
  sgroup.removeSgroupIfNeeded(action$1, restruct, atomsToRemove);
  action$1 = action$1.perform(restruct);
  action$1.addOp(new calcimplicitH.CalcImplicitH([bond$1.begin, bond$1.end]).perform(restruct));
  action$1.mergeWith(bondStereo.fromBondStereoUpdate(restruct, bond$1, false));
  action$1.operations.reverse();
  return action$1;
}
function fromOneBondDeletion(restruct, id) {
  var frid = restruct.molecule.getBondFragment(id);
  var action = fromBondDeletion(restruct, id);
  action = fragment.fromFragmentSplit(restruct, frid).mergeWith(action);
  return action;
}
function fromFragmentDeletion(restruct, rawSelection) {
  assert.assert(rawSelection != null);
  var action$1 = new action.Action();
  var atomsToRemove = [];
  var frids = [];
  var struct = restruct.molecule;
  var selection = utils.formatSelection(rawSelection);
  selection.sgroups.forEach(function (sgroupId) {
    var sgroup = restruct.sgroups.get(sgroupId);
    var sgroupAtoms = sgroup.item.atoms;
    selection.atoms = selection.atoms.concat(sgroupAtoms);
    restruct.molecule.bonds.forEach(function (bond, bondId) {
      if (sgroupAtoms.indexOf(bond.begin) >= 0 && sgroupAtoms.indexOf(bond.end) >= 0) {
        selection.bonds.push(bondId);
      }
    });
  });
  selection.atoms = Array.from(new Set(selection.atoms));
  selection.bonds = Array.from(new Set(selection.bonds));
  selection.atoms.forEach(function (atomId) {
    var sgroup = struct.getGroupFromAtomId(atomId);
    if (sgroup !== null && sgroup !== void 0 && sgroup.isSuperatomWithoutLabel) {
      var attachmentPoints = sgroup.getAttachmentPoints();
      attachmentPoints.forEach(function (attachmentPoint) {
        if (attachmentPoint.atomId === atomId && _.isNumber(attachmentPoint.leaveAtomId) && !selection.atoms.includes(attachmentPoint.leaveAtomId)) {
          action$1.addOp(new sgroupAtom.SGroupAtomRemove(sgroup.id, attachmentPoint.leaveAtomId));
          action$1.addOp(new AtomDelete.AtomDelete(attachmentPoint.leaveAtomId));
        }
      });
    }
  });
  selection.atoms.forEach(function (aid) {
    restruct.molecule.atomGetNeighbors(aid).forEach(function (nei) {
      if (selection.bonds.indexOf(nei.bid) === -1) {
        selection.bonds = selection.bonds.concat([nei.bid]);
      }
    });
  });
  var actionRemoveBonds = new action.Action();
  selection.bonds.forEach(function (bid) {
    var frid = restruct.molecule.getBondFragment(bid);
    if (frids.indexOf(frid) < 0) frids.push(frid);
    actionRemoveBonds.mergeWith(fromBondDeletion(restruct, bid, selection.atoms));
  });
  var removedRGroupAttachmentPoints = [];
  selection.atoms.forEach(function (aid) {
    var frid3 = restruct.molecule.atoms.get(aid).fragment;
    if (frids.indexOf(frid3) < 0) frids.push(frid3);
    if (sgroup.removeAtomFromSgroupIfNeeded(action$1, restruct, aid)) {
      atomsToRemove.push(aid);
    }
    action$1.addOp(new AtomDelete.AtomDelete(aid));
    var attachmentPointsToDelete = restruct.molecule.getRGroupAttachmentPointsByAtomId(aid);
    attachmentPointsToDelete.forEach(function (id) {
      action$1.addOp(new RGroupAttachmentPointRemove.RGroupAttachmentPointRemove(id));
      removedRGroupAttachmentPoints.push(id);
    });
  });
  sgroup.removeSgroupIfNeeded(action$1, restruct, atomsToRemove);
  selection.rxnArrows.forEach(function (id) {
    action$1.addOp(new index.RxnArrowDelete(id));
  });
  selection.rxnPluses.forEach(function (id) {
    action$1.addOp(new index$1.RxnPlusDelete(id));
  });
  selection.simpleObjects.forEach(function (id) {
    action$1.addOp(new simpleObject.SimpleObjectDelete(id));
  });
  selection.texts.forEach(function (id) {
    action$1.addOp(new TextCreateDelete.TextDelete(id));
  });
  selection[image.IMAGE_KEY].forEach(function (id) {
    action$1.addOp(new imageUpsertDelete.ImageDelete(id));
  });
  selection[multitailArrow.MULTITAIL_ARROW_KEY].forEach(function (id) {
    action$1.addOp(new multitailArrowUpsertDelete.MultitailArrowDelete(id));
  });
  var actionToDeleteRGroupAttachmentPoints = new action.Action();
  selection.rgroupAttachmentPoints.forEach(function (id) {
    if (!removedRGroupAttachmentPoints.includes(id)) {
      actionToDeleteRGroupAttachmentPoints.mergeWith(rgroupAttachmentPoint.fromRGroupAttachmentPointDeletion(restruct, id));
    }
  });
  action$1 = action$1.perform(restruct);
  action$1.mergeWith(actionRemoveBonds).mergeWith(actionToDeleteRGroupAttachmentPoints);
  var rgForRemove = frids.reduce(function (acc, frid) {
    var rgid = rgroup.RGroup.findRGroupByFragment(restruct.molecule.rgroups, frid);
    if (_.isNumber(rgid)) {
      acc.push(rgid);
    }
    return acc;
  }, []);
  while (frids.length > 0) {
    action$1 = fragment.fromFragmentSplit(restruct, frids.pop(), rgForRemove).mergeWith(action$1);
  }
  return action$1;
}

exports.fromFragmentDeletion = fromFragmentDeletion;
exports.fromOneAtomDeletion = fromOneAtomDeletion;
exports.fromOneBondDeletion = fromOneBondDeletion;
//# sourceMappingURL=erase.js.map
