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

var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var bond = require('../../../domain/entities/bond.js');
var functionalGroup = require('../../../domain/entities/functionalGroup.js');
var sGroupAttachmentPoint = require('../../../domain/entities/sGroupAttachmentPoint.js');
require('../operations/atom/index.js');
require('../operations/bond/index.js');
require('../operations/CanvasLoad.js');
require('../operations/descriptors.js');
require('../operations/EnhancedFlagMove.js');
require('../operations/EnhancedFlagClear.js');
require('../operations/ifThen.js');
require('../operations/fragment.js');
require('../operations/fragmentStereoAtom.js');
var FragmentStereoFlag = require('../operations/FragmentStereoFlag.js');
var calcimplicitH = require('../operations/calcimplicitH.js');
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
require('@babel/runtime/helpers/toConsumableArray');
require('../../../domain/entities/atom.js');
require('../../../domain/entities/atomList.js');
require('../../../domain/entities/fixedPrecision.js');
require('../../../domain/entities/fragment.js');
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
require('../../../domain/entities/CoreAtom.js');
require('../../../domain/entities/CoreStereoFlag.js');
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
var utils = require('./utils.js');
var atom = require('./atom.js');
var atomMerge = require('./atomMerge.js');
var bondStereo = require('./bondStereo.js');
var action = require('./action.js');
var actionTransaction = require('./actionTransaction.js');
var utils$1 = require('../shared/utils.js');
var sgroupAttachmentPoint = require('./sgroupAttachmentPoint.js');
var FragmentAdd = require('../operations/FragmentAdd.js');
var AtomAdd = require('../operations/atom/AtomAdd.js');
var BondAdd = require('../operations/bond/BondAdd.js');
var BondAttr = require('../operations/bond/BondAttr.js');
var BondDelete = require('../operations/bond/BondDelete.js');
var AtomAttr = require('../operations/atom/AtomAttr.js');
var FragmentDeleteStereoAtom = require('../operations/FragmentDeleteStereoAtom.js');
var FragmentAddStereoAtom = require('../operations/FragmentAddStereoAtom.js');
var sgroupAttachmentPoints = require('../operations/sgroup/sgroupAttachmentPoints.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function fromBondAddition(reStruct, bond, begin, end, beginAtomPos, endAtomPos) {
  var transaction = new actionTransaction.ActionTransaction(reStruct);
  var action$1 = new action.Action();
  var struct = reStruct.molecule;
  var captureAppendedAction = function captureAppendedAction(startIndex) {
    var appendedOperations = action$1.operations.slice(startIndex);
    if (appendedOperations.length > 0) {
      transaction.capture(new action.Action(appendedOperations));
    }
  };
  var captureActionMutation = function captureActionMutation(callback) {
    var startIndex = action$1.operations.length;
    try {
      return callback();
    } finally {
      captureAppendedAction(startIndex);
    }
  };
  try {
    var _struct$frags$get;
    var mouseDownNothingAndUpNothing = function mouseDownNothingAndUpNothing(beginAtomAttr, endAtomAttr) {
      var newFragmentId = action$1.addOp(transaction.capture(new FragmentAdd.FragmentAdd().perform(reStruct))).frid;
      var newBeginAtomId = action$1.addOp(transaction.capture(new AtomAdd.AtomAdd(_objectSpread(_objectSpread({}, beginAtomAttr), {}, {
        fragment: newFragmentId
      }), beginAtomPos).perform(reStruct))).data.aid;
      var newEndAtomId = action$1.addOp(transaction.capture(new AtomAdd.AtomAdd(_objectSpread(_objectSpread({}, endAtomAttr), {}, {
        fragment: newFragmentId
      }), endAtomPos).perform(reStruct))).data.aid;
      return [newBeginAtomId, newEndAtomId];
    };
    var mouseDownNothingAndUpAtom = function mouseDownNothingAndUpAtom(beginAtomAttr, endAtomId) {
      var fragmentId = utils.atomGetAttr(reStruct, endAtomId, 'fragment');
      var newBeginAtomId = action$1.addOp(transaction.capture(new AtomAdd.AtomAdd(_objectSpread(_objectSpread({}, beginAtomAttr), {}, {
        fragment: fragmentId
      }), beginAtomPos).perform(reStruct))).data.aid;
      var endAtom = struct.atoms.get(endAtomId);
      if (endAtom && !functionalGroup.FunctionalGroup.isAtomInContractedFunctionalGroup(endAtom, struct.sgroups, struct.functionalGroups)) {
        captureActionMutation(function () {
          return atom.mergeSgroups(action$1, reStruct, [newBeginAtomId], endAtomId);
        });
      }
      return [newBeginAtomId, endAtomId];
    };
    var mouseDownAtomAndUpNothing = function mouseDownAtomAndUpNothing(beginAtomId, endAtomAttr) {
      var fragmentId = utils.atomGetAttr(reStruct, beginAtomId, 'fragment');
      var newEndAtomId = action$1.addOp(transaction.capture(new AtomAdd.AtomAdd(_objectSpread(_objectSpread({}, endAtomAttr), {}, {
        fragment: fragmentId
      }), endAtomPos !== null && endAtomPos !== void 0 ? endAtomPos : utils.atomForNewBond(reStruct, begin, bond).pos).perform(reStruct))).data.aid;
      var beginAtom = struct.atoms.get(beginAtomId);
      if (beginAtom && !functionalGroup.FunctionalGroup.isAtomInContractedFunctionalGroup(beginAtom, struct.sgroups, struct.functionalGroups)) {
        captureActionMutation(function () {
          return atom.mergeSgroups(action$1, reStruct, [newEndAtomId], beginAtomId);
        });
      }
      return [beginAtomId, newEndAtomId];
    };
    var beginAtomId, endAtomId;
    var startsOnAtom = typeof begin === 'number';
    var endsOnAtom = typeof end === 'number';
    if (!startsOnAtom && !endsOnAtom) {
      var _mouseDownNothingAndU = mouseDownNothingAndUpNothing(begin, end);
      var _mouseDownNothingAndU2 = _slicedToArray__default["default"](_mouseDownNothingAndU, 2);
      beginAtomId = _mouseDownNothingAndU2[0];
      endAtomId = _mouseDownNothingAndU2[1];
    } else if (!startsOnAtom && endsOnAtom) {
      var _mouseDownNothingAndU3 = mouseDownNothingAndUpAtom(begin, end);
      var _mouseDownNothingAndU4 = _slicedToArray__default["default"](_mouseDownNothingAndU3, 2);
      beginAtomId = _mouseDownNothingAndU4[0];
      endAtomId = _mouseDownNothingAndU4[1];
    } else if (startsOnAtom && !endsOnAtom) {
      var _mouseDownAtomAndUpNo = mouseDownAtomAndUpNothing(begin, end);
      var _mouseDownAtomAndUpNo2 = _slicedToArray__default["default"](_mouseDownAtomAndUpNo, 2);
      beginAtomId = _mouseDownAtomAndUpNo2[0];
      endAtomId = _mouseDownAtomAndUpNo2[1];
    } else {
      beginAtomId = begin;
      endAtomId = end;
      if (reStruct.sgroups && reStruct.sgroups.size > 0) {
        reStruct.sgroups.forEach(function (sgroup) {
          var _sgroup$item, _sgroup$item2;
          if ((_sgroup$item = sgroup.item) !== null && _sgroup$item !== void 0 && _sgroup$item.type && ((_sgroup$item2 = sgroup.item) === null || _sgroup$item2 === void 0 ? void 0 : _sgroup$item2.type) === 'SUP') {
            addAttachmentPointToSuperatom(sgroup, beginAtomId, endAtomId, transaction);
          }
        });
      }
    }
    var bondInverse = new BondAdd.BondAdd(beginAtomId, endAtomId, bond).perform(reStruct);
    action$1.addOp(bondInverse);
    var newBondId = bondInverse.data.bid;
    var newBond = struct.bonds.get(newBondId);
    if (newBond) {
      var implicitHInverse;
      try {
        implicitHInverse = new calcimplicitH.CalcImplicitH([newBond.begin, newBond.end]).perform(reStruct);
      } catch (cause) {
        transaction.capture(new action.Action([bondInverse]));
        throw cause;
      }
      action$1.addOp(implicitHInverse);
      transaction.capture(new action.Action([bondInverse, implicitHInverse]));
      var stereoUpdateAction = bondStereo.fromBondStereoUpdate(reStruct, newBond);
      transaction.capture(stereoUpdateAction);
      action$1.mergeWith(stereoUpdateAction);
    } else {
      transaction.capture(new action.Action([bondInverse]));
    }
    action$1.operations.reverse();
    var mergedFragmentId = captureActionMutation(function () {
      return atom.mergeFragmentsIfNeeded(action$1, reStruct, beginAtomId, endAtomId);
    });
    if ((_struct$frags$get = struct.frags.get(mergedFragmentId || 0)) !== null && _struct$frags$get !== void 0 && _struct$frags$get.stereoAtoms && !bond.stereo) {
      action$1.addOp(transaction.capture(new FragmentStereoFlag.FragmentStereoFlag(mergedFragmentId || 0).perform(reStruct)));
    }
    transaction.commit();
    return [action$1, beginAtomId, endAtomId, newBondId];
  } catch (cause) {
    return transaction.rollback(cause);
  }
}
function fromBondsAttrs(restruct, ids, attrs, reset) {
  var struct = restruct.molecule;
  var action$1 = new action.Action();
  var bids = Array.isArray(ids) ? ids : [ids];
  var transaction = new actionTransaction.ActionTransaction(restruct);
  try {
    bids.forEach(function (bid) {
      Object.keys(bond.Bond.attrlist).forEach(function (key) {
        if (!(key in attrs) && !reset) return;
        var value = key in attrs ? attrs[key] : bond.Bond.attrGetDefault(key);
        action$1.addOp(transaction.capture(new BondAttr.BondAttr(bid, key, value).perform(restruct)));
        if (key === 'stereo' && key in attrs) {
          var bond$1 = struct.bonds.get(bid);
          if (bond$1) {
            action$1.addOp(transaction.capture(new calcimplicitH.CalcImplicitH([bond$1.begin, bond$1.end]).perform(restruct)));
            var stereoAction = bondStereo.fromBondStereoUpdate(restruct, bond$1);
            transaction.capture(stereoAction);
            action$1.mergeWith(stereoAction);
          }
        }
      });
    });
    transaction.commit();
    return action$1;
  } catch (cause) {
    return transaction.rollback(cause);
  }
}
function fromBondsMerge(restruct, mergeMap) {
  var struct = restruct.molecule;
  var atomPairs = new Map();
  var action$1 = new action.Action();
  var transaction = new actionTransaction.ActionTransaction(restruct);
  try {
    mergeMap.forEach(function (dstId, srcId) {
      var bond = struct.bonds.get(srcId);
      var bondCI = struct.bonds.get(dstId);
      if (!bond || !bondCI) return;
      var params = utils$1["default"].mergeBondsParams(struct, bond, struct, bondCI);
      if (!(params !== null && params !== void 0 && params.merged)) return;
      atomPairs.set(bond.begin, !params.cross ? bondCI.begin : bondCI.end);
      atomPairs.set(bond.end, !params.cross ? bondCI.end : bondCI.begin);
    });
    atomPairs.forEach(function (dst, src) {
      var atomMergeAction = atomMerge.fromAtomMerge(restruct, src, dst);
      transaction.capture(atomMergeAction);
      action$1 = atomMergeAction.mergeWith(action$1);
    });
    transaction.commit();
    return action$1;
  } catch (cause) {
    return transaction.rollback(cause);
  }
}
function fromBondFlipping(restruct, id) {
  var bond$1 = restruct.molecule.bonds.get(id);
  var struct = restruct.molecule;
  return actionTransaction.runActionTransaction(restruct, function (transaction) {
    transaction.capture(new BondDelete.BondDelete(id).perform(restruct));
    if (Number.isInteger(bond$1 === null || bond$1 === void 0 ? void 0 : bond$1.end) && Number.isInteger(bond$1 === null || bond$1 === void 0 ? void 0 : bond$1.begin)) {
      var bondAddOp = new BondAdd.BondAdd(bond$1 === null || bond$1 === void 0 ? void 0 : bond$1.end, bond$1 === null || bond$1 === void 0 ? void 0 : bond$1.begin, bond$1);
      transaction.capture(bondAddOp.perform(restruct));
      if (bond$1 !== null && bond$1 !== void 0 && bond$1.stereo && bond$1.stereo !== bond.Bond.PATTERN.STEREO.NONE) {
        var oldBeginId = bond$1.begin;
        var oldEndId = bond$1.end;
        var oldBeginAtom = struct.atoms.get(oldBeginId);
        var frid = oldBeginAtom === null || oldBeginAtom === void 0 ? void 0 : oldBeginAtom.fragment;
        if (frid !== undefined) {
          var _fragment$stereoAtoms;
          var fragment = struct.frags.get(frid);
          var isOldBeginStereoAtom = (_fragment$stereoAtoms = fragment === null || fragment === void 0 ? void 0 : fragment.stereoAtoms.includes(oldBeginId)) !== null && _fragment$stereoAtoms !== void 0 ? _fragment$stereoAtoms : false;
          if (isOldBeginStereoAtom) {
            var _oldBeginAtom$stereoL, _oldBeginAtom$stereoP;
            var stereoLabel = (_oldBeginAtom$stereoL = oldBeginAtom === null || oldBeginAtom === void 0 ? void 0 : oldBeginAtom.stereoLabel) !== null && _oldBeginAtom$stereoL !== void 0 ? _oldBeginAtom$stereoL : null;
            var stereoParity = (_oldBeginAtom$stereoP = oldBeginAtom === null || oldBeginAtom === void 0 ? void 0 : oldBeginAtom.stereoParity) !== null && _oldBeginAtom$stereoP !== void 0 ? _oldBeginAtom$stereoP : 0;
            transaction.capture(new AtomAttr.AtomAttr(oldBeginId, 'stereoLabel', null).perform(restruct));
            transaction.capture(new AtomAttr.AtomAttr(oldBeginId, 'stereoParity', 0).perform(restruct));
            transaction.capture(new FragmentDeleteStereoAtom.FragmentDeleteStereoAtom(frid, oldBeginId).perform(restruct));
            transaction.capture(new AtomAttr.AtomAttr(oldEndId, 'stereoLabel', stereoLabel).perform(restruct));
            transaction.capture(new AtomAttr.AtomAttr(oldEndId, 'stereoParity', stereoParity).perform(restruct));
            transaction.capture(new FragmentAddStereoAtom.FragmentAddStereoAtom(frid, oldEndId).perform(restruct));
          } else {
            var newBond = struct.bonds.get(bondAddOp.data.bid);
            if (newBond) {
              transaction.capture(bondStereo.fromBondStereoUpdate(restruct, newBond));
            }
          }
        }
      }
    }
  });
}
var plainBondTypes = [bond.Bond.PATTERN.TYPE.SINGLE, bond.Bond.PATTERN.TYPE.DOUBLE, bond.Bond.PATTERN.TYPE.TRIPLE];
function bondChangingAction(restruct, itemID, bond$1, bondProps) {
  var action$1 = new action.Action();
  var transaction = new actionTransaction.ActionTransaction(restruct);
  var newItemId = itemID;
  try {
    if ((bondProps.stereo !== bond.Bond.PATTERN.STEREO.NONE &&
    bondProps.type === bond.Bond.PATTERN.TYPE.SINGLE || bond$1.type === bond.Bond.PATTERN.TYPE.DATIVE) && bond$1.type === bondProps.type && bond$1.stereo === bondProps.stereo) {
      var flippingAction = fromBondFlipping(restruct, itemID);
      transaction.capture(flippingAction);
      action$1.mergeWith(flippingAction);
      newItemId = action$1.operations[1].data.bid;
    }
    var loop = bondProps.type !== undefined && plainBondTypes.includes(bondProps.type) ? plainBondTypes : null;
    if (bondProps.stereo === bond.Bond.PATTERN.STEREO.NONE && bondProps.type === bond.Bond.PATTERN.TYPE.SINGLE && bond$1.stereo === bond.Bond.PATTERN.STEREO.NONE && loop) {
      bondProps.type = loop[(loop.indexOf(bond$1.type) + 1) % loop.length];
    }
    var attrsAction = fromBondsAttrs(restruct, newItemId, bondProps);
    transaction.capture(attrsAction);
    var result = attrsAction.mergeWith(action$1);
    transaction.commit();
    return result;
  } catch (cause) {
    return transaction.rollback(cause);
  }
}
function addAttachmentPointToSuperatom(sgroup, beginAtomId, endAtomId, transaction) {
  var _sgroup$item3;
  ((_sgroup$item3 = sgroup.item) === null || _sgroup$item3 === void 0 ? void 0 : _sgroup$item3.atoms).forEach(function (atomId) {
    if (beginAtomId === atomId || endAtomId === atomId) {
      if (!sgroup.item.getAttachmentPoints().map(function (attachmentPoint) {
        return attachmentPoint.atomId;
      }).includes(atomId)) {
        var _sgroup$item4;
        var attachmentPoint = new sGroupAttachmentPoint.SGroupAttachmentPoint(atomId, undefined, undefined);
        (_sgroup$item4 = sgroup.item) === null || _sgroup$item4 === void 0 || _sgroup$item4.addAttachmentPoint(attachmentPoint);
        if (sgroup.item) {
          transaction.capture(new sgroupAttachmentPoints.SGroupAttachmentPointRemove(sgroup.item.id, attachmentPoint));
        }
      }
    }
  });
}
function removeAttachmentPointFromSuperatom(sgroup, beginAtomId, endAtomId, action, restruct) {
  var _sgroup$item5;
  ((_sgroup$item5 = sgroup.item) === null || _sgroup$item5 === void 0 ? void 0 : _sgroup$item5.atoms).forEach(function (atomId) {
    if (beginAtomId === atomId || endAtomId === atomId) {
      var _sgroup$item6;
      var anotherSideAtomId = beginAtomId === atomId ? endAtomId : beginAtomId;
      action.mergeWith(sgroupAttachmentPoint.fromSgroupAttachmentPointRemove(restruct, (_sgroup$item6 = sgroup.item) === null || _sgroup$item6 === void 0 ? void 0 : _sgroup$item6.id, atomId, anotherSideAtomId, false));
    }
  });
}

exports.bondChangingAction = bondChangingAction;
exports.fromBondAddition = fromBondAddition;
exports.fromBondFlipping = fromBondFlipping;
exports.fromBondsAttrs = fromBondsAttrs;
exports.fromBondsMerge = fromBondsMerge;
exports.removeAttachmentPointFromSuperatom = removeAttachmentPointFromSuperatom;
//# sourceMappingURL=bond.js.map
