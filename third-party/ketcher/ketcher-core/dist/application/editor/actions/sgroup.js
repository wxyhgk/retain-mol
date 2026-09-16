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
var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
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
var index = require('../operations/sgroup/index.js');
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
require('../../../domain/entities/atom.js');
require('../../../domain/entities/atomList.js');
var bond = require('../../../domain/entities/bond.js');
require('../../../domain/entities/fixedPrecision.js');
require('../../../domain/entities/fragment.js');
require('../../../domain/entities/functionalGroup.js');
require('../../../domain/entities/halfBond.js');
require('../../../domain/entities/loop.js');
require('../../../domain/entities/rgroup.js');
require('../../../domain/entities/rgroupAttachmentPoint.js');
require('../../../domain/entities/rxnArrow.js');
require('../../../domain/entities/rxnPlus.js');
var sgroup = require('../../../domain/entities/sgroup.js');
require('../../../domain/entities/sgroupForest.js');
require('../../../domain/entities/simpleObject.js');
require('../../../domain/entities/struct.js');
require('../../../domain/entities/text.js');
var pile = require('../../../domain/entities/pile.js');
var vec2 = require('../../../domain/entities/vec2.js');
require('../../../domain/entities/box2Abs.js');
require('../../../domain/entities/pool.js');
require('../../../domain/entities/image.js');
require('../../../domain/entities/multitailArrow.js');
require('../../../domain/entities/highlight.js');
require('../../../domain/entities/sGroupAttachmentPoint.js');
var monomerMicromolecule = require('../../../domain/entities/monomerMicromolecule.js');
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
var action = require('./action.js');
var constants = require('../shared/constants.js');
var fp = require('lodash/fp');
var atom = require('./atom.js');
var sgroupAttachmentPoints = require('../operations/sgroup/sgroupAttachmentPoints.js');
var _ = require('lodash');
var getAttachmentPointStereoBond = require('../../../domain/helpers/getAttachmentPointStereoBond.js');
var SGroupAttr = require('../operations/sgroup/SGroupAttr.js');
var BondAttr = require('../operations/bond/BondAttr.js');
var AtomMove = require('../operations/atom/AtomMove.js');
var SGroupDataMove = require('../operations/sgroup/SGroupDataMove.js');
var sgroupHierarchy = require('../operations/sgroup/sgroupHierarchy.js');
var sgroupAtom = require('../operations/sgroup/sgroupAtom.js');
var BondDelete = require('../operations/bond/BondDelete.js');
var AtomDelete = require('../operations/atom/AtomDelete.js');
var BondAdd = require('../operations/bond/BondAdd.js');
var AtomAttr = require('../operations/atom/AtomAttr.js');
var FragmentAdd = require('../operations/FragmentAdd.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var fromMonomerBondFlipWithNewStereo = function fromMonomerBondFlipWithNewStereo(struct, bondId, stereo) {
  var bond = struct.bonds.get(bondId);
  if (!bond) {
    return;
  }
  var action$1 = new action.Action();
  var bondWithStereo = _objectSpread(_objectSpread({}, bond), {}, {
    stereo: stereo,
    beginSuperatomAttachmentPointNumber: bond.endSuperatomAttachmentPointNumber,
    endSuperatomAttachmentPointNumber: bond.beginSuperatomAttachmentPointNumber
  });
  action$1.addOp(new BondDelete.BondDelete(bondId));
  action$1.addOp(new BondAdd.BondAdd(bond.end, bond.begin, bondWithStereo));
  return action$1;
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
  }, new action.Action());
}
function fromSgroupAttrs(restruct, id, attrs) {
  var action$1 = new action.Action();
  Object.keys(attrs).forEach(function (key) {
    action$1.addOp(new SGroupAttr.SGroupAttr(id, key, attrs[key]));
  });
  return action$1.perform(restruct);
}
function setExpandSGroup(restruct, sgid, attrs) {
  var action$1 = new action.Action();
  Object.keys(attrs).forEach(function (key) {
    action$1.addOp(new SGroupAttr.SGroupAttr(sgid, key, attrs[key]));
  });
  var struct = restruct.molecule;
  var sgroup$1 = struct.sgroups.get(sgid);
  assert.assert(sgroup$1 != null);
  var atoms = sgroup.SGroup.getAtoms(struct, sgroup$1);
  atoms.forEach(function (aid) {
    var _restruct$atoms$get;
    action$1.mergeWith(atom.fromAtomsAttrs(restruct, aid, (_restruct$atoms$get = restruct.atoms.get(aid)) === null || _restruct$atoms$get === void 0 ? void 0 : _restruct$atoms$get.a, false));
  });
  return action$1.perform(restruct);
}
function setExpandMonomerSGroup(restruct, sgid, attrs) {
  var action$1 = new action.Action();
  var struct = restruct.molecule;
  var sGroup = struct.sgroups.get(sgid);
  assert.assert(sGroup != null);
  if (attrs.expanded === sGroup.isExpanded()) {
    return action$1;
  }
  Object.keys(attrs).forEach(function (key) {
    action$1.addOp(new SGroupAttr.SGroupAttr(sgid, key, attrs[key]));
  });
  var sGroupAtoms = new Set(sgroup.SGroup.getAtoms(struct, sGroup));
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
        var currentMonomerStereo = getAttachmentPointStereoBond.getAttachmentPointStereoBond(sGroup, currentMonomerAP);
        var otherMonomerStereo = getAttachmentPointStereoBond.getAttachmentPointStereoBond(otherSGroup, otherMonomerAP);
        var hasCurrentStereo = currentMonomerStereo !== null && currentMonomerStereo !== bond.Bond.PATTERN.STEREO.NONE;
        var hasOtherStereo = otherMonomerStereo !== null && otherMonomerStereo !== bond.Bond.PATTERN.STEREO.NONE;
        var currentMonomerStereoValue = currentMonomerStereo !== null && currentMonomerStereo !== void 0 ? currentMonomerStereo : bond.Bond.PATTERN.STEREO.NONE;
        var otherMonomerStereoValue = otherMonomerStereo !== null && otherMonomerStereo !== void 0 ? otherMonomerStereo : bond.Bond.PATTERN.STEREO.NONE;
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
            action$1.mergeWith(fromMonomerBondFlipWithNewStereo(struct, bondId, currentMonomerStereoValue));
          } else {
            action$1.addOp(new BondAttr.BondAttr(bondId, 'stereo', currentMonomerStereoValue));
          }
        } else if (!hasEffectiveCurrentStereo && hasEffectiveOtherStereo) {
          if (bondToOutside.begin !== atomOutsideCurrentMonomer) {
            action$1.mergeWith(fromMonomerBondFlipWithNewStereo(struct, bondId, otherMonomerStereoValue));
          } else {
            action$1.addOp(new BondAttr.BondAttr(bondId, 'stereo', otherMonomerStereoValue));
          }
        } else if (hasEffectiveCurrentStereo && hasEffectiveOtherStereo) {
          action$1.addOp(new BondAttr.BondAttr(bondId, 'stereo', bond.Bond.PATTERN.STEREO.NONE));
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  });
  var sGroupBBox = sgroup.SGroup.getObjBBox(Array.from(sGroupAtoms.values()), struct);
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
      var movableSGroupAtoms = new Set(sgroup.SGroup.getAtoms(struct, movableSGroup));
      var movableSGroupBondsToOutside = struct.bonds.filter(function (_, bond) {
        return movableSGroupAtoms.has(bond.begin) && !movableSGroupAtoms.has(bond.end) || movableSGroupAtoms.has(bond.end) && !movableSGroupAtoms.has(bond.begin);
      });
      var hasComplementaryBondToMainLine = movableSGroupBondsToOutside.size === 1 && _toConsumableArray__default["default"](sameLine.values()).some(function (sGroupId) {
        var mainLineSGroup = struct.sgroups.get(sGroupId);
        if (!mainLineSGroup) {
          return false;
        }
        var mainLineSGroupAtoms = new Set(sgroup.SGroup.getAtoms(struct, mainLineSGroup));
        var bond = _toConsumableArray__default["default"](movableSGroupBondsToOutside.values())[0];
        return mainLineSGroupAtoms.has(bond.begin) || mainLineSGroupAtoms.has(bond.end);
      });
      if (inWideLine && hasComplementaryBondToMainLine) {
        sameLine.add(sGroupId);
      }
    });
  });
  var largestHeightInLine = _toConsumableArray__default["default"](sameLine.values()).reduce(function (acc, sGroupId) {
    var sGroupInLine = restruct.molecule.sgroups.get(sGroupId);
    if (!sGroupInLine) {
      return acc;
    }
    if (sGroupInLine.isContracted()) {
      return acc;
    }
    var sGroupInLineAtoms = sgroup.SGroup.getAtoms(struct, sGroupInLine);
    var sGroupInLineBBox = sgroup.SGroup.getObjBBox(sGroupInLineAtoms, restruct.molecule);
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
      var moveVector = new vec2.Vec2((moveHorizontally ? 1 : 0) * horizontalDirection * horizontalOffset, (moveVertically ? 1 : 0) * verticalDirection * baseVerticalOffset);
      var finalMoveVector = attrs.expanded ? moveVector : moveVector.negated();
      var movableSGroupAtoms = sgroup.SGroup.getAtoms(struct, movableSGroup);
      movableSGroupAtoms.forEach(function (aid) {
        action$1.addOp(new AtomMove.AtomMove(aid, finalMoveVector));
        handledAtoms.add(aid);
      });
      action$1.addOp(new SGroupDataMove.SGroupDataMove(sGroupId, finalMoveVector));
    });
  });
  atomsToMove.forEach(function (atomIds) {
    var intactAtoms = atomIds.filter(function (aid) {
      return !handledAtoms.has(aid);
    });
    if (intactAtoms.length === 0) {
      return;
    }
    var subStructBBox = sgroup.SGroup.getObjBBox(intactAtoms, restruct.molecule, true);
    var subStructCenter = new vec2.Vec2(subStructBBox.p0.x + (subStructBBox.p1.x - subStructBBox.p0.x) / 2, subStructBBox.p0.y + (subStructBBox.p1.y - subStructBBox.p0.y) / 2);
    var sGroupCenter = new vec2.Vec2(sGroupBBox.p0.x + (sGroupBBox.p1.x - sGroupBBox.p0.x) / 2, sGroupBBox.p0.y + (sGroupBBox.p1.y - sGroupBBox.p0.y) / 2);
    var direction = subStructCenter.sub(sGroupCenter).normalized();
    var moveVector = new vec2.Vec2(direction.x * sGroupWidth / 2, direction.y * sGroupHeight / 2);
    var finalMoveVector = attrs.expanded ? moveVector : moveVector.negated();
    intactAtoms.forEach(function (atomId) {
      action$1.addOp(new AtomMove.AtomMove(atomId, finalMoveVector));
    });
  });
  sGroupAtoms.forEach(function (aid) {
    var _restruct$atoms$get3;
    action$1.mergeWith(atom.fromAtomsAttrs(restruct, aid, (_restruct$atoms$get3 = restruct.atoms.get(aid)) === null || _restruct$atoms$get3 === void 0 ? void 0 : _restruct$atoms$get3.a, false));
  });
  return action$1.perform(restruct);
}
function expandSGroupWithMultipleAttachmentPoint(restruct) {
  var action$1 = new action.Action();
  var struct = restruct.molecule;
  struct.sgroups.forEach(function (sgroup$1) {
    if (sgroup$1.isNotContractible(struct) && !(sgroup$1 instanceof monomerMicromolecule.MonomerMicromolecule) && !sgroup.SGroup.isSuperAtom(sgroup$1)) {
      action$1.mergeWith(setExpandSGroup(restruct, sgroup$1.id, {
        expanded: true
      }));
    }
  });
  return action$1;
}
function sGroupAttributeAction(id, attrs) {
  var action$1 = new action.Action();
  Object.keys(attrs).forEach(function (key) {
    action$1.addOp(new SGroupAttr.SGroupAttr(id, key, attrs[key]));
  });
  return action$1;
}
function fromSgroupDeletion(restruct, id) {
  var _restruct$sgroups$get;
  var needPerform = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var action$1 = new action.Action();
  var struct = restruct.molecule;
  var sG = (_restruct$sgroups$get = restruct.sgroups.get(id)) === null || _restruct$sgroups$get === void 0 ? void 0 : _restruct$sgroups$get.item;
  var atoms = sgroup.SGroup.getAtoms(struct, sG);
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
      if (utils.atomGetAttr(restruct, aid, 'label') === '*') {
        action$1.addOp(new AtomAttr.AtomAttr(aid, 'label', 'C'));
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
  action$1.addOp(new sgroupHierarchy.SGroupRemoveFromHierarchy(id));
  var isMonomer = atoms.some(function (atomId) {
    var atom = struct.atoms.get(atomId);
    return atom && atom.fragment < 0;
  });
  if (isMonomer) {
    fragmentId = struct.frags.newId();
    action$1.addOp(new FragmentAdd.FragmentAdd(fragmentId));
  }
  atoms.forEach(function (atomId) {
    action$1.addOp(new sgroupAtom.SGroupAtomRemove(id, atomId));
    var atom = struct.atoms.get(atomId);
    if (atom && atom.fragment < 0) {
      action$1.addOp(new AtomAttr.AtomAttr(atomId, 'fragment', fragmentId));
    }
  });
  sG === null || sG === void 0 || sG.getAttachmentPoints().forEach(function (attachmentPoint) {
    action$1.addOp(new sgroupAttachmentPoints.SGroupAttachmentPointRemove(id, attachmentPoint));
  });
  action$1.addOp(new index.SGroupDelete(id));
  if (sG instanceof monomerMicromolecule.MonomerMicromolecule) {
    var _sG$monomer$monomerIt, _sG$monomer;
    var isExpanded = sG.isExpanded();
    var monomerCaps = (_sG$monomer$monomerIt = (_sG$monomer = sG.monomer) === null || _sG$monomer === void 0 || (_sG$monomer = _sG$monomer.monomerItem) === null || _sG$monomer === void 0 || (_sG$monomer = _sG$monomer.props) === null || _sG$monomer === void 0 ? void 0 : _sG$monomer.MonomerCaps) !== null && _sG$monomer$monomerIt !== void 0 ? _sG$monomer$monomerIt : {};
    cachedAttachmentPoints === null || cachedAttachmentPoints === void 0 || cachedAttachmentPoints.forEach(function (attachmentPoint) {
      var leaveAtomId = attachmentPoint.leaveAtomId;
      var attachmentAtomId = attachmentPoint.atomId;
      if (_.isNumber(leaveAtomId) && _.isNumber(attachmentAtomId)) {
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
            if (_.isNumber(bondApNumber) && _.isNumber(apNumber)) {
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
              action$1.addOp(new BondDelete.BondDelete(bondId));
            }
          });
          action$1.addOp(new AtomDelete.AtomDelete(leaveAtomId));
        } else if (isExpanded) {
          action$1.addOp(new AtomAttr.AtomAttr(leaveAtomId, 'rglabel', null));
        } else {
          var _attachmentPoint$atta;
          var apLabel = "R".concat((_attachmentPoint$atta = attachmentPoint.attachmentPointNumber) !== null && _attachmentPoint$atta !== void 0 ? _attachmentPoint$atta : 0);
          var newLabel = (monomerCaps === null || monomerCaps === void 0 ? void 0 : monomerCaps[apLabel]) || 'H';
          action$1.addOp(new AtomAttr.AtomAttr(leaveAtomId, 'label', newLabel));
          action$1.addOp(new AtomAttr.AtomAttr(leaveAtomId, 'rglabel', null));
        }
      }
    });
  }
  action$1.mergeWith(sGroupAttributeAction(id, attrs));
  if (needPerform) {
    action$1 = action$1.perform(restruct);
    outsideConnections.forEach(function (_ref4) {
      var _ref5 = _slicedToArray__default["default"](_ref4, 2),
        atomId = _ref5[0],
        neighborAtomId = _ref5[1];
      atom.mergeFragmentsIfNeeded(action$1, restruct, atomId, neighborAtomId);
    });
  }
  return action$1;
}
function fromSgroupAddition(restruct, type, atoms, attrs, sgid, attachmentPoints, pp, expanded, name, oldSgroup, monomer) {
  var action$1 = new action.Action();
  sgid = _.isNumber(sgid) ? sgid : restruct.molecule.sgroups.newId();
  if (type === 'SUP') {
    action$1.addOp(new index.SGroupCreate(sgid, type, pp, expanded, name, oldSgroup, monomer));
  } else {
    action$1.addOp(new index.SGroupCreate(sgid, type, pp));
  }
  atoms.forEach(function (atom) {
    action$1.addOp(new sgroupAtom.SGroupAtomAdd(sgid, atom));
  });
  if (type === 'SUP') {
    attachmentPoints.forEach(function (attachmentPoint) {
      action$1.addOp(new sgroupAttachmentPoints.SGroupAttachmentPointAdd(sgid, attachmentPoint));
    });
  }
  action$1.addOp(type !== 'DAT' ? new sgroupHierarchy.SGroupAddToHierarchy(sgid) : new sgroupHierarchy.SGroupAddToHierarchy(sgid, -1, []));
  action$1 = action$1.perform(restruct);
  if (type === 'SRU') {
    restruct.molecule.sGroupsRecalcCrossBonds();
    var asteriskAction = new action.Action();
    restruct.sgroups.get(sgid).item.neiAtoms.forEach(function (aid) {
      var plainCarbon = restruct.atoms.get(aid).a.isPlainCarbon();
      if (utils.atomGetDegree(restruct, aid) === 1 && plainCarbon) {
        asteriskAction.addOp(new AtomAttr.AtomAttr(aid, 'label', '*'));
      }
    });
    asteriskAction = asteriskAction.perform(restruct);
    asteriskAction.mergeWith(action$1);
    action$1 = asteriskAction;
  }
  return fromSgroupAttrs(restruct, sgid, attrs).mergeWith(action$1);
}
function fromSgroupAction(context, restruct, newSg, sourceAtoms, selection) {
  if (context === constants.SgContexts.Bond) {
    return fromBondAction(restruct, newSg, sourceAtoms, selection);
  }
  var atomsFromBonds = getAtomsFromBonds(restruct.molecule, selection.bonds);
  var newSourceAtoms = fp.uniq(sourceAtoms.concat(atomsFromBonds));
  if (context === constants.SgContexts.Fragment) {
    return fromGroupAction(restruct, newSg, newSourceAtoms, Array.from(restruct.atoms.keys()));
  }
  if (context === constants.SgContexts.Multifragment) {
    return fromMultiFragmentAction(restruct, newSg, newSourceAtoms);
  }
  if (context === constants.SgContexts.Group) {
    return fromGroupAction(restruct, newSg, newSourceAtoms, newSourceAtoms);
  }
  if (context === constants.SgContexts.Atom) {
    return fromAtomAction(restruct, newSg, newSourceAtoms);
  }
  if (sgroup.SGroup.isQuerySGroup(newSg)) {
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
    action: new action.Action(),
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
  var allFragments = new pile.Pile(sourceAtoms.map(function (aid) {
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
  var allFragments = new pile.Pile(sourceAtoms.map(function (aid) {
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
    action: new action.Action(),
    selection: {
      atoms: [],
      bonds: []
    }
  });
}
function fromBondAction(restruct, newSg, sourceAtoms, currSelection) {
  var struct = restruct.molecule;
  var bonds = getAtomsBondIds(struct, sourceAtoms);
  if (currSelection.bonds) bonds = fp.uniq(bonds.concat(currSelection.bonds));
  return bonds.reduce(function (acc, bondid) {
    var bond = struct.bonds.get(bondid);
    acc.action = acc.action.mergeWith(fromSeveralSgroupAddition(restruct, newSg.type, [bond.begin, bond.end], newSg.attrs));
    acc.selection.bonds.push(bondid);
    return acc;
  }, {
    action: new action.Action(),
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
  var sgroups = utils.atomGetSGroups(restruct, id);
  if (sgroups.length > 0) {
    sgroups.forEach(function (sid) {
      action.addOp(new sgroupAtom.SGroupAtomRemove(sid, id));
    });
    return true;
  }
  return false;
}
function removeSgroupIfNeeded(action, restruct, atoms) {
  var struct = restruct.molecule;
  var sgCounts = new Map();
  atoms.forEach(function (atomId) {
    var sgroups = utils.atomGetSGroups(restruct, atomId);
    sgroups.forEach(function (sid) {
      sgCounts.set(sid, sgCounts.has(sid) ? sgCounts.get(sid) + 1 : 1);
    });
  });
  sgCounts.forEach(function (count, sid) {
    var _restruct$sgroups$get2;
    var sGroup = (_restruct$sgroups$get2 = restruct.sgroups.get(sid)) === null || _restruct$sgroups$get2 === void 0 ? void 0 : _restruct$sgroups$get2.item;
    var sgAtoms = sgroup.SGroup.getAtoms(restruct.molecule, sGroup);
    if (sgAtoms.length === count && !(sGroup !== null && sGroup !== void 0 && sGroup.isSuperatomWithoutLabel)) {
      var sgroup$1 = struct.sgroups.get(sid);
      action.mergeWith(sGroupAttributeAction(sid, sgroup$1.getAttrs()));
      action.addOp(new sgroupHierarchy.SGroupRemoveFromHierarchy(sid));
      sgroup$1.getAttachmentPoints().forEach(function (attachmentPoint) {
        action.addOp(new sgroupAttachmentPoints.SGroupAttachmentPointRemove(sid, attachmentPoint));
      });
      action.addOp(new index.SGroupDelete(sid));
    }
    if (sGroup !== null && sGroup !== void 0 && sGroup.isSuperatomWithoutLabel && sGroup.getAttachmentPoints().length === 0) {
      action.mergeWith(fromSgroupDeletion(restruct, sid, false));
    }
  });
}
function getAtomsBondIds(struct, atoms) {
  var atomSet = new pile.Pile(atoms);
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
  var action$1 = new action.Action();
  action$1.addOp(new sgroupAttachmentPoints.SGroupAttachmentPointAdd(sgroupId, attachmentPoint));
  action$1 = action$1.perform(restruct);
  return action$1;
}
function fromSgroupAttachmentPointRemove(restruct, sgroupId, atomId, leaveAtomId) {
  var needPerform = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
  var action$1 = new action.Action();
  var struct = restruct.molecule;
  var sgroup = struct.sgroups.get(sgroupId);
  var atomAttachmentPoints = sgroup === null || sgroup === void 0 ? void 0 : sgroup.getAttachmentPoints().filter(function (attachmentPoint) {
    return attachmentPoint.atomId === atomId;
  });
  atomAttachmentPoints === null || atomAttachmentPoints === void 0 || atomAttachmentPoints.forEach(function (attachmentPoint) {
    if (sgroup && (!_.isNumber(attachmentPoint.leaveAtomId) || attachmentPoint.leaveAtomId === leaveAtomId)) {
      action$1.addOp(new sgroupAttachmentPoints.SGroupAttachmentPointRemove(sgroupId, attachmentPoint));
    }
  });
  if (needPerform) {
    action$1 = action$1.perform(restruct);
  }
  return action$1;
}

exports.expandSGroupWithMultipleAttachmentPoint = expandSGroupWithMultipleAttachmentPoint;
exports.fromSeveralSgroupAddition = fromSeveralSgroupAddition;
exports.fromSgroupAction = fromSgroupAction;
exports.fromSgroupAddition = fromSgroupAddition;
exports.fromSgroupAttachmentPointAddition = fromSgroupAttachmentPointAddition;
exports.fromSgroupAttachmentPointRemove = fromSgroupAttachmentPointRemove;
exports.fromSgroupAttrs = fromSgroupAttrs;
exports.fromSgroupDeletion = fromSgroupDeletion;
exports.removeAtomFromSgroupIfNeeded = removeAtomFromSgroupIfNeeded;
exports.removeSgroupIfNeeded = removeSgroupIfNeeded;
exports.sGroupAttributeAction = sGroupAttributeAction;
exports.setExpandMonomerSGroup = setExpandMonomerSGroup;
exports.setExpandSGroup = setExpandSGroup;
//# sourceMappingURL=sgroup.js.map
