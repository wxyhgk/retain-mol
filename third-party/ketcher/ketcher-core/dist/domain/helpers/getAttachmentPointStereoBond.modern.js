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
import { Bond } from '../entities/bond.modern.js';
import { getAttachmentPointLabel } from './attachmentPointCalculations.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function getAttachmentPointStereoBond(sGroup, sGroupAttachmentPoint) {
  var _monomerAttachmentPoi;
  if (!sGroup.isMonomer) {
    return null;
  }
  var monomer = sGroup.monomer;
  if (!(monomer !== null && monomer !== void 0 && monomer.monomerItem)) {
    return null;
  }
  var monomerStruct = monomer.monomerItem.struct;
  var monomerAttachmentPoints = monomer.monomerItem.attachmentPoints;
  if (!monomerStruct || !monomerAttachmentPoints) {
    return null;
  }
  var attachmentPointNumber = sGroupAttachmentPoint.attachmentPointNumber;
  if (!attachmentPointNumber) {
    return null;
  }
  var attachmentPointLabel = getAttachmentPointLabel(attachmentPointNumber);
  var orderedAttachmentPoints = monomer.listOfAttachmentPoints;
  var attachmentPointIndex = orderedAttachmentPoints.indexOf(attachmentPointLabel);
  if (attachmentPointIndex === -1 || attachmentPointIndex >= monomerAttachmentPoints.length) {
    return null;
  }
  var monomerAttachmentPoint = monomerAttachmentPoints[attachmentPointIndex];
  if (!monomerAttachmentPoint) {
    return null;
  }
  var monomerAttachmentAtomId = monomerAttachmentPoint.attachmentAtom;
  var monomerLeavingGroupAtoms = (_monomerAttachmentPoi = monomerAttachmentPoint.leavingGroup) === null || _monomerAttachmentPoi === void 0 ? void 0 : _monomerAttachmentPoi.atoms;
  if (monomerAttachmentAtomId === undefined || !monomerLeavingGroupAtoms || monomerLeavingGroupAtoms.length === 0) {
    return null;
  }
  var _iterator = _createForOfIteratorHelper(monomerLeavingGroupAtoms),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var internalLeavingAtomId = _step.value;
      var bondId = monomerStruct.findBondId(internalLeavingAtomId, monomerAttachmentAtomId);
      if (bondId === null) {
        continue;
      }
      var bond = monomerStruct.bonds.get(bondId);
      if (!bond) {
        continue;
      }
      var isSuitableStereoBond = bond.stereo === Bond.PATTERN.STEREO.UP || bond.stereo === Bond.PATTERN.STEREO.DOWN;
      if (!isSuitableStereoBond) {
        continue;
      }
      if (bond.begin === monomerAttachmentAtomId) {
        return bond.stereo;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return null;
}

export { getAttachmentPointStereoBond };
//# sourceMappingURL=getAttachmentPointStereoBond.modern.js.map
