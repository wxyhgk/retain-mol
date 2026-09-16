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
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { Bond } from '../../../domain/entities/bond.modern.js';
import { FunctionalGroup } from '../../../domain/entities/functionalGroup.modern.js';
import { SGroupAttachmentPoint } from '../../../domain/entities/sGroupAttachmentPoint.modern.js';
import '../operations/atom/index.modern.js';
import '../operations/bond/index.modern.js';
import '../operations/CanvasLoad.modern.js';
import '../operations/descriptors.modern.js';
import '../operations/EnhancedFlagMove.modern.js';
import '../operations/EnhancedFlagClear.modern.js';
import '../operations/ifThen.modern.js';
import '../operations/fragment.modern.js';
import '../operations/fragmentStereoAtom.modern.js';
import { FragmentStereoFlag } from '../operations/FragmentStereoFlag.modern.js';
import { CalcImplicitH } from '../operations/calcimplicitH.modern.js';
import '../operations/LoopMove.modern.js';
import '../operations/OperationType.modern.js';
import '../operations/image/imageMove.modern.js';
import '../operations/image/imageResize.modern.js';
import '../operations/image/imageUpsertDelete.modern.js';
import '../operations/multitailArrow/multitailArrowAddRemoveTail.modern.js';
import '../operations/multitailArrow/multitailArrowMove.modern.js';
import '../operations/multitailArrow/multitailArrowMoveHeadTail.modern.js';
import '../operations/multitailArrow/multitailArrowResizeTailHead.modern.js';
import '../operations/multitailArrow/multitailArrowUpsertDelete.modern.js';
import '../operations/rgroup/RGroupAttr.modern.js';
import '../operations/rgroup/RGroupFragment.modern.js';
import '../operations/rgroupAttachmentPoint/index.modern.js';
import '../operations/rxn/index.modern.js';
import '../operations/simpleObject.modern.js';
import '../operations/sgroup/index.modern.js';
import '../operations/Text/TextCreateDelete.modern.js';
import '../operations/Text/TextUpdate.modern.js';
import '../operations/Text/TextMove.modern.js';
import '../operations/monomer/AttachmentPointHoverOperation.modern.js';
import '../operations/monomer/FlipMonomerOperation.modern.js';
import '../operations/monomer/MonomerAddOperation.modern.js';
import '../operations/monomer/MonomerDeleteOperation.modern.js';
import '../../../domain/entities/AmbiguousMonomer.modern.js';
import '../../../domain/helpers/monomers.modern.js';
import '../../render/renderers/AmbiguousMonomerRenderer.modern.js';
import '@babel/runtime/helpers/toConsumableArray';
import '../../../domain/entities/atom.modern.js';
import '../../../domain/entities/atomList.modern.js';
import '../../../domain/entities/fixedPrecision.modern.js';
import '../../../domain/entities/fragment.modern.js';
import '../../../domain/entities/halfBond.modern.js';
import '../../../domain/entities/loop.modern.js';
import '../../../domain/entities/rgroup.modern.js';
import '../../../domain/entities/rgroupAttachmentPoint.modern.js';
import '../../../domain/entities/rxnArrow.modern.js';
import '../../../domain/entities/rxnPlus.modern.js';
import '../../../domain/entities/sgroup.modern.js';
import '../../../domain/entities/sgroupForest.modern.js';
import '../../../domain/entities/simpleObject.modern.js';
import '../../../domain/entities/struct.modern.js';
import '../../../domain/entities/text.modern.js';
import '../../../domain/entities/pile.modern.js';
import '../../../domain/entities/vec2.modern.js';
import '../../../domain/entities/box2Abs.modern.js';
import '../../../domain/entities/pool.modern.js';
import '../../../domain/entities/image.modern.js';
import '../../../domain/entities/multitailArrow.modern.js';
import '../../../domain/entities/highlight.modern.js';
import '../../../domain/entities/monomerMicromolecule.modern.js';
import '../../../domain/entities/Peptide.modern.js';
import '../../../domain/entities/BaseMonomer.modern.js';
import '../../../domain/entities/Chem.modern.js';
import '../../../domain/entities/Sugar.modern.js';
import '../../../domain/entities/RNABase.modern.js';
import '../../../domain/entities/Phosphate.modern.js';
import '../../../domain/entities/Axis.modern.js';
import '../../../domain/entities/Nucleoside.modern.js';
import '../../../domain/entities/Nucleotide.modern.js';
import '../../../domain/entities/monomer-chains/types.modern.js';
import '../../../domain/entities/monomer-chains/Chain.modern.js';
import '../../../domain/entities/monomer-chains/ChainsCollection.modern.js';
import '../../../domain/entities/MonomerSequenceNode.modern.js';
import '../../../domain/entities/EmptySequenceNode.modern.js';
import '../../../domain/entities/LinkerSequenceNode.modern.js';
import '../../../domain/entities/UnresolvedMonomer.modern.js';
import '../../../domain/entities/UnsplitNucleotide.modern.js';
import '../../../domain/entities/PolymerBond.modern.js';
import '../../../domain/entities/MonomerToAtomBond.modern.js';
import '../../../domain/entities/HydrogenBond.modern.js';
import '../../../domain/entities/SGroupDrawingEntity.modern.js';
import '../../../domain/entities/BackBoneSequenceNode.modern.js';
import '../../../domain/entities/Command.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import '../../../domain/entities/CoreAtom.modern.js';
import '../../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../../domain/constants/elements.modern.js';
import '../../../domain/constants/element.types.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/constants/chains.modern.js';
import '../../../domain/constants/monomers.modern.js';
import '../../render/renderers/ChemRenderer.modern.js';
import '../../render/renderers/PeptideRenderer.modern.js';
import '../../render/renderers/PhosphateRenderer.modern.js';
import '../../render/renderers/RNABaseRenderer.modern.js';
import '../../render/renderers/SugarRenderer.modern.js';
import '../../render/renderers/UnresolvedMonomerRenderer.modern.js';
import '../../render/renderers/UnsplitNucleotideRenderer.modern.js';
import '../operations/monomer/MonomerHoverOperation.modern.js';
import '../operations/monomer/MonomerItemModifyOperation.modern.js';
import '../operations/monomer/MonomerMoveOperation.modern.js';
import '../operations/monomer/RotateMonomerOperation.modern.js';
import '../operations/monomer/ShiftMonomerOperation.modern.js';
import '../operations/modes/index.modern.js';
import '../operations/monomerCreation/AssignAttachmentAtomOperation.modern.js';
import '../operations/monomerCreation/AssignLeavingGroupAtomOperation.modern.js';
import '../operations/monomerCreation/MarkAsRnaComponentOperation.modern.js';
import '../operations/monomerCreation/ReassignAttachmentPointOperation.modern.js';
import '../operations/monomerCreation/ReassignLeavingAtomOperation.modern.js';
import { atomGetAttr, atomForNewBond } from './utils.modern.js';
import { mergeSgroups, mergeFragmentsIfNeeded } from './atom.modern.js';
import { fromAtomMerge } from './atomMerge.modern.js';
import { fromBondStereoUpdate } from './bondStereo.modern.js';
import { Action } from './action.modern.js';
import { ActionTransaction, runActionTransaction } from './actionTransaction.modern.js';
import utils from '../shared/utils.modern.js';
import { fromSgroupAttachmentPointRemove } from './sgroupAttachmentPoint.modern.js';
import { FragmentAdd } from '../operations/FragmentAdd.modern.js';
import { AtomAdd } from '../operations/atom/AtomAdd.modern.js';
import { BondAdd } from '../operations/bond/BondAdd.modern.js';
import { BondAttr } from '../operations/bond/BondAttr.modern.js';
import { BondDelete } from '../operations/bond/BondDelete.modern.js';
import { AtomAttr } from '../operations/atom/AtomAttr.modern.js';
import { FragmentDeleteStereoAtom } from '../operations/FragmentDeleteStereoAtom.modern.js';
import { FragmentAddStereoAtom } from '../operations/FragmentAddStereoAtom.modern.js';
import { SGroupAttachmentPointRemove } from '../operations/sgroup/sgroupAttachmentPoints.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function fromBondAddition(reStruct, bond, begin, end, beginAtomPos, endAtomPos) {
  var transaction = new ActionTransaction(reStruct);
  var action = new Action();
  var struct = reStruct.molecule;
  var captureAppendedAction = function captureAppendedAction(startIndex) {
    var appendedOperations = action.operations.slice(startIndex);
    if (appendedOperations.length > 0) {
      transaction.capture(new Action(appendedOperations));
    }
  };
  var captureActionMutation = function captureActionMutation(callback) {
    var startIndex = action.operations.length;
    try {
      return callback();
    } finally {
      captureAppendedAction(startIndex);
    }
  };
  try {
    var _struct$frags$get;
    var mouseDownNothingAndUpNothing = function mouseDownNothingAndUpNothing(beginAtomAttr, endAtomAttr) {
      var newFragmentId = action.addOp(transaction.capture(new FragmentAdd().perform(reStruct))).frid;
      var newBeginAtomId = action.addOp(transaction.capture(new AtomAdd(_objectSpread(_objectSpread({}, beginAtomAttr), {}, {
        fragment: newFragmentId
      }), beginAtomPos).perform(reStruct))).data.aid;
      var newEndAtomId = action.addOp(transaction.capture(new AtomAdd(_objectSpread(_objectSpread({}, endAtomAttr), {}, {
        fragment: newFragmentId
      }), endAtomPos).perform(reStruct))).data.aid;
      return [newBeginAtomId, newEndAtomId];
    };
    var mouseDownNothingAndUpAtom = function mouseDownNothingAndUpAtom(beginAtomAttr, endAtomId) {
      var fragmentId = atomGetAttr(reStruct, endAtomId, 'fragment');
      var newBeginAtomId = action.addOp(transaction.capture(new AtomAdd(_objectSpread(_objectSpread({}, beginAtomAttr), {}, {
        fragment: fragmentId
      }), beginAtomPos).perform(reStruct))).data.aid;
      var endAtom = struct.atoms.get(endAtomId);
      if (endAtom && !FunctionalGroup.isAtomInContractedFunctionalGroup(endAtom, struct.sgroups, struct.functionalGroups)) {
        captureActionMutation(function () {
          return mergeSgroups(action, reStruct, [newBeginAtomId], endAtomId);
        });
      }
      return [newBeginAtomId, endAtomId];
    };
    var mouseDownAtomAndUpNothing = function mouseDownAtomAndUpNothing(beginAtomId, endAtomAttr) {
      var fragmentId = atomGetAttr(reStruct, beginAtomId, 'fragment');
      var newEndAtomId = action.addOp(transaction.capture(new AtomAdd(_objectSpread(_objectSpread({}, endAtomAttr), {}, {
        fragment: fragmentId
      }), endAtomPos !== null && endAtomPos !== void 0 ? endAtomPos : atomForNewBond(reStruct, begin, bond).pos).perform(reStruct))).data.aid;
      var beginAtom = struct.atoms.get(beginAtomId);
      if (beginAtom && !FunctionalGroup.isAtomInContractedFunctionalGroup(beginAtom, struct.sgroups, struct.functionalGroups)) {
        captureActionMutation(function () {
          return mergeSgroups(action, reStruct, [newEndAtomId], beginAtomId);
        });
      }
      return [beginAtomId, newEndAtomId];
    };
    var beginAtomId, endAtomId;
    var startsOnAtom = typeof begin === 'number';
    var endsOnAtom = typeof end === 'number';
    if (!startsOnAtom && !endsOnAtom) {
      var _mouseDownNothingAndU = mouseDownNothingAndUpNothing(begin, end);
      var _mouseDownNothingAndU2 = _slicedToArray(_mouseDownNothingAndU, 2);
      beginAtomId = _mouseDownNothingAndU2[0];
      endAtomId = _mouseDownNothingAndU2[1];
    } else if (!startsOnAtom && endsOnAtom) {
      var _mouseDownNothingAndU3 = mouseDownNothingAndUpAtom(begin, end);
      var _mouseDownNothingAndU4 = _slicedToArray(_mouseDownNothingAndU3, 2);
      beginAtomId = _mouseDownNothingAndU4[0];
      endAtomId = _mouseDownNothingAndU4[1];
    } else if (startsOnAtom && !endsOnAtom) {
      var _mouseDownAtomAndUpNo = mouseDownAtomAndUpNothing(begin, end);
      var _mouseDownAtomAndUpNo2 = _slicedToArray(_mouseDownAtomAndUpNo, 2);
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
    var bondInverse = new BondAdd(beginAtomId, endAtomId, bond).perform(reStruct);
    action.addOp(bondInverse);
    var newBondId = bondInverse.data.bid;
    var newBond = struct.bonds.get(newBondId);
    if (newBond) {
      var implicitHInverse;
      try {
        implicitHInverse = new CalcImplicitH([newBond.begin, newBond.end]).perform(reStruct);
      } catch (cause) {
        transaction.capture(new Action([bondInverse]));
        throw cause;
      }
      action.addOp(implicitHInverse);
      transaction.capture(new Action([bondInverse, implicitHInverse]));
      var stereoUpdateAction = fromBondStereoUpdate(reStruct, newBond);
      transaction.capture(stereoUpdateAction);
      action.mergeWith(stereoUpdateAction);
    } else {
      transaction.capture(new Action([bondInverse]));
    }
    action.operations.reverse();
    var mergedFragmentId = captureActionMutation(function () {
      return mergeFragmentsIfNeeded(action, reStruct, beginAtomId, endAtomId);
    });
    if ((_struct$frags$get = struct.frags.get(mergedFragmentId || 0)) !== null && _struct$frags$get !== void 0 && _struct$frags$get.stereoAtoms && !bond.stereo) {
      action.addOp(transaction.capture(new FragmentStereoFlag(mergedFragmentId || 0).perform(reStruct)));
    }
    transaction.commit();
    return [action, beginAtomId, endAtomId, newBondId];
  } catch (cause) {
    return transaction.rollback(cause);
  }
}
function fromBondsAttrs(restruct, ids, attrs, reset) {
  var struct = restruct.molecule;
  var action = new Action();
  var bids = Array.isArray(ids) ? ids : [ids];
  var transaction = new ActionTransaction(restruct);
  try {
    bids.forEach(function (bid) {
      Object.keys(Bond.attrlist).forEach(function (key) {
        if (!(key in attrs) && !reset) return;
        var value = key in attrs ? attrs[key] : Bond.attrGetDefault(key);
        action.addOp(transaction.capture(new BondAttr(bid, key, value).perform(restruct)));
        if (key === 'stereo' && key in attrs) {
          var bond = struct.bonds.get(bid);
          if (bond) {
            action.addOp(transaction.capture(new CalcImplicitH([bond.begin, bond.end]).perform(restruct)));
            var stereoAction = fromBondStereoUpdate(restruct, bond);
            transaction.capture(stereoAction);
            action.mergeWith(stereoAction);
          }
        }
      });
    });
    transaction.commit();
    return action;
  } catch (cause) {
    return transaction.rollback(cause);
  }
}
function fromBondsMerge(restruct, mergeMap) {
  var struct = restruct.molecule;
  var atomPairs = new Map();
  var action = new Action();
  var transaction = new ActionTransaction(restruct);
  try {
    mergeMap.forEach(function (dstId, srcId) {
      var bond = struct.bonds.get(srcId);
      var bondCI = struct.bonds.get(dstId);
      if (!bond || !bondCI) return;
      var params = utils.mergeBondsParams(struct, bond, struct, bondCI);
      if (!(params !== null && params !== void 0 && params.merged)) return;
      atomPairs.set(bond.begin, !params.cross ? bondCI.begin : bondCI.end);
      atomPairs.set(bond.end, !params.cross ? bondCI.end : bondCI.begin);
    });
    atomPairs.forEach(function (dst, src) {
      var atomMergeAction = fromAtomMerge(restruct, src, dst);
      transaction.capture(atomMergeAction);
      action = atomMergeAction.mergeWith(action);
    });
    transaction.commit();
    return action;
  } catch (cause) {
    return transaction.rollback(cause);
  }
}
function fromBondFlipping(restruct, id) {
  var bond = restruct.molecule.bonds.get(id);
  var struct = restruct.molecule;
  return runActionTransaction(restruct, function (transaction) {
    transaction.capture(new BondDelete(id).perform(restruct));
    if (Number.isInteger(bond === null || bond === void 0 ? void 0 : bond.end) && Number.isInteger(bond === null || bond === void 0 ? void 0 : bond.begin)) {
      var bondAddOp = new BondAdd(bond === null || bond === void 0 ? void 0 : bond.end, bond === null || bond === void 0 ? void 0 : bond.begin, bond);
      transaction.capture(bondAddOp.perform(restruct));
      if (bond !== null && bond !== void 0 && bond.stereo && bond.stereo !== Bond.PATTERN.STEREO.NONE) {
        var oldBeginId = bond.begin;
        var oldEndId = bond.end;
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
            transaction.capture(new AtomAttr(oldBeginId, 'stereoLabel', null).perform(restruct));
            transaction.capture(new AtomAttr(oldBeginId, 'stereoParity', 0).perform(restruct));
            transaction.capture(new FragmentDeleteStereoAtom(frid, oldBeginId).perform(restruct));
            transaction.capture(new AtomAttr(oldEndId, 'stereoLabel', stereoLabel).perform(restruct));
            transaction.capture(new AtomAttr(oldEndId, 'stereoParity', stereoParity).perform(restruct));
            transaction.capture(new FragmentAddStereoAtom(frid, oldEndId).perform(restruct));
          } else {
            var newBond = struct.bonds.get(bondAddOp.data.bid);
            if (newBond) {
              transaction.capture(fromBondStereoUpdate(restruct, newBond));
            }
          }
        }
      }
    }
  });
}
var plainBondTypes = [Bond.PATTERN.TYPE.SINGLE, Bond.PATTERN.TYPE.DOUBLE, Bond.PATTERN.TYPE.TRIPLE];
function bondChangingAction(restruct, itemID, bond, bondProps) {
  var action = new Action();
  var transaction = new ActionTransaction(restruct);
  var newItemId = itemID;
  try {
    if ((bondProps.stereo !== Bond.PATTERN.STEREO.NONE &&
    bondProps.type === Bond.PATTERN.TYPE.SINGLE || bond.type === Bond.PATTERN.TYPE.DATIVE) && bond.type === bondProps.type && bond.stereo === bondProps.stereo) {
      var flippingAction = fromBondFlipping(restruct, itemID);
      transaction.capture(flippingAction);
      action.mergeWith(flippingAction);
      newItemId = action.operations[1].data.bid;
    }
    var loop = bondProps.type !== undefined && plainBondTypes.includes(bondProps.type) ? plainBondTypes : null;
    if (bondProps.stereo === Bond.PATTERN.STEREO.NONE && bondProps.type === Bond.PATTERN.TYPE.SINGLE && bond.stereo === Bond.PATTERN.STEREO.NONE && loop) {
      bondProps.type = loop[(loop.indexOf(bond.type) + 1) % loop.length];
    }
    var attrsAction = fromBondsAttrs(restruct, newItemId, bondProps);
    transaction.capture(attrsAction);
    var result = attrsAction.mergeWith(action);
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
        var attachmentPoint = new SGroupAttachmentPoint(atomId, undefined, undefined);
        (_sgroup$item4 = sgroup.item) === null || _sgroup$item4 === void 0 || _sgroup$item4.addAttachmentPoint(attachmentPoint);
        if (sgroup.item) {
          transaction.capture(new SGroupAttachmentPointRemove(sgroup.item.id, attachmentPoint));
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
      action.mergeWith(fromSgroupAttachmentPointRemove(restruct, (_sgroup$item6 = sgroup.item) === null || _sgroup$item6 === void 0 ? void 0 : _sgroup$item6.id, atomId, anotherSideAtomId, false));
    }
  });
}

export { bondChangingAction, fromBondAddition, fromBondFlipping, fromBondsAttrs, fromBondsMerge, removeAttachmentPointFromSuperatom };
//# sourceMappingURL=bond.modern.js.map
