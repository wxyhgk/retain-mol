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
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import '../operations/atom/index.modern.js';
import '../operations/bond/index.modern.js';
import '../operations/CanvasLoad.modern.js';
import '../operations/descriptors.modern.js';
import '../operations/EnhancedFlagMove.modern.js';
import '../operations/EnhancedFlagClear.modern.js';
import '../operations/ifThen.modern.js';
import '../operations/fragment.modern.js';
import '../operations/fragmentStereoAtom.modern.js';
import '../operations/FragmentStereoFlag.modern.js';
import '../operations/calcimplicitH.modern.js';
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
import { SGroupDelete, SGroupCreate } from '../operations/sgroup/index.modern.js';
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
import '../../../domain/entities/atom.modern.js';
import '../../../domain/entities/atomList.modern.js';
import { Bond } from '../../../domain/entities/bond.modern.js';
import '../../../domain/entities/fixedPrecision.modern.js';
import '../../../domain/entities/fragment.modern.js';
import '../../../domain/entities/functionalGroup.modern.js';
import '../../../domain/entities/halfBond.modern.js';
import '../../../domain/entities/loop.modern.js';
import '../../../domain/entities/rgroup.modern.js';
import '../../../domain/entities/rgroupAttachmentPoint.modern.js';
import '../../../domain/entities/rxnArrow.modern.js';
import '../../../domain/entities/rxnPlus.modern.js';
import { SGroup } from '../../../domain/entities/sgroup.modern.js';
import '../../../domain/entities/sgroupForest.modern.js';
import '../../../domain/entities/simpleObject.modern.js';
import '../../../domain/entities/struct.modern.js';
import '../../../domain/entities/text.modern.js';
import { Pile } from '../../../domain/entities/pile.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import '../../../domain/entities/box2Abs.modern.js';
import '../../../domain/entities/pool.modern.js';
import '../../../domain/entities/image.modern.js';
import '../../../domain/entities/multitailArrow.modern.js';
import '../../../domain/entities/highlight.modern.js';
import '../../../domain/entities/sGroupAttachmentPoint.modern.js';
import { MonomerMicromolecule } from '../../../domain/entities/monomerMicromolecule.modern.js';
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
import { assert } from '../../../utilities/assert.modern.js';
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
import { atomGetAttr, atomGetDegree, atomGetSGroups } from './utils.modern.js';
import { Action } from './action.modern.js';
import { SgContexts } from '../shared/constants.modern.js';
import { uniq } from 'lodash/fp';
import { fromAtomsAttrs, mergeFragmentsIfNeeded } from './atom.modern.js';
import { SGroupAttachmentPointRemove, SGroupAttachmentPointAdd } from '../operations/sgroup/sgroupAttachmentPoints.modern.js';
import { isNumber } from 'lodash';
import { getAttachmentPointStereoBond } from '../../../domain/helpers/getAttachmentPointStereoBond.modern.js';
import { SGroupAttr } from '../operations/sgroup/SGroupAttr.modern.js';
import { BondAttr } from '../operations/bond/BondAttr.modern.js';
import { AtomMove } from '../operations/atom/AtomMove.modern.js';
import { SGroupDataMove } from '../operations/sgroup/SGroupDataMove.modern.js';
import { SGroupRemoveFromHierarchy, SGroupAddToHierarchy } from '../operations/sgroup/sgroupHierarchy.modern.js';
import { SGroupAtomRemove, SGroupAtomAdd } from '../operations/sgroup/sgroupAtom.modern.js';
import { BondDelete } from '../operations/bond/BondDelete.modern.js';
import { AtomDelete } from '../operations/atom/AtomDelete.modern.js';
import { BondAdd } from '../operations/bond/BondAdd.modern.js';
import { AtomAttr } from '../operations/atom/AtomAttr.modern.js';
import { FragmentAdd } from '../operations/FragmentAdd.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var fromMonomerBondFlipWithNewStereo = function fromMonomerBondFlipWithNewStereo(struct, bondId, stereo) {
  var bond = struct.bonds.get(bondId);
  if (!bond) {
    return;
  }
  var action = new Action();
  var bondWithStereo = _objectSpread(_objectSpread({}, bond), {}, {
    stereo: stereo,
    beginSuperatomAttachmentPointNumber: bond.endSuperatomAttachmentPointNumber,
    endSuperatomAttachmentPointNumber: bond.beginSuperatomAttachmentPointNumber
  });
  action.addOp(new BondDelete(bondId));
  action.addOp(new BondAdd(bond.end, bond.begin, bondWithStereo));
  return action;
};
function fromSeveralSgroupAddition(restruct, type, atoms, attrs) {
  var attachmentPoints = [];
  var descriptors = attrs.fieldValue;
  if (typeof descriptors === 'string' || type !== 'DAT') {
    return fromSgroupAddition(restruct, type, atoms, attrs, restruct.molecule.sgroups.newId(), attachmentPoints);
  }
  return descriptors.reduce(function (acc, fValue) {
    var localAttrs = _objectSpread({}, attrs || {});
    localAttrs.fieldValue = fValue;
    return acc.mergeWith(fromSgroupAddition(restruct, type, atoms, localAttrs, restruct.molecule.sgroups.newId(), attachmentPoints));
  }, new Action());
}
function fromSgroupAttrs(restruct, id, attrs) {
  var action = new Action();
  Object.keys(attrs).forEach(function (key) {
    action.addOp(new SGroupAttr(id, key, attrs[key]));
  });
  return action.perform(restruct);
}
function setExpandSGroup(restruct, sgid, attrs) {
  var action = new Action();
  Object.keys(attrs).forEach(function (key) {
    action.addOp(new SGroupAttr(sgid, key, attrs[key]));
  });
  var struct = restruct.molecule;
  var sgroup = struct.sgroups.get(sgid);
  assert(sgroup != null);
  var atoms = SGroup.getAtoms(struct, sgroup);
  atoms.forEach(function (aid) {
    var _restruct$atoms$get;
    action.mergeWith(fromAtomsAttrs(restruct, aid, (_restruct$atoms$get = restruct.atoms.get(aid)) === null || _restruct$atoms$get === void 0 ? void 0 : _restruct$atoms$get.a, false));
  });
  return action.perform(restruct);
}
function setExpandMonomerSGroup(restruct, sgid, attrs) {
  var action = new Action();
  var struct = restruct.molecule;
  var sGroup = struct.sgroups.get(sgid);
  assert(sGroup != null);
  if (attrs.expanded === sGroup.isExpanded()) {
    return action;
  }
  Object.keys(attrs).forEach(function (key) {
    action.addOp(new SGroupAttr(sgid, key, attrs[key]));
  });
  var sGroupAtoms = new Set(SGroup.getAtoms(struct, sGroup));
  var attachmentPoints = sGroup.getAttachmentPoints();
  var bondsToOutside = struct.bonds.filter(function (_, bond) {
    return sGroupAtoms.has(bond.begin) && !sGroupAtoms.has(bond.end) || sGroupAtoms.has(bond.end) && !sGroupAtoms.has(bond.begin);
  });
  var attachmentAtomsFromOutside = [];
  var _iterator = _createForOfIteratorHelper(bondsToOutside.values()),
    _step;
  try {
    var _loop = function _loop() {
      var bond = _step.value;
      if (attachmentPoints.some(function (attachmentPoint) {
        return attachmentPoint.atomId === bond.begin;
      })) {
        attachmentAtomsFromOutside.push(bond.end);
      } else {
        attachmentAtomsFromOutside.push(bond.begin);
      }
    };
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      _loop();
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  bondsToOutside.forEach(function (bondToOutside, bondId) {
    var _struct$atoms$get;
    var atomInsideCurrentMonomer = sGroupAtoms.has(bondToOutside.begin) ? bondToOutside.begin : bondToOutside.end;
    var atomOutsideCurrentMonomer = sGroupAtoms.has(bondToOutside.begin) ? bondToOutside.end : bondToOutside.begin;
    var outsideAtomSGroups = (_struct$atoms$get = struct.atoms.get(atomOutsideCurrentMonomer)) === null || _struct$atoms$get === void 0 ? void 0 : _struct$atoms$get.sgs;
    if (!outsideAtomSGroups || outsideAtomSGroups.size === 0) {
      return;
    }
    var _iterator2 = _createForOfIteratorHelper(outsideAtomSGroups.values()),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var otherSGroupId = _step2.value;
        var otherSGroup = struct.sgroups.get(otherSGroupId);
        if (!otherSGroup || otherSGroupId === sgid) {
          continue;
        }
        var otherMonomerIsExpanded = otherSGroup.isExpanded();
        var currentMonomerAP = attachmentPoints.find(function (ap) {
          return ap.atomId === atomInsideCurrentMonomer;
        });
        if (!currentMonomerAP) {
          continue;
        }
        var otherMonomerAPs = otherSGroup.getAttachmentPoints();
        var otherMonomerAP = otherMonomerAPs.find(function (ap) {
          return ap.atomId === atomOutsideCurrentMonomer;
        });
        if (!otherMonomerAP) {
          continue;
        }
        var currentMonomerStereo = getAttachmentPointStereoBond(sGroup, currentMonomerAP);
        var otherMonomerStereo = getAttachmentPointStereoBond(otherSGroup, otherMonomerAP);
        var hasCurrentStereo = currentMonomerStereo !== null && currentMonomerStereo !== Bond.PATTERN.STEREO.NONE;
        var hasOtherStereo = otherMonomerStereo !== null && otherMonomerStereo !== Bond.PATTERN.STEREO.NONE;
        var currentMonomerStereoValue = currentMonomerStereo !== null && currentMonomerStereo !== void 0 ? currentMonomerStereo : Bond.PATTERN.STEREO.NONE;
        var otherMonomerStereoValue = otherMonomerStereo !== null && otherMonomerStereo !== void 0 ? otherMonomerStereo : Bond.PATTERN.STEREO.NONE;
        var hasEffectiveCurrentStereo = hasCurrentStereo;
        var hasEffectiveOtherStereo = hasOtherStereo;
        if (attrs.expanded !== otherMonomerIsExpanded) {
          if (attrs.expanded && hasCurrentStereo) {
            hasEffectiveOtherStereo = false;
          } else if (otherMonomerIsExpanded && hasOtherStereo) {
            hasEffectiveCurrentStereo = false;
          }
        }
        if (hasEffectiveCurrentStereo && !hasEffectiveOtherStereo) {
          if (bondToOutside.begin !== atomInsideCurrentMonomer) {
            action.mergeWith(fromMonomerBondFlipWithNewStereo(struct, bondId, currentMonomerStereoValue));
          } else {
            action.addOp(new BondAttr(bondId, 'stereo', currentMonomerStereoValue));
          }
        } else if (!hasEffectiveCurrentStereo && hasEffectiveOtherStereo) {
          if (bondToOutside.begin !== atomOutsideCurrentMonomer) {
            action.mergeWith(fromMonomerBondFlipWithNewStereo(struct, bondId, otherMonomerStereoValue));
          } else {
            action.addOp(new BondAttr(bondId, 'stereo', otherMonomerStereoValue));
          }
        } else if (hasEffectiveCurrentStereo && hasEffectiveOtherStereo) {
          action.addOp(new BondAttr(bondId, 'stereo', Bond.PATTERN.STEREO.NONE));
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  });
  var sGroupBBox = SGroup.getObjBBox(Array.from(sGroupAtoms.values()), struct);
  var sGroupWidth = sGroupBBox.p1.x - sGroupBBox.p0.x;
  var sGroupHeight = sGroupBBox.p1.y - sGroupBBox.p0.y;
  var sGroupCenter = sGroup.isContracted() ? sGroup.getContractedPosition(struct).position : sGroup.pp;
  var visitedAtoms = new Set();
  var visitedSGroups = new Set();
  var atomsToMove = new Map();
  var sGroupsToMove = new Map();
  attachmentAtomsFromOutside.forEach(function (startAtomId, index) {
    var queue = [startAtomId];
    while (queue.length > 0) {
      var _restruct$atoms$get2;
      var currentAtomId = queue.shift();
      if (visitedAtoms.has(currentAtomId)) {
        continue;
      }
      visitedAtoms.add(currentAtomId);
      var atomSGroups = (_restruct$atoms$get2 = restruct.atoms.get(currentAtomId)) === null || _restruct$atoms$get2 === void 0 ? void 0 : _restruct$atoms$get2.a.sgs;
      var atomInSGroup = atomSGroups && atomSGroups.size > 0;
      if (atomInSGroup) {
        var _iterator3 = _createForOfIteratorHelper(atomSGroups.values()),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var _sGroupsToMove$get;
            var anotherSGroupId = _step3.value;
            if (visitedSGroups.has(anotherSGroupId) || anotherSGroupId === sgid) {
              continue;
            }
            visitedSGroups.add(anotherSGroupId);
            var anotherSGroup = struct.sgroups.get(anotherSGroupId);
            if (!anotherSGroup) {
              continue;
            }
            var previousArray = (_sGroupsToMove$get = sGroupsToMove.get(index)) !== null && _sGroupsToMove$get !== void 0 ? _sGroupsToMove$get : [];
            sGroupsToMove.set(index, previousArray.concat(anotherSGroupId));
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
      }
      var atom = struct.atoms.get(currentAtomId);
      if (atom) {
        var _atomsToMove$get;
        var _previousArray = (_atomsToMove$get = atomsToMove.get(index)) !== null && _atomsToMove$get !== void 0 ? _atomsToMove$get : [];
        atomsToMove.set(index, _previousArray.concat(currentAtomId));
        atom.neighbors.forEach(function (halfBondId) {
          var _struct$halfBonds;
          var neighborAtomId = struct === null || struct === void 0 || (_struct$halfBonds = struct.halfBonds) === null || _struct$halfBonds === void 0 || (_struct$halfBonds = _struct$halfBonds.get(halfBondId)) === null || _struct$halfBonds === void 0 ? void 0 : _struct$halfBonds.end;
          if (neighborAtomId === undefined || sGroupAtoms.has(neighborAtomId)) {
            return;
          }
          queue.push(neighborAtomId);
        });
      }
    }
  });
  var sameLine = new Set();
  sGroupsToMove.forEach(function (sGroupIds) {
    sGroupIds.forEach(function (sGroupId) {
      var movableSGroup = struct.sgroups.get(sGroupId);
      if (!movableSGroup) {
        return;
      }
      var movableSGroupCenter = movableSGroup.isContracted() ? movableSGroup.getContractedPosition(struct).position : movableSGroup === null || movableSGroup === void 0 ? void 0 : movableSGroup.pp;
      if (!sGroupCenter || !movableSGroupCenter) {
        return;
      }
      var SAME_LINE_THRESHOLD = 0.5;
      var inOneLine = movableSGroupCenter.y < sGroupCenter.y + SAME_LINE_THRESHOLD && movableSGroupCenter.y > sGroupCenter.y - SAME_LINE_THRESHOLD;
      if (inOneLine) {
        sameLine.add(sGroupId);
        return;
      }
      var WIDE_LINE_THRESHOLD = 2;
      var inWideLine = movableSGroupCenter.y < sGroupCenter.y + WIDE_LINE_THRESHOLD && movableSGroupCenter.y > sGroupCenter.y - WIDE_LINE_THRESHOLD;
      var movableSGroupAtoms = new Set(SGroup.getAtoms(struct, movableSGroup));
      var movableSGroupBondsToOutside = struct.bonds.filter(function (_, bond) {
        return movableSGroupAtoms.has(bond.begin) && !movableSGroupAtoms.has(bond.end) || movableSGroupAtoms.has(bond.end) && !movableSGroupAtoms.has(bond.begin);
      });
      var hasComplementaryBondToMainLine = movableSGroupBondsToOutside.size === 1 && _toConsumableArray(sameLine.values()).some(function (sGroupId) {
        var mainLineSGroup = struct.sgroups.get(sGroupId);
        if (!mainLineSGroup) {
          return false;
        }
        var mainLineSGroupAtoms = new Set(SGroup.getAtoms(struct, mainLineSGroup));
        var bond = _toConsumableArray(movableSGroupBondsToOutside.values())[0];
        return mainLineSGroupAtoms.has(bond.begin) || mainLineSGroupAtoms.has(bond.end);
      });
      if (inWideLine && hasComplementaryBondToMainLine) {
        sameLine.add(sGroupId);
      }
    });
  });
  var largestHeightInLine = _toConsumableArray(sameLine.values()).reduce(function (acc, sGroupId) {
    var sGroupInLine = restruct.molecule.sgroups.get(sGroupId);
    if (!sGroupInLine) {
      return acc;
    }
    if (sGroupInLine.isContracted()) {
      return acc;
    }
    var sGroupInLineAtoms = SGroup.getAtoms(struct, sGroupInLine);
    var sGroupInLineBBox = SGroup.getObjBBox(sGroupInLineAtoms, restruct.molecule);
    var sGroupInLineHeight = sGroupInLineBBox.p1.y - sGroupInLineBBox.p0.y;
    return Math.max(acc, sGroupInLineHeight);
  }, 0);
  var baseVerticalOffset = largestHeightInLine > sGroupHeight ? 0 : (sGroupHeight - largestHeightInLine) / 2;
  var horizontalOffset = sGroupWidth / 2;
  var handledAtoms = new Set();
  sGroupsToMove.forEach(function (sGroupIds) {
    sGroupIds.forEach(function (sGroupId) {
      var movableSGroup = restruct.molecule.sgroups.get(sGroupId);
      if (!movableSGroup) {
        return;
      }
      var movableSGroupCenter = movableSGroup.isContracted() ? movableSGroup.getContractedPosition(restruct.molecule).position : movableSGroup === null || movableSGroup === void 0 ? void 0 : movableSGroup.pp;
      if (!sGroupCenter || !movableSGroupCenter) {
        return;
      }
      var moveDown = movableSGroupCenter.y > sGroupCenter.y;
      var moveUp = movableSGroupCenter.y < sGroupCenter.y;
      var moveRight = movableSGroupCenter.x > sGroupCenter.x;
      var moveLeft = movableSGroupCenter.x < sGroupCenter.x;
      var moveHorizontally = sameLine.has(sGroupId);
      var moveVertically = !moveHorizontally;
      var horizontalDirection = 0;
      if (moveRight) {
        horizontalDirection = 1;
      } else if (moveLeft) {
        horizontalDirection = -1;
      }
      var verticalDirection = 0;
      if (moveDown) {
        verticalDirection = 1;
      } else if (moveUp) {
        verticalDirection = -1;
      }
      var moveVector = new Vec2((moveHorizontally ? 1 : 0) * horizontalDirection * horizontalOffset, (moveVertically ? 1 : 0) * verticalDirection * baseVerticalOffset);
      var finalMoveVector = attrs.expanded ? moveVector : moveVector.negated();
      var movableSGroupAtoms = SGroup.getAtoms(struct, movableSGroup);
      movableSGroupAtoms.forEach(function (aid) {
        action.addOp(new AtomMove(aid, finalMoveVector));
        handledAtoms.add(aid);
      });
      action.addOp(new SGroupDataMove(sGroupId, finalMoveVector));
    });
  });
  atomsToMove.forEach(function (atomIds) {
    var intactAtoms = atomIds.filter(function (aid) {
      return !handledAtoms.has(aid);
    });
    if (intactAtoms.length === 0) {
      return;
    }
    var subStructBBox = SGroup.getObjBBox(intactAtoms, restruct.molecule, true);
    var subStructCenter = new Vec2(subStructBBox.p0.x + (subStructBBox.p1.x - subStructBBox.p0.x) / 2, subStructBBox.p0.y + (subStructBBox.p1.y - subStructBBox.p0.y) / 2);
    var sGroupCenter = new Vec2(sGroupBBox.p0.x + (sGroupBBox.p1.x - sGroupBBox.p0.x) / 2, sGroupBBox.p0.y + (sGroupBBox.p1.y - sGroupBBox.p0.y) / 2);
    var direction = subStructCenter.sub(sGroupCenter).normalized();
    var moveVector = new Vec2(direction.x * sGroupWidth / 2, direction.y * sGroupHeight / 2);
    var finalMoveVector = attrs.expanded ? moveVector : moveVector.negated();
    intactAtoms.forEach(function (atomId) {
      action.addOp(new AtomMove(atomId, finalMoveVector));
    });
  });
  sGroupAtoms.forEach(function (aid) {
    var _restruct$atoms$get3;
    action.mergeWith(fromAtomsAttrs(restruct, aid, (_restruct$atoms$get3 = restruct.atoms.get(aid)) === null || _restruct$atoms$get3 === void 0 ? void 0 : _restruct$atoms$get3.a, false));
  });
  return action.perform(restruct);
}
function expandSGroupWithMultipleAttachmentPoint(restruct) {
  var action = new Action();
  var struct = restruct.molecule;
  struct.sgroups.forEach(function (sgroup) {
    if (sgroup.isNotContractible(struct) && !(sgroup instanceof MonomerMicromolecule) && !SGroup.isSuperAtom(sgroup)) {
      action.mergeWith(setExpandSGroup(restruct, sgroup.id, {
        expanded: true
      }));
    }
  });
  return action;
}
function sGroupAttributeAction(id, attrs) {
  var action = new Action();
  Object.keys(attrs).forEach(function (key) {
    action.addOp(new SGroupAttr(id, key, attrs[key]));
  });
  return action;
}
function fromSgroupDeletion(restruct, id) {
  var _restruct$sgroups$get;
  var needPerform = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var action = new Action();
  var struct = restruct.molecule;
  var sG = (_restruct$sgroups$get = restruct.sgroups.get(id)) === null || _restruct$sgroups$get === void 0 ? void 0 : _restruct$sgroups$get.item;
  var atoms = SGroup.getAtoms(struct, sG);
  var atomsSet = new Set(atoms);
  var outsideConnections = [];
  atoms.forEach(function (atomId) {
    var _struct$atomGetNeighb;
    ((_struct$atomGetNeighb = struct.atomGetNeighbors(atomId)) !== null && _struct$atomGetNeighb !== void 0 ? _struct$atomGetNeighb : []).forEach(function (_ref) {
      var aid = _ref.aid;
      if (!atomsSet.has(aid)) {
        outsideConnections.push([atomId, aid]);
      }
    });
  });
  if ((sG === null || sG === void 0 ? void 0 : sG.type) === 'SRU') {
    struct.sGroupsRecalcCrossBonds();
    sG.neiAtoms.forEach(function (aid) {
      if (atomGetAttr(restruct, aid, 'label') === '*') {
        action.addOp(new AtomAttr(aid, 'label', 'C'));
      }
    });
  }
  var fragmentId;
  var attrs = sG === null || sG === void 0 ? void 0 : sG.getAttrs();
  var cachedAttachmentPoints = sG === null || sG === void 0 ? void 0 : sG.getAttachmentPoints().map(function (ap) {
    return {
      atomId: ap.atomId,
      leaveAtomId: ap.leaveAtomId,
      attachmentPointNumber: ap.attachmentPointNumber
    };
  });
  action.addOp(new SGroupRemoveFromHierarchy(id));
  var isMonomer = atoms.some(function (atomId) {
    var atom = struct.atoms.get(atomId);
    return atom && atom.fragment < 0;
  });
  if (isMonomer) {
    fragmentId = struct.frags.newId();
    action.addOp(new FragmentAdd(fragmentId));
  }
  atoms.forEach(function (atomId) {
    action.addOp(new SGroupAtomRemove(id, atomId));
    var atom = struct.atoms.get(atomId);
    if (atom && atom.fragment < 0) {
      action.addOp(new AtomAttr(atomId, 'fragment', fragmentId));
    }
  });
  sG === null || sG === void 0 || sG.getAttachmentPoints().forEach(function (attachmentPoint) {
    action.addOp(new SGroupAttachmentPointRemove(id, attachmentPoint));
  });
  action.addOp(new SGroupDelete(id));
  if (sG instanceof MonomerMicromolecule) {
    var _sG$monomer$monomerIt, _sG$monomer;
    var isExpanded = sG.isExpanded();
    var monomerCaps = (_sG$monomer$monomerIt = (_sG$monomer = sG.monomer) === null || _sG$monomer === void 0 || (_sG$monomer = _sG$monomer.monomerItem) === null || _sG$monomer === void 0 || (_sG$monomer = _sG$monomer.props) === null || _sG$monomer === void 0 ? void 0 : _sG$monomer.MonomerCaps) !== null && _sG$monomer$monomerIt !== void 0 ? _sG$monomer$monomerIt : {};
    cachedAttachmentPoints === null || cachedAttachmentPoints === void 0 || cachedAttachmentPoints.forEach(function (attachmentPoint) {
      var leaveAtomId = attachmentPoint.leaveAtomId;
      var attachmentAtomId = attachmentPoint.atomId;
      if (isNumber(leaveAtomId) && isNumber(attachmentAtomId)) {
        var apNumber = attachmentPoint.attachmentPointNumber;
        var isOccupied = Array.from(struct.bonds.values()).some(function (_ref2) {
          var bondBegin = _ref2.begin,
            bondEnd = _ref2.end,
            beginSuperatomAttachmentPointNumber = _ref2.beginSuperatomAttachmentPointNumber,
            endSuperatomAttachmentPointNumber = _ref2.endSuperatomAttachmentPointNumber;
          var isAttached = bondBegin === attachmentAtomId || bondEnd === attachmentAtomId;
          if (!isAttached) return false;
          var otherAtomId = bondBegin === attachmentAtomId ? bondEnd : bondBegin;
          if (otherAtomId === leaveAtomId) return false;
          if (!atoms.includes(otherAtomId)) {
            var bondApNumber = bondBegin === attachmentAtomId ? beginSuperatomAttachmentPointNumber : endSuperatomAttachmentPointNumber;
            if (isNumber(bondApNumber) && isNumber(apNumber)) {
              return bondApNumber === apNumber;
            }
            return true;
          }
          return false;
        });
        if (isOccupied) {
          struct.bonds.forEach(function (_ref3, bondId) {
            var bondBegin = _ref3.begin,
              bondEnd = _ref3.end;
            if (bondBegin === leaveAtomId || bondEnd === leaveAtomId) {
              action.addOp(new BondDelete(bondId));
            }
          });
          action.addOp(new AtomDelete(leaveAtomId));
        } else if (isExpanded) {
          action.addOp(new AtomAttr(leaveAtomId, 'rglabel', null));
        } else {
          var _attachmentPoint$atta;
          var apLabel = "R".concat((_attachmentPoint$atta = attachmentPoint.attachmentPointNumber) !== null && _attachmentPoint$atta !== void 0 ? _attachmentPoint$atta : 0);
          var newLabel = (monomerCaps === null || monomerCaps === void 0 ? void 0 : monomerCaps[apLabel]) || 'H';
          action.addOp(new AtomAttr(leaveAtomId, 'label', newLabel));
          action.addOp(new AtomAttr(leaveAtomId, 'rglabel', null));
        }
      }
    });
  }
  action.mergeWith(sGroupAttributeAction(id, attrs));
  if (needPerform) {
    action = action.perform(restruct);
    outsideConnections.forEach(function (_ref4) {
      var _ref5 = _slicedToArray(_ref4, 2),
        atomId = _ref5[0],
        neighborAtomId = _ref5[1];
      mergeFragmentsIfNeeded(action, restruct, atomId, neighborAtomId);
    });
  }
  return action;
}
function fromSgroupAddition(restruct, type, atoms, attrs, sgid, attachmentPoints, pp, expanded, name, oldSgroup, monomer) {
  var action = new Action();
  sgid = isNumber(sgid) ? sgid : restruct.molecule.sgroups.newId();
  if (type === 'SUP') {
    action.addOp(new SGroupCreate(sgid, type, pp, expanded, name, oldSgroup, monomer));
  } else {
    action.addOp(new SGroupCreate(sgid, type, pp));
  }
  atoms.forEach(function (atom) {
    action.addOp(new SGroupAtomAdd(sgid, atom));
  });
  if (type === 'SUP') {
    attachmentPoints.forEach(function (attachmentPoint) {
      action.addOp(new SGroupAttachmentPointAdd(sgid, attachmentPoint));
    });
  }
  action.addOp(type !== 'DAT' ? new SGroupAddToHierarchy(sgid) : new SGroupAddToHierarchy(sgid, -1, []));
  action = action.perform(restruct);
  if (type === 'SRU') {
    restruct.molecule.sGroupsRecalcCrossBonds();
    var asteriskAction = new Action();
    restruct.sgroups.get(sgid).item.neiAtoms.forEach(function (aid) {
      var plainCarbon = restruct.atoms.get(aid).a.isPlainCarbon();
      if (atomGetDegree(restruct, aid) === 1 && plainCarbon) {
        asteriskAction.addOp(new AtomAttr(aid, 'label', '*'));
      }
    });
    asteriskAction = asteriskAction.perform(restruct);
    asteriskAction.mergeWith(action);
    action = asteriskAction;
  }
  return fromSgroupAttrs(restruct, sgid, attrs).mergeWith(action);
}
function fromSgroupAction(context, restruct, newSg, sourceAtoms, selection) {
  if (context === SgContexts.Bond) {
    return fromBondAction(restruct, newSg, sourceAtoms, selection);
  }
  var atomsFromBonds = getAtomsFromBonds(restruct.molecule, selection.bonds);
  var newSourceAtoms = uniq(sourceAtoms.concat(atomsFromBonds));
  if (context === SgContexts.Fragment) {
    return fromGroupAction(restruct, newSg, newSourceAtoms, Array.from(restruct.atoms.keys()));
  }
  if (context === SgContexts.Multifragment) {
    return fromMultiFragmentAction(restruct, newSg, newSourceAtoms);
  }
  if (context === SgContexts.Group) {
    return fromGroupAction(restruct, newSg, newSourceAtoms, newSourceAtoms);
  }
  if (context === SgContexts.Atom) {
    return fromAtomAction(restruct, newSg, newSourceAtoms);
  }
  if (SGroup.isQuerySGroup(newSg)) {
    return fromQueryComponentSGroupAction(restruct, newSg, newSourceAtoms, Array.from(restruct.atoms.keys()));
  }
  return {
    action: fromSeveralSgroupAddition(restruct, newSg.type, newSourceAtoms, newSg.attrs)
  };
}
function fromAtomAction(restruct, newSg, sourceAtoms) {
  return sourceAtoms.reduce(function (acc, atom) {
    acc.action = acc.action.mergeWith(fromSeveralSgroupAddition(restruct, newSg.type, [atom], newSg.attrs));
    return acc;
  }, {
    action: new Action(),
    selection: {
      atoms: sourceAtoms,
      bonds: []
    }
  });
}
function fromQueryComponentSGroupAction(restruct, newSg, sourceAtoms, targetAtoms) {
  var selection = {
    atoms: [],
    bonds: []
  };
  var allFragments = new Pile(sourceAtoms.map(function (aid) {
    var _restruct$atoms$get4;
    return (_restruct$atoms$get4 = restruct.atoms.get(aid)) === null || _restruct$atoms$get4 === void 0 ? void 0 : _restruct$atoms$get4.a.fragment;
  }));
  Array.from(allFragments).forEach(function (fragId) {
    var atoms = targetAtoms.reduce(function (res, aid) {
      var _restruct$atoms$get5;
      var atom = (_restruct$atoms$get5 = restruct.atoms.get(aid)) === null || _restruct$atoms$get5 === void 0 ? void 0 : _restruct$atoms$get5.a;
      if (fragId === (atom === null || atom === void 0 ? void 0 : atom.fragment)) res.push(aid);
      return res;
    }, []);
    var bonds = getAtomsBondIds(restruct.molecule, atoms);
    selection.atoms = selection.atoms.concat(atoms);
    selection.bonds = selection.bonds.concat(bonds);
  });
  return {
    action: fromSeveralSgroupAddition(restruct, newSg.type, selection.atoms, newSg.attrs),
    selection: selection
  };
}
function fromGroupAction(restruct, newSg, sourceAtoms, targetAtoms) {
  var allFragments = new Pile(sourceAtoms.map(function (aid) {
    return restruct.atoms.get(aid).a.fragment;
  }));
  return Array.from(allFragments).reduce(function (acc, fragId) {
    var atoms = targetAtoms.reduce(function (res, aid) {
      var atom = restruct.atoms.get(aid).a;
      if (fragId === atom.fragment) res.push(aid);
      return res;
    }, []);
    var bonds = getAtomsBondIds(restruct.molecule, atoms);
    acc.action = acc.action.mergeWith(fromSeveralSgroupAddition(restruct, newSg.type, atoms, newSg.attrs));
    acc.selection.atoms = acc.selection.atoms.concat(atoms);
    acc.selection.bonds = acc.selection.bonds.concat(bonds);
    return acc;
  }, {
    action: new Action(),
    selection: {
      atoms: [],
      bonds: []
    }
  });
}
function fromBondAction(restruct, newSg, sourceAtoms, currSelection) {
  var struct = restruct.molecule;
  var bonds = getAtomsBondIds(struct, sourceAtoms);
  if (currSelection.bonds) bonds = uniq(bonds.concat(currSelection.bonds));
  return bonds.reduce(function (acc, bondid) {
    var bond = struct.bonds.get(bondid);
    acc.action = acc.action.mergeWith(fromSeveralSgroupAddition(restruct, newSg.type, [bond.begin, bond.end], newSg.attrs));
    acc.selection.bonds.push(bondid);
    return acc;
  }, {
    action: new Action(),
    selection: {
      atoms: sourceAtoms,
      bonds: []
    }
  });
}
function fromMultiFragmentAction(restruct, newSg, atoms) {
  var bonds = getAtomsBondIds(restruct.molecule, atoms);
  return {
    action: fromSeveralSgroupAddition(restruct, newSg.type, atoms, newSg.attrs),
    selection: {
      atoms: atoms,
      bonds: bonds
    }
  };
}
function removeAtomFromSgroupIfNeeded(action, restruct, id) {
  var sgroups = atomGetSGroups(restruct, id);
  if (sgroups.length > 0) {
    sgroups.forEach(function (sid) {
      action.addOp(new SGroupAtomRemove(sid, id));
    });
    return true;
  }
  return false;
}
function removeSgroupIfNeeded(action, restruct, atoms) {
  var struct = restruct.molecule;
  var sgCounts = new Map();
  atoms.forEach(function (atomId) {
    var sgroups = atomGetSGroups(restruct, atomId);
    sgroups.forEach(function (sid) {
      sgCounts.set(sid, sgCounts.has(sid) ? sgCounts.get(sid) + 1 : 1);
    });
  });
  sgCounts.forEach(function (count, sid) {
    var _restruct$sgroups$get2;
    var sGroup = (_restruct$sgroups$get2 = restruct.sgroups.get(sid)) === null || _restruct$sgroups$get2 === void 0 ? void 0 : _restruct$sgroups$get2.item;
    var sgAtoms = SGroup.getAtoms(restruct.molecule, sGroup);
    if (sgAtoms.length === count && !(sGroup !== null && sGroup !== void 0 && sGroup.isSuperatomWithoutLabel)) {
      var sgroup = struct.sgroups.get(sid);
      action.mergeWith(sGroupAttributeAction(sid, sgroup.getAttrs()));
      action.addOp(new SGroupRemoveFromHierarchy(sid));
      sgroup.getAttachmentPoints().forEach(function (attachmentPoint) {
        action.addOp(new SGroupAttachmentPointRemove(sid, attachmentPoint));
      });
      action.addOp(new SGroupDelete(sid));
    }
    if (sGroup !== null && sGroup !== void 0 && sGroup.isSuperatomWithoutLabel && sGroup.getAttachmentPoints().length === 0) {
      action.mergeWith(fromSgroupDeletion(restruct, sid, false));
    }
  });
}
function getAtomsBondIds(struct, atoms) {
  var atomSet = new Pile(atoms);
  return Array.from(struct.bonds.keys()).filter(function (bid) {
    var bond = struct.bonds.get(bid);
    if (!bond) {
      return false;
    }
    return atomSet.has(bond.begin) && atomSet.has(bond.end);
  });
}
function getAtomsFromBonds(struct, bonds) {
  bonds = bonds || [];
  return bonds.reduce(function (acc, bondid) {
    var bond = struct.bonds.get(bondid);
    acc = acc.concat([bond.begin, bond.end]);
    return acc;
  }, []);
}
function fromSgroupAttachmentPointAddition(restruct, sgroupId, attachmentPoint) {
  var action = new Action();
  action.addOp(new SGroupAttachmentPointAdd(sgroupId, attachmentPoint));
  action = action.perform(restruct);
  return action;
}
function fromSgroupAttachmentPointRemove(restruct, sgroupId, atomId, leaveAtomId) {
  var needPerform = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
  var action = new Action();
  var struct = restruct.molecule;
  var sgroup = struct.sgroups.get(sgroupId);
  var atomAttachmentPoints = sgroup === null || sgroup === void 0 ? void 0 : sgroup.getAttachmentPoints().filter(function (attachmentPoint) {
    return attachmentPoint.atomId === atomId;
  });
  atomAttachmentPoints === null || atomAttachmentPoints === void 0 || atomAttachmentPoints.forEach(function (attachmentPoint) {
    if (sgroup && (!isNumber(attachmentPoint.leaveAtomId) || attachmentPoint.leaveAtomId === leaveAtomId)) {
      action.addOp(new SGroupAttachmentPointRemove(sgroupId, attachmentPoint));
    }
  });
  if (needPerform) {
    action = action.perform(restruct);
  }
  return action;
}

export { expandSGroupWithMultipleAttachmentPoint, fromSeveralSgroupAddition, fromSgroupAction, fromSgroupAddition, fromSgroupAttachmentPointAddition, fromSgroupAttachmentPointRemove, fromSgroupAttrs, fromSgroupDeletion, removeAtomFromSgroupIfNeeded, removeSgroupIfNeeded, sGroupAttributeAction, setExpandMonomerSGroup, setExpandSGroup };
//# sourceMappingURL=sgroup.modern.js.map
